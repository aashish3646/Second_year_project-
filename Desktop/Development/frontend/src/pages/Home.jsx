import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import AuctionCard from '../components/AuctionCard';
import { useAuth } from '../context/AuthContext';
import { auctionsApi } from '../services/auctionsApi';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [q, setQ] = useState('');
  const [featured, setFeatured] = useState({ loading: true, items: [] });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await auctionsApi.list({ ordering: 'end_time' });
        const items = Array.isArray(data) ? data : data?.results ?? [];
        if (alive) setFeatured({ loading: false, items: items.slice(0, 8) });
      } catch {
        if (alive) setFeatured({ loading: false, items: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/auctions?search=${encodeURIComponent(query)}` : '/auctions');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="container-page relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              <motion.h1 variants={itemVariants} className="text-7xl sm:text-9xl font-black tracking-tighter text-white leading-[0.9] mb-8">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 animate-glow">ELITE</span> BID.
              </motion.h1>
              
              <motion.p variants={itemVariants} className="mt-6 text-xl text-slate-400 leading-relaxed font-medium max-w-lg mb-10">
                A high-performance marketplace where the world's most sought-after assets find their new owners. Real-time. Professional. Secure.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4">
                <form onSubmit={submit} className="relative group flex-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    placeholder="Search for items, categories..."
                  />
                </form>
                <button type="submit" onClick={submit} className="btn btn-primary px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-2">
                  Explore Now <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-16 grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-black text-white italic">0.1ms</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Latency</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white italic">100%</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Encrypted</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white italic">PRO</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Verified</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
               <div className="relative z-10 rounded-[2.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl shadow-2xl">
                 <img 
                   src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"
                   alt="Featured Auction"
                   className="rounded-[2rem] shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                 />
                 <div className="absolute -bottom-8 -left-8 glass-premium p-6 rounded-3xl shadow-premium animate-float ring-1 ring-white/20">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current High Bid</div>
                        <div className="text-2xl font-black text-white">$45,200.00</div>
                      </div>
                    </div>
                 </div>
               </div>
               <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 blur-[100px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container-page py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Live Auctions</h2>
            <p className="text-slate-400 font-medium">Don't miss out on these exclusive deals closing soon.</p>
          </div>
          <Link to="/auctions" className="group flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            View All Marketplace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featured.loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-[400px] animate-pulse bg-white/5 rounded-3xl" />
            ))}
          </div>
        ) : featured.items.length === 0 ? (
          <div className="glass-premium rounded-3xl p-12 text-center">
            <div className="text-slate-400 font-bold mb-4">No live auctions found at the moment.</div>
            <Link to="/auctions" className="btn btn-primary px-6 py-3">Browse Catalogue</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.items.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

