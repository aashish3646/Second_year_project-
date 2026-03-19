import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Gavel, User, TrendingUp, ShieldCheck, Zap, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { http } from '../services/http';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = React.useState({
    active_users: '...',
    total_bids: '...',
    active_listings: '...',
    market_volume: '...',
    market_trend: '+0%'
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await http.get('reports/public-stats/activity/');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch platform engagement:', err);
      }
    };
    fetchStats();
  }, []);

  const statsDisplay = [
    { label: 'Total Bids', value: stats.total_bids, trend: '+5%' },
    { label: 'Active Listings', value: stats.active_listings, trend: '+18%' },
    { label: 'Active Participants', value: stats.active_users, trend: '+3%' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-premium p-8 rounded-[2.5rem] relative overflow-hidden group shadow-highlight border-white/5 bg-white/[0.02]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-blue-500/5 -z-10" />
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="h-32 w-32 text-indigo-400 -rotate-12" />
        </div>
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-2 italic">
              Welcome, <span className="text-indigo-400">{user?.username}</span>
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Professional {user?.role}
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-3 w-3 text-indigo-400" /> Active Session
              </div>
            </div>
          </div>
          <Link to="/auctions" className="btn btn-primary px-8 py-4 text-base font-black rounded-2xl shadow-xl shadow-indigo-500/30 group">
            Browse Market <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
          </Link>
        </div>
      </motion.div>

      {/* Navigation Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/dashboard/my-auctions" className="glass-premium p-6 rounded-[2rem] transition-all hover:bg-white/[0.05] hover:scale-[1.02] border-white/5 bg-white/[0.01] group">
          <div className="flex flex-col gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Gavel className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white italic">Listings</div>
              <div className="mt-1 text-sm text-slate-500 font-medium italic">Oversee the items you've brought to market.</div>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/my-bids" className="glass-premium p-6 rounded-[2rem] transition-all hover:bg-white/[0.05] hover:scale-[1.02] border-white/5 bg-white/[0.01] group">
          <div className="flex flex-col gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white italic">Active Bids</div>
              <div className="mt-1 text-sm text-slate-500 font-medium italic">Track your ongoing acquisitions in real-time.</div>
            </div>
          </div>
        </Link>

        {!isAdmin && (
          <Link to="/dashboard/profile" className="glass-premium p-6 rounded-[2rem] transition-all hover:bg-white/[0.05] hover:scale-[1.02] border-white/5 bg-white/[0.01] group">
            <div className="flex flex-col gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-500/10 text-slate-400 border border-slate-500/20 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="text-lg font-black text-white italic">Account</div>
                <div className="mt-1 text-sm text-slate-500 font-medium italic">Refine your identity and security settings.</div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Stats Activity */}
      <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Platform Activity
          </div>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Real-time Engagement</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {statsDisplay.map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-emerald-400">{stat.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

