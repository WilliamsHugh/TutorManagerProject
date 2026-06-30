import { getToken } from '../auth';

const API_URL = '/api';

// Hàm lấy chi tiết yêu cầu lớp học
export async function getClassRequestDetail(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/class-requests/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải chi tiết lớp học');
  return res.json();
}

// Hàm gia sư nhận lớp
export async function acceptClassRequest(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/class-requests/${id}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể nhận lớp. Vui lòng thử lại.');
  }
  return res.json();
}

// Hàm lấy danh sách báo cáo của một lớp
export async function getLearningReports(classId: string) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token && token !== "null" && token !== "undefined") {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/tutor/classes/${classId}/reports`, {
    credentials: 'include',
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("Fetch Reports Error:", errData);
    throw new Error(errData.message || 'Không thể tải danh sách báo cáo');
  }
  return res.json();
}

// Hàm nộp báo cáo (Kết nối với màn hình Studentdetail.html)
export async function submitLearningReport(data: any) {
  // Chuẩn hóa dữ liệu: Đảm bảo classId là chuỗi sạch (không khoảng trắng)
  const payload = {
    ...data,
    classId: typeof data.classId === 'string' ? data.classId.trim() : data.classId
  };

  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
    const message = Array.isArray(errorData.message) 
      ? errorData.message.join(', ') 
      : (errorData.message || 'Không thể nộp báo cáo');
    
    console.warn("Chi tiết lỗi từ Backend:", errorData);
    // Quăng lỗi với nội dung cụ thể (ví dụ: "classId must be a UUID")
    throw new Error(message);
  }
  return res.json();
}

// Hàm cập nhật báo cáo
export async function updateLearningReport(id: string, data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/reports/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật báo cáo');
  return res.json();
}

// Hàm xóa báo cáo
export async function deleteLearningReport(id: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/tutor/reports/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể xóa báo cáo');
  return res.json();
}

// Lấy lịch học của học viên (cho student calendar view)
export async function getStudentMySchedule() {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/my-schedule`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tải lịch học');
  }
  return res.json();
}

// Lấy danh sách lớp học của Học viên
export async function getStudentClasses() {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/my-classes`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách lớp học của bạn');
  return res.json();
}

export async function recreateClassRequest(classId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/recreate/${classId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể đăng ký học lại lớp này');
  }
  return res.json();
}

// Học viên nộp đánh giá gia sư
export async function submitReview(data: { classId: string; rating: number; comment?: string }) {
  const token = getToken();
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể gửi đánh giá');
  }
  return res.json();
}

// Lấy thông tin hồ sơ học viên đang đăng nhập
export async function getStudentProfile() {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token && token !== "null" && token !== "undefined") {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/auth/student-profile`, {
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Không thể tải thông tin học viên');
  return res.json();
}

// Lấy danh sách đề xuất từ gia sư đang chờ học viên xác nhận
export async function getStudentProposals() {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/proposals`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách đề xuất');
  return res.json();
}

// Học viên xác nhận đề xuất của gia sư → tạo lớp
export async function confirmProposal(requestId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/confirm-proposal/${requestId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể xác nhận đề xuất');
  }
  return res.json();
}

// Gửi yêu cầu tìm gia sư từ học viên
export async function createClassRequest(data: {
  studentId: string;
  subjectId: string;
  preferredArea?: string;
  preferredSchedule?: string;
  requirements?: string;
}) {
  const res = await fetch(`${API_URL}/class-requests`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể gửi yêu cầu tìm gia sư');
  }
  return res.json();
}

// Lấy đánh giá của một lớp học
export async function getClassReview(classId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/reviews/class/${classId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải đánh giá lớp học');
  return res.json();
}

// Lấy báo cáo học tập của một lớp (dành cho student)
export async function getStudentClassReports(classId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/reports/${classId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tải báo cáo học tập');
  }
  return res.json();
}

// Học viên từ chối đề xuất từ gia sư
export async function declineProposal(requestId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/decline-proposal/${requestId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể từ chối đề xuất');
  }
  return res.json();
}

// Học viên yêu cầu gia sư điều chỉnh đề xuất
export async function counterProposal(
  requestId: string,
  note: string,
  feePerSession?: number,
  totalSessions?: number,
  schedule?: string,
) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/counter-proposal/${requestId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ note, feePerSession, totalSessions, schedule }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể gửi yêu cầu điều chỉnh');
  }
  return res.json();
}

// Học viên yêu cầu hủy lớp học
export async function requestClassCancellation(classId: string, reason: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/request-cancellation/${classId}`, {
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

// Học viên phản hồi yêu cầu hủy lớp
export async function respondCancellation(classId: string, agree: boolean) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/respond-cancellation/${classId}`, {
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

// Lấy thông tin hủy lớp (kiểm tra có yêu cầu hủy không)
export async function getClassCancellationInfo(classId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/student/cancellation/${classId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải thông tin hủy lớp');
  return res.json();
}

// Lấy báo cáo cho một buổi học cụ thể (dành cho student, theo sessionDate)
export async function getStudentScheduleReport(classId: string, sessionDate: string) {
  const token = getToken();
  const encodedDate = encodeURIComponent(sessionDate);
  const res = await fetch(`${API_URL}/classes/student/schedule-report/${classId}/${encodedDate}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tải báo cáo buổi học');
  }
  return res.json();
}

export async function getStudentRequests() {
  const token = getToken();
  const res = await fetch(`${API_URL}/class-requests/student/my-requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu ghép lớp');
  return res.json();
}

export async function selectProposedTutor(requestId: string, tutorId: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/class-requests/${requestId}/select-tutor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ tutorId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể chọn gia sư');
  }
  return res.json();
}
