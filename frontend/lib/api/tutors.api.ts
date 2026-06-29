import { getToken } from '../auth';
import { apiFetch } from './interceptor';

const API_URL = '/api';


// Hàm lấy dữ liệu Dashboard Gia sư
export async function getTutorDashboard(date?: string) {
  const token = getToken();
  const url = date ? `${API_URL}/tutor/dashboard?date=${date}` : `${API_URL}/tutor/dashboard`;
  return apiFetch<any>(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm lấy lịch dạy (Kết nối với màn hình Schedule.html)
export async function getTutorSchedule(date?: string, view: string = 'week') {
  const token = getToken();
  const url = new URL(`${window.location.origin}${API_URL}/tutor/schedule`);
  if (date) url.searchParams.append('date', date);
  url.searchParams.append('view', view);

  return apiFetch<any>(url.toString(), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm lấy danh sách lớp mới (Trả về { classes, profile })
export async function getNewClasses() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/new-classes`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm lấy thông tin hồ sơ gia sư
export async function getTutorProfile() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
}

// Hàm cập nhật hồ sơ gia sư
export async function updateTutorProfile(data: any) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/profile`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
}

// Hàm lấy danh sách môn học của gia sư
export async function getTutorSubjects() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/subjects`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
}

// Hàm cập nhật danh sách môn học của gia sư
export async function updateTutorSubjects(subjects: string[]) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/subjects`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ subjects }),
  });
}

// Hàm lấy tất cả môn học trong hệ thống
export async function getAllSubjects() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/subjects`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
}

// Hàm lấy danh sách thông báo
export async function getTutorNotifications() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm đánh dấu tất cả thông báo đã đọc
export async function markAllNotificationsRead() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/notifications/read-all`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm lấy danh sách học viên của gia sư
export async function getTutorStudents() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/students`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm đăng ký lịch nghỉ học cho gia sư (theo khoảng thời gian)
export async function createLeaveSchedule(data: { startDate: string; endDate: string; startTime: string; endTime: string; note: string }) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/schedule/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
}

// Hàm lấy báo cáo thu nhập của gia sư
export async function getTutorEarnings() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/earnings`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm lấy danh sách đề xuất từ học sinh (dành riêng cho tutor)
// Trả về danh sách class requests có preferredTutor trùng với tutor đang đăng nhập
export async function getMyRecommendations() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/recommendations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Gửi đề xuất học phí & số buổi cho học sinh
export async function proposeToStudent(id: string, feePerSession: number, totalSessions: number, schedule?: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/recommendations/${id}/propose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ feePerSession, totalSessions, schedule }),
  });
}

// Từ chối đề xuất từ học sinh
export async function declineRecommendation(id: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/recommendations/${id}/decline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Lấy danh sách đề xuất đang chờ (PROPOSED + NEGOTIATING)
export async function getMyPendingProposals() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/recommendations/pending`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Điều chỉnh đề xuất (khi học sinh yêu cầu sửa)
export async function modifyProposal(id: string, feePerSession: number, totalSessions: number, schedule?: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/recommendations/${id}/modify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ feePerSession, totalSessions, schedule }),
  });
}

export async function confirmProposalByTutor(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations/${id}/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể đồng ý đề xuất');
  }
  return res.json();
}

// Rút đề xuất
export async function withdrawProposal(id: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/recommendations/${id}/withdraw`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Tutor yêu cầu hủy lớp học
export async function tutorRequestCancellation(classId: string, reason: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/classes/${classId}/request-cancellation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
}

// Tutor phản hồi yêu cầu hủy lớp
export async function tutorRespondCancellation(classId: string, agree: boolean) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/classes/${classId}/respond-cancellation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ agree }),
  });
}

// Tutor lấy danh sách lớp có yêu cầu hủy
export async function getTutorCancellations() {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/classes/cancellations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Lấy thông tin hủy của một lớp cụ thể
export async function getTutorClassCancellationInfo(classId: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/classes/${classId}/cancellation`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm hủy lịch nghỉ (khôi phục buổi học)
export async function cancelLeaveSchedule(scheduleId: string) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/schedule/leave/${scheduleId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Hàm hủy hàng loạt lịch nghỉ theo khoảng thời gian
export async function cancelLeaveScheduleRange(data: { startDate: string; endDate: string }) {
  const token = getToken();
  return apiFetch<any>(`${API_URL}/tutor/schedule/cancel-leave-range`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
}

