import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, X, User, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { sellersApi } from '../services/sellersApi';
import logo from '../assets/logo.png';

const linkClass = ({ isActive }) =>
  [
    'relative rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300',
    isActive ? 'text-white' : 'text-slate-400 hover:text-white',
  ].join(' ');

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isVerifiedSeller } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const [sellerStatus, setSellerStatus] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = useMemo(() => {
    const u = user?.username?.trim?.() ?? '';
    if (!u) return 'U';
    return u.slice(0, 1).toUpperCase();
  }, [user?.username]);

  const submitSearch = (e) => {
    e?.preventDefault?.();
    const query = q.trim();
    navigate(query ? `/auctions?search=${encodeURIComponent(query)}` : '/auctions');
    setMobileOpen(false);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadSellerApp() {
      if (!isAuthenticated || isAdmin || isVerifiedSeller) return;
      try {
        const { data } = await sellersApi.myApplication();
        if (!cancelled) setSellerStatus(data?.status || null);
      } catch {
        if (!cancelled) setSellerStatus(null);
      }
    }
    loadSellerApp();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isAuthenticated, isVerifiedSeller]);

  return (
    <header 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-1' 
          : 'bg-transparent py-2'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center group py-2">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(79,70,229,0.6)]">
              <img src={logo} alt="BidVerse Hammer" className="h-full w-full object-cover" />
            </div>
          </Link>

          <form onSubmit={submitSearch} className="ml-8 hidden w-full max-w-md items-center gap-2 lg:flex">
            <div className="relative w-full group">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input pl-10 h-10 bg-white/5 border-white/5 focus:bg-white/10"
                placeholder="Search auctions..."
              />
            </div>
          </form>

          <nav className="hidden items-center gap-2 md:flex ml-auto">
            <NavLink to="/auctions" className={linkClass}>
              {({ isActive }) => (
                <>
                  <span className="relative z-10">Auctions</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active" 
                      className="absolute inset-0 bg-white/5 rounded-xl -z-0" 
                    />
                  )}
                </>
              )}
            </NavLink>
            
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <>
                    <NavLink to="/dashboard" className={linkClass}>
                      {({ isActive }) => (
                        <>
                          <span className="relative z-10">Dashboard</span>
                          {isActive && (
                            <motion.div 
                              layoutId="nav-active" 
                              className="absolute inset-0 bg-white/5 rounded-xl -z-0" 
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                    {!isVerifiedSeller && (
                      <NavLink to="/dashboard/become-seller" className={linkClass}>
                        {({ isActive }) => (
                          <div className="flex items-center gap-2">
                            <span className="relative z-10">Sell</span>
                            {sellerStatus && (
                              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black text-indigo-300 ring-1 ring-indigo-500/30">
                                {sellerStatus}
                              </span>
                            )}
                            {isActive && (
                              <motion.div 
                                layoutId="nav-active" 
                                className="absolute inset-0 bg-white/5 rounded-xl -z-0" 
                              />
                            )}
                          </div>
                        )}
                      </NavLink>
                    )}
                    {isVerifiedSeller && (
                      <NavLink to="/dashboard/seller" className={linkClass}>
                         {({ isActive }) => (
                          <>
                            <span className="relative z-10">Seller</span>
                            {isActive && (
                              <motion.div 
                                layoutId="nav-active" 
                                className="absolute inset-0 bg-white/5 rounded-xl -z-0" 
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    )}
                  </>
                )}
                {isAdmin && (
                  <NavLink to="/dashboard" className={linkClass}>
                    {({ isActive }) => (
                      <>
                        <span className="relative z-10">Admin</span>
                        {isActive && (
                          <motion.div 
                            layoutId="nav-active" 
                            className="absolute inset-0 bg-white/5 rounded-xl -z-0" 
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className="btn btn-ghost border-none bg-transparent hover:bg-white/5 px-4 h-10">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-primary px-5 h-10">
                  Register
                </NavLink>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 ml-4">
            {isAuthenticated && (
              <button
                onClick={() => navigate('/dashboard/notifications')}
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Notifications"
                type="button"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-1 text-[10px] font-black text-white shadow-lg ring-2 ring-slate-950">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && (
              <div className="group relative">
                <button
                  className="flex items-center gap-2 rounded-xl bg-white/5 p-1 transition-all hover:bg-white/10"
                  type="button"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-300 text-xs font-black ring-1 ring-white/10">
                    {initials}
                  </div>
                </button>

                <div className="invisible absolute right-0 top-full mt-2 w-56 translate-y-2 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="glass-premium p-1.5 rounded-2xl shadow-premium border border-white/10 backdrop-blur-2xl bg-slate-950/90">
                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                      <div className="text-xs font-bold text-white truncate">{user?.username}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.role}</div>
                    </div>
                    <Link to="/dashboard/profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                      <User className="h-4 w-4" />
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                      type="button"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-slate-300 transition-all hover:bg-white/10 md:hidden"
              aria-label="Menu"
              type="button"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-slate-950/95 backdrop-blur-2xl md:hidden overflow-hidden"
          >
            <div className="container-page py-6 space-y-4">
              <form onSubmit={submitSearch} className="group relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="input pl-10 h-11 bg-white/5"
                  placeholder="Search auctions…"
                />
              </form>

              <div className="grid gap-1">
                <NavLink to="/auctions" onClick={() => setMobileOpen(false)} className={linkClass}>
                  Auctions
                </NavLink>
                {isAuthenticated ? (
                  <>
                    <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className={linkClass}>
                      Dashboard
                    </NavLink>
                    {!isAdmin && !isVerifiedSeller && (
                      <NavLink to="/dashboard/become-seller" onClick={() => setMobileOpen(false)} className={linkClass}>
                        Become a Seller
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                        navigate('/');
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-rose-400 font-semibold"
                      type="button"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="grid gap-2 pt-2">
                    <NavLink to="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost h-11">
                      Login
                    </NavLink>
                    <NavLink to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary h-11">
                      Register
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

