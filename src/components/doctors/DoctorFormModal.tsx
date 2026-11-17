'use client';

import React, { useState, useEffect } from 'react';
import { Doctor } from '@/types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Doctor>) => Promise<void>;
  initialData?: Doctor | null;
}

const SPECIALIZATION_OPTIONS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Oncology',
  'Dermatology',
  'Endocrinology',
  'Pulmonology',
  'General Medicine',
  'Gastroenterology',
  'Nephrology',
  'Psychiatry',
];

export function DoctorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DoctorFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Cardiology',
    hospital: '',
    phone: '',
    email: '',
    roomNumber: '',
    status: 'Active' as const,
    bio: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        specialization: initialData.specialization || 'Cardiology',
        hospital: initialData.hospital || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        roomNumber: initialData.roomNumber || '',
        status: (initialData.status as any) || 'Active',
        bio: initialData.bio || '',
      });
    } else {
      setFormData({
        name: '',
        specialization: 'Cardiology',
        hospital: '',
        phone: '',
        email: '',
        roomNumber: '',
        status: 'Active',
        bio: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Doctor name is required';
    if (!formData.specialization.trim())
      newErrors.specialization = 'Specialization is required';
    if (!formData.hospital.trim()) newErrors.hospital = 'Hospital is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save doctor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Doctor Record' : 'Register New Doctor'}
      subtitle="Complete doctor credentials and hospital affiliation details."
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
            label="Doctor Full Name"
            placeholder="e.g. Dr. Sarah Jenkins"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <Select
            label="Specialization"
            value={formData.specialization}
            onChange={(e) =>
              setFormData({ ...formData, specialization: e.target.value })
            }
            error={errors.specialization}
            required
          >
            {SPECIALIZATION_OPTIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hospital / Clinic Name"
            placeholder="e.g. Metro General Hospital"
            value={formData.hospital}
            onChange={(e) =>
              setFormData({ ...formData, hospital: e.target.value })
            }
            error={errors.hospital}
            required
          />

          <Input
            label="Room / Suite Number"
            placeholder="e.g. Suite 402"
            value={formData.roomNumber}
            onChange={(e) =>
              setFormData({ ...formData, roomNumber: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Phone"
            placeholder="e.g. +1 (555) 234-5678"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            error={errors.phone}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. sarah.jenkins@hospital.org"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Practice Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
          >
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <Input
            label="Brief Clinical Focus / Notes"
            placeholder="e.g. Cardiovascular care, echocardiography"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
            {initialData ? 'Save Changes' : 'Register Doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
