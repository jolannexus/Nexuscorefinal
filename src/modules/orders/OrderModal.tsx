import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Reseller, SupplierConnection } from '../../types/index';
import { useResellers } from '../../hooks/useResellers';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useOrders } from '../../hooks/useOrders';
import { cn } from '../../utils/cn';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const { resellers } = useResellers();
  const { connections } = useSuppliers();
  const { placeOrder } = useOrders();
  
  const [selectedResellerId, setSelectedResellerId] = useState('');
  const [quantity, setQuantity] = useState(product.min);
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (product.rate / 1000) * quantity;
  const selectedReseller = resellers.find(r => r.id === selectedResellerId);
  const supplierConn = connections.find(c => c.id === product.supplierId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResellerId || !supplierConn) {
      setError('Please select a reseller and ensure supplier connection is active.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await placeOrder(selectedResellerId, product.id, quantity, targetUrl, supplierConn);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failure recorded.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl max-h-[calc(100vh-2rem)] flex flex-col"
      >
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase text-purple-500 tracking-wider px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                Provisioning Request
              </span>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight line-clamp-1">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Select Channel
                </label>
                <select 
                  required
                  value={selectedResellerId}
                  onChange={(e) => setSelectedResellerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all font-mono appearance-none"
                >
                  <option value="">-- No Selection --</option>
                  {resellers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (${r.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Target Endpoint URL
                </label>
                <input 
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://instagram.com/nexus_node..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Resource Volume</label>
                  <span className="text-xs text-slate-600 font-mono">[{product.min} - {product.max}]</span>
                </div>
                <input 
                  type="range"
                  min={product.min}
                  max={product.max}
                  step={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer my-4"
                />
                <div className="flex items-center gap-2 bg-slate-950 rounded-xl p-3 border border-slate-800">
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-transparent text-white font-mono text-lg font-bold w-full outline-none"
                  />
                  <span className="text-xs text-slate-600 font-bold uppercase">Units</span>
                </div>
              </div>
            </div>

            {/* Right Side: Quote Summary */}
            <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 flex flex-col">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Financial Snapshot</h4>
              
              <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider font-mono">Unit Cost Ref</span>
                  <span className="text-white font-mono">${(product.rate/1000).toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider font-mono">Volume Buffer</span>
                  <span className="text-white font-mono">x {quantity.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-xs text-slate-500 font-bold uppercase">Total Invoice</span>
                  <span className="text-2xl font-mono font-bold text-white">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-xs font-medium",
                  selectedReseller && selectedReseller.balance >= totalCost 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                  {selectedReseller 
                    ? (selectedReseller.balance >= totalCost ? 'Funds Verified' : 'Insufficient Funds')
                    : 'Awaiting Network'}
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting || !selectedReseller || selectedReseller.balance < totalCost}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      DISPATCHING...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
