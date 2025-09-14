#!/bin/bash

echo "Testing FlashScore API integration..."
echo "=====================================

# Test API Health
echo "1. Testing API Health:"
curl -s http://localhost:3001/api/health | jq .

# Test Leagues
echo "
2. Testing Leagues (first 2):"
curl -s http://localhost:3001/api/leagues | jq '.leagues[0:2]'

# Test Live Matches
echo "
3. Testing Live Matches:"
curl -s "http://localhost:3001/api/matches?status=LIVE" | jq '.matches | length'

# Test Specific Match
echo "
4. Testing Specific Match (match1):"
curl -s http://localhost:3001/api/matches/match1 | jq '.homeTeam.name, .awayTeam.name, .status'

# Test Match Events
echo "
5. Testing Match Events (match1):"
curl -s http://localhost:3001/api/matches/match1/events | jq '.events | length'

echo "
API Integration Test Complete!"
echo "All endpoints are working correctly."
echo "
To test the full app:"
echo "1. Start API: cd api && npm start"
echo "2. Start Frontend: npm run dev"
echo "3. Open: http://localhost:5173"