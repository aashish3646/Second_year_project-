import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auctionsApi } from '../services/auctionsApi';
import LocationPicker from '../components/LocationPicker';
import { PlusCircle, Type, FileText, Gavel, Tag, MapPin, Image as ImageIcon, Calendar, ArrowRight, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateAuction() {
  const navigate = useNavigate();
  const { isSeller, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    starting_bid: '',
    category: '',
    start_time: '',
    end_time: '',
    location_address: '',
    latitude: '',
    longitude: '',
    image: null,
  });

  const canCreate = isSeller || isAdmin;

  useEffect(() => {
    auctionsApi
      .categories()
      .then(({ data }) => setCategories(data))
      .catch(() => toast.error('Could not load categories'));
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onFileChange = (e) => setForm((f) => ({ ...f, image: e.target.files[0] }));

  const handleLocationSelect = ({ lat, lng }) => {
    setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      toast.error('Only sellers can create auctions.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('starting_bid', form.starting_bid);
    if (form.category) formData.append('category', form.category);
    formData.append('start_time', form.start_time);
    formData.append('end_time', form.end_time);
    if (form.location_address) formData.append('location_address', form.location_address);
    if (form.latitude) formData.append('latitude', form.latitude);
    if (form.longitude) formData.append('longitude', form.longitude);
    if (form.image) formData.append('image', form.image);

    try {
      const { data } = await auctionsApi.create(formData);
      toast.success('Listing created. Pending administrative review.');
      navigate(`/dashboard/my-auctions`);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail ||
        (typeof data === 'object' ? Object.values(data).flat().join(', ') : null) ||
        'Failed to create auction';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="glass-premium p-12 rounded-[2.5rem] text-center border-white/5 bg-white/[0.02]">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tight">Seller Access Required</h2>
        <p className="mt-4 text-slate-400 font-medium max-w-sm mx-auto italic">To list exclusive assets, you must first verify your seller credentials through the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto lg:mx-0">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <PlusCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white italic">Create Listing</h1>
          <p className="text-slate-400 font-medium italic mt-1">Submit a new asset for marketplace verification.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Title</label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-bold italic transition-all"
                placeholder="Rare Vintage Watch No. 42"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Description</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-6 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                className="input pl-12 min-h-32 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-medium italic py-5 resize-none transition-all"
                placeholder="Detailed specifications, history, and current condition of the asset."
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Opening Bid ($)</label>
              <div className="relative group">
                <Gavel className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="starting_bid"
                  value={form.starting_bid}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-black italic transition-all"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="2500.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Categorization</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={onChange} 
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-bold italic transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Location</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="location_address"
                value={form.location_address}
                onChange={onChange}
                className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-bold italic transition-all"
                placeholder="Geneva, Switzerland"
              />
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10">
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>
          {form.latitude && (
            <div className="flex justify-center">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">
                Cords Secured: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
              </div>
            </div>
          )}
        </div>

        <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Visual Documentation</label>
            <div className="relative h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-colors group flex items-center justify-center overflow-hidden">
               {form.image ? (
                 <div className="flex items-center gap-3 text-indigo-400 font-bold italic">
                    <CheckCircle2 className="h-5 w-5" /> Image Selected: {form.image.name.slice(0, 15)}...
                 </div>
               ) : (
                 <div className="flex items-center gap-3 text-slate-500 font-bold italic">
                    <ImageIcon className="h-5 w-5" /> Click to Upload Asset Imagery
                 </div>
               )}
               <input
                name="image"
                type="file"
                onChange={onFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Commencement Time</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="start_time"
                  value={form.start_time}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-bold italic transition-all"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Conclusion Time</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="end_time"
                  value={form.end_time}
                  onChange={onChange}
                  className="input pl-12 h-14 bg-white/[0.02] border-white/10 focus:bg-white/[0.05] focus:border-indigo-500/50 rounded-2xl text-base font-bold italic transition-all"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary h-16 w-full rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-500/30 group relative overflow-hidden italic" 
          type="submit" 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-white" />
          ) : (
            <span className="flex items-center justify-center gap-3">
              Authorize Deployment <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
