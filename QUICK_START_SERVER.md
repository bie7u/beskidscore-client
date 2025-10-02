# Quick Start Guide for Server Implementation

This guide helps you quickly implement the required backend endpoints for the admin panel.

## Quick Setup (Django REST Framework Example)

### 1. Install Dependencies
```bash
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

### 2. Settings Configuration
```python
# settings.py

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://beskidscore.pl",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

### 3. Models
```python
# models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('editor', 'Editor'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='editor')

class BlogEntry(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    published = models.BooleanField(default=False)
    featured_image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
```

### 4. Serializers
```python
# serializers.py

from rest_framework import serializers
from .models import BlogEntry, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class BlogEntrySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = BlogEntry
        fields = ['id', 'title', 'slug', 'content', 'excerpt', 'author', 
                  'author_name', 'created_at', 'updated_at', 'published', 'featured_image']
        read_only_fields = ['author', 'slug', 'created_at', 'updated_at']
```

### 5. Views
```python
# views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import BlogEntry, User
from .serializers import BlogEntrySerializer, UserSerializer

@api_view(['POST'])
@permission_classes([])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': UserSerializer(user).data
        })
    
    return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response(UserSerializer(request.user).data)

class BlogEntryViewSet(viewsets.ModelViewSet):
    queryset = BlogEntry.objects.all()
    serializer_class = BlogEntrySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Only allow author or admin to update
        obj = self.get_object()
        if obj.author != self.request.user and self.request.user.role != 'admin':
            raise PermissionError("You don't have permission to edit this entry")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow author or admin to delete
        if instance.author != self.request.user and self.request.user.role != 'admin':
            raise PermissionError("You don't have permission to delete this entry")
        instance.delete()
```

### 6. URLs
```python
# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import BlogEntryViewSet, login_view, current_user_view

router = DefaultRouter()
router.register(r'blog', BlogEntryViewSet)

urlpatterns = [
    path('api/auth/login/', login_view),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/auth/me/', current_user_view),
    path('api/', include(router.urls)),
]
```

### 7. Create Initial Admin User
```bash
python manage.py createsuperuser
# Then update the role field to 'admin'
```

## Quick Setup (FastAPI Example)

### 1. Install Dependencies
```bash
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart
```

### 2. Main Application
```python
# main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://beskidscore.pl", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Models
class User(BaseModel):
    id: int
    username: str
    email: str
    role: str

class BlogEntry(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    author: int
    author_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    published: bool
    featured_image: Optional[str] = None

# Authentication
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        # Fetch user from database
        return get_user_by_username(username)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

@app.post("/api/auth/login/")
async def login(username: str, password: str):
    # Verify user credentials
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_access_token(data={"sub": user.username, "type": "refresh"})
    
    return {
        "tokens": {
            "access": access_token,
            "refresh": refresh_token
        },
        "user": user
    }

@app.get("/api/auth/me/")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/blog/")
async def list_blog_entries():
    # Return list of blog entries from database
    pass

@app.post("/api/blog/")
async def create_blog_entry(entry: BlogEntry, current_user: User = Depends(get_current_user)):
    # Create new blog entry
    pass

# Add more endpoints as needed...
```

## Testing the Endpoints

### Using curl
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}'

# Get current user
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create blog entry
curl -X POST http://localhost:8000/api/blog/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is my first blog post",
    "published": true
  }'
```

## Important Notes

1. **Change SECRET_KEY**: Use a secure, random secret key in production
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate Input**: Add proper input validation
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Database**: Use PostgreSQL in production, not SQLite
6. **Logging**: Add proper logging for security events
7. **Backups**: Set up regular database backups

## Need More Help?

See `SERVER_ENDPOINTS_DOCUMENTATION.md` for detailed specifications of all endpoints, including:
- Complete request/response examples
- Error handling
- Security best practices
- Database schema details
