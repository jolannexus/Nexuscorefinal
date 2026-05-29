import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

export const WebhookLogsTable = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState<string | null>(null);
  const [pendingReplayId, setPendingReplayId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/webhooks/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_auth_token')}` }
      });
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load webhook logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (id: string) => {
    setReplaying(id);
    setPendingReplayId(null);
    try {
      await fetch(`/api/webhooks/replay/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_auth_token')}` }
      });
      fetchLogs();
    } catch (err) {
      console.error('Failed to replay webhook:', err);
    } finally {
      setReplaying(null);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div className="text-slate-500 font-mono text-xs">Loading logs...</div>;

  return (
    <div className="overflow-x-auto border border-white/5 rounded-xl mt-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
            <th className="py-2.5 px-3">Timestamp</th>
            <th className="py-2.5 px-3">Subscriber URL</th>
            <th className="py-2.5 px-3 text-center">Status</th>
            <th className="py-2.5 px-3 text-right">Attempts</th>
            <th className="py-2.5 px-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 text-[10px]">
              <td className="py-3 px-3 font-mono text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
              <td className="py-3 px-3 font-mono text-slate-200">{log.url}</td>
              <td className="py-3 px-3 text-center">
                {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" /> : <XCircle className="w-3 h-3 text-rose-500 inline" />}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-300">{log.attempts}</td>
              <td className="py-3 px-3 text-center">
                <button 
                  onClick={() => setPendingReplayId(log.id)}
                  disabled={replaying === log.id}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {replaying === log.id ? <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" /> : <Play className="w-3 h-3 text-indigo-400" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={!!pendingReplayId}
        onClose={() => setPendingReplayId(null)}
        title="Confirm Webhook Replay"
        subtitle="This will re-trigger the webhook delivery using the original payload. Make sure the receiving system is prepared to handle this request."
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setPendingReplayId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => pendingReplayId && handleReplay(pendingReplayId)}>Confirm Replay</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="font-semibold text-xs text-rose-200">WARNING: Potential Duplicate Transaction Processing</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Replaying this webhook will resend the transaction pay-out event or status update. If the destination system has not implemented strict idempotency guards, this action could result in <strong className="text-rose-300">duplicate transaction processing</strong>, double payments, or repetitive ledger credits.
          </p>
        </div>
      </Modal>
    </div>
  );
};
