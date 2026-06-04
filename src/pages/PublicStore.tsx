import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Search, 
  Gamepad2, 
  Smartphone, 
  Lightbulb, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  Home,
  User,
  History,
  LayoutGrid,
  Video,
  Ticket,
  Tag,
  Lock,
  Cpu
} from 'lucide-react';
import { productService } from '../services/products/productService';
import { discountService } from '../services/marketing/discountService';
import { Product, DiscountCode, Order } from '../types/index';
import { BRAND } from '../config/branding';
import { cn } from '../utils/cn';
import { useTenant } from '../contexts/TenantContext';
import { diagnostics } from '../utils/diagnostics';
import { nexusApi } from '../apiService';
import { useTranslation, Trans } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';

const CATEGORY_ICONS: Record<string, any> = {
  'Games': Gamepad2,
  'Live Streaming': Video,
  'Services': Zap,
  'ALL': ShoppingBag
};

export const PublicStore = ({ tenant, isLoading: tenantLoading }: { tenant: any, isLoading: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const { tenant, isLoading: tenantLoading } = useTenant(); // REMOVED
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [targetId, setTargetId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Clear tracking state when modal is closed
  useEffect(() => {
    if (!isTrackOrderOpen) {
      setTrackingResult(null);
      setTrackingError(null);
      setTrackOrderId('');
    }
  }, [isTrackOrderOpen]);

  const handleTrackOrder = async () => {
    if (!trackOrderId.trim()) return;
    setIsTracking(true);
    setTrackingError(null);
    setTrackingResult(null);
    try {
      const searchInput = trackOrderId.trim();
      const tenantQuery = tenant?.id ? `?tenantId=${tenant.id}` : '';
      
      const res = await fetch(`/api/orders/track/${encodeURIComponent(searchInput)}${tenantQuery}`);
      if (!res.ok) {
        throw new Error("Order not found");
      }
      const data = await res.json();
      setTrackingResult(data);
    } catch (e: any) {
      
      setTrackingError("No order found matching this identification code.");
    } finally {
      setIsTracking(false);
    }
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // scroll with some offset for fixed header
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleApplyDiscount = async () => {
    if (!tenant?.id || !selectedProduct || !discountCode) return;
    
    setIsApplyingDiscount(true);
    try {
      const discount = await discountService.validateCode(tenant.id, discountCode, selectedProduct.sellingPrice || 0);
      if (discount) {
        setAppliedDiscount(discount);
        alert('Discount applied successfully!');
      } else {
        alert('Invalid or expired discount code');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to apply discount');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedDiscount || !selectedProduct?.sellingPrice) return 0;
    
    if (appliedDiscount.type === 'PERCENTAGE') {
      const discountAmount = (selectedProduct.sellingPrice * appliedDiscount.value) / 100;
      return appliedDiscount.maxDiscount ? Math.min(discountAmount, appliedDiscount.maxDiscount) : discountAmount;
    } else if (appliedDiscount.type === 'FIXED') {
      return appliedDiscount.value;
    }
    return 0;
  };

  const finalPrice = (selectedProduct?.sellingPrice || 0) - calculateDiscount();

  useEffect(() => {
    if (!tenant?.id) {
       if (!tenantLoading) setLoading(false);
       return;
    }

    fetch(`/api/products/public/${tenant.id}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        
        setLoading(false);
      });
  }, [tenant?.id, tenantLoading]);

  const storeBrand = {
    name: tenant?.name || BRAND.name,
    tagline: (tenant as any)?.tagline || BRAND.tagline,
    isCustom: !!tenant,
    primaryColor: tenant?.theme?.primary || BRAND.colors.primary,
    logoUrl: tenant?.logoUrl || ''
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category || 'General')))] as string[];

  const filteredProducts = products.filter(p => {
    const searchLower = search.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
                          p.productCode.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30">
      {/* Dynamic Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div 
              className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]",
                storeBrand.isCustom ? "bg-white" : "bg-primary"
              )}
              style={storeBrand.isCustom ? { backgroundColor: storeBrand.primaryColor } : {}}
            >
              {storeBrand.logoUrl ? (
                <img src={storeBrand.logoUrl} alt="Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
              ) : (
                <Zap 
                  className={cn("w-5 h-5 md:w-6 md:h-6 fill-current", storeBrand.isCustom ? "text-slate-950" : "text-slate-950")} 
                  style={storeBrand.isCustom ? { color: '#000000' } : {}}
                />
              )}
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold tracking-tight block leading-none">{storeBrand.name}</span>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                storeBrand.isCustom ? "text-slate-400" : "text-primary"
              )}>
                {storeBrand.isCustom ? t('store.officialStore', "Official Store") : t('store.gameStore', "Game Store")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <LanguageSelector />
            </div>
            <div className="hidden md:flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
              <LanguageSelector />
              <button onClick={() => scrollTo('catalog')} className="hover:text-white transition-colors">{t('store.catalog', "Catalog")}</button>
              <button onClick={() => setIsTrackOrderOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-slate-800 rounded-full hover:bg-white hover:text-slate-900 transition-all text-white">
                <Search className="w-3.5 h-3.5" />
                {t('store.trackOrder', "Track Order")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-40 pb-24 px-6 relative overflow-visible">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/20 blur-[180px] rounded-full pointer-events-none -z-10 animate-pulse transition-opacity duration-[5000ms]" style={{ backgroundColor: `${storeBrand.primaryColor}20` }} />
        
        <div className="max-w-7xl mx-auto text-center space-y-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-2xl"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: storeBrand.primaryColor }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: storeBrand.primaryColor }}></span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">{t('store.badgeFeature', "Instant Delivery & 100% Secure")}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9]"
          >
            {t('store.heroTitle1', "Level Up Your")} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-600">
              {t('store.heroTitle2', "Gaming Experience")}
            </span>
          </motion.h1>
          
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className="text-slate-400 max-w-2xl mx-auto text-lg md:text-2xl font-medium leading-relaxed tracking-tight"
          >
            <Trans i18nKey="store.heroDesc" values={{ brandName: storeBrand.name }}>
              Welcome to <span className="text-white font-bold">{storeBrand.name}</span>. The fastest and most reliable way to top up your favorite games and digital vouchers.
            </Trans>
          </motion.p>
          
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
             <button 
                onClick={() => scrollTo('catalog')} 
                className="group relative px-8 py-5 text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] flex items-center gap-3 overflow-hidden"
                style={{ backgroundColor: storeBrand.primaryColor }}
              >
               <span className="relative z-10 flex items-center gap-2">{t('store.topUpNow', "Top Up Now")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
             </button>
             <button 
                onClick={() => scrollTo('catalog')} 
                className="group px-8 py-5 bg-slate-900 border border-slate-800 text-white font-bold uppercase tracking-widest text-sm rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all flex items-center gap-3"
              >
               <Gamepad2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
               {t('store.viewCatalog', "View Catalog")}
             </button>
          </motion.div>
        </div>
      </section>

      {/* Promotion Banners */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[420px]">
          {/* Main Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-8 relative group rounded-[32px] md:rounded-[48px] overflow-hidden bg-slate-900 border border-slate-800 p-10 md:p-14 flex flex-col justify-end hover:border-slate-700 transition-all shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900/10 to-transparent mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(to bottom right, ${storeBrand.primaryColor}33, transparent)` }} />
            <div className="absolute top-0 right-0 p-8 md:p-10">
              <div className="px-5 py-2 bg-slate-950/80 rounded-full border border-slate-800 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md">{t('store.flashSale', "Flash Sale")}</div>
            </div>
            
            <div className="relative z-10 space-y-6 max-w-xl md:mt-16">
              <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1]">
                {t('store.promoTitle1', "Epic")} <br />
                <span style={{ color: storeBrand.primaryColor }}>{t('store.promoTitle2', "Games & Deals.")}</span>
              </h3>
              <p className="text-slate-400 text-base md:text-xl font-medium leading-relaxed max-w-lg">{t('store.promoDesc', "Get the best prices for your favorite games. Fast and secure top-up directly to your game account.")}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-4 grid grid-rows-2 gap-6"
          >
            <div className="relative group rounded-[32px] md:rounded-[40px] overflow-hidden bg-slate-900 p-8 md:p-10 flex flex-col justify-end border border-slate-800 hover:border-slate-700 transition-all shadow-2xl">
               <div className="absolute top-0 right-0 p-8">
                 <Lock className="w-10 h-10 text-slate-700 group-hover:text-emerald-400 transition-colors duration-500" />
               </div>
               <div className="relative z-10 space-y-3">
                 <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('store.secure1Title', "Secure Payment")}</div>
                 <h4 className="text-2xl font-bold text-white tracking-tight">{t('store.secure1Subtitle', "100% Safe")}</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">{t('store.secure1Desc', "Your transactions are protected with enterprise-grade encryption.")}</p>
               </div>
            </div>

            <div className="relative group rounded-[32px] md:rounded-[40px] overflow-hidden bg-slate-900 p-8 md:p-10 flex flex-col justify-end border border-slate-800 hover:border-slate-700 transition-all shadow-2xl">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(to top, ${storeBrand.primaryColor}15, transparent)` }} />
               <div className="absolute top-0 right-0 p-8">
                 <Zap className="w-10 h-10 text-slate-700 group-hover:text-white transition-colors duration-500" />
               </div>
               <div className="relative z-10 space-y-3">
                 <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('store.fast1Title', "Fast Delivery")}</div>
                 <h4 className="text-2xl font-bold text-white tracking-tight">{t('store.fast1Subtitle', "Instant Top-Up")}</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">{t('store.fast1Desc', "Items and vouchers are credited to your account instantly.")}</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="catalog" className="px-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-full max-w-lg group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={t('store.searchCatalogPlaceholder', "Find game, product name, or SKU...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl pl-16 pr-6 py-6 text-sm font-medium outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 w-full md:w-auto custom-scrollbar">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] || ShoppingBag;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                      selectedCategory === cat 
                        ? "bg-primary text-slate-950 border-primary" 
                        : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedProduct(p)}
                className="group relative bg-slate-900 border border-slate-800 rounded-[32px] p-5 md:p-6 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-950 shadow-lg" style={{ backgroundColor: storeBrand.primaryColor }}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-2xl mb-5 flex items-center justify-center border border-slate-800 group-hover:border-slate-600 transition-all relative overflow-hidden"
                  style={{ backgroundColor: `${storeBrand.primaryColor}15` }}
                >
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: storeBrand.primaryColor }} />
                   {p.category === 'Live Streaming' ? <Video className="w-6 h-6 md:w-8 md:h-8" style={{ color: storeBrand.primaryColor }} /> : <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" style={{ color: storeBrand.primaryColor }} />}
                </div>

                <div className="space-y-1 flex-1">
                  <span 
                    className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: storeBrand.primaryColor }}
                  >
                    {p.category}
                  </span>
                  <h3 className="text-sm md:text-lg font-bold tracking-tight text-white leading-tight line-clamp-2 md:min-h-0">
                    {p.name}
                  </h3>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{t('store.startingFrom', "Starting From")}</span>
                    <div className="text-sm md:text-xl font-mono font-bold text-white tracking-tight">
                      Rp {p.sellingPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-900 border-y border-slate-800 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center, ${storeBrand.primaryColor}11 0%, transparent 70%)` }} />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center border border-slate-800 shadow-xl" style={{ backgroundColor: `${storeBrand.primaryColor}15` }}>
              <ShieldCheck className="w-8 h-8" style={{ color: storeBrand.primaryColor }} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t('store.cryptoSecurity', "Cryptographic Security")}</h4>
              <p className="text-sm font-medium text-slate-500 max-w-[250px]">{t('store.cryptoSecurityDesc', "Secure encrypted tunnel. Double-ledger validation for every transaction.")}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 shadow-xl" style={{ backgroundColor: `${storeBrand.primaryColor}15` }}>
              <Clock className="w-8 h-8" style={{ color: storeBrand.primaryColor }} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t('store.zeroLatency', "Zero Latency")}</h4>
              <p className="text-sm font-medium text-slate-500 max-w-[250px]">{t('store.zeroLatencyDesc', "Fulfillment operations processed within milliseconds globally.")}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 shadow-xl" style={{ backgroundColor: `${storeBrand.primaryColor}15` }}>
              <Zap className="w-8 h-8" style={{ color: storeBrand.primaryColor }} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t('store.globalScalability', "Global Scalability")}</h4>
              <p className="text-sm font-medium text-slate-500 max-w-[250px]">{t('store.globalScalabilityDesc', "Dynamic inventory synchronized across multiple redundant nodes.")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedProduct(null)}
               className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] md:rounded-[48px] p-6 md:p-10 shadow-2xl flex flex-col md:flex-row gap-8 md:gap-12 custom-scrollbar overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 right-0 p-6 md:p-8 z-50">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all text-slate-400"
                >
                  <ArrowRight className="w-5 h-5 rotate-45" />
                </button>
              </div>

              {/* Left Column: Product Info & Form */}
              <div className="flex-1 space-y-8 md:space-y-10 relative z-10 pt-4">
                <div className="flex flex-row gap-6 items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-950 rounded-[24px] flex items-center justify-center border border-slate-800 shadow-xl shrink-0" style={{ boxShadow: `0 20px 40px ${storeBrand.primaryColor}15` }}>
                    {selectedProduct.category === 'Live Streaming' ? <Video className="w-10 h-10" style={{ color: storeBrand.primaryColor }} /> : <Gamepad2 className="w-10 h-10" style={{ color: storeBrand.primaryColor }} />}
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: storeBrand.primaryColor }}>Secure Checkout</div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-[1.1]">{selectedProduct.name}</h2>
                    <p className="text-xs text-slate-400 font-medium">Standard Fulfillment Node</p>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Destination Address (ID/Phone)</label>
                      <input 
                        type="text" 
                        placeholder="Enter identifier..."
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-slate-600 rounded-2xl px-6 py-5 text-sm md:text-base text-white outline-none transition-colors shadow-inner font-mono placeholder:text-slate-600"
                      />
                   </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Promotion Code</label>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder="PROMO10"
                           value={discountCode}
                           onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                           className="flex-1 bg-slate-950/50 border border-slate-800 focus:border-slate-600 rounded-xl px-5 py-3 text-sm text-white font-mono outline-none transition-colors shadow-inner placeholder:text-slate-600 uppercase"
                         />
                         <button 
                           type="button"
                           onClick={handleApplyDiscount}
                           disabled={isApplyingDiscount || !discountCode}
                           className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-20 flex items-center justify-center min-w-[100px]"
                           style={{ backgroundColor: storeBrand.primaryColor, color: '#0f172a' }}
                         >
                           {isApplyingDiscount ? '...' : 'Apply'}
                         </button>
                      </div>
                      {appliedDiscount && (
                         <div className="inline-flex items-center gap-2 text-[11px] font-bold text-emerald-400 uppercase tracking-[0.1em] bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                           <Tag className="w-3 h-3" />
                           {appliedDiscount.code} Applied
                         </div>
                      )}
                    </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="w-full md:w-[380px] shrink-0 flex flex-col pt-4 relative z-10">
                <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-[32px] p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
                   <div className="space-y-4">
                     <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] pb-4 border-b border-slate-800/50">Ledger Summary</h3>
                     
                     <div className="space-y-3 pt-2 text-sm font-medium">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Unit Price</span>
                          <span className="text-white font-mono">Rp {selectedProduct.sellingPrice.toLocaleString()}</span>
                        </div>
                        {calculateDiscount() > 0 && (
                            <div className="flex justify-between items-center text-emerald-400">
                              <span>Promotion</span>
                              <span className="font-mono">-Rp {calculateDiscount().toLocaleString()}</span>
                            </div>
                         )}
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Network Fee</span>
                          <span className="text-white font-mono">Rp 0</span>
                        </div>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-slate-800/50 space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Total Settlement</span>
                        <span className="text-3xl font-black tracking-tighter" style={{ color: storeBrand.primaryColor }}>
                          Rp {finalPrice.toLocaleString()}
                        </span>
                      </div>

                      <button 
                        type="button"
                        disabled={!targetId}
                        onClick={() => {
                          alert('Order successfully submitted to processing.');
                          setTargetId('');
                          setSelectedProduct(null);
                          setDiscountCode('');
                          setAppliedDiscount(null);
                        }}
                        className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: storeBrand.primaryColor, color: '#0f172a', boxShadow: `0 10px 30px ${storeBrand.primaryColor}33` }}
                      >
                        Authorize Payment
                      </button>

                      <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em]">
                        <Lock className="w-3 h-3" /> Encrypted Pipeline
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Track Order Modal */}
      <AnimatePresence>
        {isTrackOrderOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsTrackOrderOpen(false)}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col gap-6"
            >
              <div className="absolute top-0 right-0 p-6 z-50">
                <button 
                  onClick={() => setIsTrackOrderOpen(false)}
                  className="w-10 h-10 rounded-full border border-slate-800 bg-slate-950/50 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all text-slate-400"
                >
                  <ArrowRight className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-2 text-center pt-2">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl mx-auto flex items-center justify-center border border-slate-800 shadow-xl mb-4">
                  <Search className="w-8 h-8" style={{ color: storeBrand.primaryColor }} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Track Your Order</h2>
                <p className="text-sm text-slate-400 font-medium">Enter your Order Reference ID or associated Phone Number.</p>
              </div>

              <div className="space-y-6 pt-4">
                {!trackingResult && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Reference ID or Phone</label>
                      <div className="relative">
                        <History className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="e.g. ORD_12345678"
                          value={trackOrderId}
                          onChange={(e) => setTrackOrderId(e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 focus:border-slate-600 rounded-2xl pl-14 pr-6 py-4 text-sm text-white outline-none transition-colors shadow-inner font-mono placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {trackingError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 font-mono text-center">
                        {trackingError}
                      </div>
                    )}

                    <button 
                      type="button"
                      disabled={!trackOrderId || isTracking}
                      onClick={handleTrackOrder}
                      className="w-full py-4 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ backgroundColor: storeBrand.primaryColor, color: '#0f172a', boxShadow: `0 10px 30px ${storeBrand.primaryColor}33` }}
                    >
                      {isTracking ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-[#0f172a] border-t-transparent animate-spin" />
                          Verifying logs...
                        </>
                      ) : (
                        "Lookup Order"
                      )}
                    </button>
                  </div>
                )}

                {trackingResult && (
                  <div className="space-y-6">
                    {/* Dynamic Header Badge */}
                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">Transaction Ref</span>
                          <span className="text-sm font-mono font-bold text-white">ORD_{trackingResult.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                          trackingResult.status === 'COMPLETED' || trackingResult.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          trackingResult.status === 'PENDING' || trackingResult.status === 'PROCESSING' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {trackingResult.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs gap-4">
                          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">Product:</span>
                          <span className="text-white font-semibold text-right truncate">
                            {products.find(p => p.id === trackingResult.productId)?.name || 'Digital Package'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs gap-4">
                          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">Destination / ID:</span>
                          <span className="text-white font-mono font-semibold text-right truncate">{trackingResult.targetAccount || 'N/A'}</span>
                        </div>
                        {trackingResult.quantity && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Quantity:</span>
                            <span className="text-white font-semibold">{trackingResult.quantity}</span>
                          </div>
                        )}
                        {trackingResult.totalCost !== undefined && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Billing cost:</span>
                            <span className="text-emerald-400 font-bold font-mono">IDR {trackingResult.totalCost.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {trackingResult.createdAt && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Timestamp:</span>
                            <span className="text-slate-400 font-mono">
                              {trackingResult.createdAt ? new Date(trackingResult.createdAt).toLocaleString() : new Date().toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        setTrackingResult(null);
                        setTrackingError(null);
                        setTrackOrderId('');
                      }}
                      className="w-full py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-white/5 rounded-2xl border border-slate-800"
                    >
                      Track Another Order
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 inset-x-6 z-50">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-3 shadow-2xl flex justify-between items-center px-6">
          <button 
            className="flex flex-col items-center gap-1"
            style={{ color: storeBrand.primaryColor }}
            onClick={() => scrollTo('home')}
          >
             <Home className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-wider">{t('store.homeTab', "Home")}</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors"
            onClick={() => scrollTo('catalog')}
          >
             <LayoutGrid className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-wider">{t('store.catalogTab', "Catalog")}</span>
          </button>
          <div 
            className="w-12 h-12 rounded-3xl -mt-10 flex items-center justify-center shadow-lg border-4 border-slate-950 cursor-pointer"
            style={{ backgroundColor: storeBrand.primaryColor, boxShadow: `0 10px 20px ${storeBrand.primaryColor}33` }}
            onClick={() => scrollTo('catalog')}
          >
             <Zap className="w-6 h-6 text-slate-950 fill-current" />
          </div>
          <button 
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors"
            onClick={() => setIsTrackOrderOpen(true)}
          >
             <History className="w-5 h-5" />
             <span className="text-[10px] font-bold uppercase tracking-wider">{t('store.trackTab', "Track")}</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors"
            onClick={() => {
              alert('Support integration coming soon.');
            }}
          >
             <ShieldCheck className="w-5 h-5" />
             <span className="text-[10px] font-bold uppercase tracking-wider">{t('store.supportTab', "Support")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
