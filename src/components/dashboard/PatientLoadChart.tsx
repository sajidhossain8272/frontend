'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PatientsPerDoctorStat } from '@/types';

interface PatientLoadChartProps {
  data: PatientsPerDoctorStat[];
}

export function PatientLoadChart({ data }: PatientLoadChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No doctor allocation records available
      </div>
    );
  }

  // Format doctor's name for chart axis (e.g. Dr. Jenkins)
  const chartData = data.map((item) => ({
    name: item.doctorName.replace('Dr. ', ''),
    fullName: item.doctorName,
    patientCount: item.patientCount,
    specialization: item.specialization,
    hospital: item.hospital,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const doc = payload[0].payload;
      return (
        <div className="rounded-lg bg-[#0F172A] text-white p-3 shadow-xl border border-slate-700 text-xs">
          <p className="font-semibold text-sm">{doc.fullName}</p>
          <p className="text-slate-300 text-[11px] mt-0.5">{doc.specialization} • {doc.hospital}</p>
          <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between gap-4">
            <span className="text-slate-400">Assigned Patients:</span>
            <span className="font-bold text-emerald-400">{doc.patientCount}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="patientCount"
            fill="#0F172A"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
