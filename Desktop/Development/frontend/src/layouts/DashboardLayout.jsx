import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Gavel, LayoutDashboard, LogOut, PlusCircle, User as UserIcon, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const navItemClass = ({ isActive }) =>
  [
    'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all relative overflow-hidden',
    isActive ? 'text-white' : 'text-slate-400 hover:text-white',
  ].join(' ');

export default function DashboardLayout() {
  const { user, logout, isSeller, isVerifiedSeller, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="container-page pb-20 pt-28">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-28 h-fit">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-premium p-6 rounded-[2.5rem] border-white/5 bg-white/[0.02] shadow-premium"
          >
            <div className="flex items-center justify-center mb-10 pb-10 border-b border-white/5">
              <div className="h-28 w-28 overflow-hidden rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-white/10">
                <img src={logo} alt="BidVerse Hammer" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="flex items-center gap-4 px-2 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black text-xl">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-black text-white leading-none">{user?.username ?? 'Account'}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role ?? 'user'}</div>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <NavLink to="/dashboard" end className={navItemClass}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 relative z-10">
                      <LayoutDashboard className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span>{isAdmin ? 'Admin Panel' : 'Workspace'}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0"
                      />
                    )}
                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                  </>
                )}
              </NavLink>

              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Management</div>
                  <NavLink to="/dashboard/admin/seller-applications" className={navItemClass}>
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 relative z-10">
                          <ShieldCheck className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span>Seller Requests</span>
                        </div>
                        {isActive && (
                          <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                        )}
                        <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                      </>
                    )}
                  </NavLink>
                  <NavLink to="/dashboard/my-auctions" className={navItemClass}>
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 relative z-10">
                          <Gavel className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span>Market Reviews</span>
                        </div>
                        {isActive && (
                          <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                        )}
                        <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                      </>
                    )}
                  </NavLink>
                </div>
              )}

              {!isAdmin && (
                <>
                  <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                    <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Auctions</div>
                    {isSeller && (
                      <NavLink to="/dashboard/create-auction" className={navItemClass}>
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3 relative z-10">
                              <PlusCircle className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                              <span>Create Listing</span>
                            </div>
                            {isActive && (
                              <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                            )}
                            <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                          </>
                        )}
                      </NavLink>
                    )}
                    <NavLink to="/dashboard/my-auctions" className={navItemClass}>
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 relative z-10">
                            <Gavel className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>My Auctions</span>
                          </div>
                          {isActive && (
                            <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                          )}
                          <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/dashboard/my-bids" className={navItemClass}>
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 relative z-10">
                            <Gavel className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Active Bids</span>
                          </div>
                          {isActive && (
                            <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                          )}
                          <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                        </>
                      )}
                    </NavLink>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                    <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Verification</div>
                    {!isVerifiedSeller && (
                      <NavLink to="/dashboard/become-seller" className={navItemClass}>
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3 relative z-10">
                              <PlusCircle className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                              <span>Join as Seller</span>
                            </div>
                            {isActive && (
                              <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                            )}
                          </>
                        )}
                      </NavLink>
                    )}
                    <NavLink to="/dashboard/seller-application" className={navItemClass}>
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 relative z-10">
                            <ShieldCheck className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Status Check</span>
                          </div>
                          {isActive && (
                            <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </div>
                </>
              )}

              <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Account</div>
                <NavLink to="/dashboard/notifications" className={navItemClass}>
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 relative z-10">
                        <Bell className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span>Notifications</span>
                      </div>
                      {isActive && (
                        <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                      )}
                    </>
                  )}
                </NavLink>
                {!isAdmin && (
                  <NavLink to="/dashboard/profile" className={navItemClass}>
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 relative z-10">
                          <UserIcon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span>Profile Settings</span>
                        </div>
                        {isActive && (
                          <motion.div layoutId="active-nav" className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-2xl -z-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            </nav>

            <button 
              onClick={logout} 
              className="group flex items-center gap-3 w-full mt-10 px-4 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all font-bold text-sm border border-red-500/10"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </motion.div>
        </aside>

        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

