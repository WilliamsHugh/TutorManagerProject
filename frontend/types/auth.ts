export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'student' | 'tutor' | 'admin' | 'staff';
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterStudentPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface RegisterTutorPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  education: string;
  experience: string;
  subjects: string[];
}
