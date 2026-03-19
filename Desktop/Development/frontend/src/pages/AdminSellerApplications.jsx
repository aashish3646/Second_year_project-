import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellersApi } from '../services/sellersApi';
import { toast } from 'react-toastify';

const chip = (s) =>
  ({
    approved: 'bg-emerald-500/15 text-emerald-100',
    rejected: 'bg-rose-500/15 text-rose-100',
    needs_more_documents: 'bg-amber-500/15 text-amber-100',
    pending_review: 'bg-white/10 text-white',
    under_verification: 'bg-indigo-500/15 text-indigo-100',
    suspended: 'bg-slate-500/15 text-slate-100',
  })[s] || 'bg-white/10 text-white';

export default function AdminSellerApplications() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await sellersApi.adminListApplications();
        if (!cancelled) setApps(data?.results || data || []);
      } catch (e) {
        if (!cancelled) toast.error('Failed to load seller applications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-xs font-semibold text-slate-400">Admin</div>
        <div className="mt-1 text-2xl font-black tracking-tight text-white">Seller verification requests</div>
        <p className="mt-2 text-sm text-slate-300">Review and approve/reject seller applications.</p>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="h-4 w-52 animate-pulse rounded bg-white/10" />
        ) : apps.length === 0 ? (
          <div className="text-sm text-slate-300">No applications.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Applicant</th>
                  <th className="py-2">Seller type</th>
                  <th className="py-2">Categories</th>
                  <th className="py-2">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {apps.map((a) => (
                  <tr key={a.id} className="border-t border-white/10">
                    <td className="py-3 font-semibold">{a?.user}</td>
                    <td className="py-3">{a.seller_type}</td>
                    <td className="py-3">{(a.intended_item_categories || []).join(', ')}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-black ${chip(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <Link className="btn btn-ghost" to={`/dashboard/admin/seller-applications/${a.id}`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

