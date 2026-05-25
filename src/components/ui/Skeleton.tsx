import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-white/5', className)}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="w-full">
    <div className="flex bg-white/5 border-b border-white/10 px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1">
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex px-4 py-4 border-b border-white/5">
        {Array.from({ length: columns }).map((_, c) => (
          <div key={c} className="flex-1 pr-4">
            <Skeleton className="h-4 w-full bg-white/5" />
          </div>
        ))}
      </div>
    ))}
  </div>
);
