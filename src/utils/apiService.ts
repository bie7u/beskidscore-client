import type { League, Team, Match, MatchEvent, Standing, Round, Season, LoginCredentials, AuthTokens, User, BlogEntry, BlogEntryInput, BlogCategory } from './types';
import { authUtils } from './authUtils';
import { mockApiService } from './mockApiService';

// const API_BASE_URL = import.meta.env.PROD 
//   ? '/api' 
//   : 'http://localhost:8000/api';

// const API_BASE_URL = 'http://100.64.0.1:8000/api';
const API_BASE_URL = 'https://api.beskidscore.pl/api';

// Set to true to use mock data for blog and auth (for development/demo)
const USE_MOCK_BLOG_API = false;

class ApiService {
  private async fetchData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async authenticatedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      ...authUtils.getAuthHeader(),
      ...options.headers,
    };

    return this.fetchData<T>(endpoint, { ...options, headers });
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

  // Authentication
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.login(credentials);
    }
    return this.fetchData<{ tokens: AuthTokens; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.refreshToken(refreshToken);
    }
    return this.fetchData<{ access: string }>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.getCurrentUser();
    }
    return this.authenticatedFetch<User>('/auth/me/');
  }

  // Blog
  async getBlogEntries(): Promise<BlogEntry[]> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.getBlogEntries();
    }
    return this.fetchData<BlogEntry[]>('/blog/');
  }

  async getBlogEntry(id: number): Promise<BlogEntry> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.getBlogEntry(id);
    }
    return this.fetchData<BlogEntry>(`/blog/${id}/`);
  }

  async createBlogEntry(entry: BlogEntryInput): Promise<BlogEntry> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.createBlogEntry(entry);
    }
    return this.authenticatedFetch<BlogEntry>('/blog/', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateBlogEntry(id: number, entry: Partial<BlogEntryInput>): Promise<BlogEntry> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.updateBlogEntry(id, entry);
    }
    return this.authenticatedFetch<BlogEntry>(`/blog/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(entry),
    });
  }

  async deleteBlogEntry(id: number): Promise<void> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.deleteBlogEntry(id);
    }
    return this.authenticatedFetch<void>(`/blog/${id}/`, {
      method: 'DELETE',
    });
  }

  async getBlogCategories(): Promise<BlogCategory[]> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.getBlogCategories();
    }
    return this.fetchData<BlogCategory[]>('/blog/categories/');
  }
}

export const apiService = new ApiService();
export default apiService;