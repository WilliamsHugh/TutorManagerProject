// lib/api/staff.api.ts
// Di chuyển từ lib/staff-api.ts sang đây để chuẩn hóa cấu trúc lib/api/
import type { ApiClassRequest, ApiTutorRecommendation } from '@/types/class_request';
import type { ApiClass, ApiClassStatus } from '@/types/staff';

// Dùng proxy Next.js (/api) thay vì direct backend URL để tránh lỗi CORS
// Next.js rewrites (next.config.ts) sẽ forward /api/:path* tới backend
export const STAFF_API_URL = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${STAFF_API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Không thể kết nối đến máy chủ');
  }

  return res.json() as Promise<T>;
}

export function getCurrentUser() {
  return request<any>('/auth/me');
}

export function getClassRequests(params: { status?: string; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return request<ApiClassRequest[]>(`/class-requests${query ? `?${query}` : ''}`);
}

export function getClassRequest(id: string) {
  return request<ApiClassRequest>(`/class-requests/${id}`);
}

export function updateClassRequestStatus(id: string, status: string) {
  return request<ApiClassRequest>(`/class-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getTutorRecommendations(requestId: string) {
  return request<ApiTutorRecommendation[]>(`/class-requests/${requestId}/tutor-recommendations`);
}

export function createClass(data: {
  requestId: string;
  tutorId: string;
  location?: string;
  feePerSession?: string;
  totalSessions?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}) {
  return request<ApiClass>('/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getClasses(params: { status?: ApiClassStatus } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  const query = searchParams.toString();
  return request<ApiClass[]>(`/classes${query ? `?${query}` : ''}`);
}

// Staff data endpoints — kết nối với AdminController (cho phép cả STAFF role)
export function getStaffStats() {
  return request<{
    activeClasses: number;
    completedClasses: number;
    newRequests: number;
    activeTutors: number;
    learningStudents: number;
  }>('/admin/stats');
}

export function getStaffTutors() {
  return request<any[]>('/admin/tutors');
}

export function getStaffStudents() {
  return request<any[]>('/admin/students');
}
