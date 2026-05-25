import React from 'react';
import { Database, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';

export const Inventory = () => (
  <Card className="border-slate-800 bg-slate-900/20">
    <SectionHeader title="11. SKU Catalog" icon={Database} colorClass="text-blue-500" />
    <div className="space-y-2 mt-4">
      {[
        { name: 'MLBB 100 Diamonds', supplier: 'Digiflazz', price: 'Rp 14.500', markup: '+12%' },
        { name: 'PUBG 60 UC', supplier: 'Unipin', price: 'Rp 12.100', markup: '+8%' },
        { name: 'FF 50 Diamonds', supplier: 'API Games', price: 'Rp 6.800', markup: '+15%' }
      ].map((p, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-white/5 hover:border-white/10 transition-all">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-200">{p.name}</span>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">{p.supplier} // BASE: {p.price}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-emerald-400">{p.markup}</span>
          </div>
        </div>
      ))}
      <Button variant="ghost" className="w-full mt-4" icon={<Plus className="w-4 h-4" />}>
        Import New SKU from Bridge
      </Button>
    </div>
  </Card>
);
