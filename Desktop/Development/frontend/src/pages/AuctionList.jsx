import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { auctionsApi } from '../services/auctionsApi';
import AuctionCard from '../components/AuctionCard';

export default function AuctionList() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, items: [], error: null });
  const [searchTerm, setSearchTerm] = useState(() => params.get('search') ?? '');

  useEffect(() => {
    let alive = true;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const search = params.get('search') ?? '';
        const ordering = params.get('ordering') ?? '-created_at';
        const { data } = await auctionsApi.list({ search, ordering });
        const items = Array.isArray(data) ? data : data?.results ?? [];
        if (alive) setState({ loading: false, items, error: null });
      } catch (e) {
        if (alive) setState({ loading: false, items: [], error: e });
      }
    })();
    return () => {
      alive = false;
    };
  }, [params]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (searchTerm.trim()) next.set('search', searchTerm.trim());
    else next.delete('search');
    setParams(next, { replace: true });
  };

  const items = state.items;
  const empty = !state.loading && items.length === 0;
  const activeSearch = params.get('search') ?? '';
  const title = useMemo(
    () => (activeSearch ? `Results for “${activeSearch}”` : 'Marketplace'),
    [activeSearch]
  );

  return (
    <div className="container-page py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 md:flex-row md:items-end justify-between mb-10"
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">Live Auctions</div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-slate-400 font-medium">Discover unique items from sellers worldwide.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost h-11 px-4 border-white/5 bg-white/5">
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </button>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button className="p-2 rounded-lg bg-indigo-500 text-white shadow-soft">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors">
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-premium mb-12 p-1 rounded-[2rem]"
      >
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center p-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              className="input h-14 pl-12 bg-transparent border-none focus:ring-0 text-base"
              placeholder="Search by title, category, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1">
            {activeSearch && (
              <button
                className="btn btn-ghost h-12 px-6 rounded-xl"
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  const next = new URLSearchParams(params);
                  next.delete('search');
                  setParams(next, { replace: true });
                }}
              >
                Reset
              </button>
            )}
            <button className="btn btn-primary h-12 px-8 rounded-xl font-bold shadow-lg" type="submit">
              Search Items
            </button>
          </div>
        </form>
      </motion.div>

      {state.loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-[420px] animate-pulse bg-white/5 rounded-3xl" />
          ))}
        </div>
      ) : empty ? (
        <div className="glass-premium rounded-3xl p-20 text-center animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-6">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">We couldn't find any auctions matching your search criteria. Try different keywords.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setParams({}, { replace: true });
            }}
            className="btn btn-primary px-8"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

