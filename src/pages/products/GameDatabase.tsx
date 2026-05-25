
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  TrendingUp, 
  Star, 
  Gamepad, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  Trophy,
  History,
  Activity
} from 'lucide-react';
import { productService } from '../../services/products/productService';
import { Product } from '../../types/index';
import { GAME_ANALYTICS, GAMES } from '../../data/gameProducts';
import { cn } from '../../utils/cn';

export const GameDatabase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await productService.getProducts('nexus-demo', { includeGames: true });
      setProducts(data.filter(p => p.id.startsWith('game_') || p.category === 'Games'));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.productCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGame = selectedGame === 'ALL' || p.appName === selectedGame;
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesGame && matchesCategory;
    });
  }, [products, searchQuery, selectedGame, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[48px] p-8 md:p-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-slate-800 text-xs font-bold text-primary uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              Gaming Catalog
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Game <span className="text-primary italic">Matrix</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg leading-relaxed">
              Global gateway for high-throughput fulfillment. Supporting 24+ titles with real-time sync.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-3xl">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Daily Volume</div>
                <div className="text-2xl font-bold text-white font-mono">{GAME_ANALYTICS.dailyOrders} Units</div>
              </div>
              <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-3xl">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Liquidity</div>
                <div className="text-2xl font-bold text-emerald-500 font-mono">Rp 3.4B</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {GAME_ANALYTICS.trendingGames.map((game, i) => (
              <div key={game} className={cn(
                "p-6 rounded-[32px] border transition-all hover:scale-105 cursor-default",
                i === 0 ? "bg-primary border-primary text-slate-950" : "bg-slate-950 border-slate-800 text-white"
              )}>
                <TrendingUp className={cn("w-6 h-6 mb-4", i === 0 ? "text-slate-950" : "text-primary")} />
                <div className="text-xs font-bold uppercase tracking-wider opacity-60">Trending Now</div>
                <div className="text-sm font-bold uppercase tracking-tight mt-1">{game}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Alert */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-500 rounded-xl">
               <Zap className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <div>
               <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Operational Status</span>
               <span className="text-xs text-slate-400 font-medium">All nodes are healthy. Average delivery time: 14 seconds across 24 platforms.</span>
            </div>
         </div>
         <div className="hidden md:flex gap-2">
            {GAME_ANALYTICS.featuredProducts.map(p => (
              <span key={p} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-500 uppercase tracking-wider border border-emerald-500/20">
                {p}
              </span>
            ))}
         </div>
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
          <input 
            type="text"
            placeholder="Search catalog by product or game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-[32px] pl-16 pr-6 py-6 text-sm text-white outline-none focus:border-primary/50 transition-all font-medium"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <select 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-[24px] px-8 py-6 text-sm font-medium text-slate-400 outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="ALL">All Titles</option>
            {GAMES.map(g => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-[24px] px-8 py-6 text-sm font-medium text-slate-400 outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-[40px] animate-pulse" />
          ))
        ) : filteredProducts.map((p) => (
          <motion.div 
            layout
            key={p.id}
            className="group relative bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:bg-primary transition-all duration-500">
                  <Gamepad2 className="w-6 h-6 text-primary group-hover:text-slate-950" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SKU REF</div>
                  <div className="text-xs font-medium text-white opacity-40">{p.productCode}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">{p.appName}</div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">
                  {p.name}
                </h3>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Pricing</div>
                  <div className="text-xl font-bold text-white font-mono">Rp {p.sellingPrice?.toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Markup</div>
                   <div className="text-xs font-bold text-emerald-500">+8.0%</div>
                </div>
              </div>

              <button className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider overflow-hidden relative group-hover:bg-white group-hover:text-slate-950 transition-all duration-500">
                Sync Catalog
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {(!loading && filteredProducts.length === 0) && (
        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[48px] p-32 flex flex-col items-center justify-center text-center">
           <Gamepad className="w-16 h-16 text-slate-800 mb-6" />
           <h3 className="text-xl font-bold text-slate-500 uppercase tracking-wider">Access Denied // Zero Results</h3>
           <p className="text-xs text-slate-600 font-mono mt-2 uppercase">The requested game matrix parameters returned no active products.</p>
        </div>
      )}

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-blue-500" />
              Real Time Fulfillment Stream
            </h3>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                   <div className="flex items-center gap-4">
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                     <div className="text-xs font-bold text-white uppercase">TX_{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                   </div>
                   <div className="text-xs font-medium text-slate-500">{GAMES[Math.floor(Math.random() * GAMES.length)].name} // IDR {Math.floor(Math.random() * 500000).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-white transition-colors flex items-center gap-2">
            View Full Audit Trail <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-10">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <ShieldCheck className="w-8 h-8 text-slate-950" />
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Nexus Vault™ Verification</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed uppercase tracking-tight">
              All transactions are fully secured and compliant with supplier requirements. Enjoy low latency processing for your catalog.
            </p>
            <div className="pt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Compliance</div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider tracking-tight italic">Grade A Certified</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sync Rate</div>
                <div className="text-xs font-bold text-white uppercase font-mono tracking-tight">99.999% UP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
