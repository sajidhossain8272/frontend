import {
  Doctor,
  Patient,
  DashboardAnalytics,
  PaginationMeta,
  User,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('doctor_tracker_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          data.message ||
          (data.errors && data.errors[0]?.message) ||
          `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      // If server is not reachable, provide friendly error message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Unable to connect to backend API server at ${API_BASE_URL}. Please ensure the backend is running.`
        );
      }
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async login(credentials: { email: string; password: string }) {
    return this.request<{
      success: boolean;
      data: { user: User; token: string };
      message?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { name: string; email: string; password: string }) {
    return this.request<{
      success: boolean;
      data: { user: User; token: string };
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: { user: User } }>('/auth/me');
  }

  // --- Doctors Endpoints ---
  async getDoctors(params: {
    search?: string;
    specialization?: string;
    hospital?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.specialization && params.specialization !== 'All')
      query.set('specialization', params.specialization);
    if (params.hospital && params.hospital !== 'All')
      query.set('hospital', params.hospital);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    return this.request<{
      success: boolean;
      data: {
        doctors: Doctor[];
        pagination: PaginationMeta;
        filters: { specializations: string[]; hospitals: string[] };
      };
    }>(`/doctors?${query.toString()}`);
  }

  async getDoctorById(id: string) {
    return this.request<{
      success: boolean;
      data: { doctor: Doctor; patients: Patient[]; patientCount: number };
    }>(`/doctors/${id}`);
  }

  async createDoctor(data: Partial<Doctor>) {
    return this.request<{ success: boolean; data: Doctor; message?: string }>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(id: string, data: Partial<Doctor>) {
    return this.request<{ success: boolean; data: Doctor; message?: string }>(
      `/doctors/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteDoctor(id: string) {
    return this.request<{ success: boolean; message: string }>(`/doctors/${id}`, {
      method: 'DELETE',
    });
  }

  async getDoctorPatients(
    doctorId: string,
    params: { search?: string; page?: number; limit?: number } = {}
  ) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return this.request<{
      success: boolean;
      data: {
        doctor: Doctor;
        patients: Patient[];
        pagination: PaginationMeta;
      };
    }>(`/doctors/${doctorId}/patients?${query.toString()}`);
  }

  async addPatientToDoctor(doctorId: string, patientData: Partial<Patient>) {
    return this.request<{ success: boolean; data: Patient; message?: string }>(
      `/doctors/${doctorId}/patients`,
      {
        method: 'POST',
        body: JSON.stringify(patientData),
      }
    );
  }

  async removePatientFromDoctor(doctorId: string, patientId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/doctors/${doctorId}/patients/${patientId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // --- Patients Endpoints ---
  async getPatients(params: {
    search?: string;
    condition?: string;
    status?: string;
    doctor?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.condition && params.condition !== 'All')
      query.set('condition', params.condition);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.doctor && params.doctor !== 'All') query.set('doctor', params.doctor);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    return this.request<{
      success: boolean;
      data: {
        patients: Patient[];
        pagination: PaginationMeta;
        filters: {
          conditions: string[];
          statuses: string[];
          doctors: Array<{ _id: string; name: string; specialization: string }>;
        };
      };
    }>(`/patients?${query.toString()}`);
  }

  async getPatientById(id: string) {
    return this.request<{ success: boolean; data: Patient }>(`/patients/${id}`);
  }

  async createPatient(data: Partial<Patient>) {
    return this.request<{ success: boolean; data: Patient; message?: string }>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: Partial<Patient>) {
    return this.request<{ success: boolean; data: Patient; message?: string }>(
      `/patients/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deletePatient(id: string) {
    return this.request<{ success: boolean; message: string }>(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Analytics Endpoint ---
  async getDashboardAnalytics() {
    return this.request<{ success: boolean; data: DashboardAnalytics }>(
      '/analytics/dashboard'
    );
  }
}

export const api = new ApiClient();
