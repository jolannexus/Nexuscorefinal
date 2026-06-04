import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Hash, 
  Settings2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Percent,
  Banknote,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { discountService } from '../../services/marketing/discountService';
import { DiscountCode } from '../../types';
import { cn } from '../../utils/cn';

interface DiscountManagerProps {
  agencyId: string;
}

export const DiscountManager = ({ agencyId }: DiscountManagerProps) => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<DiscountCode>>({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minPurchase: 0,
    status: 'ACTIVE'
  });

  const fetchDiscounts = async () => {
    try {
      const data = await discountService.getDiscounts(agencyId);
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (error) {
      setFetchError('Gagal memuat discount. Coba refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [agencyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await discountService.createDiscount(agencyId, {
        ...formData,
        code: formData.code?.toUpperCase()
      });
      setShowAdd(false);
      setFormData({ code: '', type: 'PERCENTAGE', value: 0, minPurchase: 0, status: 'ACTIVE' });
      fetchDiscounts();
    } catch (error) {
      alert('Failed to create discount code');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    try {
      await discountService.deleteDiscount(agencyId, id);
      fetchDiscounts();
    } catch (error) {
      alert('Failed to delete discount code');
    }
  };

  const toggleStatus = async (discount: DiscountCode) => {
    try {
      await discountService.updateDiscount(agencyId, discount.id, {
        status: discount.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      });
      fetchDiscounts();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Ticket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Discount Campaigns</h3>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Manage your promotional discounts</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="vortex-button-primary px-4 py-2 text-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {discounts.map((discount) => (
            <motion.div
              layout
              key={discount.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className={cn(
                "group relative overflow-hidden transition-all duration-500",
                discount.status === 'ACTIVE' ? "border-primary/20 bg-slate-900/40" : "border-slate-800 bg-slate-950/40 opacity-60"
              )}>
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                   <button 
                     onClick={() => toggleStatus(discount)}
                     className={cn(
                       "p-2 rounded-lg border transition-all",
                       discount.status === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-800 border-slate-800 text-slate-500"
                     )}
                   >
                     <Settings2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(discount.id)}
                     className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 transition-all hover:text-white"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                       {discount.type === 'PERCENTAGE' ? <Percent className="w-2.5 h-2.5" /> : discount.type === 'FIXED' ? <Banknote className="w-2.5 h-2.5" /> : <Truck className="w-2.5 h-2.5" />}
                       {discount.type}
                    </div>
                    <h4 className="text-xl font-mono font-bold text-white tracking-wider group-hover:text-primary transition-colors">{discount.code}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Value</p>
                        <p className="text-sm font-bold text-white">
                          {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `IDR ${discount.value.toLocaleString()}`}
                        </p>
                     </div>
                     <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Usage</p>
                        <p className="text-sm font-bold text-white">{discount.usageCount} / {discount.usageLimit || '∞'}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Clock className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold uppercase tracking-wider">
                         {discount.expiryDate ? new Date(discount.expiryDate.seconds * 1000).toLocaleDateString() : 'No Expiry'}
                       </span>
                    </div>
                    <div className={cn(
                      "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg",
                      discount.status === 'ACTIVE' ? "text-emerald-400 bg-emerald-400/10" : "text-slate-500 bg-white/5"
                    )}>
                      {discount.status}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Create Discount"
        subtitle="Create a new promotional code"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-slate-400">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[11px] font-semibold uppercase tracking-widest px-1">Discount Code</label>
                 <input 
                   required
                   type="text" 
                   value={formData.code}
                   onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                   className="vortex-input uppercase font-semibold"
                   placeholder="e.g. FLASH20"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-semibold uppercase tracking-widest px-1">Discount Type</label>
                 <select 
                   value={formData.type}
                   onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                   className="vortex-input"
                 >
                   <option value="PERCENTAGE">Percentage (%)</option>
                   <option value="FIXED">Fixed Amount (IDR)</option>
                   <option value="FREE_SHIPPING">Free Shipping</option>
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[11px] font-semibold uppercase tracking-widest px-1">Value</label>
                 <input 
                   required
                   type="number" 
                   value={formData.value}
                   onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                   className="vortex-input font-mono"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-semibold uppercase tracking-widest px-1">Min Purchase</label>
                 <input 
                   type="number" 
                   value={formData.minPurchase}
                   onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                   className="vortex-input font-mono"
                 />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[11px] font-semibold uppercase tracking-widest px-1">Usage Limit</label>
                 <input 
                   type="number" 
                   value={formData.usageLimit || ''}
                   onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || undefined })}
                   className="vortex-input font-mono"
                   placeholder="Infinite"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-semibold uppercase tracking-widest px-1">Expiry Date</label>
                 <input 
                   type="date" 
                   onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : undefined })}
                   className="vortex-input"
                 />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1"
            >
              Create Discount
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
