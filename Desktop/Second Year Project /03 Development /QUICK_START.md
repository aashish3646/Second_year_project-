# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup

```bash
# Navigate to backend
cd "Backend /bidverse"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start server
python manage.py runserver
```

✅ Backend running on `http://127.0.0.1:8000`

### Step 2: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd "Frontend "

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 3: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Sign up" or navigate to `/signup`
3. Create an account:
   - Name: Your Name
   - Email: test@example.com
   - Password: test123 (min 6 characters)
4. You'll be automatically logged in and redirected to the dashboard
5. Try logging out and logging back in

## 🎯 What You Get

- ✅ Complete authentication system
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Protected routes
- ✅ Automatic token refresh
- ✅ Persistent sessions
- ✅ Clean, modern UI

## 📚 Next Steps

- Customize the UI styling
- Add more protected pages
- Implement password reset
- Add email verification
- Deploy to production

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure virtual environment is activated
- Check if port 8000 is already in use
- Verify all dependencies are installed

**Frontend won't start:**
- Make sure Node.js is installed (v16+)
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is available

**CORS errors:**
- Make sure backend is running on `http://127.0.0.1:8000`
- Check `settings.py` CORS configuration
- Verify frontend is on `localhost:5173` or `localhost:3000`

**Authentication not working:**
- Check browser console for errors
- Verify tokens are being stored in localStorage
- Check network tab for API responses

## 📞 Need Help?

Check the detailed documentation in:
- `README.md` - Full project documentation
- `Backend /SETUP_INSTRUCTIONS.md` - Backend setup details
- `Frontend /SETUP_INSTRUCTIONS.md` - Frontend setup details

