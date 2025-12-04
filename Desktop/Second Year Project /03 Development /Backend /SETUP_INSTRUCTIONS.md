# Django Backend Setup Instructions

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation Steps

1. **Navigate to the backend directory:**
   ```bash
   cd "Backend /bidverse"
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create environment variables (optional but recommended):**
   Create a `.env` file in the `bidverse` directory:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

6. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create a superuser (optional, for admin access):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://127.0.0.1:8000`

## API Endpoints

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login user
- `GET /api/auth/user/` - Get current user (requires authentication)
- `POST /api/auth/logout/` - Logout user (requires authentication)
- `POST /api/auth/token/refresh/` - Refresh access token

## Testing the API

You can test the endpoints using:
- Postman
- curl
- The React frontend

Example registration:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "password_confirm": "test123", "name": "Test User"}'
```

Example login:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

