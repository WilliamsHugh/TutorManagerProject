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
  const res = await fetch(`${API_URL}/tutor/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
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

// Hàm lấy danh sách môn học của gia sư
export async function getTutorSubjects() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/subjects`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Không thể tải danh sách môn học của gia sư');
  return res.json();
}

// Hàm cập nhật danh sách môn học của gia sư
export async function updateTutorSubjects(subjects: string[]) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/subjects`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ subjects }),
  });
  if (!res.ok) throw new Error('Không thể cập nhật danh sách môn học');
  return res.json();
}

// Hàm lấy tất cả môn học trong hệ thống
export async function getAllSubjects() {
  const token = getToken();
  const res = await fetch(`${API_URL}/subjects`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Không thể tải danh sách môn học hệ thống');
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

// Hàm đăng ký lịch nghỉ học cho gia sư (theo khoảng thời gian)
export async function createLeaveSchedule(data: { startDate: string; endDate: string; startTime: string; endTime: string; note: string }) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/schedule/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tạo lịch nghỉ');
  }
  return res.json();
}

// Hàm lấy báo cáo thu nhập của gia sư
export async function getTutorEarnings() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/earnings`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải báo cáo thu nhập');
  return res.json();
}

// Hàm lấy danh sách đề xuất từ học sinh (dành riêng cho tutor)
// Trả về danh sách class requests có preferredTutor trùng với tutor đang đăng nhập
export async function getMyRecommendations() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách đề xuất');
  return res.json();
}

// Gửi đề xuất học phí & số buổi cho học sinh
export async function proposeToStudent(id: string, feePerSession: number, totalSessions: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations/${id}/propose`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ feePerSession, totalSessions }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể gửi đề xuất');
  }
  return res.json();
}

// Từ chối đề xuất từ học sinh
export async function declineRecommendation(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations/${id}/decline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể từ chối đề xuất');
  }
  return res.json();
}

// Lấy danh sách đề xuất đang chờ (PROPOSED + NEGOTIATING)
export async function getMyPendingProposals() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations/pending`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách đề xuất đang chờ');
  return res.json();
}

// Điều chỉnh đề xuất (khi học sinh yêu cầu sửa)
export async function modifyProposal(id: string, feePerSession: number, totalSessions: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations/${id}/modify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ feePerSession, totalSessions }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể điều chỉnh đề xuất');
  }
  return res.json();
}

// Rút đề xuất
export async function withdrawProposal(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/recommendations/${id}/withdraw`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể rút đề xuất');
  }
  return res.json();
}

// Tutor yêu cầu hủy lớp học
export async function tutorRequestCancellation(classId: string, reason: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/classes/${classId}/request-cancellation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể yêu cầu hủy lớp');
  }
  return res.json();
}

// Tutor phản hồi yêu cầu hủy lớp
export async function tutorRespondCancellation(classId: string, agree: boolean) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/classes/${classId}/respond-cancellation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ agree }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể phản hồi yêu cầu hủy lớp');
  }
  return res.json();
}

// Tutor lấy danh sách lớp có yêu cầu hủy
export async function getTutorCancellations() {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/classes/cancellations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu hủy lớp');
  return res.json();
}

// Hàm hủy lịch nghỉ (khôi phục buổi học)
export async function cancelLeaveSchedule(scheduleId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/schedule/leave/${scheduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể hủy lịch nghỉ');
  }
  return res.json();
}

