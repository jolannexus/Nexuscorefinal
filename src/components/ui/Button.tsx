import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  block?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, block = false, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: "bg-white text-black hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-transparent",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/5",
      outline: "bg-transparent text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5",
      ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 hover:border-red-500/30",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-[15px]",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          block ? "w-full" : "",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!loading && props.icon && <span className="mr-2">{props.icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
