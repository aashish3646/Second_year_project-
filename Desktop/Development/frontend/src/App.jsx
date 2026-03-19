import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import MainLayout from './layouts/MainLayout';
import AuctionDetail from './pages/AuctionDetail';
import AuctionList from './pages/AuctionList';
import CreateAuction from './pages/CreateAuction';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import LiveBidding from './pages/LiveBidding';
import Login from './pages/Login';
import MyAuctions from './pages/MyAuctions';
import MyBids from './pages/MyBids';
import Notifications from './pages/Notifications';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Register from './pages/Register';
import BecomeSeller from './pages/BecomeSeller';
import SellerApplicationStatus from './pages/SellerApplicationStatus';
import SellerDashboard from './pages/SellerDashboard';
import AccountSettings from './pages/AccountSettings';
import AdminDashboard from './pages/AdminDashboard';
import AdminSellerApplications from './pages/AdminSellerApplications';
import AdminSellerApplicationReview from './pages/AdminSellerApplicationReview';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auctions" element={<AuctionList />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route
              path="/auctions/:id/live"
              element={
                <PrivateRoute>
                  <LiveBidding />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment/:auctionId"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="create-auction"
              element={
                <SellerRoute>
                  <CreateAuction />
                </SellerRoute>
              }
            />
            <Route path="my-auctions" element={<MyAuctions />} />
            <Route path="my-bids" element={<MyBids />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<AccountSettings />} />
            <Route path="become-seller" element={<BecomeSeller />} />
            <Route path="seller-application" element={<SellerApplicationStatus />} />
            <Route
              path="seller"
              element={
                <SellerRoute>
                  <SellerDashboard />
                </SellerRoute>
              }
            />

            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="admin/seller-applications"
              element={
                <AdminRoute>
                  <AdminSellerApplications />
                </AdminRoute>
              }
            />
            <Route
              path="admin/seller-applications/:id"
              element={
                <AdminRoute>
                  <AdminSellerApplicationReview />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

