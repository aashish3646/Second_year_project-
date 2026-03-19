import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      toast.success('Access granted. Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-sm mx-auto lg:mx-0"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <LogIn className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white italic">Login</h2>
      </div>
      <p className="text-slate-400 font-medium">Continue your bidding journey.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
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
              placeholder="Your username"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
            <Link to="#" className="text-[10px] font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">Forgot?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input pl-12 h-14 bg-white/[0.03] border-white/10 focus:bg-white/[0.07] focus:border-indigo-500/50 rounded-2xl text-base font-medium transition-all"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
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
              Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-sm text-slate-400 font-medium italic">
          New to the market?{' '}
          <Link className="text-indigo-400 font-black hover:text-white transition-colors ml-1" to="/register">
            Create an Account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

