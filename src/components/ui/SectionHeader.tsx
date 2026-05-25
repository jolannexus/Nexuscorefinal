import React from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  colorClass?: string;
}

export const SectionHeader = ({ title, icon: Icon, colorClass = "text-blue-400" }: SectionHeaderProps) => (
  <h2 className={cn("text-xs font-bold uppercase mb-3 flex items-center gap-2 tracking-wider", colorClass)}>
    <span className={cn("w-2 h-2 rounded-sm rotate-45", colorClass.replace('text', 'bg'))}></span>
    {title}
  </h2>
);
