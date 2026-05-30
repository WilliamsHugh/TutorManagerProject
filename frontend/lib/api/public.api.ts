// lib/api/public.api.ts
// Public endpoints — không cần xác thực JWT
const API_URL = '/api';

/**
 * Map dữ liệu từ backend API sang kiểu ClassListing mà component ClassCard yêu cầu.
 */
function mapClassRequestData(raw: any) {
  const locationRaw = (raw.location || '').toLowerCase();
  const mode: 'Online' | 'Offline' = locationRaw.includes('online')
    ? 'Online'
    : 'Offline';

  let postedAt = 'Vừa xong';
  if (raw.createdAt) {
    const diff = Date.now() - new Date(raw.createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) postedAt = 'Vừa xong';
    else if (hours < 24) postedAt = `${hours} giờ trước`;
    else if (days < 7) postedAt = `${days} ngày trước`;
    else postedAt = new Date(raw.createdAt).toLocaleDateString('vi-VN');
  }

  return {
    id: raw.id,
    code: `#LH${(raw.id || '').substring(0, 4).toUpperCase()}`,
    title: `Tìm gia sư ${raw.subject || 'môn học'}`,
    mode,
    levelTag: raw.gradeLevel || 'Mọi cấp độ',
    salary: 'Thỏa thuận',
    salaryNote: '',
    schedule: raw.schedule || 'Linh hoạt',
    location: raw.location || 'Toàn quốc',
    requirement: raw.requirements || '',
    postedAt,
  };
}

/**
 * Map dữ liệu từ backend API sang kiểu Tutor mà component TutorCard yêu cầu.
 */
function mapTutorData(raw: any) {
  return {
    id: raw.id,
    name: raw.fullName || 'Chưa có tên',
    title:
      [raw.educationLevel, raw.major].filter(Boolean).join(' · ') || 'Gia sư',
    avatar:
      raw.avatarUrl ||
      'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1',
    rating: 5.0,
    reviews: 0,
    location: raw.availableAreas || 'Toàn quốc',
    tags: raw.subjects || [],
    price: 200000,
  };
}

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
  const json = await res.json();
  return {
    data: (json.data || []).map(mapTutorData),
    meta: json.meta || { total: 0, page: 1, limit: 12 },
  };
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
  const res = await fetch(`${API_URL}/public/class-requests${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Không thể tải danh sách lớp học');
  const json = await res.json();
  return {
    data: (json.data || []).map(mapClassRequestData),
    meta: json.meta || { total: 0, page: 1, limit: 12 },
  };
}
