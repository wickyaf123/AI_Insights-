# Sports Insights Backend

FastAPI backend for generating AI-powered sports analytics using Google Gemini.

## Features

- **Multi-Sport Support**: NBA, AFL, NRL, EPL, IPL
- **AI-Powered Insights**: Uses Google Gemini 2.0 Flash for data analysis
- **Streaming Support**: Server-Sent Events (SSE) for real-time insights
- **CSV Data Processing**: Analyzes historical sports data from CSV files
- **RESTful API**: Clean, documented API endpoints

## Requirements

- Python 3.9+
- Google Gemini API Key

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 4. Verify Data Files

Ensure CSV files are present in the `data/` directory:

```
data/
├── AFL_players_1711.csv
├── AFL_teams_1711.csv
├── EPL_TeamData_121125.csv
├── IPL/
│   ├── Batters_StrikeRateVSBowlerTypeNew.csv
│   ├── IPL_21_24_Batting.csv
│   ├── IPL_Venue_details.csv
│   ├── VenueTossDecisions.csv
│   └── VenueToss_Situation_Details.csv
├── NBA_PlayerStats.csv
├── NBA_Team_Stats.csv
├── NRL_Players_recent_try_form141125.csv
└── NRL_TeamAnalysis.csv
```

## Running the Server

### Development Mode (with auto-reload)

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 3000 --reload
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and timestamp.

### Generate Insights

```
POST /api/{sport}/generate-insights?stream=true
```

**Supported Sports**: `nba`, `afl`, `nrl`, `epl`, `ipl`

**Request Body**:
```json
{
  "selectedPlayers": ["Player Name 1", "Player Name 2"],
  "team1": "Team 1 Name",
  "team2": "Team 2 Name",
  "venue": "Venue Name" // For IPL only
}
```

**Query Parameters**:
- `stream` (optional): Set to `true` for Server-Sent Events streaming

**Response** (Non-streaming):
```json
{
  "players": {
    "Player Name": {
      "insights": ["Stat with numbers"],
      "strengths": ["Data-backed strength"],
      "weaknesses": ["Weakness with stats"]
    }
  },
  "team1": {
    "insights": ["Team stat"],
    "strengths": ["Strength"],
    "weaknesses": ["Weakness"]
  },
  "team2": {
    "insights": ["Team stat"],
    "strengths": ["Strength"],
    "weaknesses": ["Weakness"]
  }
}
```

### API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:3000/docs`
- ReDoc: `http://localhost:3000/redoc`

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration and environment variables
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create this)
├── .gitignore          # Git ignore rules
├── data/               # CSV data files
├── models/
│   ├── __init__.py
│   └── schemas.py      # Pydantic models for validation
├── routers/
│   ├── __init__.py
│   └── insights.py     # API endpoint handlers
└── services/
    ├── __init__.py
    └── gemini_service.py  # Gemini AI integration
```

## Development

### Adding a New Sport

1. Add CSV files to `data/` directory
2. Update `get_sport_file_paths()` in `services/gemini_service.py`
3. Add sport-specific prompt in `get_sport_prompt()`
4. Add sport to `SUPPORTED_SPORTS` in `config.py`

### Testing

Test endpoints using curl:

```bash
# Health check
curl http://localhost:3000/health

# Generate insights (non-streaming)
curl -X POST http://localhost:3000/api/nba/generate-insights \
  -H "Content-Type: application/json" \
  -d '{
    "selectedPlayers": ["LeBron James", "Stephen Curry"],
    "team1": "Lakers",
    "team2": "Warriors"
  }'

# Generate insights (streaming)
curl -N -X POST http://localhost:3000/api/nba/generate-insights?stream=true \
  -H "Content-Type: application/json" \
  -d '{
    "selectedPlayers": ["LeBron James"],
    "team1": "Lakers",
    "team2": "Warriors"
  }'
```

## Troubleshooting

### Import Errors

Make sure you're in the virtual environment:
```bash
source venv/bin/activate
```

### Missing API Key

Ensure `.env` file exists with valid `GEMINI_API_KEY`:
```bash
cat .env
```

### CSV Files Not Found

Verify data files are in the correct location:
```bash
ls -la data/
```

## License

Private - All rights reserved

