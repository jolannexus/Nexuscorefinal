import React, { useState } from 'react';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Product, ProductVariant } from '../../types/index';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/Button';

export const CatalogManager = () => {
  const [products, setProducts] = useState<any[]>([
    { 
      id: 1, 
      name: 'Mobile Legends', 
      category: 'Mobile Legends', 
      status: 'Active',
      variants: [
        { id: 101, name: '100 Diamonds', price: 14500, status: 'Active' },
        { id: 102, name: '500 Diamonds', price: 72000, status: 'OOS' }
      ]
    },
    { 
      id: 2, 
      name: 'PUBG Mobile', 
      category: 'PUBG', 
      status: 'Active',
      variants: [
        { id: 201, name: '60 UC', price: 12100, status: 'Active' }
      ]
    }
  ]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Mobile Legends', 
    status: 'Active',
    variants: [] as ProductVariant[]
  });

  const [newVariant, setNewVariant] = useState({ name: '', price: 1000, status: 'Active' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...formData } : p));
      setEditingId(null);
    } else {
      setProducts([...products, { id: Date.now(), ...formData }]);
    }
    setFormData({ name: '', category: 'Mobile Legends', status: 'Active', variants: [] });
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ 
      name: p.name, 
      category: p.category, 
      status: p.status,
      variants: [...p.variants]
    });
  };

  const addVariant = () => {
    if (!newVariant.name) return;
    setFormData({
      ...formData,
      variants: [...formData.variants, { ...newVariant, id: Date.now() }]
    });
    setNewVariant({ name: '', price: 1000, status: 'Active' });
  };

  const removeVariant = (id: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== id)
    });
  };

  return (
    <Card className="col-span-1 md:col-span-2 border-slate-700 bg-slate-900/50">
      <SectionHeader title="35. Catalog Management" icon={BarChart3} colorClass="text-blue-500" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Form Section */}
        <div className="space-y-4 bg-slate-950/40 p-4 rounded border border-slate-800">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {editingId ? 'Modify Game Group' : 'Provision New Game'}
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Game Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Mobile Legends: Bang Bang"
                  className="vortex-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="vortex-input"
                    >
                      <option>Mobile Legends</option>
                      <option>PUBG</option>
                      <option>Free Fire</option>
                      <option>Valorant</option>
                    </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Overall Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="vortex-input"
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>OOS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Variants Management */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">SKU VARIANTS</h4>
              
              <div className="space-y-2">
                {formData.variants.map((v, index) => (
                   <div key={v.id} className="grid grid-cols-12 gap-2 bg-slate-900/50 p-2 rounded border border-dashed border-slate-800 items-center">
                    <div className="col-span-5">
                      <input 
                        type="text" 
                        value={v.name}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].name = e.target.value;
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={v.price}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].price = Number(e.target.value);
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <select 
                        value={v.status}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].status = e.target.value;
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono outline-none appearance-none"
                      >
                        <option>Active</option>
                        <option>Draft</option>
                        <option>OOS</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button 
                        type="button"
                        onClick={() => removeVariant(v.id)}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-2 bg-slate-900/50 p-2 rounded border border-dashed border-slate-800">
                <div className="col-span-5">
                  <input 
                    type="text" 
                    placeholder="Variant (e.g. 100 DM)"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-3">
                  <input 
                    type="number" 
                    placeholder="Price"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({...newVariant, price: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-3">
                  <select 
                    value={newVariant.status}
                    onChange={(e) => setNewVariant({...newVariant, status: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono outline-none appearance-none"
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>OOS</option>
                  </select>
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  <button 
                    type="button" 
                    onClick={addVariant}
                    className="flex justify-center items-center bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded p-1 w-full text-xs font-bold uppercase hover:bg-emerald-600/30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit"
                className="flex-[2]"
              >
                {editingId ? 'Apply All Changes' : 'Commit to Catalog'}
              </Button>
              {editingId && (
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Mobile Legends', status: 'Active', variants: [] }); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-slate-900 py-1 z-10">
            Active Ecosystem Catalog
          </h3>
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950/60 rounded border border-slate-800 hover:border-blue-500/20 group transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-tight">{p.name}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-bold tracking-tight uppercase",
                        p.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-500"
                      )}>{p.status}</span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium uppercase tracking-wider">{p.category}</span>
                  </div>
                  <button 
                    onClick={() => startEdit(p)}
                    className="p-1 px-2 border border-slate-800 rounded text-xs font-bold uppercase text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all"
                  >
                    Edit Group
                  </button>
                </div>
                <div className="space-y-1.5 pl-2 border-l border-slate-800/50">
                  {p.variants.map((v) => (
                    <div key={v.id} className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded">
                      <span className="text-xs text-slate-400 font-bold uppercase">{v.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500">IDR {v.price.toLocaleString()}</span>
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          v.status === 'Active' ? "bg-emerald-500" : "bg-red-500"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
