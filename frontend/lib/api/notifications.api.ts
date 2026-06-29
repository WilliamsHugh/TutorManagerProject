import { getToken } from '../auth';

const API_URL = '/api';

export async function getNotifications() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách thông báo');
  return res.json();
}

export async function markNotificationAsRead(id: string) {
  const token = getToken();
  if (!token) return;
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể đánh dấu đã đọc thông báo');
  return res.json();
}

export async function markAllNotificationsAsRead() {
  const token = getToken();
  if (!token) return;
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể đánh dấu tất cả đã đọc');
  return res.json();
}
