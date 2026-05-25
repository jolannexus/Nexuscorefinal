import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Wallet, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2,
  TrendingUp,
  CreditCard,
  Mail,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useResellers } from '../../hooks/useResellers';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

export const ResellerModule = () => {
  const { resellers, loading, addReseller, updateBalance, updateStatus, deleteReseller } = useResellers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    initialBalance: 0
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReseller(formData.name, formData.email, Number(formData.initialBalance));
      setShowAddForm(false);
      setFormData({ name: '', email: '', initialBalance: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResellers = resellers.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            Distribution Network
          </h2>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search Partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="vortex-button-primary bg-white text-black px-4 py-2 text-xs font-semibold whitespace-nowrap hidden md:flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Partner
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredResellers.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-sm">No partners found</h3>
          <p className="text-xs text-slate-500 mt-1">Add a partner to begin distribution.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 vortex-button-secondary inline-flex items-center gap-2 text-xs"
          >
            <UserPlus className="w-3 h-3" /> Add Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredResellers.map((reseller, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={reseller.id}
              className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {reseller.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-semibold text-white tracking-tight">{reseller.name}</h3>
                     {i % 3 === 0 ? (
                       <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 uppercase tracking-widest">
                         <Award className="w-3 h-3" /> Gold
                       </span>
                     ) : i % 2 === 0 ? (
                       <span className="text-[9px] font-bold text-slate-300 bg-slate-500/10 px-1.5 py-0.5 rounded border border-slate-500/20 flex items-center gap-1 uppercase tracking-widest">
                         <Award className="w-3 h-3" /> Silver
                       </span>
                     ) : (
                       <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 uppercase tracking-widest">
                         <Award className="w-3 h-3" /> Platinum
                       </span>
                     )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">{reseller.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center gap-4 md:gap-8 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                <div className="flex-1 md:w-32">
                   <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mb-0.5">Balance</p>
                   <p className="text-sm font-semibold text-white">IDR {reseller.balance.toLocaleString()}</p>
                </div>
                <div className="flex-1 md:w-24">
                   <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mb-0.5">Status</p>
                   <span className={cn(
                     "text-[10px] font-bold uppercase tracking-widest text-emerald-500",
                     reseller.status !== 'ACTIVE' && "text-red-500"
                   )}>
                     {reseller.status}
                   </span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                   <button 
                     onClick={() => {
                       const amount = prompt("Enter amount to add (positive) or subtract (negative):");
                       if (amount && !isNaN(Number(amount))) {
                         updateBalance(reseller.id, Number(amount));
                       }
                     }}
                     className="p-2 bg-transparent text-slate-500 hover:text-white transition-all rounded-lg hover:bg-white/5"
                     title="Adjust Balance"
                   >
                     <CreditCard className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => updateStatus(reseller.id, reseller.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                     className="p-2 bg-transparent text-slate-500 hover:text-white transition-all rounded-lg hover:bg-white/5"
                   >
                     {reseller.status === 'ACTIVE' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                   </button>
                   <button 
                     onClick={() => deleteReseller(reseller.id)}
                     className="p-2 bg-transparent text-slate-500 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white tracking-tight mb-4">Add Partner</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-semibold px-1">Organization Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Partner Inc"
                    className="vortex-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-semibold px-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@partner.com"
                    className="vortex-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-semibold px-1">Initial Balance (IDR)</label>
                  <input 
                    required
                    type="number"
                    value={formData.initialBalance}
                    onChange={e => setFormData({...formData, initialBalance: Number(e.target.value)})}
                    className="vortex-input"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 vortex-button-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 vortex-button-primary text-xs"
                  >
                    Add Partner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
