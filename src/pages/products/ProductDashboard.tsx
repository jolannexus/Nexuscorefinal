import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Package, 
  Search, 
  Filter, 
  RefreshCcw, 
  LayoutGrid, 
  List,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { ProductTable } from '../../modules/products/ProductTable';
import { ProductStats } from '../../modules/products/ProductStats';
import { BulkPricingControl } from '../../modules/products/BulkPricingControl';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../../services/products/productService';

export const ProductDashboard = () => {
  const { profile } = useAuth();
  const { products, loading, syncProducts } = useProducts();
  const { connections } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [showPricingControl, setShowPricingControl] = useState(false);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const platforms = Array.from(new Set(products.map(p => p.appName)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.productCode.includes(searchQuery);
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      console.error('Global sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    if (!profile?.agencyId) return;
    try {
      await productService.toggleProductStatus(profile.agencyId, id, enabled);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-slate-950">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight leading-none">
              Products
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Manage your product catalog
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowPricingControl(!showPricingControl)}
            className="vortex-button-secondary bg-slate-950/40 border-slate-800 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4 text-primary" />
            Bulk Pricing
          </button>
          <button 
            onClick={handleGlobalSync}
            disabled={syncing}
            className="vortex-button-primary flex items-center gap-3 px-8"
          >
            <RefreshCcw className={cn("w-4 h-4", syncing && "animate-spin")} />
            {syncing ? 'Synchronizing...' : 'Sync Providers'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPricingControl && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <BulkPricingControl 
              categories={categories} 
              platforms={platforms} 
              onComplete={() => setShowPricingControl(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <ProductStats products={products} />

      {/* Management Area */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex bg-slate-950/40 p-1 rounded-2xl border border-slate-800 backdrop-blur-xl">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all",
                !selectedCategory ? "bg-primary text-slate-950 shadow-xl" : "text-slate-500 hover:text-white"
              )}
            >
              All Products
            </button>
            {categories.slice(0, 4).map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  selectedCategory === cat ? "bg-primary text-slate-950 shadow-xl" : "text-slate-500 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary" />
              <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vortex-input pl-12"
              />
            </div>
            
            <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setViewMode('TABLE')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'TABLE' ? "bg-primary/20 text-primary" : "text-slate-600 hover:text-slate-400")}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('GRID')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'GRID' ? "bg-primary/20 text-primary" : "text-slate-600 hover:text-slate-400")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Render */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-slate-900/40 rounded-3xl animate-pulse border border-slate-800" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProductTable products={filteredProducts} onToggle={handleToggle} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
