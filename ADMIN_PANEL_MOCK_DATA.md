# Admin Panel Mock Data Guide

This document explains how to use the mock data system for the admin panel and blog management features.

## Overview

The admin panel uses mock data by default to allow visualization and testing without requiring a backend server. This is controlled by a simple flag in the API service.

## Configuration

To toggle between mock and real API:

**File:** `src/utils/apiService.ts`

```typescript
// Set to true to use mock data (default for development)
const USE_MOCK_BLOG_API = true;

// Set to false to use real API server
const USE_MOCK_BLOG_API = false;
```

## Mock Data Files

### 1. Blog Entries (`src/mock-data/blogEntries.json`)

Contains sample blog posts and user data:
- **6 sample blog entries** - Mix of published (4) and draft (2) posts
- **2 mock users** - Admin and Editor roles
- **Realistic content** - Polish language blog posts about football

### 2. Mock API Service (`src/utils/mockApiService.ts`)

Provides mock implementations for:
- **Authentication**
  - `login(credentials)` - Validates username and password
  - `refreshToken(token)` - Refreshes access token
  - `getCurrentUser()` - Returns logged-in user info

- **Blog Operations**
  - `getBlogEntries()` - Returns all blog posts
  - `getBlogEntry(id)` - Returns single blog post
  - `createBlogEntry(entry)` - Creates new blog post
  - `updateBlogEntry(id, entry)` - Updates existing blog post
  - `deleteBlogEntry(id)` - Deletes blog post

## How to Use

### Logging In

1. Click **"Zaloguj"** in the header
2. Enter credentials:
   - **Username:** `admin` or `editor`
   - **Password:** Any text with 3+ characters (e.g., `admin123`)
3. Click **"Zaloguj się"**

### Accessing Admin Panel

1. After logging in, click the username in the header
2. Select **"Panel administracyjny"** from dropdown
3. You'll see the admin dashboard

### Managing Blog Posts

From the admin dashboard:
- Click **"Blog"** card to view all blog entries
- Click **"Nowy wpis"** to create a new blog post
- Click the edit icon (pencil) to edit an existing post
- Click the delete icon (trash) to delete a post

### Creating a Blog Post

1. Navigate to Blog Management
2. Click **"Nowy wpis"** button
3. Fill in the form:
   - **Tytuł** (Title) - Required
   - **Excerpt** - Optional short description
   - **Treść** (Content) - Required, supports Markdown
   - **URL obrazu** - Optional featured image URL
   - **Opublikuj wpis** - Check to publish, uncheck for draft
4. Click **"Zapisz"** to save

### Editing a Blog Post

1. Navigate to Blog Management
2. Click the edit icon next to any post
3. Modify the fields as needed
4. Click **"Zapisz"** to save changes

## Mock Data Behavior

### Session Persistence
- Changes are stored in memory during the session
- **Page refresh will reset all changes** to original mock data
- This is intentional for demo/development purposes

### Authentication
- Login credentials are validated (username must exist, password must be 3+ chars)
- Tokens are stored in localStorage
- Logout clears tokens and user state
- Protected routes redirect to home when not authenticated

### API Delays
Mock API calls include realistic delays:
- Login: 500ms
- Token refresh: 300ms
- Get entries: 500ms
- Get single entry: 400ms
- Create/Update: 600ms
- Delete: 500ms

## Mock Blog Entries

The mock data includes 6 diverse blog posts:

1. **"Wielki mecz o mistrzostwo - relacja na żywo"**
   - Author: Jan Kowalski
   - Status: Published
   - Date: 2025-01-15
   - Topic: Live match report

2. **"Transfery letnie - podsumowanie okienka"**
   - Author: Anna Nowak
   - Status: Published
   - Date: 2025-01-10
   - Topic: Transfer window summary

3. **"Taktyka i analiza: Jak grać przeciwko defensywie"**
   - Author: Jan Kowalski
   - Status: Published
   - Date: 2025-01-08
   - Topic: Tactical analysis

4. **"Młody talent sezonu - wywiad"**
   - Author: Anna Nowak
   - Status: Published
   - Date: 2025-01-05
   - Topic: Player interview

5. **"Zapowiedź kolejki: Derby w centrum uwagi"**
   - Author: Jan Kowalski
   - Status: Draft
   - Date: 2025-01-03
   - Topic: Match preview

6. **"Historia klubu: 100 lat tradycji"**
   - Author: Anna Nowak
   - Status: Draft
   - Date: 2025-01-01
   - Topic: Club history

## Mock Users

Two users are available for testing:

### Admin User
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@beskidscore.pl",
  "role": "admin"
}
```

### Editor User
```json
{
  "id": 2,
  "username": "editor",
  "email": "editor@beskidscore.pl",
  "role": "editor"
}
```

Both users have the same mock password validation (any 3+ character password works).

## Switching to Real API

When ready to use the real backend:

1. Open `src/utils/apiService.ts`
2. Change `USE_MOCK_BLOG_API` to `false`
3. Ensure your backend server is running
4. Update `API_BASE_URL` if needed
5. Restart the development server

The app will then use real API endpoints:
- POST `/api/auth/login/`
- POST `/api/auth/refresh/`
- GET `/api/auth/me/`
- GET `/api/blog/`
- GET `/api/blog/:id/`
- POST `/api/blog/`
- PATCH `/api/blog/:id/`
- DELETE `/api/blog/:id/`

## Troubleshooting

### Can't log in
- Check that `USE_MOCK_BLOG_API = true` in `src/utils/apiService.ts`
- Ensure password is at least 3 characters
- Clear browser localStorage and try again

### Changes not saving
- This is expected with mock data - changes reset on page refresh
- For persistent changes, switch to real API

### Protected route redirects
- Make sure you're logged in
- Check browser console for authentication errors
- Verify tokens in localStorage

## Adding More Mock Data

To add more mock blog entries:

1. Open `src/mock-data/blogEntries.json`
2. Add new entry to the `entries` array:

```json
{
  "id": 7,
  "title": "Your Title",
  "slug": "your-title",
  "content": "## Your content here",
  "excerpt": "Short description",
  "author": 1,
  "author_name": "Jan Kowalski",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T10:00:00Z",
  "published": true,
  "featured_image": "https://example.com/image.jpg"
}
```

3. Restart the dev server to see changes

## Notes

- Match, league, team, and season data continue to use the real API
- Only authentication and blog features use mock data
- Mock service is completely isolated and doesn't affect production builds
- All TypeScript types are maintained for type safety
