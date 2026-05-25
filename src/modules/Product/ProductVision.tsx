import React from 'react';
import { Target } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const ProductVision = () => (
  <Card>
    <SectionHeader title="01. SYSTEM VISION" icon={Target} />
    <p className="text-xs leading-relaxed italic text-slate-400 font-serif">
      "Turnkey infrastructure for digital distribution. Scale legacy game top-ups into an enterprise SaaS ecosystem with military-grade ledger accuracy."
    </p>
  </Card>
);
