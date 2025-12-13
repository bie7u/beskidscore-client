# Server Endpoints Documentation

This document describes all the backend API endpoints that need to be implemented to support the admin panel and authentication features.

## Base URL
All endpoints should be available at: `https://api.beskidscore.pl/api`

---

## Authentication Endpoints

### 1. Login
**Endpoint:** `POST /auth/login/`

**Description:** Authenticates a user and returns JWT tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"  // or "editor"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

**Notes:**
- Access token should expire after 15-60 minutes
- Refresh token should expire after 7-30 days
- Password should be hashed (bcrypt recommended)

---

### 2. Refresh Token
**Endpoint:** `POST /auth/refresh/`

**Description:** Gets a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid or expired refresh token"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /auth/me/`

**Description:** Returns the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided"
}
```

---

## Blog Endpoints

### 4. List Blog Entries
**Endpoint:** `GET /blog/`

**Description:** Returns a list of all blog entries (public endpoint - no auth required).

**Query Parameters:**
- `published` (optional): Filter by published status (true/false)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "First Blog Post",
    "slug": "first-blog-post",
    "content": "Full blog content here...",
    "excerpt": "Short description",
    "author": 1,
    "author_name": "Admin User",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "published": true,
    "featured_image": "https://example.com/image.jpg"
  }
]
```

---

### 5. Get Single Blog Entry
**Endpoint:** `GET /blog/{id}/`

**Description:** Returns a single blog entry by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "First Blog Post",
  "slug": "first-blog-post",
  "content": "Full blog content here...",
  "excerpt": "Short description",
  "author": 1,
  "author_name": "Admin User",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "published": true,
  "featured_image": "https://example.com/image.jpg"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Not found"
}
```

---

### 6. Create Blog Entry
**Endpoint:** `POST /blog/`

**Description:** Creates a new blog entry (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Blog Post",
  "content": "Full blog content...",
  "excerpt": "Short description",
  "published": false,
  "featured_image": "https://example.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "content": "Full blog content...",
  "excerpt": "Short description",
  "author": 1,
  "author_name": "Admin User",
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z",
  "published": false,
  "featured_image": "https://example.com/image.jpg"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action"
}
```

**Notes:**
- Only users with role "editor" or "admin" can create blog entries
- The `author` field should be automatically set to the authenticated user
- The `slug` should be auto-generated from the title
- The `excerpt` field is optional

---

### 7. Update Blog Entry
**Endpoint:** `PATCH /blog/{id}/`

**Description:** Updates an existing blog entry (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt",
  "published": true,
  "featured_image": "https://example.com/new-image.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Title",
  "slug": "updated-title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt",
  "author": 1,
  "author_name": "Admin User",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T12:00:00Z",
  "published": true,
  "featured_image": "https://example.com/new-image.jpg"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Not found"
}
```

**Notes:**
- Only the author of the entry or an admin can update it
- Editors can only update their own entries
- Admins can update any entry
- The `updated_at` field should be automatically updated

---

### 8. Delete Blog Entry
**Endpoint:** `DELETE /blog/{id}/`

**Description:** Deletes a blog entry (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content):**
No response body.

**Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Not found"
}
```

**Notes:**
- Only the author of the entry or an admin can delete it
- Editors can only delete their own entries
- Admins can delete any entry

---

## User Roles

### Admin
- Full access to all features
- Can create, edit, and delete any blog entry
- Can manage other users (future feature)

### Editor
- Can create blog entries
- Can edit and delete only their own blog entries
- Cannot manage other users

---

## Authentication Flow

1. **Login:**
   - User submits username and password to `/auth/login/`
   - Server validates credentials and returns access + refresh tokens
   - Client stores both tokens in localStorage

2. **Making Authenticated Requests:**
   - Client includes access token in Authorization header
   - Server validates token and processes request

3. **Token Expiration:**
   - When access token expires, server returns 401 Unauthorized
   - Client automatically calls `/auth/refresh/` with refresh token
   - Server returns new access token
   - Client retries the original request with new token

4. **Logout:**
   - Client removes tokens from localStorage
   - No server-side endpoint needed (tokens will expire naturally)

---

## CORS Configuration

The server should allow requests from:
- `https://beskidscore.pl`
- `http://localhost:5173` (for development)

Required CORS headers:
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Security Recommendations

1. **JWT Tokens:**
   - Use HS256 or RS256 algorithm
   - Include user ID and role in token payload
   - Set appropriate expiration times

2. **Password Security:**
   - Hash passwords using bcrypt with salt
   - Enforce password complexity requirements
   - Implement rate limiting on login endpoint

3. **HTTPS:**
   - Use HTTPS for all production endpoints
   - Redirect HTTP to HTTPS

4. **Input Validation:**
   - Validate all input data
   - Sanitize HTML content in blog posts
   - Prevent SQL injection and XSS attacks

5. **Rate Limiting:**
   - Implement rate limiting on authentication endpoints
   - Limit blog creation to prevent spam

---

## Database Models

### User Model
```python
{
  "id": Integer (primary key),
  "username": String (unique, required),
  "email": String (unique, required),
  "password": String (hashed, required),
  "role": Enum["admin", "editor"] (required),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### Blog Entry Model
```python
{
  "id": Integer (primary key),
  "title": String (required),
  "slug": String (unique, auto-generated),
  "content": Text (required),
  "excerpt": Text (optional),
  "author": ForeignKey(User),
  "published": Boolean (default: false),
  "featured_image": String (URL, optional),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

---

## Testing

You can test the authentication flow using curl:

```bash
# Login
curl -X POST https://api.beskidscore.pl/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Create blog entry
curl -X POST https://api.beskidscore.pl/api/blog/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "published": true
  }'

# Get all blog entries
curl https://api.beskidscore.pl/api/blog/

# Update blog entry
curl -X PATCH https://api.beskidscore.pl/api/blog/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"published": true}'

# Delete blog entry
curl -X DELETE https://api.beskidscore.pl/api/blog/1/ \
  -H "Authorization: Bearer <access_token>"
```

---

## Implementation Notes

1. **Django REST Framework (Recommended):**
   - Use `djangorestframework-simplejwt` for JWT authentication
   - Use `django-cors-headers` for CORS support

2. **FastAPI (Alternative):**
   - Use `python-jose` for JWT tokens
   - Use `passlib` for password hashing
   - Use `fastapi-cors` for CORS support

3. **Database:**
   - PostgreSQL recommended for production
   - SQLite acceptable for development

4. **Migrations:**
   - Create migrations for User and BlogEntry models
   - Create initial admin user via seed data or management command
