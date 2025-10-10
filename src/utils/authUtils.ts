import type { AuthTokens } from './types';

/**
 * Authentication utilities for HTTP-only cookie-based authentication.
 * 
 * With HTTP-only cookies, tokens are stored server-side in cookies and are
 * automatically included in requests by the browser. The client-side code
 * does not directly access or store the tokens, providing better security
 * against XSS attacks.
 */

export const authUtils = {
  /**
   * Store tokens - No-op for HTTP-only cookie implementation
   * Tokens are stored server-side in HTTP-only cookies
   */
  setTokens(_tokens: AuthTokens): void {
    // With HTTP-only cookies, tokens are managed by the server
    // and automatically included in requests via cookies.
    // No client-side storage needed.
    console.log('Tokens received and stored as HTTP-only cookies by the server');
  },

  /**
   * Get access token - Not accessible with HTTP-only cookies
   * This method is kept for backward compatibility but returns null
   */
  getAccessToken(): string | null {
    // HTTP-only cookies cannot be accessed via JavaScript
    // The browser automatically includes them in requests
    return null;
  },

  /**
   * Get refresh token - Not accessible with HTTP-only cookies
   * This method is kept for backward compatibility but returns null
   */
  getRefreshToken(): string | null {
    // HTTP-only cookies cannot be accessed via JavaScript
    // The browser automatically includes them in requests
    return null;
  },

  /**
   * Clear tokens - Handled by server-side logout endpoint
   * Client-side cannot directly clear HTTP-only cookies
   */
  clearTokens(): void {
    // HTTP-only cookies must be cleared by the server
    // The logout endpoint should clear the cookies
    console.log('Token clearing will be handled by server logout endpoint');
  },

  /**
   * Check if user is authenticated
   * With HTTP-only cookies, we rely on the server to validate authentication
   * This method is kept for backward compatibility
   */
  isAuthenticated(): boolean {
    // With HTTP-only cookies, authentication state is managed by the server
    // Client components should check the user object from AuthContext instead
    return false;
  },

  /**
   * Get auth header - Not needed with HTTP-only cookies
   * Returns empty object as cookies are automatically included
   */
  getAuthHeader(): Record<string, never> {
    // With HTTP-only cookies, no Authorization header is needed
    // The browser automatically includes cookies in requests
    return {};
  }
};
