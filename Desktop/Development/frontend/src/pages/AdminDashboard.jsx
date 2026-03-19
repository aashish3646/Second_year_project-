import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, to }) => {
  const inner = (
    <div className="card p-6 transition hover:bg-white/10">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-white">{value}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [o, l] = await Promise.all([adminApi.overview(), adminApi.reviewLogs(15)]);
        if (cancelled) return;
        setOverview(o.data);
        setLogs(l.data || []);
      } catch (e) {
        if (!cancelled) toast.error('Failed to load admin overview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = overview?.counts || {};

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-xs font-semibold text-slate-400">Admin</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-white">Dashboard</div>
        <p className="mt-2 text-sm text-slate-300">Quick access to reviews and moderation.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card h-24 animate-pulse bg-white/5" />
          <div className="card h-24 animate-pulse bg-white/5" />
          <div className="card h-24 animate-pulse bg-white/5" />
          <div className="card h-24 animate-pulse bg-white/5" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Seller requests (pending)"
            value={counts.seller_applications_pending_review ?? 0}
            to="/dashboard/admin/seller-applications"
          />
          <StatCard label="Seller requests (active)" value={counts.seller_applications_active ?? 0} to="/dashboard/admin/seller-applications" />
          <StatCard label="Auctions pending" value={counts.auctions_pending ?? 0} to="/dashboard/my-auctions" />
          <StatCard label="Open reports" value={counts.reports_open ?? 0} to="/dashboard" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-black text-white">Recent admin actions</div>
            <Link className="btn btn-ghost" to="/dashboard/admin/seller-applications">
              Go to seller requests
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {logs.length === 0 ? (
              <div className="text-sm text-slate-400">No recent actions.</div>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-100">
                      {l.admin} • {l.action}
                    </div>
                    <div className="text-xs text-slate-400">{new Date(l.created_at).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {l.target_type} #{l.target_id}
                    {l.remarks ? <span className="text-slate-400"> • {l.remarks}</span> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-black text-white">Admin shortcuts</div>
          <div className="mt-4 grid gap-2">
            <Link className="btn btn-primary" to="/dashboard/admin/seller-applications">
              Review seller applications
            </Link>
            <Link className="btn btn-primary" to="/dashboard/my-auctions">
              Approve pending auctions
            </Link>
            <a className="btn btn-ghost" href="http://localhost:8000/admin/" target="_blank" rel="noreferrer">
              Open Django admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

