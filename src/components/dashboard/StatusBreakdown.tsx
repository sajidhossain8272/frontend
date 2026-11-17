import React from 'react';
import { StatusStat } from '@/types';
import { Badge } from '../ui/Badge';

interface StatusBreakdownProps {
  data: StatusStat[];
}

export function StatusBreakdown({ data }: StatusBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No patient status metrics recorded
      </div>
    );
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-rose-500';
      case 'Under Observation':
        return 'bg-amber-500';
      case 'Stable':
        return 'bg-emerald-500';
      case 'Recovering':
        return 'bg-teal-500';
      case 'Discharged':
        return 'bg-slate-400';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.status} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <Badge status={item.status}>{item.status}</Badge>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{item.count}</span>
              <span className="text-slate-400 text-[11px]">({item.percentage}%)</span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                item.status
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
