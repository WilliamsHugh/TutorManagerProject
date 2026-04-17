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