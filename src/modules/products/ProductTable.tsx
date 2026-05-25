import React from 'react';
import { 
  Package, 
  Search, 
  Power, 
  PowerOff, 
  ExternalLink, 
  MoreVertical,
  Layers,
  Database,
  DollarSign
} from 'lucide-react';
import { Product } from '../../types';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

interface ProductTableProps {
  products: Product[];
  onToggle: (id: string, enabled: boolean) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onToggle }) => {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/20 backdrop-blur-3xl shadow-2xl">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800">
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Service Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Supplier</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Base Rate</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Selling Price</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Database className="w-12 h-12 text-slate-800" />
                    <div>
                      <h3 className="text-slate-300 font-bold uppercase tracking-wider text-sm mb-1">No products found</h3>
                      <p className="text-xs text-slate-500 font-medium">Connect a supplier to populate your monetization catalog in this region.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-medium text-xs text-purple-400 font-bold group-hover:border-purple-500/50 transition-colors">
                        {product.productCode.slice(-3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1">{product.name}</div>
                        <div className="text-xs font-medium text-slate-600 mt-0.5">UID: {product.id.slice(0, 12)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{product.supplierName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20">
                        {product.appName}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider rounded border border-slate-800">
                        {product.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 font-mono">
                      <DollarSign className="w-3 h-3 text-slate-500" />
                      <span className="text-sm font-bold text-slate-400">{product.basePrice.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <span className="text-sm font-bold text-white">{(product.sellingPrice || product.basePrice).toFixed(2)}</span>
                      </div>
                      {product.marginValue && (
                        <div className="text-xs font-bold text-emerald-500/80 uppercase tracking-wider bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 w-fit">
                          +{product.marginValue}{product.marginType === 'PERCENTAGE' ? '%' : ' FIXED'} Profit
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => onToggle(product.id, !product.isEnabled)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                        product.isEnabled 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20" 
                          : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                      )}
                    >
                      {product.isEnabled ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      {product.isEnabled ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid/Card View */}
      <div className="md:hidden divide-y divide-white/5">
        {products.length === 0 ? (
          <div className="p-12 text-center">
             <Database className="w-10 h-10 text-slate-800 mx-auto mb-4" />
             <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">System Empty</h3>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-medium text-xs text-purple-400 font-bold">
                    {product.productCode.slice(-3)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">{product.name}</div>
                    <div className="text-xs font-medium text-slate-600 mt-0.5">ID: {product.id.slice(0, 8)}</div>
                  </div>
                </div>
                <button 
                  onClick={() => onToggle(product.id, !product.isEnabled)}
                  className={cn(
                    "p-2 rounded-lg border",
                    product.isEnabled 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                      : "bg-red-500/10 border-red-500/30 text-red-500"
                  )}
                >
                  {product.isEnabled ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                <div className="space-y-1">
                   <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Base Rate</p>
                   <p className="text-xs font-medium font-bold text-slate-400">Rp {product.basePrice.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Retail Rate</p>
                   <p className="text-xs font-medium font-bold text-emerald-400">Rp {(product.sellingPrice || product.basePrice).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-500/20">
                    {product.appName}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product.supplierName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
