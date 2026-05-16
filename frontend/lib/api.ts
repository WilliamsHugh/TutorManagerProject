const API_URL = '/api';

export async function registerStudent(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/register/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Đăng ký thất bại');
  }
  return res.json();
}

export async function registerTutor(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  education: string;
  experience: string;
  subjects: string[];
}) {
  const res = await fetch(`${API_URL}/auth/register/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Đăng ký thất bại');
  }
  return res.json();
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Đăng nhập thất bại');
  }
  return res.json();
}

import { getToken } from './auth';

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
export async function getTutorSchedule(date?: string) {
  const token = getToken();
  const url = date ? `${API_URL}/tutor/schedule?date=${date}` : `${API_URL}/tutor/schedule`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải lịch dạy');
  return res.json();
}

export async function getLearningReports(classId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/classes/${classId}/reports`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

export async function updateLearningReport(id: string, data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteLearningReport(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/reports/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

// Hàm nộp báo cáo (Kết nối với màn hình Studentdetail.html)
export async function submitLearningReport(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/report`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
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

// Hàm lấy chi tiết yêu cầu lớp học
export async function getClassRequestDetail(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/class-requests/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải chi tiết lớp học');
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

// Hàm gia sư nhận lớp
export async function acceptClassRequest(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/class-requests/${id}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}