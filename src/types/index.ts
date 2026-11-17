export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
}

export interface Doctor {
  _id: string;
  id?: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  bio?: string;
  roomNumber?: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PatientStatus = 'Critical' | 'Under Observation' | 'Stable' | 'Recovering' | 'Discharged';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  _id: string;
  id?: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  condition: string;
  status: PatientStatus;
  doctor: Doctor | string;
  admissionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface KPIStats {
  totalDoctors: number;
  activeDoctors: number;
  totalPatients: number;
  criticalPatients: number;
  averagePatientsPerDoctor: number;
}

export interface PatientsPerDoctorStat {
  _id: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  patientCount: number;
}

export interface DateStat {
  date: string;
  label: string;
  admissions: number;
}

export interface ConditionStat {
  condition: string;
  count: number;
}

export interface StatusStat {
  status: PatientStatus;
  count: number;
  percentage: number;
}

export interface DashboardAnalytics {
  kpis: KPIStats;
  patientsPerDoctor: PatientsPerDoctorStat[];
  dateStatistics: DateStat[];
  conditionBreakdown: ConditionStat[];
  statusDistribution: StatusStat[];
  recentPatients: Patient[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}
