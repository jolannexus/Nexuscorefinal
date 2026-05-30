import React, { useState } from 'react';
import { Terminal, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';

export const DeveloperSnippet = () => {
  const [snippet, setSnippet] = useState<string>(`POST /api/v1/order/create
{
  "api_id": "NX-092-22",
  "secret_key": "********",
  "sku": "ML_100_DM",
  "target": "12345678(2001)"
}`);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/docs/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('nexus_auth_token')}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (data.snippet) {
        setSnippet(data.snippet.replace(/```(json|markdown)?\n?/g, '').replace(/```/g, ''));
      }
    } catch (err) {
      console.error("Failed to generate snippet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-950 font-mono overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <SectionHeader title="19. API Endpoint" icon={Terminal} colorClass="text-purple-400" />
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI Generate
        </button>
      </div>
      <div className="bg-black/50 p-3 rounded text-xs leading-relaxed relative group overflow-x-auto">
        <div className="absolute top-2 right-2 text-slate-700 group-hover:text-purple-500 transition-colors cursor-pointer">
          COPY
        </div>
        <pre className="text-purple-300 whitespace-pre-wrap">
          {snippet}
        </pre>
      </div>
    </Card>
  );
};
