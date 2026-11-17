'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { PatientLoadChart } from '@/components/dashboard/PatientLoadChart';
import { AdmissionTrendChart } from '@/components/dashboard/AdmissionTrendChart';
import { ConditionChart } from '@/components/dashboard/ConditionChart';
import { StatusBreakdown } from '@/components/dashboard/StatusBreakdown';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardAnalytics, Patient, Doctor } from '@/types';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  UserCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Plus,
  ArrowUpRight,
  Activity,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Dashboard analytics error:', err);
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpis = data?.kpis || {
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0,
    criticalPatients: 0,
    averagePatientsPerDoctor: 0,
  };

  return (
    <AppShell
      title="Clinical Overview & Analytics"
      subtitle="Comprehensive data insights on medical staff allocations and patient metrics."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            leftIcon={<RotateCw className="w-3.5 h-3.5 text-slate-500" />}
          >
            Refresh Data
          </Button>
          <Link href="/doctors">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Doctor
            </Button>
          </Link>
        </div>
      }
    >
      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"
          value={isLoading ? '—' : kpis.totalDoctors}
          subtitle={`${kpis.activeDoctors} currently on active clinical duty`}
          icon={UserCheck}
          trend={{ value: 'Active Staff', isPositive: true }}
        />
        <StatCard
          title="Total Patients"
          value={isLoading ? '—' : kpis.totalPatients}
          subtitle="Cumulative registered clinical records"
          icon={Users}
          trend={{ value: '+14% this month', isPositive: true }}
        />
        <StatCard
          title="Patients Per Doctor"
          value={isLoading ? '—' : `${kpis.averagePatientsPerDoctor}`}
          subtitle="Average active practitioner caseload"
          icon={TrendingUp}
        />
        <StatCard
          title="Critical Cases"
          value={isLoading ? '—' : kpis.criticalPatients}
          subtitle="Immediate clinical surveillance required"
          icon={AlertTriangle}
          trend={{
            value: `${kpis.criticalPatients} High Priority`,
            isPositive: false,
          }}
        />
      </div>

      {/* Primary Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Load per Doctor */}
        <div className="rounded-xl bg-white border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Patient Load per Doctor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of assigned patients across leading practitioners.
              </p>
            </div>
            <Link
              href="/doctors"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <PatientLoadChart data={data?.patientsPerDoctor || []} />
          )}
        </div>

        {/* Date-Based Statistics / Admissions Timeline */}
        <div className="rounded-xl bg-white border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Patient Admissions Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Date-based trends over the preceding 30 days.
              </p>
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              30-Day Window
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <AdmissionTrendChart data={data?.dateStatistics || []} />
          )}
        </div>
      </div>

      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Condition Breakdown */}
        <div className="rounded-xl bg-white border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Clinical Condition Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top recorded patient diagnoses and clinical categorizations.
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ConditionChart data={data?.conditionBreakdown || []} />
          )}
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl bg-white border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Patient Care Status Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of active cases under observation, stable, or recovering.
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <StatusBreakdown data={data?.statusDistribution || []} />
          )}
        </div>
      </div>

      {/* Recent Patient Admissions Table */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Recent Patient Admissions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest patient admissions registered into the clinical system.
            </p>
          </div>
          <Link
            href="/patients"
            className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 group"
          >
            <span>View All Patients</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-3 px-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : (data?.recentPatients || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No recent admissions recorded.
                  </td>
                </tr>
              ) : (
                data?.recentPatients.map((patient) => {
                  const doc =
                    typeof patient.doctor === 'object' && patient.doctor !== null
                      ? (patient.doctor as Doctor)
                      : null;
                  return (
                    <tr
                      key={patient._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {patient.name}
                        <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                          ({patient.age} yrs)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {patient.condition}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {doc ? doc.name : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={patient.status}>{patient.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {formatDate(patient.admissionDate || patient.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
