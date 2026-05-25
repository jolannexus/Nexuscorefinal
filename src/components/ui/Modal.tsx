import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = 'lg' }: ModalProps) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col max-h-full overflow-hidden",
              maxWidthClass
            )}
          >
            <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{title}</h2>
                {subtitle && <p className="text-[13px] text-slate-500 font-medium mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="p-6 md:p-8 border-t border-white/5 bg-white/[0.02] shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
