import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    default: "bg-white/5 text-slate-300 border-white/10",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest", 
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
