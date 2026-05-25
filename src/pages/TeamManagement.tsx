import React from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  CheckCircle2, 
  Clock,
  Search,
  Filter,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';

const teamMembers = [
  { id: '1', name: 'Alex Rivera', email: 'alex@company.com', role: 'Administrator', status: 'Active', lastActive: '2 mins ago', avatar: 'AR' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Finance Manager', status: 'Active', lastActive: '15 mins ago', avatar: 'SC' },
  { id: '3', name: 'Michael Scott', email: 'm.scott@company.com', role: 'Viewer', status: 'Inactive', lastActive: '2 days ago', avatar: 'MS' },
  { id: '4', name: 'David Kim', email: 'david@company.com', role: 'Support Agent', status: 'Active', lastActive: '1 hour ago', avatar: 'DK' },
];

const TeamManagement = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg text-slate-950">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
              Team Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-lg">
            Manage your organization's members, assign roles, and control access permissions across the infrastructure.
          </p>
        </div>
        <button className="vortex-button-primary flex items-center gap-2 h-12 px-6">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: teamMembers.length, color: 'text-indigo-400' },
          { label: 'Active Now', value: '3', color: 'text-emerald-400' },
          { label: 'Access Keys', value: '12', color: 'text-amber-400' },
          { label: 'Pending Invites', value: '1', color: 'text-slate-400' }
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</span>
            <span className={cn("text-2xl font-bold font-mono tracking-tight", stat.color)}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Card title="Workspace Members" subtitle="Manage individual access controls and security roles">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search members by name or email..." 
              className="vortex-input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:bg-white/5 transition-all text-xs font-semibold">
              <Filter className="w-4 h-4" />
              Roles
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:bg-white/5 transition-all text-xs font-semibold">
              Status
            </button>
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Security Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {member.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight">{member.name}</span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Shield className={cn(
                        "w-4 h-4",
                        member.role === 'Administrator' ? "text-indigo-400" : "text-slate-500"
                      )} />
                      <span className="text-xs font-semibold text-slate-300">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       {member.status === 'Active' ? (
                         <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-1">
                           <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                           ACTIVE
                         </div>
                       ) : (
                         <div className="px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-800 text-xs font-bold text-slate-500 flex items-center gap-1">
                           INACTIVE
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {member.lastActive}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security Notice */}
      <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Advanced Role-Based Access Control</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            You are using granular permission management. Changes to administrator roles may require secondary confirmation through the security dashboard. 
            All member actions are logged in the <strong>infrastructure audit trail</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
