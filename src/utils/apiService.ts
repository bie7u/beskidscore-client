import type { League, Team, Match, MatchEvent, Standing, Round, Season } from './types';

// const API_BASE_URL = import.meta.env.PROD 
//   ? '/api' 
//   : 'http://localhost:8000/api';

// const API_BASE_URL = 'http://100.64.0.1:8000/api';
const API_BASE_URL = 'https://api.beskidscore.pl/api';

class ApiService {
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Leagues
  async getLeagues(league_name?: string): Promise<League[]> {
    const params = league_name ? `?league_name=${league_name}` : '';
    return this.fetchData<League[]>(`/leagues/${params}`);
  }

  async getLeague(id: number): Promise<League> {
    return this.fetchData<League>(`/leagues/${id}/`);
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.fetchData<Team[]>(`/teams/`);
  }

  async getTeam(id: number): Promise<Team> {
    return this.fetchData<Team>(`/teams/${id}/`);
  }

  // Matches
  async getMatches(filters: {
    league_id?: number;
    status?: string;
    date?: string;
    team_id?: number;
  } = {}): Promise<Match[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    return this.fetchData<Match[]>(`/matches/${queryString ? '?' + queryString : ''}`);
  }

  async getMatch(matchId: number): Promise<Match> {
    return this.fetchData<Match>(`/matches/${matchId}/`);
  }

  async getMatchEvents(matchId: number): Promise<{ events: MatchEvent[] }> {
    return this.fetchData<{ events: MatchEvent[] }>(`/matches/${matchId}/events/`);
  }

  // Standings
  async getStandings(league?: number, season?: number): Promise<Standing[]> {
    const params = new URLSearchParams();
    if (league !== undefined) params.append('league', league.toString());
    if (season !== undefined) params.append('season', season.toString());
    
    const queryString = params.toString();
    return this.fetchData<Standing[]>(`/standings/${queryString ? '?' + queryString : ''}`);
  }

  async getStanding(id: number): Promise<Standing> {
    return this.fetchData<Standing>(`/standings/${id}/`);
  }

  // Rounds
  async getRounds(league?: number, season?: number): Promise<Round[]> {
    const params = new URLSearchParams();
    if (league !== undefined) params.append('league', league.toString());
    if (season !== undefined) params.append('season__year', season.toString());
    
    const queryString = params.toString();
    return this.fetchData<Round[]>(`/rounds/${queryString ? '?' + queryString : ''}`);
  }

  async getRound(id: number): Promise<Round> {
    return this.fetchData<Round>(`/rounds/${id}/`);
  }

  // Seasons
  async getSeasons(league?: number): Promise<Season[]> {
    const params = league !== undefined ? `?league=${league}` : '';
    return this.fetchData<Season[]>(`/seasons/${params}`);
  }

  async getSeason(id: number): Promise<Season> {
    return this.fetchData<Season>(`/seasons/${id}/`);
  }

  // Health check
  async getHealth(): Promise<{ status: string; message: string }> {
    return this.fetchData<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;