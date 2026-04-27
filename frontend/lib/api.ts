const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  const res = await fetch(`${API_URL}/tutor/stats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

// Hàm lấy dữ liệu Dashboard Gia sư
export async function getTutorDashboard() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải dữ liệu Dashboard');
  return res.json();
}

// Hàm lấy lịch dạy (Kết nối với màn hình Schedule.html)
export async function getTutorSchedule() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/schedule`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải lịch dạy');
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

// Hàm lấy danh sách lớp mới
export async function getNewClasses() {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/new`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách lớp mới');
  return res.json();
}

// Hàm lấy thông tin hồ sơ gia sư
export async function getTutorProfile() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải thông tin hồ sơ');
  return res.json();
}