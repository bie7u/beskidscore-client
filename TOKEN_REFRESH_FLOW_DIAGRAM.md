# Token Refresh Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TOKEN REFRESH FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
  SCENARIO 1: SUCCESSFUL REQUEST (Token Still Valid)
═══════════════════════════════════════════════════════════════════════

┌──────────┐                                           ┌──────────┐
│  User    │                                           │   API    │
│Component │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  1. Call apiService.getCurrentUser()                │
     ├────────────────────────────────────────────────────►│
     │     Headers: Authorization: Bearer <valid_token>    │
     │                                                      │
     │  2. Return User Data                                │
     │◄────────────────────────────────────────────────────┤
     │     Status: 200 OK                                  │
     │                                                      │
     ▼                                                      ▼


═══════════════════════════════════════════════════════════════════════
  SCENARIO 2: AUTO REFRESH (Access Token Expired)
═══════════════════════════════════════════════════════════════════════

┌──────────┐                                           ┌──────────┐
│  User    │                                           │   API    │
│Component │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  1. Call apiService.getCurrentUser()                │
     ├────────────────────────────────────────────────────►│
     │     Headers: Authorization: Bearer <expired_token>  │
     │                                                      │
     │  2. Return 401 Unauthorized                         │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │                                                      │
     │  ┌─────────────────────────────────────────┐        │
     │  │  ApiService detects 401 error           │        │
     │  │  Automatically triggers token refresh   │        │
     │  └─────────────────────────────────────────┘        │
     │                                                      │
     │  3. POST /api/auth/refresh/                         │
     ├────────────────────────────────────────────────────►│
     │     Body: { refresh: <refresh_token> }              │
     │                                                      │
     │  4. Return New Access Token                         │
     │◄────────────────────────────────────────────────────┤
     │     { access: <new_token> }                         │
     │                                                      │
     │  ┌─────────────────────────────────────────┐        │
     │  │  ApiService updates token in localStorage│       │
     │  │  Retries original request with new token│        │
     │  └─────────────────────────────────────────┘        │
     │                                                      │
     │  5. RETRY: GET /api/auth/me/                        │
     ├────────────────────────────────────────────────────►│
     │     Headers: Authorization: Bearer <new_token>      │
     │                                                      │
     │  6. Return User Data                                │
     │◄────────────────────────────────────────────────────┤
     │     Status: 200 OK                                  │
     │                                                      │
     │  ✅ User sees data (seamless experience!)           │
     ▼                                                      ▼


═══════════════════════════════════════════════════════════════════════
  SCENARIO 3: REFRESH FAILED (Both Tokens Expired)
═══════════════════════════════════════════════════════════════════════

┌──────────┐                                           ┌──────────┐
│  User    │                                           │   API    │
│Component │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  1. Call apiService.getCurrentUser()                │
     ├────────────────────────────────────────────────────►│
     │     Headers: Authorization: Bearer <expired_token>  │
     │                                                      │
     │  2. Return 401 Unauthorized                         │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  3. POST /api/auth/refresh/                         │
     ├────────────────────────────────────────────────────►│
     │     Body: { refresh: <expired_refresh_token> }      │
     │                                                      │
     │  4. Return 401 Unauthorized                         │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  ┌─────────────────────────────────────────┐        │
     │  │  ApiService clears all tokens           │        │
     │  │  Redirects to home page                 │        │
     │  └─────────────────────────────────────────┘        │
     │                                                      │
     │  🔄 Redirect to /                                    │
     │                                                      │
     │  ❌ User must log in again                          │
     ▼                                                      ▼


═══════════════════════════════════════════════════════════════════════
  SCENARIO 4: CONCURRENT REQUESTS (Multiple Calls, One Refresh)
═══════════════════════════════════════════════════════════════════════

┌──────────┐                                           ┌──────────┐
│  User    │                                           │   API    │
│Component │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  1a. Call apiService.getBlogEntries()               │
     ├────────────────────────────────────────────────────►│
     │  1b. Call apiService.getCurrentUser()               │
     ├────────────────────────────────────────────────────►│
     │  1c. Call apiService.createBlogEntry()              │
     ├────────────────────────────────────────────────────►│
     │     (All sent with expired token)                   │
     │                                                      │
     │  2. All return 401 Unauthorized                     │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  ┌─────────────────────────────────────────┐        │
     │  │  First 401 triggers refresh             │        │
     │  │  Other requests WAIT for same refresh   │        │
     │  │  (using isRefreshing flag)              │        │
     │  └─────────────────────────────────────────┘        │
     │                                                      │
     │  3. POST /api/auth/refresh/ (ONLY ONCE!)            │
     ├────────────────────────────────────────────────────►│
     │                                                      │
     │  4. Return New Access Token                         │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  ┌─────────────────────────────────────────┐        │
     │  │  All waiting requests now retry         │        │
     │  │  with the new token                     │        │
     │  └─────────────────────────────────────────┘        │
     │                                                      │
     │  5a. RETRY: GET /api/blog/                          │
     ├────────────────────────────────────────────────────►│
     │  5b. RETRY: GET /api/auth/me/                       │
     ├────────────────────────────────────────────────────►│
     │  5c. RETRY: POST /api/blog/                         │
     ├────────────────────────────────────────────────────►│
     │     (All with new token)                            │
     │                                                      │
     │  6. All requests succeed                            │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  ✅ User sees all data (only 1 refresh made!)       │
     ▼                                                      ▼


═══════════════════════════════════════════════════════════════════════
  KEY IMPLEMENTATION DETAILS
═══════════════════════════════════════════════════════════════════════

1. TOKEN STORAGE (localStorage)
   ├── access_token: Short-lived JWT for API authentication
   └── refresh_token: Long-lived token to get new access tokens

2. AUTOMATIC DETECTION
   └── Every authenticatedFetch() call checks for 401 status code

3. REFRESH COORDINATION
   ├── isRefreshing flag: Prevents multiple refresh requests
   ├── refreshPromise: Allows concurrent requests to wait
   └── Single refresh serves all waiting requests

4. ERROR HANDLING
   ├── 401 on normal endpoint → Auto refresh + retry
   ├── 401 on /auth/refresh/ → Clear tokens + redirect
   └── Other errors → Propagate to caller

5. TRANSPARENT TO COMPONENTS
   └── No changes needed in React components
   └── Works automatically for all authenticated requests
```
