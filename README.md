# BidVerse Backend

Django REST API for the BidVerse Online Auction Management System.

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Linux/Mac
# OR
venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
Create a PostgreSQL database named `bidverse_db`:
```bash
psql -U postgres
CREATE DATABASE bidverse_db;
\q
```

### 4. Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/token/refresh/` - Refresh JWT token
- `GET /api/accounts/profile/` - Get user profile
- `PUT /api/accounts/profile/` - Update user profile

### Auctions
- `GET /api/auctions/` - List all active auctions
- `POST /api/auctions/create/` - Create new auction (sellers only)
- `GET /api/auctions/<id>/` - Get auction details
- `PUT /api/auctions/<id>/` - Update auction
- `DELETE /api/auctions/<id>/` - Delete auction
- `POST /api/auctions/<id>/approve/` - Approve/reject auction (admin only)

### Bids
- `POST /api/bids/place/` - Place a bid
- `GET /api/bids/auction/<auction_id>/` - Get bids for an auction
- `GET /api/bids/my-bids/` - Get user's bids
- `GET /api/bids/winning/` - Get user's winning bids

### Notifications
- `GET /api/notifications/` - Get user notifications
- `POST /api/notifications/<id>/read/` - Mark notification as read
- `POST /api/notifications/mark-all-read/` - Mark all as read

### Payments
- `POST /api/payments/create/` - Create payment
- `GET /api/payments/` - List payments
- `POST /api/payments/<id>/confirm/` - Confirm payment
- `GET /api/payments/invoices/` - Get invoices
