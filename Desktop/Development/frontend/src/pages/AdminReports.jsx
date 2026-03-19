import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, colorClass }) => (
  <div className="card p-6">
    <div className="text-xs font-semibold text-slate-400 capitalize">{label.replace(/_/g, ' ')}</div>
    <div className={`mt-2 text-3xl font-black tracking-tight ${colorClass || 'text-white'}`}>
      {typeof value === 'number' && label.includes('volume') ? `$${value.toFixed(2)}` : value}
    </div>
  </div>
);

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [s, t] = await Promise.all([adminApi.stats(), adminApi.transactions()]);
        setStats(s.data);
        setTransactions(t.data);
      } catch (e) {
        toast.error('Failed to load platform reports.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="card h-64 animate-pulse bg-white/5" />;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-2xl font-black tracking-tight text-white">Platform Reports</div>
        <p className="mt-1 text-sm text-slate-400">Comprehensive overview of site sales and user activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats && Object.entries(stats).map(([k, v]) => (
          <StatCard key={k} label={k} value={v} colorClass={k.includes('volume') ? 'text-indigo-400' : ''} />
        ))}
      </div>

      <div className="card">
        <div className="border-b border-white/10 bg-white/5 px-6 py-4">
          <div className="text-sm font-black text-white">Recent Transactions</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Auction</th>
                <th className="px-6 py-3">Payer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="max-w-[200px] truncate px-6 py-4 font-medium text-slate-100">{t.auction_title}</td>
                    <td className="px-6 py-4 text-slate-300">{t.payer_name}</td>
                    <td className="px-6 py-4 font-black text-white">${t.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                        t.status === 'successful' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
