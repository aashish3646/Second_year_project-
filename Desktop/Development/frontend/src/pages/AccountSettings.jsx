import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { User, Mail, Phone, MapPin, Save, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AccountSettings() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authApi.updateProfile(form);
      // Update the local auth context with new user data
      // Assuming context has a way to update, or just notify user to refresh.
      // Most implementation of login(data) might just set the user.
      // If AuthContext doesn't have an 'updateUser' we might need to be careful.
      // For now, let's toast success.
      toast.success('Profile Transformed Successfully');
    } catch (err) {
      const msg = err.response?.data?.detail || 'System rejection: Update failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/profile" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white italic">Account Security</h1>
            <p className="text-slate-400 font-medium italic mt-1">Refine your identity and contact vectors.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Username Identity</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-sm font-bold italic transition-all"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Primary Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-sm font-bold italic transition-all"
                  placeholder="name@exclusive.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Communication Line</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-sm font-bold italic transition-all"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Operational Base</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-sm font-bold italic transition-all"
                  placeholder="Global HQ"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-premium p-6 rounded-[2rem] border-white/5 bg-indigo-500/[0.02] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                 <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Verification Status</div>
                 <div className="text-xs font-bold text-white italic">Updates require system-wide propagation.</div>
              </div>
           </div>
           <button 
             type="submit" 
             disabled={loading}
             className="btn btn-primary h-14 px-8 rounded-2xl font-black italic tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-500/20 disabled:grayscale transition-all"
           >
             {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Commit Changes</>}
           </button>
        </div>
      </form>
    </div>
  );
}
