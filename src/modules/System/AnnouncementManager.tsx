import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  CheckCircle,
  X
} from 'lucide-react';
import { Announcement, Role } from '../../types/index';
import { announcementService } from '../../services/system/announcementService';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'INFO' as Announcement['type'],
    priority: 'LOW' as Announcement['priority'],
    targetRoles: ['RESELLER', 'AGENCY'] as Role[]
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    // Admin can see everything essentially, but for simplicity we fetch a general list
    const data = await announcementService.getLatestAnnouncements('SUPER_ADMIN' as Role, 20);
    setAnnouncements(Array.isArray(data) ? data : []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await announcementService.createAnnouncement({
        ...formData,
        createdBy: 'Admin', // In real app, get from Auth
      });
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        type: 'INFO',
        priority: 'LOW',
        targetRoles: ['RESELLER', 'AGENCY']
      });
      loadAnnouncements();
    } catch (err) {
      alert('Gagal publish announcement. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this broadcast?')) {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const toggleRole = (role: Role) => {
    if (formData.targetRoles.includes(role)) {
      setFormData({ ...formData, targetRoles: formData.targetRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, targetRoles: [...formData.targetRoles, role] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-blue-500" />
          Announcements
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl overflow-hidden"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Critical System Maintenance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none"
                    >
                      <option value="INFO">Information</option>
                      <option value="WARNING">Warning</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="SUCCESS">Success</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Content</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Detailed explanation of the announcement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Audience:</span>
                  {['SUPER_ADMIN', 'AGENCY', 'RESELLER'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r as Role)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                        formData.targetRoles.includes(r as Role)
                          ? "bg-white text-slate-950 border-white"
                          : "bg-slate-950 text-slate-500 border-slate-800 hover:text-white"
                      )}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-white text-slate-950 px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  {loading ? 'Initializing...' : 'Publish'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Array.isArray(announcements) ? announcements : []).map((msg) => (
          <div key={msg.id} className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5 hover:border-slate-800 transition-all group relative">
            <button 
              onClick={() => handleDelete(msg.id)}
              className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                msg.type === 'INFO' && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                msg.type === 'WARNING' && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                msg.type === 'CRITICAL' && "bg-red-500/10 border-red-500/20 text-red-500",
                msg.type === 'SUCCESS' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              )}>
                {msg.type === 'INFO' && <Info className="w-5 h-5" />}
                {msg.type === 'WARNING' && <AlertTriangle className="w-5 h-5" />}
                {msg.type === 'CRITICAL' && <ShieldAlert className="w-5 h-5" />}
                {msg.type === 'SUCCESS' && <CheckCircle className="w-5 h-5" />}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{msg.title}</h4>
                  <span className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-tight",
                    msg.priority === 'HIGH' ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400"
                  )}>
                    {msg.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono leading-relaxed line-clamp-2">
                  {msg.content}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">
                    Sent: {new Date(msg.createdAt?.seconds * 1000).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    {msg.targetRoles.map(role => (
                      <span key={role} className="text-xs text-slate-600 bg-slate-950 px-1 rounded uppercase font-bold">
                        {role.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
