import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Zap, Edit3, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
           <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 font-black text-3xl">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1 italic">{user?.username}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${user?.is_verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                {user?.is_verified ? 'Verified Identity' : 'Standard Account'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.15em]">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
        <Link to="/dashboard/settings" className="btn btn-ghost border-white/5 bg-white/5 rounded-2xl px-6 py-3 font-bold text-sm hover:bg-white/10 flex items-center gap-2 transition-all">
          <Settings className="h-4 w-4" /> Account Settings
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" /> Personal Profile
            </h2>
            <Edit3 className="h-4 w-4 text-slate-600 hover:text-white cursor-pointer transition-colors" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Public Display Name</div>
              <div className="text-base font-bold text-white tracking-tight">{user?.username}</div>
            </div>
            
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</div>
              <div className="text-base font-bold text-white tracking-tight flex items-center justify-between">
                {user?.email}
                <ShieldCheck className="h-4 w-4 text-emerald-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" /> Security & Status
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Verification Level</div>
                <div className="text-sm font-black text-white italic">{user?.is_verified ? 'Tier 1 Verified' : 'Standard (Unverified)'}</div>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${user?.is_verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Role</div>
                <div className="text-sm font-black text-white italic uppercase tracking-tighter">{user?.role}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mt-2">
              <p className="text-[10px] leading-relaxed text-indigo-300 font-medium italic">
                Seller privileges can be managed through the <Link to="/dashboard/become-seller" className="underline font-black hover:text-white transition-colors">verification flow</Link>. Keep your credentials secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

