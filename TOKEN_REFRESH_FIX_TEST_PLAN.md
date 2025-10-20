# Token Refresh Fix - Test Plan

## Overview
This document describes the changes made to fix the token refresh issue and provides a comprehensive test plan.

## Changes Made

### 1. Enhanced Error Handling
- **Fixed**: All HTTP errors now include a `status` property, not just 401 errors
- **Fixed**: Network errors are properly logged and distinguished from HTTP errors
- **Benefit**: Ensures consistent error object structure for proper error handling

### 2. Improved Refresh Logic
- **Fixed**: Added proper error handling when waiting for an existing refresh to complete
- **Fixed**: Retry no longer happens if the refresh fails
- **Fixed**: More precise endpoint check using exact match instead of substring
- **Benefit**: Prevents incorrect retry attempts and avoids potential infinite loops

### 3. Comprehensive Debug Logging
- **Added**: Detailed logging throughout the token refresh flow
- **Logs Include**:
  - When an error is caught in `authenticatedFetch`
  - The error status code
  - Whether the error has a status property
  - Whether the refresh should be triggered
  - When refresh starts and completes
  - When the original request is retried
- **Benefit**: Makes it easy to diagnose token refresh issues

## How to Test

### Prerequisites
1. Build the application: `npm run build`
2. Serve the application: `npm run preview` or deploy to your server
3. Open browser DevTools (F12) and go to the Console tab

### Test Scenario 1: Normal Token Refresh

**Objective**: Verify that token refresh works when access token expires

**Steps**:
1. Log in to the application
2. Open DevTools → Application → Cookies
3. Note the `access_token` cookie value
4. Wait for the access token to expire naturally (or modify it to trigger expiration)
5. Perform an authenticated action (e.g., create/edit a blog post)

**Expected Results**:
- Console shows: `[AuthenticatedFetch] Error caught: { errorStatus: 401, shouldRefresh: true }`
- Console shows: `[AuthenticatedFetch] Token expired, attempting refresh...`
- Console shows: `[HandleTokenRefresh] Calling refresh token endpoint...`
- Console shows: `[HandleTokenRefresh] Refresh token successful`
- Console shows: `[AuthenticatedFetch] Token refresh successful`
- Console shows: `[AuthenticatedFetch] Retrying original request: /blog/`
- The action completes successfully without requiring re-login
- The `access_token` cookie has a new value

### Test Scenario 2: Concurrent Requests with Expired Token

**Objective**: Verify that multiple concurrent requests don't trigger multiple refreshes

**Steps**:
1. Log in to the application
2. Wait for or force token expiration
3. Quickly perform multiple authenticated actions (e.g., open blog editor, click save, create another post)

**Expected Results**:
- Console shows: `[AuthenticatedFetch] Token expired, attempting refresh...` (once)
- Console shows: `[AuthenticatedFetch] Waiting for existing refresh to complete...` (for subsequent requests)
- Console shows only ONE `[HandleTokenRefresh] Calling refresh token endpoint...` log
- All requests complete successfully after the single refresh

### Test Scenario 3: Both Tokens Expired

**Objective**: Verify that user is logged out when refresh token is also expired

**Steps**:
1. Log in to the application
2. Open DevTools → Application → Cookies
3. Delete both `access_token` and `refresh_token` cookies
4. Perform an authenticated action

**Expected Results**:
- Console shows: `[AuthenticatedFetch] Token expired, attempting refresh...`
- Console shows: `[HandleTokenRefresh] Calling refresh token endpoint...`
- Console shows: `[HandleTokenRefresh] Refresh token failed: [error details]`
- User is redirected to the home page
- User is logged out (need to log in again)

### Test Scenario 4: Network Error

**Objective**: Verify that network errors are handled properly

**Steps**:
1. Log in to the application
2. Open DevTools → Network tab
3. Set throttling to "Offline"
4. Perform an authenticated action

**Expected Results**:
- Console shows: `Network error for [endpoint]: [error details]`
- Error is displayed to the user (not a silent failure)
- No refresh attempt is made (since there's no 401 error)

### Test Scenario 5: Read vs Write Operations

**Objective**: Verify that read operations don't require authentication, but write operations do

**Steps**:
1. Log out of the application
2. Try to view blog entries (GET operation)
3. Try to create a blog entry (POST operation)

**Expected Results**:
- Viewing blog entries works without authentication
- Creating a blog entry requires authentication (shows login modal or error)

## Debug Log Reference

### Success Flow
```
[AuthenticatedFetch] Error caught: { endpoint: "/blog/", errorStatus: 401, hasStatus: true, skipAutoRefresh: false, isRefreshEndpoint: false, shouldRefresh: true }
[AuthenticatedFetch] Token expired, attempting refresh...
[AuthenticatedFetch] Starting new refresh process...
[HandleTokenRefresh] Calling refresh token endpoint...
[HandleTokenRefresh] Refresh token successful
[AuthenticatedFetch] Token refresh successful
[AuthenticatedFetch] Retrying original request: /blog/
```

### Concurrent Request Flow
```
[AuthenticatedFetch] Error caught: { endpoint: "/blog/", errorStatus: 401, shouldRefresh: true }
[AuthenticatedFetch] Token expired, attempting refresh...
[AuthenticatedFetch] Starting new refresh process...
[HandleTokenRefresh] Calling refresh token endpoint...

[AuthenticatedFetch] Error caught: { endpoint: "/blog/1/", errorStatus: 401, shouldRefresh: true }
[AuthenticatedFetch] Token expired, attempting refresh...
[AuthenticatedFetch] Waiting for existing refresh to complete...

[HandleTokenRefresh] Refresh token successful
[AuthenticatedFetch] Token refresh successful
[AuthenticatedFetch] Retrying original request: /blog/
[AuthenticatedFetch] Existing refresh completed successfully
[AuthenticatedFetch] Retrying original request: /blog/1/
```

### Refresh Failure Flow
```
[AuthenticatedFetch] Error caught: { endpoint: "/blog/", errorStatus: 401, shouldRefresh: true }
[AuthenticatedFetch] Token expired, attempting refresh...
[AuthenticatedFetch] Starting new refresh process...
[HandleTokenRefresh] Calling refresh token endpoint...
API request failed for /auth/refresh/: { status: 401, statusText: "Unauthorized", url: "..." }
[HandleTokenRefresh] Refresh token failed: Error: HTTP error! status: 401
[AuthenticatedFetch] Token refresh failed
```

## Troubleshooting

### Issue: Refresh is not triggered on 401 error
**Check**:
- Is the error status code actually 401?
- Is the request using `authenticatedFetch` or just `fetchData`?
- Is `skipAutoRefresh` set to true?
- Is the endpoint exactly `/auth/refresh/`?

**Solution**: Check the debug logs. The log `[AuthenticatedFetch] Error caught:` shows all the conditions. Look at `shouldRefresh` - if it's `false`, check which condition is failing.

### Issue: Refresh is called but fails
**Check**:
- Are cookies being sent with the request? (Check DevTools → Network → Request Headers → Cookie)
- Is the server properly configured for CORS with credentials?
- Is the refresh token cookie valid and not expired?

**Solution**: Check the network tab to see the actual request and response. The server should accept `credentials: 'include'` and return `Access-Control-Allow-Credentials: true`.

### Issue: Refresh succeeds but retry fails
**Check**:
- Did the server actually set new cookies? (Check DevTools → Application → Cookies)
- Is the new access token valid?

**Solution**: This indicates a server-side issue. The refresh endpoint should return a success response AND set new HTTP-only cookies.

### Issue: Multiple refresh requests are being made
**Check**:
- Are multiple requests failing at exactly the same time?
- Is the `isRefreshing` flag being properly reset?

**Solution**: This should not happen with the current implementation. If it does, check the debug logs to see if there's a timing issue.

## Next Steps

After testing, consider:

1. **If everything works**: The debug logging can be reduced or removed for production
2. **If issues persist**: Share the console logs with the development team for further investigation
3. **Performance optimization**: Consider proactive token refresh (refresh before expiration) to avoid 401 errors
4. **User experience**: Add a loading indicator during token refresh to prevent confusion

## Additional Notes

- The application uses HTTP-only cookies for token storage, which provides better security against XSS attacks
- The `credentials: 'include'` option is crucial for cookies to be sent with requests
- The server must be configured to accept credentials and return appropriate CORS headers
- Token refresh is automatic and transparent to the user in most cases
