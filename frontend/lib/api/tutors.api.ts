import { getToken } from '../auth';

const API_URL = '/api';

// Hàm lấy thông tin chung cho Dashboard
export async function getTutorStats() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

// Hàm lấy dữ liệu Dashboard Gia sư
export async function getTutorDashboard(date?: string) {
  const token = getToken();
  const url = date ? `${API_URL}/tutor/dashboard?date=${date}` : `${API_URL}/tutor/dashboard`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải dữ liệu Dashboard');
  return res.json();
}

// Hàm lấy lịch dạy (Kết nối với màn hình Schedule.html)
export async function getTutorSchedule(date?: string, view: string = 'week') {
  const token = getToken();
  const url = new URL(`${window.location.origin}${API_URL}/tutor/schedule`);
  if (date) url.searchParams.append('date', date);
  url.searchParams.append('view', view);

  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải lịch dạy');
  return res.json();
}

// Hàm lấy danh sách lớp mới (Trả về { classes, profile })
export async function getNewClasses() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/new-classes`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách lớp mới');
  return res.json();
}

// Hàm lấy thông tin hồ sơ gia sư
export async function getTutorProfile() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải thông tin hồ sơ');
  return res.json();
}

// Hàm cập nhật hồ sơ gia sư
export async function updateTutorProfile(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/profile`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật hồ sơ');
  return res.json();
}

// Hàm lấy danh sách thông báo
export async function getTutorNotifications() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải thông báo');
  return res.json();
}

// Hàm lấy danh sách học viên của gia sư
export async function getTutorStudents() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/students`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách học viên');
  return res.json();
}
