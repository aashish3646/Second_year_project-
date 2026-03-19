import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';

const money = (n) => {
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0.00';
  return v.toFixed(2);
};

export default function AuctionCard({ auction }) {
  const defaultImage = 'https://via.placeholder.com/1200x800?text=BidVerse';
  const { days, hours, minutes, seconds, isEnded } = useCountdown(auction?.end_time);
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const timeLabel = useMemo(() => {
    if (isEnded) return 'Ended';
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m ${seconds}s`;
  }, [days, hours, minutes, seconds, isEnded]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ '--x': `${mousePos.x}px`, '--y': `${mousePos.y}px` }}
      className="card spotlight-card group h-full glass-premium overflow-hidden"
    >
      <Link to={`/auctions/${auction.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={auction.image || defaultImage}
            alt={auction.title}
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md ring-1 ring-white/10">
              {auction?.category_name ?? 'Auction'}
            </div>
            <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ring-1 ring-white/10 ${isEnded ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white'}`}>
              {timeLabel}
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col p-5">
          <div className="line-clamp-1 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            {auction.title}
          </div>
          <div className="mt-2 line-clamp-2 text-sm text-slate-400">
            {auction.description || 'No description provided.'}
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Bid</div>
                <div className="text-xl font-black tracking-tight text-white group-hover:scale-105 transition-transform origin-left">
                  ${money(auction.current_bid ?? auction.starting_bid)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bids</div>
                <div className="text-sm font-black text-slate-300">{auction.total_bids ?? 0}</div>
              </div>
            </div>

            <button className="btn btn-primary w-full group/btn relative overflow-hidden">
              <span className="relative z-10">Place Bid</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

