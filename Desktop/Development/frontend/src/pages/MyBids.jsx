import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bidsApi } from '../services/bidsApi';
import { Gavel, Clock, Trophy, ArrowRight, Loader2, Search, Zap, Plus, AlertCircle, X, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const money = (n) => {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0.00';
  return v.toFixed(2);
};

export default function MyBids() {
  const [state, setState] = useState({ loading: true, items: [] });
  const [editingBid, setEditingBid] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBids = async () => {
    try {
      const { data } = await bidsApi.mine();
      const items = Array.isArray(data) ? data : data?.results ?? [];
      setState({ loading: false, items });
    } catch {
      setState({ loading: false, items: [] });
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleUpdateBid = async (e) => {
    e.preventDefault();
    if (!editingBid) return;

    setSubmitting(true);
    try {
      await bidsApi.update(editingBid.id, newAmount);
      toast.success('Force Multiplier Applied: Bid Increased');
      await fetchBids();
      setEditingBid(null);
    } catch (err) {
      const msg = err.response?.data?.detail || (err.response?.data && Object.values(err.response.data).flat()[0]) || 'Failed to recalibrate bid.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (state.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white italic">Active Bids</h1>
          <p className="text-slate-400 font-medium italic mt-1">Monitor your ongoing acquisitions and win history.</p>
        </div>
        <div className="relative group max-w-xs w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
           <input type="text" placeholder="Search bids..." className="input pl-12 h-12 bg-white/[0.03] border-white/10 rounded-2xl text-sm italic focus:bg-white/[0.07] transition-all" />
        </div>
      </div>

      {state.items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium p-12 rounded-[2.5rem] border-dashed border-white/10 text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Gavel className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white italic">No active bids found</h3>
          <p className="mt-2 text-slate-400 font-medium">Your bidding history is currently empty. Ready to start?</p>
          <Link to="/auctions" className="btn btn-primary mt-6 px-8 py-3 rounded-2xl font-black">
            Explore Marketplace
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
          {state.items.map((bid, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              key={bid.id}
              className={`glass-premium p-6 rounded-[2rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group ${bid.is_winning ? 'shadow-highlight-indigo' : ''}`}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/5 bg-slate-900 shrink-0 relative">
                    <img 
                      src={`https://via.placeholder.com/80?text=${encodeURIComponent(bid.auction_title[0])}`} 
                      className="h-full w-full object-cover opacity-60"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                      <Gavel className="h-6 w-6 text-indigo-400 opacity-50" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-white italic tracking-tight truncate group-hover:text-indigo-300 transition-colors">{bid.auction_title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(bid.created_at).toLocaleDateString()}</span>
                       <span className="h-1 w-1 rounded-full bg-slate-700" />
                       <span className="text-indigo-400/70">Ref: #{bid.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Active Offer</div>
                    <div className="text-2xl font-black text-white tracking-tighter italic">${money(bid.amount)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingBid(bid);
                        setNewAmount((parseFloat(bid.amount) + 10).toString());
                      }}
                      className="btn btn-ghost border-white/5 bg-white/5 hover:bg-indigo-500 hover:text-white rounded-2xl px-5 h-12 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-transparent hover:shadow-indigo-500/20"
                    >
                      <Plus className="h-4 w-4" /> Revise
                    </button>
                    <Link 
                      to={`/auctions/${bid.auction}`} 
                      className="h-12 w-12 rounded-2xl bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all group/btn"
                    >
                      <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Status Band */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${
                     bid.auction_status === 'closed' ? 'bg-slate-500' :
                     bid.is_winning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                   }`} />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                     {bid.auction_status === 'closed' ? (
                       bid.is_winning ? 'Acquisition Finalized' : 'Auction Concluded'
                     ) : (
                       bid.is_winning ? 'Dominating Position' : 'Position Compromised'
                     )}
                   </span>
                </div>
                {bid.auction_status === 'closed' ? (
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${bid.is_winning ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {bid.is_winning ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {bid.is_winning ? 'Secured' : 'Outbid'}
                  </div>
                ) : bid.is_winning ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Trophy className="h-3.5 w-3.5" /> High Ground
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <AlertCircle className="h-3.5 w-3.5" /> Outbid
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      {/* Revise Modal */}
      <AnimatePresence>
        {editingBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBid(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-premium p-8 rounded-[2.5rem] border-white/10 shadow-3xl bg-slate-900"
            >
              <button 
                onClick={() => setEditingBid(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3 text-indigo-400 mb-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Capital Deployment</span>
                </div>
                <h2 className="text-3xl font-black text-white italic">Revise Offer</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Increasing position on <span className="text-indigo-300">"{editingBid.auction_title}"</span></p>
              </div>

              <form onSubmit={handleUpdateBid} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">New Commitment</label>
                    <span className="text-[10px] font-black text-indigo-400 uppercase">Min. ${money(parseFloat(editingBid.amount) + 0.01)}</span>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-400 group-focus-within:text-white transition-colors">$</span>
                    <input 
                      autoFocus
                      type="number" 
                      step="0.01"
                      min={parseFloat(editingBid.amount) + 0.01}
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="input w-full h-20 pl-14 bg-white/[0.03] border-white/10 focus:border-indigo-500/50 rounded-2xl text-4xl font-black text-white italic tracking-tighter"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    disabled={submitting}
                    type="submit"
                    className="btn btn-primary h-16 rounded-2xl font-black text-base uppercase tracking-widest italic flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20"
                  >
                    {submitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>Push Position <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingBid(null)}
                    className="btn btn-ghost h-12 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-500"
                  >
                    Abort Recalibration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

