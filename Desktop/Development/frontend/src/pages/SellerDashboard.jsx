import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-xs font-semibold text-slate-400">Seller dashboard</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-white">Welcome, {user?.username}</div>
        <p className="mt-2 text-sm text-slate-300">
          This is the seller control center. Next we’ll connect real stats (auctions, earnings, payouts).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="card p-6">
          <div className="text-xs font-semibold text-slate-400">Auctions</div>
          <div className="mt-1 text-3xl font-black text-white">—</div>
          <div className="mt-2 text-sm text-slate-400">Total auctions</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-semibold text-slate-400">Payments</div>
          <div className="mt-1 text-3xl font-black text-white">—</div>
          <div className="mt-2 text-sm text-slate-400">Pending payouts</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-semibold text-slate-400">Earnings</div>
          <div className="mt-1 text-3xl font-black text-white">—</div>
          <div className="mt-2 text-sm text-slate-400">Total earnings</div>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-sm font-black text-white">Quick actions</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="btn btn-primary" to="/dashboard/create-auction">
            Create auction
          </Link>
          <Link className="btn btn-ghost" to="/dashboard/my-auctions">
            My auctions
          </Link>
          <Link className="btn btn-ghost" to="/dashboard/seller-application">
            Verification status
          </Link>
        </div>
      </div>
    </div>
  );
}

