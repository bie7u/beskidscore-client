import type { League, Team, Match, MatchEvent, Standing, Round, Season, LoginCredentials, AuthTokens, User, BlogEntry, BlogEntryInput, BlogCategory } from './types';
import { authUtils } from './authUtils';
import { mockApiService } from './mockApiService';

// const API_BASE_URL = import.meta.env.PROD 
//   ? '/api' 
//   : 'http://localhost:8000/api';

const API_BASE_URL = 'http://localhost:8000/api';
// const API_BASE_URL = 'https://api.beskidscore.pl/api';

// Set to true to use mock data for blog and auth (for development/demo)
const USE_MOCK_BLOG_API = false;

class ApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  private async fetchData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Important: Include cookies in requests
      });
      
      if (!response.ok) {
        // Create error object with status for proper error handling
        const error = new Error(`HTTP error! status: ${response.status}`) as Error & { status: number; response: Response };
        error.status = response.status;
        error.response = response;
        console.error(`API request failed for ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      // If error doesn't have a status property, it's likely a network error
      const err = error as Error & { status?: number };
      if (!err.status) {
        console.error(`Network error for ${endpoint}:`, error);
      }
      throw error;
    }
  }

  private async authenticatedFetch<T>(endpoint: string, options: RequestInit = {}, skipAutoRefresh = false): Promise<T> {
    try {
      // With HTTP-only cookies, no need to add Authorization header
      // Cookies are automatically included due to credentials: 'include'
      return await this.fetchData<T>(endpoint, options);
    } catch (error: unknown) {
      // Handle 401 errors by attempting to refresh the token
      const err = error as { status?: number };
      console.log('[AuthenticatedFetch] Error caught:', {
        endpoint,
        errorStatus: err.status,
        hasStatus: 'status' in (err as object),
        skipAutoRefresh,
        isRefreshEndpoint: endpoint === '/auth/refresh/',
        shouldRefresh: err.status === 401 && endpoint !== '/auth/refresh/' && !skipAutoRefresh
      });
      
      if (err.status === 401 && endpoint !== '/auth/refresh/' && !skipAutoRefresh) {
        console.log('[AuthenticatedFetch] Token expired, attempting refresh...');
        
        // If we're already refreshing, wait for that to complete
        if (this.isRefreshing && this.refreshPromise) {
          console.log('[AuthenticatedFetch] Waiting for existing refresh to complete...');
          try {
            await this.refreshPromise;
            console.log('[AuthenticatedFetch] Existing refresh completed successfully');
          } catch (refreshError) {
            console.log('[AuthenticatedFetch] Existing refresh failed, not retrying request');
            throw refreshError;
          }
        } else {
          // Start refresh process
          console.log('[AuthenticatedFetch] Starting new refresh process...');
          this.isRefreshing = true;
          this.refreshPromise = this.handleTokenRefresh();
          
          try {
            await this.refreshPromise;
            console.log('[AuthenticatedFetch] Token refresh successful');
          } catch (refreshError) {
            console.log('[AuthenticatedFetch] Token refresh failed');
            throw refreshError;
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        // Retry the original request (cookies will be updated by refresh)
        console.log('[AuthenticatedFetch] Retrying original request:', endpoint);
        return await this.fetchData<T>(endpoint, options);
      }
      
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    try {
      console.log('[HandleTokenRefresh] Calling refresh token endpoint...');
      // With HTTP-only cookies, the refresh token is automatically sent
      // No need to retrieve it from storage
      await this.refreshToken();
      console.log('[HandleTokenRefresh] Refresh token successful');
      // Server will set new cookies automatically
    } catch (error) {
      console.error('[HandleTokenRefresh] Refresh token failed:', error);
      // If refresh fails, clear any authentication state
      authUtils.clearTokens();
      // Redirect to login or home page
      window.location.href = '/';
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

  // Authentication
  async login(credentials: LoginCredentials): Promise<{ tokens?: AuthTokens; user: User }> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.login(credentials);
    }
    return this.fetchData<{ tokens?: AuthTokens; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(): Promise<{ access: string }> {
    if (USE_MOCK_BLOG_API) {
      // For mock API, we still need to pass a dummy token
      return mockApiService.refreshToken('mock-refresh-token');
    }
    // With HTTP-only cookies, no body needed - refresh token cookie is sent automatically
    return this.fetchData<{ access: string }>('/auth/refresh/', {
      method: 'POST',
    });
  }

  async getCurrentUser(skipAutoRefresh = false): Promise<User> {
    if (USE_MOCK_BLOG_API) {
      return mockApiService.getCurrentUser();
    }
    return this.authenticatedFetch<User>('/auth/me/', {}, skipAutoRefresh);
  }

  async logout(skipAutoRefresh = false): Promise<void> {
    if (USE_MOCK_BLOG_API) {
      // Mock logout doesn't need server call
      return Promise.resolve();
    }
    // Call server logout endpoint to clear HTTP-only cookies
    return this.authenticatedFetch<void>('/auth/logout/', {
      method: 'POST',
    }, skipAutoRefresh);
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