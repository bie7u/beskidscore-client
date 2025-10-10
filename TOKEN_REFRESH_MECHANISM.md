# Token Refresh Mechanism

## Overview

The BeskidScore client implements an automatic token refresh mechanism to handle expired access tokens seamlessly. When an authenticated API request fails due to an expired access token (401 Unauthorized), the system automatically attempts to refresh the token and retry the request.

## How It Works

### 1. Token Storage
- **Access Token**: Stored in `localStorage` as `access_token`
- **Refresh Token**: Stored in `localStorage` as `refresh_token`
- Both tokens are managed by the `authUtils` utility in `src/utils/authUtils.ts`

### 2. Authentication Flow

#### Initial Login
1. User provides credentials (username and password)
2. Frontend sends login request to `/api/auth/login/`
3. Backend responds with:
   ```json
   {
     "tokens": {
       "access": "eyJ...",
       "refresh": "eyJ..."
     },
     "user": { ... }
   }
   ```
4. Tokens are stored in localStorage
5. User information is stored in React context

#### Authenticated Requests
1. For protected endpoints, `authenticatedFetch()` method is used
2. Access token is automatically attached to request headers:
   ```
   Authorization: Bearer <access_token>
   ```

### 3. Token Refresh Process

When an access token expires, the following automatic process occurs:

#### Step 1: Detect Expiration
- API request returns 401 Unauthorized status
- Error is caught in `authenticatedFetch()` method

#### Step 2: Refresh Token
- Check if token refresh is already in progress
  - If yes: Wait for the ongoing refresh to complete
  - If no: Start new refresh process
- Send refresh request to `/api/auth/refresh/` with refresh token:
  ```json
  {
    "refresh": "eyJ..."
  }
  ```
- Backend validates refresh token and returns new access token:
  ```json
  {
    "access": "eyJ..."
  }
  ```
- Update access token in localStorage

#### Step 3: Retry Original Request
- Retry the failed request with the new access token
- Return the response to the caller

#### Step 4: Handle Refresh Failure
If the refresh token is also expired or invalid:
1. Clear all tokens from localStorage
2. Redirect user to home page
3. User must log in again

## Implementation Details

### Key Components

#### 1. `ApiService` class (`src/utils/apiService.ts`)
```typescript
class ApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  private async authenticatedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      // Make authenticated request
      return await this.fetchData<T>(endpoint, { ...options, headers });
    } catch (error: any) {
      // Handle 401 errors
      if (error.status === 401 && !endpoint.includes('/auth/refresh/')) {
        // Refresh token and retry
      }
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    // Refresh the access token
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

1. **Token Storage**: Tokens are stored in localStorage
   - Vulnerable to XSS attacks
   - Should be combined with proper Content Security Policy

2. **Automatic Redirect**: Failed refresh redirects to home
   - Prevents infinite refresh loops
   - Ensures user re-authenticates with valid credentials

3. **Refresh Token Rotation**: Current implementation reuses refresh token
   - Backend should implement refresh token rotation for better security

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
   - Open browser DevTools → Application → Local Storage
   - Modify the `access_token` to an invalid value
   - Make an authenticated request
   - Verify token is refreshed automatically

2. **Expire Refresh Token**
   - Modify both `access_token` and `refresh_token`
   - Make an authenticated request
   - Verify user is redirected to home page

3. **Concurrent Requests**
   - Make multiple authenticated requests simultaneously
   - Verify only one refresh request is made
   - Verify all requests complete successfully

## Future Improvements

1. **Refresh Token Rotation**
   - Backend should return new refresh token on each refresh
   - Frontend should update both access and refresh tokens

2. **Proactive Refresh**
   - Decode JWT to check expiration time
   - Refresh token before it expires
   - Prevents 401 errors altogether

3. **Retry Queue**
   - Queue failed requests during refresh
   - Automatically retry all queued requests
   - Better handling of concurrent requests

4. **Token Storage**
   - Consider using httpOnly cookies for tokens
   - Reduces XSS attack surface
   - Requires backend changes
