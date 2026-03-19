import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auctionsApi } from '../services/auctionsApi';
import { useAuth } from '../context/AuthContext';
import { useAuctionWebSocket } from '../hooks/useAuctionWebSocket';
import { useCountdown } from '../hooks/useCountdown';
import { Gavel, Clock, Trophy, Activity, ArrowUpRight, Signal, History, Zap, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const money = (n) => {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0.00';
  return v.toFixed(2);
};

export default function LiveBidding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const ws = useAuctionWebSocket(id);
  const { days, hours, minutes, seconds, isEnded } = useCountdown(auction?.end_time);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [a, b] = await Promise.all([auctionsApi.detail(id), auctionsApi.bids(id)]);
        if (!alive) return;
        setAuction(a.data);
        const bids = Array.isArray(b.data) ? b.data : b.data?.results ?? [];
        setHistory(bids);
        const floor = parseFloat(a.data.current_bid ?? a.data.starting_bid ?? 0);
        setAmount((floor + 1).toString());
      } catch (e) {
        toast.error(e?.response?.data?.detail || 'Failed to load live auction');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!ws.events.length) return;
    const latest = ws.events[0];
    if (latest?.type === 'outbid') {
      toast.info(latest?.message || 'You have been outbid.');
    }
    if (latest?.type === 'new_bid') {
      setAuction((prev) => (prev ? { ...prev, current_bid: latest.amount ?? prev.current_bid } : prev));
      setHistory((prev) => {
        const next = [
          {
            id: `${Date.now()}-${Math.random()}`,
            bidder_name: latest.bidder ?? 'Bidder',
            amount: latest.amount,
            created_at: latest.time ?? new Date().toISOString(),
            is_winning: true,
          },
          ...prev.map((x) => ({ ...x, is_winning: false })),
        ];
        return next.slice(0, 20);
      });
    }
  }, [ws.events]);

  const timeLabel = useMemo(() => {
    if (isEnded) return 'Auction Concluded';
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}:${minutes}:${seconds}`;
  }, [days, hours, minutes, seconds, isEnded]);

  const placeBid = async (e) => {
    e.preventDefault();
    if (!auction) return;

    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    try {
      const { data } = await auctionsApi.placeBid(id, { amount });
      toast.success('Position Secured: Bid Placed');

      setAuction((prev) => (prev ? { ...prev, current_bid: data.amount } : prev));
      setHistory((prev) => [data, ...prev].slice(0, 20));
      setAmount((parseFloat(data.amount) + 1).toString());

      ws.send({ type: 'place_bid', amount: Number(data.amount) });
    } catch (error) {
      const err = error.response?.data;
      const msg = 
        (typeof err === 'string' ? err : null) || 
        err?.detail || 
        (err && Object.values(err).flat().join(', ')) || 
        'Authorization Failed / Bid Refused';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container-page py-24 text-center">
        <h2 className="text-2xl font-black text-white italic">Operational Error: Auction Untraceable</h2>
      </div>
    );
  }

  return (
    <div className="container-page py-10 space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] italic">Live Pulse Active</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white italic">{auction.title}</h1>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
               <Signal className={`h-3 w-3 ${ws.status === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`} />
               <span className="uppercase tracking-widest">{ws.status}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
               <Clock className="h-3 w-3" />
               <span className="font-black italic uppercase tracking-widest">{timeLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link to={`/auctions/${auction.id}`} className="btn btn-ghost border-white/5 bg-white/5 rounded-2xl px-6 h-12 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
             <Zap className="h-4 w-4" /> Specs
           </Link>
           <Link to="/auctions" className="btn btn-ghost border-white/5 bg-white/5 rounded-2xl px-6 h-12 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
             Market
           </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <div className="glass-premium p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <ArrowUpRight className="h-32 w-32 text-indigo-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Valuation Threshold</div>
                <div className="text-6xl font-black tracking-tighter text-white italic">
                  ${money(auction.current_bid ?? auction.starting_bid)}
                </div>
              </div>
              <div className="flex items-center gap-8 border-l border-white/10 pl-8">
                <div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Engagement</div>
                   <div className="text-2xl font-black text-white italic">{auction.total_bids ?? history.length} <span className="text-xs text-slate-500 uppercase">bids</span></div>
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Participants</div>
                   <div className="text-2xl font-black text-white italic">12 <span className="text-xs text-slate-500 uppercase">active</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 italic">
                <History className="h-4 w-4 text-indigo-400" /> Transmission History
              </h2>
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium italic">Scanning for signals... No bid activity detected.</div>
              ) : (
                history.slice(0, 15).map((b, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    key={b.id || i} 
                    className={`flex items-center justify-between gap-4 p-5 rounded-3xl border transition-all ${b.is_winning ? 'bg-indigo-500/10 border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'bg-white/[0.01] border-white/5 opacity-60'}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                       <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${b.is_winning ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                          {b.is_winning ? <Trophy className="h-5 w-5" /> : <Gavel className="h-5 w-5" />}
                       </div>
                       <div className="min-w-0">
                          <div className="truncate text-sm font-black text-white italic tracking-tight">{b.bidder_name}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{new Date(b.created_at).toLocaleTimeString()}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-lg font-black italic tracking-wider ${b.is_winning ? 'text-white' : 'text-slate-400'}`}>${money(b.amount)}</div>
                       {b.is_winning && <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Dominant Position</div>}
                    </div>
                  </motion.div>
                ))
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <Activity className="h-10 w-10 text-indigo-500 opacity-20" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1 italic">Deploy Capital</h2>
            <p className="text-xs text-slate-500 font-medium italic mb-6 leading-relaxed">System-wide verification required. Ensure bid exceeds current floor.</p>

            <form onSubmit={placeBid} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-indigo-400">$</div>
                <input
                  className="input pl-12 h-20 bg-white/[0.03] border-white/10 focus:bg-white/[0.06] focus:border-indigo-500/50 rounded-[2rem] text-3xl font-black italic tracking-tighter transition-all"
                  type="number"
                  step="0.01"
                  min={Number(auction.current_bid ?? auction.starting_bid ?? 0) + 0.01}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isEnded || auction.is_upcoming}
                  required
                />
              </div>
              <button 
                className="btn btn-primary h-20 w-full rounded-[2rem] text-xl font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-500/30 group disabled:opacity-50 disabled:grayscale transition-all" 
                type="submit" 
                disabled={isEnded || auction.is_upcoming}
              >
                {auction.is_upcoming ? 'Upcoming' : isEnded ? 'Finalized' : (
                   <span className="flex items-center justify-center gap-3">
                     Commit Bid <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
                   </span>
                )}
              </button>
            </form>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-indigo-500/[0.02]"
          >
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 italic">Live Stream Terminal</h3>
            <div className="space-y-3 font-mono text-[10px] leading-relaxed">
               <div className="flex gap-2 text-slate-500">
                  <span className="text-indigo-500">[SYSTEM]</span> Authentication verified...
               </div>
               <div className="flex gap-2 text-slate-500">
                  <span className="text-indigo-500">[WEB_SOC]</span> Protocol handshaking...
               </div>
               <div className="flex gap-2 text-emerald-500/70 italic">
                  <span className="text-emerald-500">[STREAM]</span> Receiving metadata for ID: {id}...
               </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 border-t border-white/5 pt-4">
               <span>Latency: 24ms</span>
               <span className="text-indigo-400">Encrypted AES-256</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

