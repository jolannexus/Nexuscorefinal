import React, { useState, useEffect } from 'react';
import { 
  Bell,
  ChevronRight,
  Info,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  X
} from 'lucide-react';
import { Announcement, Role } from '../../types/index';
import { announcementService } from '../../services/system/announcementService';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const AnnouncementFeed = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const { role } = useAuth();

  useEffect(() => {
    if (role) {
      loadAnnouncements();
    }
  }, [role]);

  const loadAnnouncements = async () => {
    const data = await announcementService.getLatestAnnouncements(role as Role, 5);
    setAnnouncements(data);
  };

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-3 h-3 text-purple-500" />
          Broadcast Log
        </h3>
      </div>

      <div className="space-y-2">
        {announcements.map((msg) => (
          <button 
            key={msg.id}
            onClick={() => setSelected(msg)}
            className={cn(
              "w-full text-left bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800 p-3 rounded-2xl transition-all flex items-center gap-3 group px-4",
              msg.priority === 'HIGH' && "border-red-500/20 bg-red-500/5"
            )}
          >
            <div className={cn(
              "shrink-0 w-1.5 h-1.5 rounded-full",
              msg.type === 'INFO' && "bg-blue-500",
              msg.type === 'WARNING' && "bg-amber-500",
              msg.type === 'CRITICAL' && "bg-red-500",
              msg.type === 'SUCCESS' && "bg-emerald-500"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{msg.title}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{msg.content}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Bell className="w-32 h-32 text-purple-500" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                    selected.type === 'INFO' && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                    selected.type === 'WARNING' && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                    selected.type === 'CRITICAL' && "bg-red-500/10 border-red-500/20 text-red-500",
                    selected.type === 'SUCCESS' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  )}>
                    {selected.type} // {selected.priority} Priority
                  </div>
                  <button 
                    onClick={() => setSelected(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">
                    {selected.title}
                  </h2>
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                      {selected.content}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                  <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Sent by SYSTEM // {new Date(selected.createdAt?.seconds * 1000).toLocaleString()}
                  </div>
                  <button 
                    onClick={() => setSelected(null)}
                    className="bg-white text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all font-sans"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
