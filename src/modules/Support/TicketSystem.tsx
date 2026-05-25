import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  Filter, 
  Plus,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Settings,
  AlertCircle,
  X,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Ticket, TicketMessage, Role } from '../../types/index';
import { ticketService } from '../../services/system/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

export const TicketSystem = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newReply, setNewReply] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Create form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'GENERAL' as Ticket['category'],
    priority: 'MEDIUM' as Ticket['priority'],
    message: ''
  });

  const isAdmin = role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN' || role === 'AGENCY_ADMIN';

  useEffect(() => {
    loadTickets();
  }, [user?.uid]);

  useEffect(() => {
    if (selectedTicket?.id) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  const loadTickets = async () => {
    if (!user) return;
    const data = await ticketService.getTickets(isAdmin ? undefined : user.uid);
    setTickets(data);
  };

  const loadMessages = async (ticketId: string) => {
    const data = await ticketService.getTicketMessages(ticketId);
    setMessages(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const ticketData: Omit<Ticket, 'id' | 'createdAt' | 'lastMessageAt'> = {
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
      userRole: role as Role,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'OPEN'
    };

    const id = await ticketService.createTicket(ticketData, newTicket.message);
    if (id) {
      setShowCreate(false);
      setNewTicket({ subject: '', category: 'GENERAL', priority: 'MEDIUM', message: '' });
      loadTickets();
    }
    setLoading(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !user || !newReply.trim()) return;

    setLoading(true);
    const reply: Omit<TicketMessage, 'id' | 'createdAt'> = {
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous',
      senderRole: role as Role,
      content: newReply
    };

    // If admin replies, change status to REPLIED, if user replies, change to OPEN/IN_PROGRESS
    const newStatus = isAdmin ? 'REPLIED' : 'IN_PROGRESS';

    await ticketService.addReply(selectedTicket.id, reply, newStatus);
    setNewReply('');
    loadMessages(selectedTicket.id);
    loadTickets();
    setLoading(false);
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'OPEN': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'REPLIED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'CLOSED': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-transparent';
    }
  };

  const getCategoryIcon = (cat: Ticket['category']) => {
    switch (cat) {
      case 'BILLING': return <CreditCard className="w-4 h-4" />;
      case 'ORDER': return <Clock className="w-4 h-4" />;
      case 'TECHNICAL': return <Settings className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
      {/* Sidebar: Ticket List */}
      <div className={cn("w-full lg:w-96 space-y-4 flex flex-col", selectedTicket ? "hidden lg:flex" : "flex")}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            Support Channels
          </h3>
          <button 
            onClick={() => setShowCreate(true)}
            className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tickets..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white outline-none focus:border-purple-500/30"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "w-full text-left p-4 rounded-3xl border transition-all group relative overflow-hidden",
                selectedTicket?.id === ticket.id 
                  ? "bg-slate-900 border-purple-500/50 shadow-lg" 
                  : "bg-slate-900/30 border-slate-800 hover:border-slate-800"
              )}
            >
              {selectedTicket?.id === ticket.id && (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-500" />
              )}
              
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                  getStatusColor(ticket.status)
                )}>
                  {ticket.status}
                </span>
                <span className="text-xs text-slate-600 font-mono">
                  {ticket.lastMessageAt?.seconds ? new Date(ticket.lastMessageAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                </span>
              </div>
              
              <h4 className="text-xs font-bold text-white uppercase tracking-tight mb-1 truncate">
                {ticket.subject}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="uppercase text-slate-600">ID:</span>
                <span className="truncate">...{ticket.id.slice(-6)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span className="text-purple-500/80">{ticket.category}</span>
              </div>
            </button>
          ))}

          {tickets.length === 0 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto opacity-20">
                <MessageSquare className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-xs text-slate-600 uppercase font-bold tracking-wider">No Active Sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Chat View */}
      <div className={cn("flex-1 bg-slate-900/40 rounded-[40px] border border-slate-800 flex flex-col relative overflow-hidden h-[600px]", !selectedTicket ? "hidden lg:flex" : "flex")}>
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl">
              <div className="flex items-center gap-4 min-w-0">
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="lg:hidden p-2 bg-slate-800/10 hover:bg-slate-800/20 text-slate-300 rounded-xl transition-all mr-2 flex-shrink-0"
                  aria-label="Back to channels"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20 bg-purple-500/5 flex-shrink-0"
                )}>
                  {getCategoryIcon(selectedTicket.category)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider leading-none mb-1 truncate">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs text-slate-500 font-mono">Channel: {selectedTicket.userName}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:inline" />
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-tight",
                      selectedTicket.priority === 'HIGH' || selectedTicket.priority === 'URGENT' ? "text-red-500" : "text-slate-600"
                    )}>
                      {selectedTicket.priority}_PRIORITY
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isAdmin && selectedTicket.status !== 'CLOSED' && (
                  <button 
                    onClick={() => ticketService.updateStatus(selectedTicket.id, 'CLOSED').then(loadTickets)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Close Ticket
                  </button>
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => {
                const isMyMessage = msg.senderId === user?.uid;
                return (
                  <div key={msg.id || idx} className={cn(
                    "flex flex-col max-w-[80%]",
                    isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {msg.senderName}
                      </span>
                      <span className="text-xs text-slate-800 font-mono">
                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className={cn(
                      "p-4 rounded-3xl text-xs font-medium leading-relaxed",
                      isMyMessage 
                        ? "bg-purple-600 text-white shadow-lg rounded-tr-none" 
                        : "bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
              <form onSubmit={handleReply} className="relative">
                <textarea 
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  disabled={selectedTicket.status === 'CLOSED'}
                  rows={2}
                  placeholder={selectedTicket.status === 'CLOSED' ? "This ticket is closed" : "Transmit technical data reply..."}
                  className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-mono placeholder:text-slate-700 outline-none focus:border-purple-500/30 transition-all resize-none pr-20"
                />
                <button 
                  type="submit"
                  disabled={loading || !newReply.trim() || selectedTicket.status === 'CLOSED'}
                  className="absolute right-3 top-3 bottom-3 aspect-square bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95"
                >
                  <Send className="w-5 h-5 pointer-events-none" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-[40px] bg-slate-950 border border-slate-800 flex items-center justify-center mb-8 relative">
              <MessageSquare className="w-10 h-10 text-slate-700" />
              <div className="absolute inset-0 bg-purple-500/5 animate-pulse rounded-[40px]" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">
              Awaiting Selection
            </h2>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider max-w-xs leading-loose">
              Select an active communication node from the uplink to begin data transmission.
            </p>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCreate(false)}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[48px] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Open Uplink</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Establish a new technical support session</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Protocol Class</label>
                    <select 
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-medium text-white outline-none focus:border-purple-500/50"
                    >
                      <option value="GENERAL">General Inquiry</option>
                      <option value="ORDER">Order Support</option>
                      <option value="BILLING">Billing/Deposit</option>
                      <option value="TECHNICAL">Technical Fault</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Urgency Level</label>
                    <select 
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-medium text-white outline-none focus:border-purple-500/50"
                    >
                      <option value="LOW">Routine (Low)</option>
                      <option value="MEDIUM">Standard (Med)</option>
                      <option value="HIGH">Critical (High)</option>
                      <option value="URGENT">Emergency (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subject Line</label>
                  <input 
                    type="text" 
                    required
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="Brief summary of the requirement..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium font-bold text-white outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Initial Payload</label>
                  <textarea 
                    required
                    rows={4}
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    placeholder="Detail the technical specifications of your request..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-medium text-slate-300 outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Establishing..." : "Initialize Session"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
