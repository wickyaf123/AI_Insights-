# Sports Insights Platform

AI-powered sports analytics platform providing data-driven insights for NBA, AFL, NRL, EPL, and IPL using Google Gemini.

## Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI with Google Gemini AI
- **Data**: CSV files with historical sports statistics

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
python main.py
```

Backend will run on `http://localhost:3000`

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:8080`

### 3. Access the Application

Open `http://localhost:8080` in your browser.

## Features

### Supported Sports

- **NBA**: Player and team analytics with quarter-by-quarter performance
- **AFL**: Player goals, disposals, and team performance metrics
- **NRL**: Try scoring analysis and team statistics
- **EPL**: Team performance, goals per half, home/away analysis
- **IPL**: Batting analysis, venue characteristics, toss decisions

### Key Capabilities

- Real-time AI-generated insights using Google Gemini
- Streaming responses for better user experience
- Player-specific performance analysis
- Team matchup predictions
- Historical data analysis from CSV files
- Interactive visualizations (charts, tables, pitch maps)

## Project Structure

```
.
├── backend/                 # FastAPI Python backend
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration
│   ├── requirements.txt    # Python dependencies
│   ├── data/               # CSV data files
│   ├── models/             # Pydantic schemas
│   ├── routers/            # API endpoints
│   └── services/           # Business logic (Gemini integration)
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Sport-specific pages
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Utilities
│   ├── package.json
│   └── vite.config.ts
│
└── README.md              # This file
```

## Development

### Backend Development

The backend uses FastAPI with automatic API documentation:
- Swagger UI: `http://localhost:3000/docs`
- ReDoc: `http://localhost:3000/redoc`

Key files:
- `backend/services/gemini_service.py`: AI integration and prompt engineering
- `backend/routers/insights.py`: API endpoint definitions
- `backend/models/schemas.py`: Request/response models

### Frontend Development

The frontend uses Vite for fast development with Hot Module Replacement (HMR).

Key directories:
- `frontend/src/pages/`: Sport-specific page components
- `frontend/src/components/ui/`: Shadcn UI components
- `frontend/src/components/[sport]/`: Sport-specific visualizations

### Adding a New Sport

1. **Add Data**: Place CSV files in `backend/data/`
2. **Update Backend**:
   - Add file paths in `backend/services/gemini_service.py`
   - Create sport-specific prompt
   - Add to `SUPPORTED_SPORTS` in `backend/config.py`
3. **Update Frontend**:
   - Create page in `frontend/src/pages/[Sport].tsx`
   - Add route in `frontend/src/App.tsx`
   - Create visualizations in `frontend/src/components/[sport]/`

## API Documentation

### Generate Insights

**Endpoint**: `POST /api/{sport}/generate-insights`

**Parameters**:
- `sport`: One of `nba`, `afl`, `nrl`, `epl`, `ipl`
- `stream` (query): Set to `true` for streaming response

**Request Body**:
```json
{
  "selectedPlayers": ["Player 1", "Player 2"],
  "team1": "Team Name 1",
  "team2": "Team Name 2",
  "venue": "Venue Name"  // For IPL only
}
```

**Response**: JSON with insights, strengths, and weaknesses for players and teams.

## Environment Variables

### Backend (.env)

```env
GEMINI_API_KEY=your_api_key_here
```

## Building for Production

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 3000
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Backend Issues

**Problem**: "GEMINI_API_KEY is required"
- Solution: Create `.env` file in backend directory with your API key

**Problem**: CSV files not found
- Solution: Ensure data files are in `backend/data/` directory

### Frontend Issues

**Problem**: API requests failing
- Solution: Ensure backend is running on port 3000
- Check Vite proxy configuration in `vite.config.ts`

**Problem**: CORS errors
- Solution: Backend CORS is configured for localhost:8080
- Update `ALLOWED_ORIGINS` in `backend/config.py` if needed

## License

Private - All rights reserved

## Support

For issues and questions, please refer to the individual README files in the `backend/` and `frontend/` directories.

