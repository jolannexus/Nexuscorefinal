import React from 'react';
import { Terminal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const DeveloperSnippet = () => (
  <Card className="border-slate-800 bg-slate-950 font-mono overflow-hidden">
    <SectionHeader title="19. API Endpoint" icon={Terminal} colorClass="text-purple-400" />
    <div className="bg-black/50 p-3 rounded text-xs leading-relaxed relative group">
      <div className="absolute top-2 right-2 text-slate-700 group-hover:text-purple-500 transition-colors cursor-pointer">
        COPY
      </div>
      <pre className="text-purple-300 whitespace-pre-wrap">
        {`POST /api/v1/order/create
{
  "api_id": "NX-092-22",
  "secret_key": "********",
  "sku": "ML_100_DM",
  "target": "12345678(2001)"
}`}
      </pre>
    </div>
  </Card>
);
