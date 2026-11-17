'use client';

import React, { useState, useEffect } from 'react';
import { Patient, Doctor } from '@/types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  initialData?: Patient | null;
  doctors: Array<{ _id: string; name: string; specialization: string }>;
}

export function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  doctors,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as const,
    phone: '',
    condition: '',
    status: 'Under Observation' as const,
    doctor: '',
    admissionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const docId =
        typeof initialData.doctor === 'object' && initialData.doctor !== null
          ? (initialData.doctor as Doctor)._id
          : (initialData.doctor as string) || '';

      const dateStr = initialData.admissionDate
        ? new Date(initialData.admissionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        name: initialData.name || '',
        age: String(initialData.age || ''),
        gender: (initialData.gender as any) || 'Male',
        phone: initialData.phone || '',
        condition: initialData.condition || '',
        status: (initialData.status as any) || 'Under Observation',
        doctor: docId || (doctors[0]?._id || ''),
        admissionDate: dateStr,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        condition: '',
        status: 'Under Observation',
        doctor: doctors[0]?._id || '',
        admissionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, doctors]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Patient name is required';
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const parsedAge = parseInt(formData.age, 10);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        newErrors.age = 'Age must be between 0 and 130';
      }
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.condition.trim())
      newErrors.condition = 'Condition / Diagnosis is required';
    if (!formData.doctor) newErrors.doctor = 'Please assign a attending doctor';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender as any,
        phone: formData.phone.trim(),
        condition: formData.condition.trim(),
        status: formData.status as any,
        doctor: formData.doctor,
        admissionDate: formData.admissionDate,
        notes: formData.notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save patient' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Update Patient Information' : 'Register New Patient'}
      subtitle="Complete medical record details and assign attending physician."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Patient Full Name"
            placeholder="e.g. Liam Martinez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Age"
              type="number"
              placeholder="e.g. 42"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              error={errors.age}
              required
            />

            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value as any })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Phone"
            placeholder="e.g. +1 (555) 019-3829"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            error={errors.phone}
            required
          />

          <Input
            label="Condition / Diagnosis"
            placeholder="e.g. Type 2 Diabetes"
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
            error={errors.condition}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Attending Doctor"
            value={formData.doctor}
            onChange={(e) =>
              setFormData({ ...formData, doctor: e.target.value })
            }
            error={errors.doctor}
            required
          >
            <option value="">Select a Doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} ({doc.specialization})
              </option>
            ))}
          </Select>

          <Select
            label="Clinical Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
          >
            <option value="Critical">Critical</option>
            <option value="Under Observation">Under Observation</option>
            <option value="Stable">Stable</option>
            <option value="Recovering">Recovering</option>
            <option value="Discharged">Discharged</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Admission Date"
            type="date"
            value={formData.admissionDate}
            onChange={(e) =>
              setFormData({ ...formData, admissionDate: e.target.value })
            }
          />

          <Input
            label="Clinical Notes / Directives"
            placeholder="e.g. Routine insulin therapy and lipid checks"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData ? 'Update Patient' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
