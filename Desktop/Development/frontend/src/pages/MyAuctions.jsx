import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auctionsApi } from '../services/auctionsApi';
import { useAuth } from '../context/AuthContext';
import { Gavel, Search, ExternalLink, CheckCircle2, XCircle, Clock, Filter, ListChecks, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const money = (n) => {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0.00';
  return v.toFixed(2);
};

const statusBadge = (status) => {
  const base = 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border italic';
  if (status === 'active') return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-400`;
  if (status === 'pending') return `${base} bg-amber-500/10 border-amber-500/20 text-amber-400`;
  if (status === 'closed') return `${base} bg-blue-500/10 border-blue-500/20 text-blue-400`;
  if (status === 'rejected') return `${base} bg-rose-500/10 border-rose-500/20 text-rose-400`;
  return `${base} bg-slate-500/10 border-slate-500/20 text-slate-400`;
};

export default function MyAuctions() {
  const { isSeller, isAdmin } = useAuth();
  const [state, setState] = useState({ loading: true, items: [] });
  const [tab, setTab] = useState(isAdmin ? 'pending' : 'mine');

  const fetchItems = async (currentTab) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      let res;
      if (isAdmin && currentTab === 'pending') {
        res = await auctionsApi.list({ status: 'pending' });
      } else {
        res = await auctionsApi.mine();
      }
      const data = res.data;
      const items = Array.isArray(data) ? data : data?.results ?? [];
      setState({ loading: false, items });
    } catch (e) {
      setState({ loading: false, items: [] });
      toast.error(e?.response?.data?.detail || 'Failed to load auctions');
    }
  };

  useEffect(() => {
    if (isSeller || isAdmin) {
      fetchItems(tab);
    }
  }, [isSeller, isAdmin, tab]);

  const onReview = async (id, action) => {
    let remarks = '';
    if (action === 'reject') {
      remarks = window.prompt('Please provide a reason for rejection:');
      if (remarks === null) return;
      if (!remarks.trim()) {
        toast.error('A reason is required for rejection.');
        return;
      }
    }

    try {
      await auctionsApi.adminReview(id, action, remarks || `${action.charAt(0).toUpperCase() + action.slice(1)}d via Manage Auctions`);
      toast.success(`Auction ${action}d`);
      fetchItems(tab);
    } catch (err) {
      toast.error('Review failed');
    }
  };

  const pageTitle = useMemo(
    () => (isAdmin && tab === 'pending' ? 'Review Queue' : 'Listing Management'),
    [isAdmin, tab]
  );

  if (!isSeller && !isAdmin) {
    return (
      <div className="glass-premium p-12 rounded-[2.5rem] text-center border-white/5 bg-white/[0.02]">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6">
          <ShieldCheck className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tight">Access Restricted</h2>
        <p className="mt-4 text-slate-400 font-medium max-w-sm mx-auto">You need an authorized seller account to bring items to market or manage existing auctions.</p>
        <Link to="/dashboard/become-seller" className="btn btn-primary mt-8 px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/20">
          Apply for Seller Access
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white italic">{pageTitle}</h1>
          <p className="text-slate-400 font-medium italic mt-1">
            {isAdmin && tab === 'pending'
              ? 'Moderate and approve new marketplace submissions.'
              : 'Monitor and control your active inventory.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           {isAdmin && (
             <div className="flex p-1.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <button 
                  onClick={() => setTab('mine')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'mine' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                >
                  My Inventory
                </button>
                <button 
                  onClick={() => setTab('pending')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'pending' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                >
                  Approvals
                </button>
             </div>
           )}
           <Link to="/auctions" className="btn btn-ghost border-white/5 bg-white/5 rounded-2xl px-5 h-12 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
             <ExternalLink className="h-4 w-4" /> View Market
           </Link>
        </div>
      </div>

      <div className="glass-premium rounded-[2.5rem] border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
        {state.loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : state.items.length === 0 ? (
          <div className="p-20 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
               <ListChecks className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-white italic">No auctions identified</h3>
            <p className="mt-2 text-slate-400 font-medium italic">There are currently no items matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset Title</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Valuation</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inventory Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Bids</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {state.items.map((a, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={a.id} 
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6 font-black text-white italic tracking-tight">{a.title}</td>
                    <td className="px-8 py-6">
                       <span className="text-lg font-black text-white tracking-widest">${money(a.current_bid ?? a.starting_bid)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={statusBadge(a.status)}>{a.status}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                          <Gavel className="h-4 w-4 text-indigo-400 opacity-50" /> {a.total_bids ?? 0}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isAdmin && a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onReview(a.id, 'approve')}
                              className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/10"
                              title="Approve Asset"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => onReview(a.id, 'reject')}
                              className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/10"
                              title="Reject Asset"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <Link 
                          to={`/auctions/${a.id}`}
                          className="h-10 px-5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/0 hover:shadow-indigo-500/10"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

