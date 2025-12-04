# Full Stack Authentication System

A complete authentication system built with Django (Backend) and React.js (Frontend) using JWT tokens.

## 🚀 Features

### Backend (Django)
- ✅ Custom User model with email-only authentication
- ✅ JWT-based authentication (access token: 5 min, refresh token: 1 day)
- ✅ User registration with validation
- ✅ User login
- ✅ Protected user profile endpoint
- ✅ Token blacklisting on logout
- ✅ CORS support for React frontend
- ✅ Django REST Framework

### Frontend (React)
- ✅ User registration page
- ✅ User login page
- ✅ Protected dashboard
- ✅ Automatic token refresh
- ✅ Persistent login (survives page reload)
- ✅ Protected routes
- ✅ Context API for global auth state
- ✅ Axios interceptors for token management

## 📁 Project Structure

```
.
├── Backend /
│   └── bidverse/
│       ├── accounts/          # Authentication app
│       │   ├── models.py      # CustomUser model
│       │   ├── serializers.py # DRF serializers
│       │   ├── views.py       # API views
│       │   └── urls.py        # URL routing
│       ├── bidverse/
│       │   ├── settings.py    # Django settings
│       │   └── urls.py        # Main URL config
│       ├── requirements.txt   # Python dependencies
│       └── manage.py
│
└── Frontend /
    ├── src/
    │   ├── App.jsx            # Main app with routing
    │   └── main.jsx           # Entry point
    ├── api/
    │   └── authApi.js         # API functions
    ├── context/
    │   └── AuthContext.jsx    # Auth context
    ├── components/
    │   ├── Navbar.jsx
    │   └── ProtectedRoute.jsx
    ├── pages/
    │   ├── Auth/
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   └── Dashboard.jsx
    └── package.json
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd "Backend /bidverse"
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Run server:
   ```bash
   python manage.py runserver
   ```

Backend will run on `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd "Frontend "
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication Endpoints

- `POST /api/auth/register/` - Register new user
  - Body: `{ "email": "user@example.com", "password": "password123", "password_confirm": "password123", "name": "User Name" }`
  - Returns: `{ "message": "...", "user": {...}, "token": { "access": "...", "refresh": "..." } }`

- `POST /api/auth/login/` - Login user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns: `{ "message": "...", "user": {...}, "access": "...", "refresh": "..." }`

- `GET /api/auth/user/` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`
  - Returns: `{ "id": 1, "email": "...", "name": "...", ... }`

- `POST /api/auth/logout/` - Logout user (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`
  - Body: `{ "refresh": "<refresh_token>" }`
  - Returns: `{ "message": "Successfully logged out" }`

- `POST /api/auth/token/refresh/` - Refresh access token
  - Body: `{ "refresh": "<refresh_token>" }`
  - Returns: `{ "access": "<new_access_token>" }`

## 🔐 Authentication Flow

1. **Registration:**
   - User fills signup form
   - Frontend sends POST to `/api/auth/register/`
   - Backend creates user and returns JWT tokens
   - Tokens stored in localStorage
   - User redirected to dashboard

2. **Login:**
   - User fills login form
   - Frontend sends POST to `/api/auth/login/`
   - Backend validates credentials and returns JWT tokens
   - Tokens stored in localStorage
   - User redirected to dashboard

3. **Protected Routes:**
   - Access token sent in `Authorization: Bearer <token>` header
   - If token expired, refresh token used automatically
   - If refresh fails, user redirected to login

4. **Logout:**
   - Refresh token sent to backend for blacklisting
   - All tokens removed from localStorage
   - User redirected to login

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "password_confirm": "test123",
    "name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://127.0.0.1:8000/api/auth/user/ \
  -H "Authorization: Bearer <your_access_token>"
```

## 📝 Notes

- Access tokens expire after 5 minutes
- Refresh tokens expire after 1 day
- Tokens are automatically refreshed when access token expires
- All passwords must be at least 6 characters
- Email must be unique
- CORS is configured for `localhost:3000` and `localhost:5173`

## 🔧 Technologies Used

### Backend
- Django 5.2.8
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- SQLite (default database)

### Frontend
- React 18
- React Router DOM
- Axios
- Vite

## 📄 License

This project is for educational purposes.

