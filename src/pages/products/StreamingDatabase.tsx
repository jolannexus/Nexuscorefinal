
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Search, 
  Filter, 
  TrendingUp, 
  Activity, 
  Globe, 
  ShieldCheck, 
  ChevronRight,
  Download,
  ExternalLink,
  Zap
} from 'lucide-react';
import { productService } from '../../services/products/productService';
import { Product } from '../../types/index';
import { STREMAING_ANALYTICS, PLATFORMS } from '../../data/streamingProducts';
import { cn } from '../../utils/cn';

export const StreamingDatabase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await productService.getProducts('nexus-demo', { includeStreaming: true });
      // Filter for streaming only if needed, but the generator only makes streaming mostly
      setProducts(Array.isArray(data) ? data.filter(p => p.supplierId === 'nexus_fulfillment_v4' || p.category === 'Live Streaming') : []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.productCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatform === 'ALL' || p.appName === selectedPlatform;
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesPlatform && matchesCategory;
    });
  }, [products, searchQuery, selectedPlatform, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider">
            <Globe className="w-3 h-3" />
            Global Platform
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Streaming <span className="text-primary not-italic">Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-md">
            Product database and catalog for 37+ streaming platforms.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
               <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume</div>
              <div className="text-xl font-bold text-white">Rp {STREMAING_ANALYTICS.totalVolume.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '75%' }}
                 className="h-full bg-emerald-500"
               />
            </div>
            <span className="text-xs font-bold text-emerald-500">+12.4%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
           <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-xl">
               <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Platforms</div>
              <div className="text-xl font-bold text-white font-mono">{STREMAING_ANALYTICS.activeNodes} / 37</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Operational: Optimal</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input 
            type="text"
            placeholder="Search SKUs, Platforms, or Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <select 
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider outline-none focus:border-primary/50"
          >
            <option value="ALL">All Platforms</option>
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider outline-none focus:border-primary/50"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Ref</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acquisition</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Retail Mark</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Popularity</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-800 last:border-0">
                    <td colSpan={6} className="px-8 py-6 h-16 bg-slate-900" />
                  </tr>
                ))
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="group border-b border-slate-800 last:border-0 hover:bg-slate-900 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-primary/30 transition-all">
                        <Video className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-tight">{p.appName}</div>
                        <div className="text-xs font-medium text-slate-600">ID: {p.id.split('_').pop()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-xs font-bold text-blue-500 uppercase tracking-wider border border-blue-500/20">
                          {p.category}
                        </span>
                        <span className="text-xs font-medium text-slate-600 uppercase tracking-tight italic">{p.productCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-medium text-xs text-slate-400">
                    Rp {p.basePrice.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right font-medium text-xs text-emerald-400 font-bold">
                    Rp {p.sellingPrice?.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-3 h-1 rounded-full",
                            i < Math.min(5, Math.ceil(Math.random() * 5)) ? "bg-primary" : "bg-slate-800"
                          )} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                       <span className="text-xs font-bold text-white uppercase tracking-wider">Active</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-white/5 rounded" />
                  <div className="w-16 h-4 bg-white/5 rounded" />
                </div>
                <div className="w-full h-8 bg-white/5 rounded" />
              </div>
            ))
          ) : filteredProducts.map((p) => (
            <div key={p.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">{p.appName}</div>
                    <div className="text-xs font-medium text-slate-600 uppercase italic">Ref: {p.productCode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retail</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">Rp {p.sellingPrice?.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-bold text-white uppercase tracking-tight">{p.name}</div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-xs font-bold text-blue-500 uppercase tracking-wider border border-blue-500/20">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Active</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-4 h-1 rounded-full",
                        i < 3 ? "bg-primary" : "bg-slate-800"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">No products found</h3>
            <p className="text-xs text-slate-500 font-medium">Clear search filters or add new supplier products.</p>
          </div>
        )}
      </div>

      {/* Analytics Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Platform Logs
              </h3>
              <button className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-white transition-colors">View Full Audit</button>
           </div>
           <div className="space-y-4">
              {STREMAING_ANALYTICS.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                   <div className="flex items-center gap-4">
                      <div className="w-1 h-8 rounded-full bg-blue-500/20" />
                      <div>
                         <div className="text-xs font-bold text-white uppercase tracking-tight">{tx.platform} Recharge</div>
                         <div className="text-xs font-medium text-slate-600">{tx.id} // Fulfillment complete</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xs font-bold text-white font-mono">Rp {tx.amount.toLocaleString()}</div>
                      <div className="text-xs font-medium text-slate-600 uppercase italic">0.42ms Sync</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 flex flex-col justify-between">
           <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                 <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">White Label Protection</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase tracking-tight">
                Your agency identity is fully hidden during fulfillment. Every transaction uses our rotating Nexus residential proxy pool for 100% platform compliance.
              </p>
           </div>
           
           <div className="pt-8 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                 <span>Proxy Pool Status</span>
                 <span className="text-emerald-500">SECURE</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                 {Array.from({ length: 8 }).map((_, i) => (
                   <div key={i} className="h-1 bg-primary rounded-full opacity-30" />
                 ))}
              </div>
              <button className="w-full py-4 bg-primary text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-white transition-all">
                Export Catalog
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
