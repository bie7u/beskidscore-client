# FlashScore Clone - Mock Data Documentation

This document outlines all mock data locations and the structure of data that should be supplied to replace the mock data with real API calls.

## Mock Data Files Location

All mock data files are located in: `/src/mock-data/`

## Data Sources and Structures

### 1. Leagues (`/src/mock-data/leagues.json`)

**Purpose**: Contains information about football leagues/competitions

**Structure**:
```typescript
{
  "leagues": [
    {
      "id": string,           // Unique league identifier (e.g., "pl", "laliga")
      "name": string,         // Display name (e.g., "Premier League")
      "country": string,      // Country/region (e.g., "England")
      "logo": string          // Logo URL/path
    }
  ]
}
```

**Usage in Components**:
- `src/pages/Home.tsx` - League filtering
- `src/pages/LeagueOverview.tsx` - League selection
- `src/pages/Live.tsx` - League filtering
- `src/components/league/LeagueSelector.tsx` - League dropdown

---

### 2. Seasons (`/src/mock-data/seasons.json`)

**Purpose**: Contains season information for each league

**Structure**:
```typescript
{
  "seasons": [
    {
      "id": string,           // Unique season identifier (e.g., "2025", "2025-laliga")
      "year": string,         // Season year (e.g., "2025")
      "name": string,         // Display name (e.g., "2025/26")
      "leagueId": string      // Reference to league.id
    }
  ]
}
```

**Current Default Season**: 2025/26

**Usage in Components**:
- `src/pages/LeagueOverview.tsx` - Season selection
- `src/components/league/SeasonSelector.tsx` - Season dropdown

---

### 3. Teams (`/src/mock-data/teams.json`)

**Purpose**: Contains team information

**Structure**:
```typescript
{
  "teams": [
    {
      "id": string,           // Unique team identifier (e.g., "mu", "mcfc")
      "name": string,         // Team name (e.g., "Manchester United")
      "logo": string,         // Team logo URL/path
      "country": string,      // Team's country
      "founded": number,      // Year founded
      "stadium": string,      // Home stadium name
      "website": string       // Official website URL
    }
  ]
}
```

**Usage in Components**:
- Match displays (team names and logos)
- Team detail pages (if implemented)

---

### 4. Matches (`/src/mock-data/matches.json`)

**Purpose**: Contains match/fixture information

**Structure**:
```typescript
{
  "matches": [
    {
      "id": string,           // Unique match identifier
      "leagueId": string,     // Reference to league.id
      "seasonId": string,     // Reference to season.id
      "roundId": string,      // Optional reference to round.id
      "homeTeam": {
        "id": string,         // Reference to team.id
        "name": string,       // Team name
        "score": number | null // Match score (null for unplayed matches)
      },
      "awayTeam": {
        "id": string,         // Reference to team.id
        "name": string,       // Team name
        "score": number | null // Match score (null for unplayed matches)
      },
      "status": "LIVE" | "FINISHED" | "SCHEDULED" | "POSTPONED" | "CANCELLED",
      "minute": number,       // Current match minute (for live matches)
      "date": string,         // ISO 8601 date string
      "venue": string         // Stadium/venue name
    }
  ]
}
```

**Usage in Components**:
- `src/pages/Home.tsx` - All matches with date/league filtering
- `src/pages/Live.tsx` - Live matches only
- `src/pages/LeagueOverview.tsx` - League-specific matches
- `src/components/match/MatchList.tsx` - Match display
- `src/components/match/MatchCard.tsx` - Individual match cards

---

### 5. Rounds (`/src/mock-data/rounds.json`)

**Purpose**: Contains matchday/round information for organizing fixtures

**Structure**:
```typescript
{
  "rounds": [
    {
      "id": string,           // Unique round identifier (e.g., "pl-2025-1")
      "leagueId": string,     // Reference to league.id
      "seasonId": string,     // Reference to season.id
      "roundNumber": number,  // Round number (1, 2, 3, etc.)
      "name": string,         // Display name (e.g., "Matchday 1", "Jornada 1")
      "startDate": string,    // ISO 8601 date string
      "endDate": string       // ISO 8601 date string
    }
  ]
}
```

**Usage in Components**:
- `src/pages/LeagueOverview.tsx` - Round-based fixture organization
- `src/components/league/RoundSelector.tsx` - Round navigation

---

### 6. Standings (`/src/mock-data/standings.json`)

**Purpose**: Contains league table/standings information

**Structure**:
```typescript
{
  "standings": [
    {
      "id": string,           // Unique standings identifier
      "leagueId": string,     // Reference to league.id
      "seasonId": string,     // Reference to season.id
      "table": [
        {
          "position": number,     // League position (1, 2, 3, etc.)
          "teamId": string,       // Reference to team.id
          "teamName": string,     // Team name
          "played": number,       // Matches played
          "won": number,          // Matches won
          "drawn": number,        // Matches drawn
          "lost": number,         // Matches lost
          "goalsFor": number,     // Goals scored
          "goalsAgainst": number, // Goals conceded
          "goalDifference": number, // Goal difference
          "points": number        // Total points
        }
      ]
    }
  ]
}
```

**Usage in Components**:
- `src/pages/LeagueOverview.tsx` - League table display
- `src/components/league/StandingsTable.tsx` - Table formatting and display

---

### 7. Events (`/src/mock-data/events.json`)

**Purpose**: Contains match events (goals, cards, substitutions, etc.)

**Structure**:
```typescript
{
  "events": [
    {
      "id": string,           // Unique event identifier
      "matchId": string,      // Reference to match.id
      "type": "GOAL" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "PENALTY" | "OWN_GOAL",
      "minute": number,       // Event minute
      "teamId": string,       // Reference to team.id
      "playerId": string,     // Optional player identifier
      "playerName": string,   // Player name
      "description": string   // Optional event description
    }
  ]
}
```

**Usage in Components**:
- `src/pages/MatchDetails.tsx` - Match timeline and events
- Match event components

---

## Data Relationships

```
League (1) ──── (many) Season
Season (1) ──── (many) Round
Season (1) ──── (many) Match
Season (1) ──── (1) Standing
Round (1) ──── (many) Match
Match (1) ──── (many) Event
Team (1) ──── (many) Match (as home/away)
Team (1) ──── (many) StandingEntry
```

## API Integration Points

When replacing mock data with real APIs, update these files:

1. **`src/pages/Home.tsx`** (lines 11-12): Replace mock imports with API calls
2. **`src/pages/Live.tsx`** (lines 10-11): Replace mock imports with API calls  
3. **`src/pages/LeagueOverview.tsx`** (lines 11-15): Replace mock imports with API calls
4. **`src/pages/MatchDetails.tsx`**: Replace mock imports with API calls

## Default Values

- **Current Season**: 2025/26
- **Default League**: None (user must select)
- **Date Filter**: Current date
- **Live Update Interval**: Not implemented (static data)

## Data Loading Simulation

Currently, all mock data loading includes artificial delays (800-1000ms) to simulate API response times. Remove these `setTimeout` calls when implementing real API integration.

## Required External APIs

To fully replace mock data, you'll need APIs for:

1. **Leagues/Competitions**: List of available leagues
2. **Seasons**: Available seasons per league
3. **Teams**: Team information and metadata
4. **Fixtures**: Match schedules and results
5. **Live Scores**: Real-time match updates
6. **Standings**: League tables and statistics
7. **Match Events**: Goals, cards, substitutions timeline
8. **Rounds/Matchdays**: Fixture organization by rounds