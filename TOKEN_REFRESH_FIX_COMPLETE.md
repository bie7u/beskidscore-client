# Token Refresh Fix Summary

## Problem Statement
The token refresh mechanism was not working properly. After receiving a 401 error, the client was not calling the refresh endpoint to obtain a new access token, forcing users to log in again manually.

## Root Causes Identified

### 1. Inconsistent Error Object Structure
**Problem**: Only 401 errors had a `status` property added to the error object. Other HTTP errors were created as plain Error objects without status information.

**Impact**: This inconsistency could cause issues in error handling and made debugging difficult.

**Fix**: All HTTP errors now include a `status` property, ensuring consistent error object structure throughout the application.

### 2. Missing Error Handling for Concurrent Refresh Attempts
**Problem**: When multiple requests failed with 401 simultaneously, some requests would wait for an existing refresh to complete. However, if that refresh failed, the waiting requests didn't handle the error properly.

**Impact**: If a refresh failed, waiting requests would still attempt to retry their original requests, potentially causing undefined behavior.

**Fix**: Added proper try-catch blocks for waiting requests. If the refresh fails, the error is now properly propagated without attempting a retry.

### 3. Imprecise Endpoint Check
**Problem**: The code used `endpoint.includes('/auth/refresh/')` to check if the current request is to the refresh endpoint. This substring check could potentially match other endpoints that contain this string.

**Impact**: Could cause issues if there were endpoints like `/auth/refresh/status/` or similar.

**Fix**: Changed to exact match: `endpoint === '/auth/refresh/'` for more precise checking.

### 4. Lack of Debugging Information
**Problem**: No logging was present to trace the token refresh flow, making it difficult to diagnose issues.

**Impact**: When refresh didn't work, it was impossible to tell why without inspecting the code.

**Fix**: Added comprehensive debug logging throughout the token refresh flow, including:
- When errors are caught
- What the error status is
- Whether refresh should be triggered
- When refresh starts and completes
- When requests are retried

## Changes Made

### File: `src/utils/apiService.ts`

#### 1. Enhanced `fetchData` Method
```typescript
// Before: Only 401 errors had status property
if (response.status === 401) {
  const error = new Error(...) as Error & { status: number };
  error.status = response.status;
  throw error;
}
throw new Error(`HTTP error! status: ${response.status}`); // No status property!

// After: All HTTP errors have status property
if (!response.ok) {
  const error = new Error(...) as Error & { status: number; response: Response };
  error.status = response.status;
  error.response = response;
  console.error(`API request failed for ${endpoint}:`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url
  });
  throw error;
}
```

#### 2. Improved `authenticatedFetch` Method
```typescript
// Added debug logging
console.log('[AuthenticatedFetch] Error caught:', {
  endpoint,
  errorStatus: err.status,
  hasStatus: 'status' in (err as object),
  skipAutoRefresh,
  isRefreshEndpoint: endpoint === '/auth/refresh/',
  shouldRefresh: err.status === 401 && endpoint !== '/auth/refresh/' && !skipAutoRefresh
});

// Fixed concurrent refresh handling
if (this.isRefreshing && this.refreshPromise) {
  console.log('[AuthenticatedFetch] Waiting for existing refresh to complete...');
  try {
    await this.refreshPromise;
    console.log('[AuthenticatedFetch] Existing refresh completed successfully');
  } catch (refreshError) {
    // NEW: Properly handle refresh failure
    console.log('[AuthenticatedFetch] Existing refresh failed, not retrying request');
    throw refreshError; // Don't retry if refresh failed
  }
}

// Fixed new refresh handling
else {
  console.log('[AuthenticatedFetch] Starting new refresh process...');
  this.isRefreshing = true;
  this.refreshPromise = this.handleTokenRefresh();
  
  try {
    await this.refreshPromise;
    console.log('[AuthenticatedFetch] Token refresh successful');
  } catch (refreshError) {
    // NEW: Properly handle refresh failure
    console.log('[AuthenticatedFetch] Token refresh failed');
    throw refreshError; // Don't retry if refresh failed
  } finally {
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}

// Changed endpoint check from includes() to exact match
if (err.status === 401 && endpoint !== '/auth/refresh/' && !skipAutoRefresh) {
```

#### 3. Enhanced `handleTokenRefresh` Method
```typescript
// Added debug logging
console.log('[HandleTokenRefresh] Calling refresh token endpoint...');
await this.refreshToken();
console.log('[HandleTokenRefresh] Refresh token successful');

// Error logging
console.error('[HandleTokenRefresh] Refresh token failed:', error);
```

## How Token Refresh Works Now

### Normal Flow (Token Expired)
1. User performs an authenticated action (e.g., create blog post)
2. Request fails with 401 (access token expired)
3. **DEBUG LOG**: `[AuthenticatedFetch] Error caught: { errorStatus: 401, shouldRefresh: true }`
4. **DEBUG LOG**: `[AuthenticatedFetch] Token expired, attempting refresh...`
5. System checks if refresh is already in progress
6. If not, starts new refresh:
   - **DEBUG LOG**: `[AuthenticatedFetch] Starting new refresh process...`
   - **DEBUG LOG**: `[HandleTokenRefresh] Calling refresh token endpoint...`
7. Refresh succeeds (server sets new cookies)
   - **DEBUG LOG**: `[HandleTokenRefresh] Refresh token successful`
   - **DEBUG LOG**: `[AuthenticatedFetch] Token refresh successful`
8. Original request is retried with new token
   - **DEBUG LOG**: `[AuthenticatedFetch] Retrying original request: [endpoint]`
9. Request succeeds
10. User's action completes without needing to log in again

### Concurrent Requests Flow
1. Multiple requests fail with 401 at the same time
2. First request starts the refresh process
3. Other requests see refresh is already in progress
   - **DEBUG LOG**: `[AuthenticatedFetch] Waiting for existing refresh to complete...`
4. All requests wait for the same refresh to complete
5. After refresh succeeds, all requests retry their original operations
6. **Important**: Only ONE refresh request is made, not one per failed request

### Failure Flow (Refresh Token Expired)
1. User performs an authenticated action
2. Request fails with 401
3. System attempts to refresh
   - **DEBUG LOG**: `[HandleTokenRefresh] Calling refresh token endpoint...`
4. Refresh fails with 401 (refresh token also expired)
   - **DEBUG LOG**: `[HandleTokenRefresh] Refresh token failed: Error: HTTP error! status: 401`
5. System clears tokens and redirects to home page
6. User must log in again

## Testing Instructions

See `TOKEN_REFRESH_FIX_TEST_PLAN.md` for comprehensive testing instructions.

### Quick Test
1. Log in to the application
2. Open browser DevTools Console
3. Wait for token to expire (or manually delete the `access_token` cookie)
4. Try to create or edit a blog post
5. Check the console logs - you should see the refresh flow logs
6. The action should complete successfully without requiring login

## Expected Behavior

### ✅ What Should Happen
- Token refresh happens automatically and transparently
- User stays logged in when access token expires
- Only one refresh request is made for concurrent 401 errors
- Detailed logs help diagnose any issues
- If refresh token is expired, user is logged out gracefully

### ❌ What Should NOT Happen
- User should not be logged out when only access token expires
- Multiple refresh requests should not be made simultaneously
- Original requests should not retry if refresh fails
- Infinite refresh loops should not occur

## Benefits

1. **Better User Experience**: Users stay logged in longer without interruption
2. **Improved Reliability**: Proper error handling prevents undefined behavior
3. **Easier Debugging**: Comprehensive logging makes issues easy to diagnose
4. **Better Code Quality**: Consistent error object structure throughout
5. **More Secure**: Prevents potential edge cases and race conditions

## Future Improvements

Consider these enhancements based on testing results:

1. **Proactive Refresh**: Refresh tokens before they expire (requires JWT decoding)
2. **Retry Queue**: Queue failed requests during refresh for better concurrency handling
3. **Progressive Backoff**: If refresh keeps failing, use exponential backoff
4. **User Notification**: Show a subtle notification when token is being refreshed
5. **Configurable Logging**: Make debug logging configurable (dev vs production)

## Migration Notes

- No changes required to existing code that uses `apiService`
- Debug logging is currently always enabled - consider making it configurable
- All existing functionality is preserved and enhanced
