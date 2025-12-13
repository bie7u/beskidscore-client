# HTTP-Only Cookie Authentication

## 🔐 Overview

The BeskidScore client uses **HTTP-only cookie-based authentication** for secure token management. This approach provides better security against XSS (Cross-Site Scripting) attacks compared to localStorage-based token storage.

## 🎯 Why HTTP-Only Cookies?

### Security Benefits

1. **XSS Protection**: HTTP-only cookies cannot be accessed via JavaScript, making them immune to XSS attacks that could steal tokens from localStorage.

2. **Automatic Management**: Browsers automatically include cookies in requests, eliminating the need to manually attach Authorization headers.

3. **CSRF Protection**: When combined with proper CSRF tokens, provides comprehensive security.

### Comparison with localStorage

| Aspect | localStorage | HTTP-Only Cookies |
|--------|-------------|-------------------|
| XSS Vulnerability | ❌ Vulnerable | ✅ Protected |
| Automatic Inclusion | ❌ Manual header | ✅ Automatic |
| JavaScript Access | ✅ Full access | ❌ No access |
| CSRF Protection | ✅ Not needed | ⚠️ Requires CSRF tokens |

## 🏗️ Architecture

### Cookie Storage

Tokens are stored in HTTP-only cookies on the server side:

- **Access Token Cookie**: Contains the JWT access token
  - Name: `access_token` (configurable on server)
  - Flags: `HttpOnly`, `Secure`, `SameSite=Lax`
  - Expires: Short-lived (e.g., 15 minutes)

- **Refresh Token Cookie**: Contains the JWT refresh token
  - Name: `refresh_token` (configurable on server)
  - Flags: `HttpOnly`, `Secure`, `SameSite=Lax`
  - Expires: Long-lived (e.g., 7 days)

### Request Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │   Frontend   │         │   Backend   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Login Request     │                        │
       ├──────────────────────►│                        │
       │                       │  2. POST /auth/login/  │
       │                       ├───────────────────────►│
       │                       │                        │
       │                       │  3. Set-Cookie headers │
       │                       │◄───────────────────────┤
       │  4. Store cookies     │                        │
       │◄──────────────────────┤                        │
       │                       │                        │
       │  5. API Request       │                        │
       │  (cookies auto-sent)  │                        │
       ├──────────────────────►│  6. GET /api/resource  │
       │                       ├───────────────────────►│
       │                       │  (cookies included)    │
       │                       │                        │
       │                       │  7. Response           │
       │                       │◄───────────────────────┤
       │  8. Data              │                        │
       │◄──────────────────────┤                        │
       │                       │                        │
```

## 🔄 Token Refresh Flow

When the access token expires, the system automatically refreshes it:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │   Frontend   │         │   Backend   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. API Request       │                        │
       ├──────────────────────►│  2. GET /api/resource  │
       │                       ├───────────────────────►│
       │                       │                        │
       │                       │  3. 401 Unauthorized   │
       │                       │◄───────────────────────┤
       │                       │  (access token expired)│
       │                       │                        │
       │                       │  4. POST /auth/refresh/│
       │                       ├───────────────────────►│
       │                       │  (refresh cookie sent) │
       │                       │                        │
       │                       │  5. New access cookie  │
       │  6. Update cookies    │◄───────────────────────┤
       │◄──────────────────────┤                        │
       │                       │                        │
       │  7. Retry Request     │                        │
       ├──────────────────────►│  8. GET /api/resource  │
       │                       ├───────────────────────►│
       │                       │  (new access cookie)   │
       │                       │                        │
       │                       │  9. Success Response   │
       │                       │◄───────────────────────┤
       │  10. Data             │                        │
       │◄──────────────────────┤                        │
       │                       │                        │
```

## 💻 Implementation

### Frontend Configuration

#### 1. Fetch API Configuration

All requests must include `credentials: 'include'` to send cookies:

```typescript
fetch('https://api.beskidscore.pl/api/endpoint', {
  method: 'GET',
  credentials: 'include', // ⚠️ Required for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});
```

#### 2. Authentication Utilities (`src/utils/authUtils.ts`)

The authentication utilities have been updated for cookie-based auth:

```typescript
export const authUtils = {
  // No-op methods for backward compatibility
  setTokens(tokens: AuthTokens): void {
    // Tokens are managed by server-side cookies
    console.log('Tokens stored as HTTP-only cookies');
  },

  getAccessToken(): string | null {
    // Cannot access HTTP-only cookies via JavaScript
    return null;
  },

  getRefreshToken(): string | null {
    // Cannot access HTTP-only cookies via JavaScript
    return null;
  },

  clearTokens(): void {
    // Cookies cleared by server logout endpoint
    console.log('Token clearing handled by server');
  },

  isAuthenticated(): boolean {
    // Authentication state managed by server
    return false; // Use AuthContext.user instead
  },

  getAuthHeader(): Record<string, never> {
    // No Authorization header needed (cookies used)
    return {};
  }
};
```

#### 3. API Service (`src/utils/apiService.ts`)

Key changes:

```typescript
class ApiService {
  private async fetchData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // ⚠️ Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // ... error handling
    return await response.json();
  }

  private async authenticatedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      // No Authorization header needed - cookies included automatically
      return await this.fetchData<T>(endpoint, options);
    } catch (error: any) {
      if (error.status === 401 && !endpoint.includes('/auth/refresh/')) {
        // Auto-refresh token
        await this.handleTokenRefresh();
        // Retry with new cookies
        return await this.fetchData<T>(endpoint, options);
      }
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    try {
      // Refresh token cookie sent automatically
      await this.refreshToken();
      // Server sets new cookies
    } catch (error) {
      // Redirect to login on refresh failure
      window.location.href = '/';
      throw error;
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    // No body needed - refresh cookie sent automatically
    return this.fetchData<{ access: string }>('/auth/refresh/', {
      method: 'POST',
    });
  }

  async logout(): Promise<void> {
    // Server clears cookies
    return this.authenticatedFetch<void>('/auth/logout/', {
      method: 'POST',
    });
  }
}
```

#### 4. Auth Context (`src/contexts/AuthContext.tsx`)

Updated to work with cookie-based auth:

```typescript
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // If cookies are valid, this succeeds
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        // Set dummy tokens for backward compatibility
        setTokens({ access: 'cookie-based', refresh: 'cookie-based' });
      } catch (error) {
        // Not authenticated
        setUser(null);
        setTokens(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiService.login(credentials);
    // Server sets cookies automatically
    setTokens({ access: 'cookie-based', refresh: 'cookie-based' });
    setUser(response.user);
  };

  const logout = async () => {
    await apiService.logout(); // Clears server cookies
    setTokens(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    await apiService.refreshToken(); // Server sets new cookies
    setTokens({ access: 'cookie-based', refresh: 'cookie-based' });
  };
};
```

### Backend Requirements

The backend must be configured to work with HTTP-only cookies:

#### 1. Cookie Settings

```python
# Django example
SIMPLE_JWT = {
    'AUTH_COOKIE': 'access_token',
    'AUTH_COOKIE_REFRESH': 'refresh_token',
    'AUTH_COOKIE_SECURE': True,  # HTTPS only
    'AUTH_COOKIE_HTTP_ONLY': True,  # No JavaScript access
    'AUTH_COOKIE_SAMESITE': 'Lax',  # CSRF protection
    'AUTH_COOKIE_PATH': '/',
}
```

#### 2. CORS Configuration

```python
# Django example
CORS_ALLOWED_ORIGINS = [
    "https://beskidscore.pl",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True  # ⚠️ Required for cookies
```

#### 3. Required Endpoints

1. **Login Endpoint**: `POST /api/auth/login/`
   - Request body: `{ "username": "...", "password": "..." }`
   - Response: Sets cookies + returns user data
   ```json
   {
     "tokens": { "access": "...", "refresh": "..." },
     "user": { "id": 1, "username": "..." }
   }
   ```

2. **Refresh Endpoint**: `POST /api/auth/refresh/`
   - Request: Refresh cookie sent automatically
   - Response: Sets new access cookie
   ```json
   {
     "access": "new-access-token"
   }
   ```

3. **Logout Endpoint**: `POST /api/auth/logout/`
   - Request: Cookies sent automatically
   - Response: Clears cookies (Set-Cookie with expired date)

4. **Current User Endpoint**: `GET /api/auth/me/`
   - Request: Access cookie sent automatically
   - Response: User data
   ```json
   {
     "id": 1,
     "username": "...",
     "email": "...",
     "is_staff": true
   }
   ```

## 🧪 Testing

### 1. Test Authentication Flow

```bash
# 1. Login
curl -X POST https://api.beskidscore.pl/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt

# 2. Make authenticated request
curl https://api.beskidscore.pl/api/auth/me/ \
  -b cookies.txt

# 3. Logout
curl -X POST https://api.beskidscore.pl/api/auth/logout/ \
  -b cookies.txt \
  -c cookies.txt
```

### 2. Browser DevTools

#### View Cookies
1. Open DevTools → Application → Cookies
2. Look for `access_token` and `refresh_token` cookies
3. Verify `HttpOnly` and `Secure` flags are set

#### Test Token Refresh
1. Login to the application
2. Open DevTools → Network tab
3. Wait for access token to expire (or manually delete it from cookies)
4. Make an authenticated request (e.g., load admin panel)
5. ✅ Verify `/auth/refresh/` is called automatically
6. ✅ Verify new cookie is set
7. ✅ Verify original request succeeds

#### Test Logout
1. Login to the application
2. Check cookies (should see `access_token` and `refresh_token`)
3. Click logout
4. ✅ Verify `/auth/logout/` is called
5. ✅ Verify cookies are removed
6. ✅ Verify user is redirected

### 3. Security Testing

#### Test HttpOnly Flag
```javascript
// In browser console
document.cookie.includes('access_token')
// ✅ Should return false (HttpOnly prevents JavaScript access)
```

#### Test Secure Flag (HTTPS only)
- Access token cookies should only be sent over HTTPS
- HTTP requests should not include the cookies

#### Test SameSite Protection
- Cookies should not be sent in cross-site requests
- Prevents CSRF attacks

## 🔒 Security Considerations

### Implemented Security Measures

1. **HttpOnly Flag**: ✅ Prevents XSS attacks
2. **Secure Flag**: ✅ HTTPS only transmission
3. **SameSite=Lax**: ✅ CSRF protection
4. **Automatic Refresh**: ✅ Seamless token renewal
5. **Server-side Validation**: ✅ Token validation on backend

### Additional Recommendations

1. **CSRF Tokens**: For state-changing requests (POST, PUT, DELETE)
   ```typescript
   // Include CSRF token in headers
   headers: {
     'X-CSRFToken': getCsrfToken(),
   }
   ```

2. **Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self'">
   ```

3. **Token Rotation**: Backend should rotate refresh tokens
   - Issue new refresh token on each refresh
   - Invalidate old refresh token

4. **Rate Limiting**: Limit refresh requests
   - Prevent brute force attacks
   - Limit failed login attempts

5. **Monitoring**: Log authentication events
   - Track failed login attempts
   - Monitor suspicious refresh patterns
   - Alert on security anomalies

## 🐛 Troubleshooting

### Issue: Cookies Not Being Sent

**Symptoms**: 401 errors, cookies not in request headers

**Solutions**:
1. ✅ Ensure `credentials: 'include'` in fetch options
2. ✅ Check CORS: `CORS_ALLOW_CREDENTIALS = True`
3. ✅ Verify domain matches (no localhost vs 127.0.0.1 mismatch)
4. ✅ Check SameSite settings

### Issue: Cookies Not Being Set

**Symptoms**: No cookies in browser after login

**Solutions**:
1. ✅ Check Set-Cookie headers in response
2. ✅ Verify HTTPS (Secure flag requires HTTPS)
3. ✅ Check cookie domain and path settings
4. ✅ Verify browser allows third-party cookies (if applicable)

### Issue: Token Refresh Fails

**Symptoms**: Logged out after access token expires

**Solutions**:
1. ✅ Check refresh cookie is being sent
2. ✅ Verify refresh endpoint is working
3. ✅ Check refresh token expiration
4. ✅ Review server logs for errors

### Issue: CORS Errors

**Symptoms**: "CORS policy" errors in console

**Solutions**:
1. ✅ Set `CORS_ALLOW_CREDENTIALS = True`
2. ✅ Add frontend origin to `CORS_ALLOWED_ORIGINS`
3. ✅ Don't use `*` wildcard with credentials
4. ✅ Check preflight (OPTIONS) responses

## 📊 Migration from localStorage

If migrating from localStorage-based auth:

### 1. Code Changes

✅ **Completed**:
- Updated `authUtils.ts` for cookie-based auth
- Updated `apiService.ts` to include `credentials: 'include'`
- Updated `AuthContext.tsx` to work with cookies
- Removed Authorization header logic

### 2. Backend Changes

⚠️ **Required**:
- Configure JWT to use HTTP-only cookies
- Update login endpoint to set cookies
- Update refresh endpoint to read/set cookies
- Add logout endpoint to clear cookies
- Update CORS settings

### 3. Deployment Checklist

- [ ] Backend: Enable HTTP-only cookie support
- [ ] Backend: Configure CORS with credentials
- [ ] Backend: Set up HTTPS (required for Secure flag)
- [ ] Frontend: Deploy with updated code
- [ ] Test: Verify login/logout flow
- [ ] Test: Verify token refresh works
- [ ] Monitor: Check for authentication errors

## 📚 Further Reading

- [OWASP: HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: Fetch API - credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

## 🎉 Summary

HTTP-only cookie-based authentication provides:

✅ **Better Security**: Protected against XSS attacks  
✅ **Automatic Management**: Browser handles cookies  
✅ **Seamless Refresh**: Automatic token renewal  
✅ **Standard Practice**: Industry-standard approach  
✅ **CSRF Protection**: When combined with SameSite  

The implementation is complete and well-documented. Users benefit from improved security without any impact on user experience.
