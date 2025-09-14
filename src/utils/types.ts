// Base interfaces for the application

export interface League {
  id: number;
  name: string;
  logo: string;
  country: string;
}

export interface Season {
  id: number;
  year: number;
  name: string;
  league: number;
}

export interface Round {
  id: number;
  league: number;
  league_read: string;
  season: number;
  round_number: number;
  name: string;
  start_date: string;
  end_date: string;
  matches?: Match[]; // Optional field for when API returns matches with rounds
}

export interface StandingEntry {
  position: number;
  team: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface Standing {
  id: number;
  league: number;
  league_read: string;
  season: number;
  promotion_number?: number;
  playoffs_number?: number;
  relegation_number?: number;
  table: StandingEntry[];
}

export interface Team {
  id: number;
  name: string;
  logo?: string;
  founded?: number;
  stadium?: string;
  website?: string;
  score?: number;
}

export interface Match {
  id: number;
  league: number;
  league_read: string;
  season: number;
  round: number;
  round_number_read: string;
  home_team: Team;
  away_team: Team;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  minute?: number | null;
  date: string;
  venue?: string;
}

export type MatchStatus = 'LIVE' | 'FINISHED' | 'SCHEDULED' | 'POSTPONED' | 'CANCELLED';

export interface MatchEvent {
  id: number;
  match: number;
  event_type: EventType;
  minute: number;
  team: number;
  player_id?: number;
  player_name: string;
  description?: string;
}

export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'PENALTY' | 'OWN_GOAL';

export interface Player {
  id: number;
  name: string;
  position?: string;
  number?: number;
}

// Context types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Component prop types
export interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
}

export interface MatchListProps {
  matches: Match[];
  onMatchClick?: (match: Match) => void;
}

export interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague?: number;
  onLeagueSelect: (leagueId: number | null) => void;
}

export interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason?: string;
  onSeasonSelect: (seasonId: string) => void;
}

// Utility types
export interface DateFilter {
  startDate: Date;
  endDate: Date;
}

export interface MatchFilters {
  league_id?: number;
  season?: number;
  status?: MatchStatus;
  date?: DateFilter;
}