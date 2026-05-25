import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  accent?: boolean;
  title?: string;
  subtitle?: string;
}

export const Card = ({ children, className = "", glow = false, accent = false, title, subtitle }: CardProps) => (
  <section className={cn(
    "vortex-card p-4 sm:p-6 relative group overflow-hidden bg-white/[0.01]",
    glow && "ring-1 ring-white/10 shadow-[0_0_40px_rgba(255,255,255,0.03)]",
    accent && "border-white/20 bg-white/5",
    className
  )}>
    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] blur-[80px] pointer-events-none group-hover:bg-white/[0.04] transition-all duration-700" />

    {(title || subtitle) && (
      <div className="flex flex-col mb-6 space-y-1">
        {title && (
          <h3 className="text-[15px] font-semibold text-white tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-[13px] text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    )}

    <div className="relative z-10">
      {children}
    </div>
  </section>
);
