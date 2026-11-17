import React from 'react';
import { Patient, Doctor } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { Edit2, Trash2, HeartPulse, Stethoscope, Phone, Calendar } from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export function PatientTable({
  patients,
  isLoading,
  onEdit,
  onDelete,
}: PatientTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-card p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
            <div className="space-y-2 w-1/4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-card">
        <HeartPulse className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">No patient records found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No patients matched your current filters. Clear filters or add a new patient.
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
              <th className="py-3.5 px-4">Patient</th>
              <th className="py-3.5 px-4">Condition / Diagnosis</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Doctor</th>
              <th className="py-3.5 px-4">Contact Phone</th>
              <th className="py-3.5 px-4">Admission Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => {
              const assignedDoctor =
                typeof patient.doctor === 'object' && patient.doctor !== null
                  ? (patient.doctor as Doctor)
                  : null;

              return (
                <tr
                  key={patient._id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Name & Demographics */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 text-sm">
                      {patient.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {patient.age} yrs • {patient.gender}
                    </div>
                  </td>

                  {/* Condition */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">
                      {patient.condition}
                    </span>
                    {patient.notes && (
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {patient.notes}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <Badge status={patient.status}>{patient.status}</Badge>
                  </td>

                  {/* Assigned Doctor */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {assignedDoctor ? (
                      <div>
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <Stethoscope className="w-3 h-3 text-slate-400" />
                          <span>{assignedDoctor.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {assignedDoctor.specialization}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                  </td>

                  {/* Admission Date */}
                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(patient.admissionDate || patient.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(patient)}
                        className="text-slate-600 hover:text-slate-900"
                        title="Edit Patient"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(patient)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
