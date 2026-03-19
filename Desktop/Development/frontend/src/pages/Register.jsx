import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus, User, Mail, Lock, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(formData);

    if (result.success) {
      toast.success('Account created! Welcome to the marketplace.');
      navigate('/login');
    } else {
      const errorMsg = typeof result.error === 'object' ? Object.values(result.error).flat().join(', ') : result.error;
      toast.error(errorMsg);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto lg:mx-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <UserPlus className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white italic">Register</h2>
      </div>
      <p className="text-slate-400 font-medium">Join the world's most exclusive auction network.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
                placeholder="User123"
                autoComplete="username"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Phone (optional)</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Address (optional)</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
                placeholder="Global Headquarters"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary h-14 w-full rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 group relative overflow-hidden" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-sm text-slate-400 font-medium italic">
          Already verified?{' '}
          <Link className="text-indigo-400 font-black hover:text-white transition-colors ml-1" to="/login">
            Login to Account
          </Link>
        </p>
      </div>
    </div>
  );
}

