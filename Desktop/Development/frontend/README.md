# BidVerse Frontend

React.js frontend for the BidVerse Online Auction Management System.

## Features

- User Authentication (Login/Register)
- Browse Active Auctions
- Real-time Bidding System
- Countdown Timer for Auctions
- Create and Manage Auctions (Sellers)
- Bid Management
- User Dashboard
- Admin Dashboard
- Profile Management
- Responsive Design

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The app is configured to proxy API requests to `http://localhost:8000` (Django backend).
If your backend runs on a different port, update the `proxy` field in `package.json`.

### 3. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000/`

### 4. Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.js
│   ├── PrivateRoute.js
│   ├── CountdownTimer.js
│   └── AuctionCard.js
├── pages/              # Page components
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── AuctionList.js
│   ├── AuctionDetail.js
│   ├── CreateAuction.js
│   ├── MyAuctions.js
│   ├── MyBids.js
│   ├── Profile.js
│   └── AdminDashboard.js
├── context/            # Context providers
│   └── AuthContext.js
├── services/           # API services
│   └── api.js
├── App.js
├── index.js
└── index.css
```

## User Roles

### Bidder
- Browse and search auctions
- Place bids on active auctions
- View bid history
- Track winning bids

### Seller
- All bidder features
- Create new auctions
- Manage own auctions
- View auction analytics

### Admin
- All seller features
- Approve/reject auctions
- Manage all users
- Monitor platform activity

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Technologies Used

- React 18.2
- React Router 6
- Axios
- React Toastify
- Google Maps React Wrapper
- JWT Decode
