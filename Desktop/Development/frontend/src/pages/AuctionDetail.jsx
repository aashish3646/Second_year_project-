import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auctionsApi } from '../services/auctionsApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useCountdown } from '../hooks/useCountdown';
import LocationDisplay from '../components/LocationDisplay';
import { Gavel, MapPin, Clock, User as UserIcon, ArrowLeft, Share2, Heart, ShieldCheck, Zap, History, TrendingUp } from 'lucide-react';

const money = (n) => {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0.00';
  return v.toFixed(2);
};

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await auctionsApi.detail(id);
      setAuction(response.data);
      const floor = parseFloat(response.data.current_bid ?? response.data.starting_bid ?? 0);
      setBidAmount((floor + 1).toString());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Failed to load auction details');
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await auctionsApi.bids(id);
      setBids(Array.isArray(response.data) ? response.data : response.data?.results ?? []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      return;
    }

    try {
      await auctionsApi.placeBid(id, { amount: bidAmount });
      toast.success('Bid placed successfully!');
      fetchAuctionDetails();
      fetchBids();
      setBidAmount((parseFloat(bidAmount) + 1).toString());
    } catch (error) {
      const err = error.response?.data;
      const errorMsg =
        (typeof err === 'string' && err) ||
        err?.detail ||
        (Array.isArray(err) ? err.join(', ') : null) ||
        'Failed to place bid';
      toast.error(errorMsg);
    }
  };

  const defaultImage = 'https://via.placeholder.com/1200x800?text=No+Image';
  const floor = auction?.current_bid ?? auction?.starting_bid;
  
  const { days: sDays, hours: sHours, minutes: sMinutes, seconds: sSeconds, isEnded: hasStarted } = useCountdown(auction?.start_time);
  const { days, hours, minutes, seconds, isEnded } = useCountdown(auction?.end_time);

  const timeLabel = useMemo(() => {
    if (auction?.is_upcoming && !hasStarted) {
      if (sDays > 0) return `${sDays}d ${sHours}h ${sMinutes}m`;
      return `${sHours}h ${sMinutes}m ${sSeconds}s`;
    }
    if (isEnded) return 'Ended';
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${seconds}s`;
  }, [days, hours, minutes, seconds, isEnded, sDays, sHours, sMinutes, sSeconds, hasStarted, auction?.is_upcoming]);

  if (loading) {
    return (
      <div className="container-page pt-32 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card h-[600px] animate-pulse bg-white/5 rounded-[2.5rem]" />
          <div className="space-y-6">
            <div className="card h-[300px] animate-pulse bg-white/5 rounded-[2rem]" />
            <div className="card h-[250px] animate-pulse bg-white/5 rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container-page pt-32 text-center py-40">
        <div className="glass-premium p-12 rounded-[2.5rem]">
          <h2 className="text-2xl font-black text-white mb-4">Auction not found</h2>
          <button onClick={() => navigate('/auctions')} className="btn btn-primary px-8">Return to Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 pt-28">
      <motion.button 
        whileHover={{ x: -4 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Market
      </motion.button>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="glass-premium overflow-hidden rounded-[2.5rem] relative group">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={auction.image || defaultImage}
                alt={auction.title}
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
                <div className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 backdrop-blur">
                  {auction?.category_name ?? 'Collection'}
                </div>
                <div className="flex gap-2">
                  <button className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wider backdrop-blur-xl ring-1 ring-white/10 shadow-2xl ${isEnded ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                   {isEnded ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4 animate-pulse" />}
                   {timeLabel}
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">{auction.title}</h1>
              <div className="mt-8 prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-slate-300 font-medium">
                  {auction.description}
                </p>
              </div>

              {auction.location_address && (
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
                    <MapPin className="h-4 w-4" />
                    Item Location
                  </div>
                  <div className="rounded-[2rem] glass-premium p-6 border-white/5 bg-white/[0.02]">
                    <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                       <MapPin className="h-4 w-4 text-slate-500" />
                       {auction.location_address}
                    </div>
                    {auction.latitude && auction.longitude && (
                      <div className="mt-6 rounded-3xl overflow-hidden ring-1 ring-white/10 grayscale-[0.6] hover:grayscale-0 transition-all duration-500">
                        <LocationDisplay 
                          lat={auction.latitude} 
                          lng={auction.longitude} 
                          title={auction.title} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="glass-premium p-8 rounded-[2.5rem] sticky top-28 shadow-premium">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Current Highest Bid</div>
                <div className="text-4xl font-black tracking-tight text-white flex items-center gap-2">
                   <TrendingUp className="h-6 w-6 text-indigo-400" />
                   ${money(floor)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Bids</div>
                <div className="text-lg font-black text-white bg-white/5 rounded-full px-4 py-1 ring-1 ring-white/10 shadow-soft">{auction.total_bids ?? 0}</div>
              </div>
            </div>

            <div className="space-y-4 mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4 opacity-50" /> Seller
                </span>
                <span className="font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer">{auction.seller_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 opacity-50" /> Status
                </span>
                <span className="font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full text-xs uppercase tracking-widest">{auction.status}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-50" /> Ends On
                </span>
                <span className="font-bold text-white tracking-tight">{new Date(auction.end_time).toLocaleDateString()} at {new Date(auction.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link to={`/auctions/${auction.id}/live`} className="btn btn-primary w-full py-4 text-base font-bold rounded-2xl group flex items-center justify-center gap-3">
                <Gavel className="h-5 w-5 transition-transform group-hover:rotate-12" />
                Live Bidding Dashboard
              </Link>
              
              {isEnded && bids.length > 0 && bids[0].bidder === user?.id && (
                <Link to={`/payment/${auction.id}`} className="btn btn-emerald w-full py-4 text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                  Proceed to Checkout (Winner)
                </Link>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
               <div className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                 <Zap className="h-4 w-4 text-indigo-400" /> Quick Bid Placement
               </div>
               
               {!isAuthenticated ? (
                <div className="glass-premium p-4 rounded-2xl bg-indigo-500/10 border-indigo-500/20 text-sm font-medium text-indigo-300">
                  Join BidVerse to participate. <Link className="underline font-black hover:text-white" to="/login">Login here</Link>
                </div>
              ) : auction.is_upcoming ? (
                <div className="glass-premium p-4 rounded-2xl bg-blue-500/10 border-blue-500/20 text-sm font-medium text-blue-300 flex items-center gap-3">
                  <Clock className="h-5 w-5" /> Standard bidding starts in {timeLabel}
                </div>
              ) : auction.is_active && user?.id !== auction.seller ? (
                <form onSubmit={handlePlaceBid} className="flex gap-3">
                  <input
                    className="input h-14 bg-white/5 border-white/10 focus:bg-white/10 rounded-xl flex-1 text-lg font-black"
                    type="number"
                    step="0.01"
                    min={Number(floor) + 0.01}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary px-8 rounded-xl font-black shadow-lg shadow-indigo-500/30" type="submit">
                    Bid
                  </button>
                </form>
              ) : (
                <div className="glass-premium p-4 rounded-2xl bg-white/5 border-white/10 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  {user?.id === auction.seller 
                    ? "Your listing" 
                    : isEnded ? "Bidding closed" : "Unavailable"}
                </div>
              )}
            </div>
          </div>

          <div className="glass-premium p-8 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-400" />
                Bid History
              </h2>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Status</div>
            </div>

            {bids.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                <div className="text-slate-500 font-bold mb-1">No bids yet</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-600">Be the first to bid on this item</div>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={bid.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${bid.is_winning ? 'bg-indigo-500/10 border-indigo-500/30 shadow-highlight' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black ${bid.is_winning ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                        {bid.bidder_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {bid.bidder_name}
                          {bid.is_winning && (
                            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest">
                              Winning
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{new Date(bid.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-black ${bid.is_winning ? 'text-indigo-300' : 'text-white'}`}>${money(bid.amount)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuctionDetail;

