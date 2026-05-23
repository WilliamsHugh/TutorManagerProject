// lib/api/public.api.ts
// Public endpoints — không cần xác thực JWT
const API_URL = '/api';

export async function getPublicTutors(params?: {
  search?: string;
  subject?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();
  const res = await fetch(`${API_URL}/tutors${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Không thể tải danh sách gia sư');
  return res.json() as Promise<{ data: any[]; meta: { total: number; page: number; limit: number } }>;
}

export async function getPublicClasses(params?: {
  search?: string;
  subject?: string;
  mode?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.subject) searchParams.set('subject', params.subject);
  if (params?.mode) searchParams.set('mode', params.mode);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();
  const res = await fetch(`${API_URL}/class-requests${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Không thể tải danh sách lớp học');
  return res.json() as Promise<{ data: any[]; meta: { total: number; page: number; limit: number } }>;
}
