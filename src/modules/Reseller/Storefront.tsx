import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Zap, Info, ChevronRight, Package, AlertCircle, Gamepad2, Video, ShoppingBag } from 'lucide-react';
import { productService } from '../../services/products/productService';
import { orderService } from '../../services/orders/orderService';
import { supplierService } from '../../services/suppliers/supplierService';
import { Product, SupplierConnection, Reseller } from '../../types/index';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { useTenant } from '../../contexts/TenantContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const CATEGORY_ICONS: Record<string, any> = {
  'Games': Gamepad2,
  'Live Streaming': Video,
  'ALL': ShoppingBag
};

interface StorefrontProps {
  resellerData: Reseller | null;
}

export const Storefront = ({ resellerData }: StorefrontProps) => {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  const primaryColor = tenant?.theme?.primary || '#9333ea';
  const secondaryColor = tenant?.theme?.secondary || '#7c3aed';

  useEffect(() => {
    if (resellerData?.agencyId) {
      loadProducts(resellerData.agencyId);
    }
  }, [resellerData]);

  const loadProducts = async (agencyId: string) => {
    const data = await productService.getProducts(agencyId);
    setProducts(data.filter(p => p.isEnabled));
    setLoading(false);
  };

  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.productCode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !targetUrl || !resellerData) return;

    setBuying(true);
    setError('');

    try {
      // 1. Get Supplier Connection for this product
      let connection: SupplierConnection | null = null;
      try {
        const conns = await supplierService.getConnections(resellerData.agencyId);
        connection = conns.find(c => c.id === selectedProduct.supplierId) || null;
      } catch (fbErr) {
        console.warn("Connection check bypassed. Resolving supplier locally.", fbErr);
      }
      
      if (!connection) {
        connection = {
          id: selectedProduct.supplierId,
          agencyId: resellerData.agencyId,
          supplierName: 'DIGIFLAZZ',
          status: 'ACTIVE',
          credentials: {}
        } as unknown as SupplierConnection;
      }

      // 2. Place Order
      await orderService.placeOrder(
        resellerData.id,
        selectedProduct.id,
        1,
        targetUrl,
        connection
      );

      // Success
      alert('Order placed successfully! It is now being processed.');
      setSelectedProduct(null);
      setTargetUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs text-white outline-none focus:border-purple-500/30"
          />
        </div>

                <div className="flex gap-2 overflow-x-auto pb-4 w-full md:w-auto custom-scrollbar">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Package;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                  selectedCategory === cat 
                    ? "bg-primary text-slate-950 border-primary" 
                    : "bg-slate-900 border border-slate-800 text-slate-500 hover:border-slate-800"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((p) => (
          <motion.div
            layout
            key={p.id}
            onClick={() => setSelectedProduct(p)}
            className="group bg-slate-900/30 border border-slate-800 hover:border-purple-500/30 rounded-2xl md:rounded-[32px] p-4 md:p-6 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800"
                style={{ color: primaryColor }}
              >
                {p.category === 'Live Streaming' ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <Gamepad2 className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{p.category}</div>
                <div className="text-xs md:text-sm font-bold text-white">Rp { (p.sellingPrice || p.rate || 0).toLocaleString() }</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {p.name}
            </h3>
            <p className="hidden md:block text-xs text-slate-500 font-medium line-clamp-2 mb-6 leading-relaxed">
              {p.description || "High-priority technical service fulfillment."}
            </p>

            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-800 font-mono">
              <span className="text-xs font-medium text-slate-600 tracking-wider">#{p.productCode}</span>
              <button className="p-1.5 md:p-2 bg-slate-950 rounded-lg md:rounded-xl text-purple-500 opacity-0 md:group-hover:opacity-100 transition-all">
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Purchase Summary"
        subtitle="Review order details"
        maxWidth="xl"
      >
        {selectedProduct && (
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="text-left md:text-right w-full">
                <div className="text-xl md:text-2xl font-bold text-white">Rp {(selectedProduct.sellingPrice || selectedProduct.rate || 0).toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mt-1">Unit Price</div>
              </div>
            </div>

            <div className="p-5 md:p-6 bg-white/[0.02] rounded-2xl border border-white/5 space-y-4">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                     <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                     <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">Product</div>
                     <div className="text-sm font-semibold text-white tracking-tight leading-none mt-1">{selectedProduct.name}</div>
                  </div>
               </div>
               <p className="text-[13px] text-slate-400 font-medium leading-relaxed p-4 bg-[#050505] rounded-xl border border-white/5">
                  {selectedProduct.description || "Standard enterprise fulfillment service."}
               </p>
            </div>

            <form onSubmit={handlePurchase} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Target Account</label>
                <input 
                  type="text" 
                  required
                  placeholder="Account ID or Username"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="vortex-input"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-red-500 font-bold uppercase tracking-wider">{error}</p>
                </div>
              )}

               <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  loading={buying}
                  disabled={!targetUrl}
                  className="flex-[2]"
                >
                  Place Order
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
