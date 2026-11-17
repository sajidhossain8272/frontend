'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DoctorTable } from '@/components/doctors/DoctorTable';
import { DoctorFormModal } from '@/components/doctors/DoctorFormModal';
import { DoctorPatientsDrawer } from '@/components/doctors/DoctorPatientsDrawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Doctor, PaginationMeta } from '@/types';
import { api } from '@/lib/api';
import {
  UserPlus,
  Search,
  Filter,
  X,
  RotateCcw,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
  const [specialization, setSpecialization] = useState('All');
  const [hospital, setHospital] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Available filter options from API
  const [specializationsList, setSpecializationsList] = useState<string[]>([]);
  const [hospitalsList, setHospitalsList] = useState<string[]>([]);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedDoctorForPatients, setSelectedDoctorForPatients] =
    useState<Doctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Debounce search input for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getDoctors({
        search: debouncedSearch,
        specialization,
        hospital,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res.success && res.data) {
        setDoctors(res.data.doctors || []);
        setPagination(res.data.pagination);
        if (res.data.filters) {
          setSpecializationsList(res.data.filters.specializations || []);
          setHospitalsList(res.data.filters.hospitals || []);
        }
      }
    } catch (err: any) {
      console.error('Fetch doctors error:', err);
      setBannerNotice({
        type: 'error',
        text: err.message || 'Failed to retrieve doctors.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    specialization,
    hospital,
    status,
    startDate,
    endDate,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSpecialization('All');
    setHospital('All');
    setStatus('All');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    search !== '' ||
    specialization !== 'All' ||
    hospital !== 'All' ||
    status !== 'All' ||
    startDate !== '' ||
    endDate !== '';

  const handleCreateOrUpdateDoctor = async (data: Partial<Doctor>) => {
    if (editingDoctor) {
      const res = await api.updateDoctor(editingDoctor._id, data);
      setBannerNotice({
        type: 'success',
        text: `Doctor ${res.data.name} updated successfully.`,
      });
    } else {
      const res = await api.createDoctor(data);
      setBannerNotice({
        type: 'success',
        text: `Doctor ${res.data.name} registered successfully.`,
      });
    }
    fetchDoctors();
  };

  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (
      !confirm(
        `Are you sure you want to delete ${doctor.name}? This will also delete any assigned patient records.`
      )
    ) {
      return;
    }

    try {
      const res = await api.deleteDoctor(doctor._id);
      setBannerNotice({
        type: 'success',
        text: res.message || `${doctor.name} was removed.`,
      });
      fetchDoctors();
    } catch (err: any) {
      setBannerNotice({
        type: 'error',
        text: err.message || 'Failed to delete doctor',
      });
    }
  };

  return (
    <AppShell
      title="Medical Practitioners Directory"
      subtitle="Manage licensed doctors, clinical affiliations, and patient allocations."
      actions={
        <Button
          size="sm"
          onClick={() => {
            setEditingDoctor(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Doctor
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
              placeholder="Search doctors by name, specialization, hospital, email, phone..."
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
              Specialization
            </label>
            <select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full text-xs rounded-md border border-slate-200 py-1.5 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Specializations</option>
              {specializationsList.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Hospital Affiliation
            </label>
            <select
              value={hospital}
              onChange={(e) => {
                setHospital(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full text-xs rounded-md border border-slate-200 py-1.5 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Hospitals</option>
              {hospitalsList.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Practice Status
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
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Date Registered (From)
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

      {/* Main Doctors Table */}
      <DoctorTable
        doctors={doctors}
        isLoading={isLoading}
        onViewPatients={(doctor) => {
          setSelectedDoctorForPatients(doctor);
          setIsDrawerOpen(true);
        }}
        onAddPatient={(doctor) => {
          setSelectedDoctorForPatients(doctor);
          setIsDrawerOpen(true);
        }}
        onEdit={(doctor) => {
          setEditingDoctor(doctor);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteDoctor}
      />

      {/* Pagination Controls */}
      <Pagination
        meta={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />

      {/* Doctor Create/Edit Modal */}
      <DoctorFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingDoctor(null);
        }}
        onSubmit={handleCreateOrUpdateDoctor}
        initialData={editingDoctor}
      />

      {/* Dedicated Doctor Patients Drawer */}
      <DoctorPatientsDrawer
        doctor={selectedDoctorForPatients}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDoctorForPatients(null);
        }}
        onPatientCountChanged={fetchDoctors}
      />
    </AppShell>
  );
}
