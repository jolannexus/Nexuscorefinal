import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, FileJson, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export const IncomingWebhooksTable = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/webhooks/incoming', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_auth_token')}` }
      });
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError('Gagal memuat log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const eventSource = new EventSource('/api/events/stream');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'INCOMING_WEBHOOK') {
          // Unshift the new log
          setLogs(prev => [data.payload, ...prev].slice(0, 20)); // keep last 20
        }
      } catch (err) {
        // ignore parsing errors
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) return <div className="text-slate-500 font-mono text-xs">Loading incoming callbacks...</div>;

  return (
    <div className="overflow-x-auto border border-white/5 rounded-xl mt-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
            <th className="py-2.5 px-3">Timestamp</th>
            <th className="py-2.5 px-3">Supplier Source</th>
            <th className="py-2.5 px-3 text-center">Verified</th>
            <th className="py-2.5 px-3 text-center">Payload</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 text-[10px]">
              <td className="py-3 px-3 font-mono text-slate-400 flex items-center gap-2">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="py-3 px-3 font-mono text-emerald-400 font-bold uppercase">
                {log.supplier?.name || "Unknown"}
              </td>
              <td className="py-3 px-3 text-center">
                {log.isVerified ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-500 inline" />
                ) : (
                  <ShieldAlert className="w-3 h-3 text-rose-500 inline" />
                )}
              </td>
              <td className="py-3 px-3 text-center">
                <button 
                  onClick={() => setSelectedPayload(log.payload)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-indigo-400 border border-white/10 transition-colors flex items-center gap-1 mx-auto"
                >
                  <FileJson className="w-3 h-3" />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
             <tr>
               <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">No incoming webhooks recorded recently</td>
             </tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={!!selectedPayload}
        onClose={() => setSelectedPayload(null)}
        title="Supplier Callback Payload"
        subtitle="Raw JSON payload received from the supplier system."
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setSelectedPayload(null)}>Close</Button>
          </div>
        }
      >
        <div className="bg-slate-950 p-4 rounded-xl border border-white/10 overflow-x-auto max-h-[400px] overflow-y-auto w-[500px] max-w-full">
           <pre className="text-[10px] text-emerald-400 font-mono">
              {JSON.stringify(selectedPayload, null, 2)}
           </pre>
        </div>
      </Modal>
    </div>
  );
};
