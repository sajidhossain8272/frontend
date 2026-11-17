'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ConditionStat } from '@/types';

interface ConditionChartProps {
  data: ConditionStat[];
}

// Editorial, refined restrained color palette
const PALETTE = ['#0F172A', '#0D9488', '#2563EB', '#64748B', '#F59E0B', '#8B5CF6'];

export function ConditionChart({ data }: ConditionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No condition data recorded
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return (
        <div className="rounded-lg bg-[#0F172A] text-white p-2.5 shadow-xl border border-slate-700 text-xs">
          <p className="font-semibold">{item.condition}</p>
          <div className="mt-1 flex items-center justify-between gap-3 text-slate-300 text-[11px]">
            <span>{item.count} Patients</span>
            <span className="font-medium text-emerald-400">({percent}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full py-2">
      <div className="w-full sm:w-1/2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="condition"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PALETTE[index % PALETTE.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="w-full sm:w-1/2 space-y-2 text-xs">
        {data.map((item, index) => {
          const color = PALETTE[index % PALETTE.length];
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.condition}
              className="flex items-center justify-between text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{item.condition}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-medium text-slate-900">{item.count}</span>
                <span className="text-[11px] text-slate-400">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
