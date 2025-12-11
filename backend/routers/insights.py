"""
Insights router for generating sports analytics.
Handles both streaming and non-streaming insight generation.
"""
import json
import asyncio
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional

from config import SUPPORTED_SPORTS
from models.schemas import InsightRequest, InsightResponse
from services.gemini_service import generate_sport_insights, generate_sport_insights_stream

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
                """Generate Server-Sent Events with word-by-word streaming."""
                try:
                    # Ensure files are uploaded first
                    from services.gemini_service import sport_file_uris, upload_sport_files, generate_sport_insights_stream_sync
                    
                    print(f"[Router] Starting event generator for {sport_lower}")
                    
                    if not sport_file_uris[sport_lower]:
                        print(f"[Router] Uploading files for {sport_lower}")
                        await upload_sport_files(sport_lower)
                    else:
                        print(f"[Router] Files already uploaded for {sport_lower}")
                    
                    print(f"[Router] Starting to stream chunks...")
                    chunk_num = 0
                    
                    # Stream raw chunks as they arrive for real-time display
                    for chunk in generate_sport_insights_stream_sync(sport_lower, query):
                        chunk_num += 1
                        print(f"[Router] Yielding chunk {chunk_num}")
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                        await asyncio.sleep(0)  # Allow other tasks to run
                    
                    # Send completion signal
                    print(f"[Router] Streaming complete. Sent {chunk_num} chunks. Sending completion signal.")
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

