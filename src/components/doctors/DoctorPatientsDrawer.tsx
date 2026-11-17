'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Doctor, Patient } from '@/types';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Users,
  UserPlus,
  Trash2,
  Search,
  Building,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface DoctorPatientsDrawerProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onPatientCountChanged?: () => void;
}

export function DoctorPatientsDrawer({
  doctor,
  isOpen,
  onClose,
  onPatientCountChanged,
}: DoctorPatientsDrawerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // New Patient Under Doctor Form
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    condition: '',
    status: 'Under Observation',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    if (!doctor) return;
    setIsLoading(true);
    try {
      const res = await api.getDoctorPatients(doctor._id, { search });
      if (res.success && res.data) {
        setPatients(res.data.patients || []);
      }
    } catch (err: any) {
      console.error('Error fetching doctor patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [doctor, search]);

  useEffect(() => {
    if (isOpen && doctor) {
      fetchPatients();
      setIsAddingPatient(false);
      setActionMessage(null);
    }
  }, [isOpen, doctor, fetchPatients]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    if (!newPatient.name.trim() || !newPatient.age || !newPatient.phone.trim() || !newPatient.condition.trim()) {
      setActionMessage({
        type: 'error',
        text: 'Please fill in Name, Age, Phone, and Condition.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addPatientToDoctor(doctor._id, {
        name: newPatient.name.trim(),
        age: parseInt(newPatient.age, 10),
        gender: newPatient.gender as any,
        phone: newPatient.phone.trim(),
        condition: newPatient.condition.trim(),
        status: newPatient.status as any,
        notes: newPatient.notes.trim(),
      });

      setActionMessage({
        type: 'success',
        text: 'Patient successfully assigned under this doctor.',
      });
      setNewPatient({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        condition: '',
        status: 'Under Observation',
        notes: '',
      });
      setIsAddingPatient(false);
      fetchPatients();
      if (onPatientCountChanged) onPatientCountChanged();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to add patient',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!doctor) return;
    if (!confirm('Are you sure you want to remove this patient from the doctor’s care list?')) return;

    try {
      await api.removePatientFromDoctor(doctor._id, patientId);
      setActionMessage({
        type: 'success',
        text: 'Patient removed from doctor’s care list.',
      });
      fetchPatients();
      if (onPatientCountChanged) onPatientCountChanged();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to remove patient',
      });
    }
  };

  if (!doctor) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={doctor.name}
      subtitle={`${doctor.specialization} • ${doctor.hospital}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Doctor Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge status={doctor.status}>{doctor.status}</Badge>
              {doctor.roomNumber && (
                <span className="text-xs text-slate-500 font-medium">
                  {doctor.roomNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-subtle">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{patients.length} Active Patients</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{doctor.hospital}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{doctor.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{doctor.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined: {formatDate(doctor.createdAt)}</span>
            </div>
          </div>

          {doctor.bio && (
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-200/60 leading-relaxed italic">
              "{doctor.bio}"
            </p>
          )}
        </div>

        {/* Action Feedback Alerts */}
        {actionMessage && (
          <div
            className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Controls: Search & Toggle Add Patient */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <Button
            size="sm"
            variant={isAddingPatient ? 'outline' : 'primary'}
            onClick={() => setIsAddingPatient(!isAddingPatient)}
            leftIcon={isAddingPatient ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          >
            {isAddingPatient ? 'Cancel' : 'Add Patient Under Doctor'}
          </Button>
        </div>

        {/* Inline Add Patient Form */}
        {isAddingPatient && (
          <form
            onSubmit={handleCreatePatient}
            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-3 animate-in fade-in duration-150"
          >
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              New Patient Registration (Assigned to {doctor.name})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Patient Name"
                placeholder="e.g. Michael Lopez"
                value={newPatient.name}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, name: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Age"
                  type="number"
                  placeholder="e.g. 45"
                  value={newPatient.age}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, age: e.target.value })
                  }
                  required
                />
                <Select
                  label="Gender"
                  value={newPatient.gender}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Phone"
                placeholder="e.g. +1 (555) 019-2345"
                value={newPatient.phone}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, phone: e.target.value })
                }
                required
              />
              <Input
                label="Diagnosis / Condition"
                placeholder="e.g. Hypertension"
                value={newPatient.condition}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, condition: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Care Status"
                value={newPatient.status}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, status: e.target.value })
                }
              >
                <option value="Critical">Critical</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Stable">Stable</option>
                <option value="Recovering">Recovering</option>
                <option value="Discharged">Discharged</option>
              </Select>
              <Input
                label="Clinical Notes"
                placeholder="e.g. Routine follow-up scheduled"
                value={newPatient.notes}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, notes: e.target.value })
                }
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingPatient(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Patient
              </Button>
            </div>
          </form>
        )}

        {/* Patients List Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 tracking-wider uppercase">
            <span>Assigned Patient Directory</span>
            <span className="text-slate-400 text-[11px]">
              {patients.length} Record(s)
            </span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading patient records...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-10 text-center rounded-lg border border-dashed border-slate-200 p-6">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                No patients currently allocated
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click "Add Patient Under Doctor" above to allocate a patient to this doctor.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-card">
              {patients.map((patient) => (
                <div
                  key={patient._id}
                  className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {patient.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({patient.age} yrs, {patient.gender})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                      <span className="font-medium text-slate-700">
                        {patient.condition}
                      </span>
                      <span>•</span>
                      <span>{patient.phone}</span>
                      <span>•</span>
                      <span>Admitted: {formatDate(patient.admissionDate || patient.createdAt)}</span>
                    </div>

                    {patient.notes && (
                      <p className="text-[11px] text-slate-400 italic truncate max-w-md">
                        {patient.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge status={patient.status}>{patient.status}</Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePatient(patient._id)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove Patient from Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
