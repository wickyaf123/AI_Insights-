#!/bin/bash

# Test script for Sports Insights API
# Run this after starting the backend server

echo "===== Testing Sports Insights API ====="
echo ""

echo "1. Testing Health Endpoint..."
curl -s http://localhost:3000/health | python3 -m json.tool
echo ""
echo ""

echo "2. Testing Root Endpoint..."
curl -s http://localhost:3000/ | python3 -m json.tool
echo ""
echo ""

echo "3. Testing NBA Insights (Non-streaming)..."
echo "Note: This will make an actual API call to Google Gemini and may take time."
echo "Request:"
cat << 'EOF'
{
  "selectedPlayers": ["LeBron James"],
  "team1": "Lakers",
  "team2": "Warriors"
}
EOF
echo ""
echo "Response:"
curl -s -X POST http://localhost:3000/api/nba/generate-insights \
  -H "Content-Type: application/json" \
  -d '{
    "selectedPlayers": ["LeBron James"],
    "team1": "Lakers",
    "team2": "Warriors"
  }' | python3 -m json.tool
echo ""
echo ""

echo "4. Testing EPL Insights (Non-streaming)..."
echo "Request:"
cat << 'EOF'
{
  "team1": "Manchester City",
  "team2": "Liverpool"
}
EOF
echo ""
echo "Response:"
curl -s -X POST http://localhost:3000/api/epl/generate-insights \
  -H "Content-Type: application/json" \
  -d '{
    "team1": "Manchester City",
    "team2": "Liverpool"
  }' | python3 -m json.tool
echo ""
echo ""

echo "===== Tests Complete ====="
echo ""
echo "To test streaming, use:"
echo 'curl -N -X POST http://localhost:3000/api/nba/generate-insights?stream=true \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"selectedPlayers": ["LeBron James"], "team1": "Lakers", "team2": "Warriors"}'"'"''

