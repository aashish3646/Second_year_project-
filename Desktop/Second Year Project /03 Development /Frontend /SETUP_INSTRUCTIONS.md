# React Frontend Setup Instructions

## Prerequisites
- Node.js 16 or higher
- npm or yarn

## Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd "Frontend "
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
Frontend/
├── src/
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Entry point
├── api/
│   └── authApi.js       # API functions for authentication
├── context/
│   └── AuthContext.jsx  # Authentication context provider
├── components/
│   ├── Navbar.jsx       # Navigation bar component
│   └── ProtectedRoute.jsx # Route protection component
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx    # Login page
│   │   └── Signup.jsx   # Signup page
│   └── Dashboard.jsx    # Protected dashboard page
└── package.json
```

## Features

- ✅ User registration with email and password
- ✅ User login with JWT authentication
- ✅ Protected routes (Dashboard requires authentication)
- ✅ Automatic token refresh on expiration
- ✅ Persistent login (stays logged in on page reload)
- ✅ Logout functionality

## Testing

1. **Register a new user:**
   - Navigate to `/signup`
   - Fill in name, email, and password (min 6 characters)
   - Click "Sign Up"
   - You'll be redirected to the dashboard

2. **Login:**
   - Navigate to `/login`
   - Enter your email and password
   - Click "Login"
   - You'll be redirected to the dashboard

3. **Access Dashboard:**
   - The dashboard is protected and requires authentication
   - If not logged in, you'll be redirected to login

4. **Logout:**
   - Click the "Logout" button in the navbar
   - You'll be logged out and redirected to login

## API Configuration

The API base URL is set in `api/authApi.js`:
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';
```

Make sure your Django backend is running on this URL.

