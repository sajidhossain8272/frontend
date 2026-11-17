import React from 'react';
import { Doctor } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

interface DoctorTableProps {
  doctors: Doctor[];
  isLoading: boolean;
  onViewPatients: (doctor: Doctor) => void;
  onAddPatient: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export function DoctorTable({
  doctors,
  isLoading,
  onViewPatients,
  onAddPatient,
  onEdit,
  onDelete,
}: DoctorTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-card p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
            <div className="space-y-2 w-1/4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-card">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">No doctors found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No medical practitioner records matched your current query or filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Doctor</th>
              <th className="py-3.5 px-4">Specialization</th>
              <th className="py-3.5 px-4">Hospital / Clinic</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4 text-center">Patients</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map((doctor) => (
              <tr
                key={doctor._id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Doctor Name & Room */}
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 text-sm">
                    {doctor.name}
                  </div>
                  {doctor.roomNumber && (
                    <div className="text-[11px] text-slate-400">
                      {doctor.roomNumber}
                    </div>
                  )}
                </td>

                {/* Specialization */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                    {doctor.specialization}
                  </span>
                </td>

                {/* Hospital */}
                <td className="py-3.5 px-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{doctor.hospital}</span>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-3.5 px-4 text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[160px]">{doctor.email}</span>
                  </div>
                </td>

                {/* Patients Count Pill */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onViewPatients(doctor)}
                    title="View assigned patients"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-[#0F172A] hover:text-white text-slate-800 border border-slate-200/80 transition-all cursor-pointer"
                  >
                    <Users className="w-3 h-3" />
                    <span>{doctor.patientCount ?? 0}</span>
                  </button>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <Badge status={doctor.status}>{doctor.status}</Badge>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPatients(doctor)}
                      className="h-8 px-2 text-xs"
                      title="View Doctor Details & Patients"
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Patients
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAddPatient(doctor)}
                      className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                      title="Add Patient Under This Doctor"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(doctor)}
                      className="text-slate-600 hover:text-slate-900"
                      title="Edit Doctor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(doctor)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
