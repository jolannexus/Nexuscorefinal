import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCcw, 
  ShoppingCart, 
  Tag, 
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { cn } from '../../utils/cn';
import { OrderModal } from '../orders/OrderModal';
import { Product } from '../../types';

export const ProductCatalog = () => {
  const { products, loading, syncProducts } = useProducts();
  const { connections } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.productCode.includes(searchQuery);
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.isEnabled;
  });

  const handleGlobalSync = async () => {
    if (connections.length === 0) return;
    setSyncing(true);
    try {
      for (const conn of connections) {
        if (conn.status === 'ACTIVE') {
          await syncProducts(conn);
        }
      }
    } catch (err) {
      
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            Collection Market
          </h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
            Global Fulfillment Catalog // SECURE_ACCESS
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Query Market Platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vortex-input pl-12 h-12"
            />
          </div>
          <button 
            onClick={handleGlobalSync}
            disabled={syncing || connections.length === 0}
            className="vortex-button-primary h-12 px-6 flex items-center gap-3"
          >
            <RefreshCcw className={cn("w-4 h-4", syncing && "animate-spin")} />
            Sync Stream
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-1">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
            !selectedCategory ? "bg-primary text-slate-950 shadow-lg" : "bg-slate-800/50 text-slate-500 hover:text-white border border-slate-800"
          )}
        >
          All Fulfillment
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
              selectedCategory === cat ? "bg-primary text-slate-950 border-primary" : "bg-slate-800/50 border-slate-800 text-slate-500 hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-20 text-center">
          <Layers className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-50" />
          <h3 className="text-slate-400 font-bold uppercase tracking-wider mb-2 text-base">Catalog Not Initialized</h3>
          <p className="text-xs text-slate-600 font-medium uppercase tracking-wider max-w-sm mx-auto">
            Awaiting supplier node synchronization. Execute manual sync to populate local service infrastructure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={product.id}
              className="group bg-slate-950/40 backdrop-blur-2xl border border-slate-800 rounded-[32px] overflow-hidden hover:border-primary/20 transition-all flex flex-col shadow-2xl"
            >
              <div className="p-7 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/20">
                    {product.category}
                  </span>
                  <span className="text-xs font-medium text-slate-700 font-bold group-hover:text-primary/50 transition-colors">#{product.productCode}</span>
                </div>
                
                <h3 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 mb-6 bg-slate-900 p-2 rounded-xl">
                  <Info className="w-4 h-4 text-slate-600" />
                  <p className="text-xs line-clamp-1 font-medium">{product.description || 'Standard product delivery.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-1">Price</span>
                    <div className="text-lg font-mono font-bold text-white flex items-baseline gap-1">
                      <span className="text-xs text-primary">IDR</span>
                      {(product.sellingPrice || product.rate || product.basePrice).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-1">Limits</span>
                    <div className="text-xs font-medium text-slate-400 font-bold">
                      {product.min.toLocaleString()} - {product.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-3">
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 vortex-button-primary h-12 flex items-center justify-center gap-3 text-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Place Order
                </button>
                <button className="w-12 h-12 flex items-center justify-center border border-slate-800 rounded-2xl hover:bg-white/5 hover:border-primary/30 transition-all text-slate-500 hover:text-primary">
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <OrderModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
