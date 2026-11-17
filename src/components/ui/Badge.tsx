import React from 'react';
import { cn, getStatusBadgeStyle } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'outline' | 'neutral' | 'accent';
  status?: string;
  className?: string;
  showDot?: boolean;
}

export function Badge({
  children,
  variant = 'status',
  status,
  className,
  showDot = true,
}: BadgeProps) {
  if (variant === 'status' && status) {
    const style = getStatusBadgeStyle(status);
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
          style.bg,
          style.text,
          style.border,
          className
        )}
      >
        {showDot && (
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
        )}
        {children}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-slate-200 text-slate-700 bg-white',
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'accent') {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200',
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200',
        className
      )}
    >
      {children}
    </span>
  );
}
