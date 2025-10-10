# Token Refresh Mechanism

## Overview

The BeskidScore client implements an automatic token refresh mechanism using **HTTP-only cookies** to handle expired access tokens seamlessly. When an authenticated API request fails due to an expired access token (401 Unauthorized), the system automatically attempts to refresh the token and retry the request.

> **Note**: This application uses HTTP-only cookie-based authentication for enhanced security. For complete documentation, see [HTTP_ONLY_COOKIE_AUTH.md](./HTTP_ONLY_COOKIE_AUTH.md).

## How It Works

### 1. Token Storage
- **Access Token**: Stored in HTTP-only cookie (server-side)
- **Refresh Token**: Stored in HTTP-only cookie (server-side)
- Both tokens are managed by the server and automatically included in requests
- Client-side JavaScript cannot access these tokens (XSS protection)

### 2. Authentication Flow

#### Initial Login
1. User provides credentials (username and password)
2. Frontend sends login request to `/api/auth/login/` with `credentials: 'include'`
3. Backend responds with user data and sets HTTP-only cookies:
   - `Set-Cookie: access_token=eyJ...; HttpOnly; Secure; SameSite=Lax`
   - `Set-Cookie: refresh_token=eyJ...; HttpOnly; Secure; SameSite=Lax`
4. Browser automatically stores cookies
5. User information is stored in React context

#### Authenticated Requests
1. For protected endpoints, `authenticatedFetch()` method is used
2. Access token cookie is automatically included by the browser
3. No Authorization header needed (cookies are sent automatically)

### 3. Token Refresh Process

When an access token expires, the following automatic process occurs:

#### Step 1: Detect Expiration
- API request returns 401 Unauthorized status
- Error is caught in `authenticatedFetch()` method

#### Step 2: Refresh Token
- Check if token refresh is already in progress
  - If yes: Wait for the ongoing refresh to complete
  - If no: Start new refresh process
- Send refresh request to `/api/auth/refresh/` with `credentials: 'include'`
- Refresh token cookie is automatically included by the browser
- Backend validates refresh token cookie and sets new access token cookie:
  ```
  Set-Cookie: access_token=eyJ...; HttpOnly; Secure; SameSite=Lax
  ```
- Browser automatically updates the access token cookie

#### Step 3: Retry Original Request
- Retry the failed request with `credentials: 'include'`
- Browser automatically includes the new access token cookie
- Return the response to the caller

#### Step 4: Handle Refresh Failure
If the refresh token is also expired or invalid:
1. Clear authentication state on client
2. Redirect user to home page
3. User must log in again (server will set new cookies)

## Implementation Details

### Key Components

#### 1. `ApiService` class (`src/utils/apiService.ts`)
```typescript
class ApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  private async authenticatedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      // Cookies are automatically included with credentials: 'include'
      return await this.fetchData<T>(endpoint, options);
    } catch (error: any) {
      // Handle 401 errors
      if (error.status === 401 && !endpoint.includes('/auth/refresh/')) {
        // Refresh token and retry
      }
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    // Refresh token cookie is automatically sent
    await this.refreshToken();
    // Server sets new access token cookie
  }
}
```

#### 2. Preventing Multiple Refresh Requests
- Uses `isRefreshing` flag to track refresh status
- Uses `refreshPromise` to queue concurrent requests
- Multiple 401 errors wait for the same refresh operation

### Error Handling

1. **401 on Regular Endpoint**
   - Triggers automatic token refresh
   - Retries original request

2. **401 on Refresh Endpoint**
   - Means refresh token is invalid/expired
   - Clears tokens and redirects to home

3. **Other HTTP Errors**
   - Propagated to calling code
   - Handled by component error states

## Security Considerations

1. **Token Storage**: Tokens are stored in HTTP-only cookies
   - **Protected from XSS attacks** (JavaScript cannot access cookies)
   - Requires proper CORS configuration with `credentials: 'include'`
   - Must use HTTPS (Secure flag)

2. **Automatic Redirect**: Failed refresh redirects to home
   - Prevents infinite refresh loops
   - Ensures user re-authenticates with valid credentials

3. **Refresh Token Rotation**: Backend should implement refresh token rotation
   - Issue new refresh token on each refresh
   - Invalidate old refresh token for better security

4. **CSRF Protection**: HTTP-only cookies require CSRF protection
   - Use SameSite=Lax or SameSite=Strict
   - Implement CSRF tokens for state-changing requests

## Usage Example

### In Components
```typescript
// Component code doesn't need to handle token refresh
const BlogManagement = () => {
  const loadBlogEntries = async () => {
    try {
      // Token refresh happens automatically if needed
      const entries = await apiService.getBlogEntries();
      setBlogEntries(entries);
    } catch (error) {
      // Only handle actual errors, not 401s
      console.error('Failed to load blog entries:', error);
    }
  };
};
```

### In API Service
```typescript
// Protected endpoint automatically uses token refresh
async getBlogEntries(): Promise<BlogEntry[]> {
  return this.authenticatedFetch<BlogEntry[]>('/blog/');
}

// Public endpoint doesn't need authentication
async getLeagues(): Promise<League[]> {
  return this.fetchData<League[]>('/leagues/');
}
```

## Testing

To test the token refresh mechanism:

1. **Manually Expire Access Token**
   - Open browser DevTools → Application → Cookies
   - Delete the `access_token` cookie
   - Make an authenticated request
   - Verify token is refreshed automatically

2. **Expire Refresh Token**
   - Delete both `access_token` and `refresh_token` cookies
   - Make an authenticated request
   - Verify user is redirected to home page

3. **Concurrent Requests**
   - Make multiple authenticated requests simultaneously
   - Verify only one refresh request is made
   - Verify all requests complete successfully

> **Note**: With HTTP-only cookies, you cannot modify cookie values via JavaScript. Use browser DevTools to manually delete cookies for testing.

## Future Improvements

1. **Refresh Token Rotation**
   - Backend should return new refresh token on each refresh
   - Frontend automatically receives updated cookie
   - Enhances security by limiting token lifespan

2. **Proactive Refresh**
   - Decode JWT to check expiration time
   - Refresh token before it expires
   - Prevents 401 errors altogether

3. **Retry Queue**
   - Queue failed requests during refresh
   - Automatically retry all queued requests
   - Better handling of concurrent requests

4. **CSRF Tokens**
   - Implement CSRF token validation
   - Required for state-changing requests with cookies
   - Complement SameSite cookie protection

For complete documentation on HTTP-only cookie authentication, see [HTTP_ONLY_COOKIE_AUTH.md](./HTTP_ONLY_COOKIE_AUTH.md).
