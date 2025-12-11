"""
Pydantic models for request and response validation.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class InsightRequest(BaseModel):
    """Request model for generating insights."""
    selectedPlayers: Optional[List[str]] = Field(default=None, description="List of selected players")
    team1: Optional[str] = Field(default=None, description="First team name")
    team2: Optional[str] = Field(default=None, description="Second team name")
    venue: Optional[str] = Field(default=None, description="Venue name (for IPL)")


class PlayerInsights(BaseModel):
    """Player-specific insights."""
    insights: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)


class TeamInsights(BaseModel):
    """Team-specific insights."""
    insights: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)


class VenueInsights(BaseModel):
    """Venue-specific insights (for cricket)."""
    insights: List[str] = Field(default_factory=list)
    characteristics: List[str] = Field(default_factory=list)


class InsightResponse(BaseModel):
    """Response model for insights."""
    players: Optional[Dict[str, PlayerInsights]] = None
    team1: Optional[TeamInsights] = None
    team2: Optional[TeamInsights] = None
    venue: Optional[VenueInsights] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: str

