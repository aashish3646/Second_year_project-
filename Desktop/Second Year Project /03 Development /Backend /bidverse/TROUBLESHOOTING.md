# Backend Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "ModuleNotFoundError" or Import Errors

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 2: "No module named 'accounts'"

**Solution:**
- Make sure you're in the correct directory: `Backend /bidverse`
- Verify `accounts` app exists in `INSTALLED_APPS` in `settings.py`
- Run: `python manage.py check`

### Issue 3: Database/Migration Errors

**Solution:**
```bash
# Delete database and recreate (WARNING: This deletes all data)
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

### Issue 4: Port Already in Use

**Solution:**
```bash
# Use a different port
python manage.py runserver 8001

# Or kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Issue 5: CORS Errors in Browser

**Solution:**
- Verify `corsheaders` is in `INSTALLED_APPS`
- Verify `CorsMiddleware` is in `MIDDLEWARE` (should be near the top)
- Check `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL

### Issue 6: "AUTH_USER_MODEL" Errors

**Solution:**
- Make sure `AUTH_USER_MODEL = 'accounts.CustomUser'` is in `settings.py`
- Run migrations: `python manage.py migrate`

## Quick Health Check

Run this to verify everything is set up correctly:

```bash
cd "Backend /bidverse"
source venv/bin/activate
python test_backend.py
```

All tests should pass with ✓ marks.

## Starting the Server

**Correct way to start:**
```bash
cd "Backend /bidverse"
source venv/bin/activate
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

## Testing Endpoints

### Test Registration:
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

### Test Login:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## Still Having Issues?

1. Check the error message carefully
2. Run `python manage.py check` to see system issues
3. Check Django logs in the terminal where you started the server
4. Verify all files are in the correct locations

