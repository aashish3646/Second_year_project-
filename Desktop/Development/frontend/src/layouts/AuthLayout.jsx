import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Gavel } from 'lucide-react';
import logo from '../assets/logo.png';

export default function AuthLayout() {
  return (
    <div className="min-h-screen pt-20 pb-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-950" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container-page relative z-0">
        <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[1fr_1.1fr] glass-premium rounded-[2.5rem] overflow-hidden shadow-2xl border-white/5 bg-white/[0.01]">
          {/* Left Sidebar - Branding/Marketing */}
          <div className="hidden lg:block relative overflow-hidden p-12 bg-slate-900/40 border-r border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/5" />
            
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-6 mb-16"
                >
                  <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-white/10">
                    <img src={logo} alt="BidVerse Hammer" className="h-full w-full object-cover" />
                  </div>
                  <div className="text-5xl font-black text-white italic tracking-tighter">
                    BIDVERSE
                  </div>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6"
                >
                  Direct <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Digital</span> Marketplace.
                </motion.h1>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                  <div className="text-xl font-black text-white">LIVE</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Real-time</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                  <div className="text-xl font-black text-white">SECURE</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Encrypted</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Panel - Form Content */}
          <div className="p-8 sm:p-14 bg-slate-950/40 relative">
            <div className="flex items-center justify-between mb-12">
              <Link to="/" className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
              </Link>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

