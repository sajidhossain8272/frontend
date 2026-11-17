'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PatientTable } from '@/components/patients/PatientTable';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Patient, PaginationMeta } from '@/types';
import { api } from '@/lib/api';
import {
  UserPlus,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [condition, setCondition] = useState('All');
  const [status, setStatus] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown options
  const [conditionsList, setConditionsList] = useState<string[]>([]);
  const [doctorsList, setDoctorsList] = useState<
    Array<{ _id: string; name: string; specialization: string }>
  >([]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getPatients({
        search: debouncedSearch,
        condition,
        status,
        doctor: doctorFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res.success && res.data) {
        setPatients(res.data.patients || []);
        setPagination(res.data.pagination);
        if (res.data.filters) {
          setConditionsList(res.data.filters.conditions || []);
          setDoctorsList(res.data.filters.doctors || []);
        }
      }
    } catch (err: any) {
      console.error('Fetch patients error:', err);
      setBannerNotice({
        type: 'error',
        text: err.message || 'Failed to retrieve patient records.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    condition,
    status,
    doctorFilter,
    startDate,
    endDate,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCondition('All');
    setStatus('All');
    setDoctorFilter('All');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    search !== '' ||
    condition !== 'All' ||
    status !== 'All' ||
    doctorFilter !== 'All' ||
    startDate !== '' ||
    endDate !== '';

  const handleCreateOrUpdatePatient = async (data: Partial<Patient>) => {
    if (editingPatient) {
      const res = await api.updatePatient(editingPatient._id, data);
      setBannerNotice({
        type: 'success',
        text: `Patient ${res.data.name} updated successfully.`,
      });
    } else {
      const res = await api.createPatient(data);
      setBannerNotice({
        type: 'success',
        text: `Patient ${res.data.name} admitted successfully.`,
      });
    }
    fetchPatients();
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (
      !confirm(
        `Are you sure you want to permanently remove ${patient.name}'s medical record?`
      )
    ) {
      return;
    }

    try {
      const res = await api.deletePatient(patient._id);
      setBannerNotice({
        type: 'success',
        text: res.message || `${patient.name} record removed.`,
      });
      fetchPatients();
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        text: err.message || 'Failed to remove patient record.',
      });
    }
  };

  return (
    <AppShell
      title="Patient Clinical Records"
      subtitle="Comprehensive clinical records directory, medical conditions, and attending physician tracking."
      actions={
        <Button
          size="sm"
          onClick={() => {
            setEditingPatient(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Register Patient
        </Button>
      }
    >
      {/* Banner Feedback */}
      {bannerNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name, condition, phone, attending doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-slate-600 shrink-0"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Multi-attribute Filter Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Diagnosis / Condition
            </label>
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full text-xs rounded-md border border-slate-200 py-1.5 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Conditions</option>
              {conditionsList.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Care Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full text-xs rounded-md border border-slate-200 py-1.5 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Statuses</option>
              <option value="Critical">Critical</option>
              <option value="Under Observation">Under Observation</option>
              <option value="Stable">Stable</option>
              <option value="Recovering">Recovering</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Attending Doctor
            </label>
            <select
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full text-xs rounded-md border border-slate-200 py-1.5 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Doctors</option>
              {doctorsList.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Admitted (From)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full text-xs rounded-md border border-slate-200 py-1.5 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Main Patients Table */}
      <PatientTable
        patients={patients}
        isLoading={isLoading}
        onEdit={(patient) => {
          setEditingPatient(patient);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeletePatient}
      />

      {/* Pagination Controls */}
      <Pagination
        meta={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />

      {/* Patient Create/Edit Modal */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPatient(null);
        }}
        onSubmit={handleCreateOrUpdatePatient}
        initialData={editingPatient}
        doctors={doctorsList}
      />
    </AppShell>
  );
}
