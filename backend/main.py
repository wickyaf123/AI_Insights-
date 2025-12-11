"""
FastAPI backend for Sports Insights Generator.
Provides AI-powered insights for NBA, AFL, NRL, EPL, and IPL using Google Gemini.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from config import ALLOWED_ORIGINS, HOST, PORT
from models.schemas import HealthResponse
from routers import insights

# Create FastAPI application
app = FastAPI(
    title="Sports Insights API",
    description="AI-powered sports analytics using Google Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(insights.router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow().isoformat()
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Sports Insights API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )

