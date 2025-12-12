"""
Insights router for generating sports analytics.
Handles both streaming and non-streaming insight generation.
Supports concurrent requests via thread pool executors.
"""
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional

from config import SUPPORTED_SPORTS
from models.schemas import InsightRequest, InsightResponse, EditedInsights, EditInsightsRequest
from services.gemini_service import generate_sport_insights, generate_sport_insights_stream
from services.json_repair import (
    validate_and_repair_json,
    validate_sports_json_structure,
    create_fallback_structure,
)
from services.insights_storage import (
    generate_insight_id,
    save_edited_insights,
    get_edited_insights,
    delete_edited_insights
)

router = APIRouter(prefix="/api", tags=["insights"])


@router.post("/{sport}/generate-insights", response_model=Optional[InsightResponse])
async def generate_insights(
    sport: str,
    request: InsightRequest,
    stream: bool = Query(False, description="Enable streaming response")
):
    """
    Generate AI-powered insights for a specific sport.
    
    Args:
        sport: Sport identifier (nba, afl, nrl, epl, ipl)
        request: Insight generation parameters
        stream: Enable Server-Sent Events streaming
        
    Returns:
        JSON insights or streaming response
        
    Raises:
        HTTPException: If sport is invalid or generation fails
    """
    # Validate sport
    if sport.lower() not in SUPPORTED_SPORTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sport. Must be one of: {', '.join(SUPPORTED_SPORTS)}"
        )
    
    sport_lower = sport.lower()
    
    # Convert request to dict
    query = request.model_dump(exclude_none=True)
    
    try:
        if stream:
            # Streaming response
            async def event_generator():
                """Generate Server-Sent Events with async streaming support."""
                try:
                    # Ensure files are uploaded first
                    from services.gemini_service import sport_file_uris, upload_sport_files, generate_sport_insights_stream_sync
                    import time
                    
                    print(f"[Router] Starting event generator for {sport_lower}")
                    
                    if not sport_file_uris[sport_lower]:
                        print(f"[Router] Uploading files for {sport_lower}")
                        await upload_sport_files(sport_lower)
                    else:
                        print(f"[Router] Files already uploaded for {sport_lower}")
                    
                    print(f"[Router] Starting to stream chunks...")
                    chunk_num = 0
                    last_chunk_time = time.time()
                    heartbeat_enabled = False  # Only enable after first chunk arrives
                    
                    # Run the blocking stream generator in a thread pool
                    # This allows other requests to be handled concurrently
                    loop = asyncio.get_event_loop()
                    
                    # Create a queue to communicate between threads
                    import queue
                    chunk_queue = queue.Queue()
                    
                    def stream_in_thread():
                        """Run the blocking streaming generator in a separate thread."""
                        try:
                            accumulated_text = ""
                            for chunk in generate_sport_insights_stream_sync(sport_lower, query):
                                accumulated_text += chunk
                                chunk_queue.put(('chunk', chunk))
                            # Send a best-effort repaired final payload as a single SSE event.
                            # This avoids frontend JSON.parse failures when intermediate streamed text is malformed.
                            print(f"[Router] Validating and repairing accumulated text ({len(accumulated_text)} chars)...")
                            final_data = validate_and_repair_json(accumulated_text)
                            if not isinstance(final_data, dict):
                                print(f"[Router] ⚠️ Repair failed, using fallback structure")
                                final_data = create_fallback_structure()
                            else:
                                print(f"[Router] ✅ Final data repaired successfully")
                                # Ensure required structure exists, even if partially missing
                                fallback = create_fallback_structure()
                                for k, v in fallback.items():
                                    final_data.setdefault(k, v)
                                if not validate_sports_json_structure(final_data):
                                    print(f"[Router] ⚠️ Structure validation failed, using fallback")
                                    final_data = fallback
                                else:
                                    print(f"[Router] ✅ Structure validated successfully")
                                    # Log what we have
                                    players_count = len(final_data.get('players', {}))
                                    team1_items = sum([
                                        len(final_data.get('team1', {}).get('insights', [])),
                                        len(final_data.get('team1', {}).get('strengths', [])),
                                        len(final_data.get('team1', {}).get('weaknesses', []))
                                    ])
                                    team2_items = sum([
                                        len(final_data.get('team2', {}).get('insights', [])),
                                        len(final_data.get('team2', {}).get('strengths', [])),
                                        len(final_data.get('team2', {}).get('weaknesses', []))
                                    ])
                                    print(f"[Router] Final data: {players_count} players, team1: {team1_items} items, team2: {team2_items} items")

                            chunk_queue.put(('final', final_data))
                            chunk_queue.put(('done', None))
                        except Exception as e:
                            chunk_queue.put(('error', str(e)))
                    
                    # Start streaming in background thread
                    with ThreadPoolExecutor(max_workers=1) as executor:
                        future = executor.submit(stream_in_thread)
                        
                        # Yield chunks as they arrive
                        while True:
                            # Check queue without blocking the event loop
                            await asyncio.sleep(0.01)  # Small delay to yield control
                            
                            # Send heartbeat only if streaming has started and no chunks for 10 seconds
                            current_time = time.time()
                            if heartbeat_enabled and current_time - last_chunk_time > 10:
                                print(f"[Router] Sending heartbeat (no chunks for 10s)")
                                yield f"data: {json.dumps({'heartbeat': True})}\n\n"
                                last_chunk_time = current_time
                            
                            try:
                                msg_type, data = chunk_queue.get_nowait()
                                last_chunk_time = time.time()  # Reset heartbeat timer
                                
                                if msg_type == 'chunk':
                                    if not heartbeat_enabled:
                                        heartbeat_enabled = True  # Enable heartbeat after first chunk
                                        print(f"[Router] First chunk received - heartbeat enabled")
                                    chunk_num += 1
                                    print(f"[Router] Yielding chunk {chunk_num}")
                                    yield f"data: {json.dumps({'chunk': data})}\n\n"
                                elif msg_type == 'final':
                                    # Send repaired final JSON object (clients can prefer this over parsing accumulated chunks)
                                    yield f"data: {json.dumps({'final': data})}\n\n"
                                elif msg_type == 'done':
                                    print(f"[Router] Streaming complete. Sent {chunk_num} chunks.")
                                    break
                                elif msg_type == 'error':
                                    print(f"[Router] Streaming error: {data}")
                                    yield f"data: {json.dumps({'error': data})}\n\n"
                                    break
                            except queue.Empty:
                                continue
                    
                    # Send completion signal
                    yield "data: [DONE]\n\n"
                
                except Exception as e:
                    print(f"[Router] Streaming error: {e}")
                    import traceback
                    traceback.print_exc()
                    error_data = json.dumps({"error": str(e)})
                    yield f"data: {error_data}\n\n"
            
            return StreamingResponse(
                event_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache, no-transform",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",  # Disable nginx buffering
                }
            )
        else:
            # Non-streaming response
            insights = await generate_sport_insights(sport_lower, query)
            return insights
    
    except Exception as e:
        print(f"Error generating {sport} insights:", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.put("/insights/edit/{insight_id}", response_model=EditedInsights)
async def update_edited_insights(insight_id: str, request: EditInsightsRequest):
    """
    Save or update edited insights.
    
    Args:
        insight_id: Unique identifier for the insights
        request: Edited insights data
        
    Returns:
        Saved insights with timestamp
    """
    try:
        data = {
            "sport": request.sport,
            "category": request.category,
            "entity_name": request.entity_name,
            "insights": request.insights or [],
            "strengths": request.strengths or [],
            "weaknesses": request.weaknesses or []
        }
        
        result = await save_edited_insights(insight_id, data)
        return EditedInsights(**result)
    except Exception as e:
        print(f"Error saving edited insights: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save edited insights: {str(e)}"
        )


@router.get("/insights/edit/{insight_id}", response_model=Optional[EditedInsights])
async def fetch_edited_insights(insight_id: str):
    """
    Retrieve edited insights by ID.
    
    Args:
        insight_id: Unique identifier for the insights
        
    Returns:
        Edited insights if found, None otherwise
    """
    try:
        result = await get_edited_insights(insight_id)
        if result:
            return EditedInsights(**result)
        return None
    except Exception as e:
        print(f"Error fetching edited insights: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch edited insights: {str(e)}"
        )


@router.delete("/insights/edit/{insight_id}")
async def remove_edited_insights(insight_id: str):
    """
    Delete edited insights (revert to original AI-generated insights).
    
    Args:
        insight_id: Unique identifier for the insights
        
    Returns:
        Success message
    """
    try:
        success = await delete_edited_insights(insight_id)
        if success:
            return {"message": "Edited insights deleted successfully", "insight_id": insight_id}
        raise HTTPException(status_code=404, detail="Insights not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting edited insights: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete edited insights: {str(e)}"
        )

