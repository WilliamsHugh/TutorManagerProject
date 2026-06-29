'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getAuthUser, clearAuth } from '@/lib/auth';

import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  userProfile?: {
    fullName: string;
    roleName: string;
    avatar?: string;
    avatarUrl?: string;
  };
}

export default function Header({ title, showSearch = false, userProfile }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const userData = getAuthUser();
    setUser(userData);

    // Chỉ lấy thông báo từ database nếu đang có token đăng nhập
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      getNotifications()
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        })
        .catch(err => console.error("Lỗi tải thông báo:", err));
    }
  }, []);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const handleNotificationClick = async (noti: any) => {
    try {
      await markNotificationAsRead(noti.id);
      setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true } : n));
      setIsNotificationsOpen(false);

      // Route mapping for Tutor
      const msg = noti.message?.toLowerCase() || '';
      const titleLower = noti.title?.toLowerCase() || '';

      if (titleLower.includes('lịch') || msg.includes('lịch dạy') || msg.includes('lịch học')) {
        router.push('/tutors/calendar');
      } else if (titleLower.includes('đề xuất') || titleLower.includes('yêu cầu ghép') || msg.includes('đề xuất') || msg.includes('yêu cầu ghép') || msg.includes('thương lượng')) {
        router.push('/tutors/recommendations');
      } else if (titleLower.includes('lớp học') || msg.includes('lớp học')) {
        router.push('/tutors/students');
      } else if (titleLower.includes('hồ sơ') || msg.includes('hồ sơ') || titleLower.includes('gia sư')) {
        router.push('/tutors/profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    clearAuth();
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // PHẢI await để trình duyệt nhận Set-Cookie xóa httpOnly cookie TRƯỚC KHI chuyển trang
    try {
      await Promise.race([
        fetch('/api/logout', { method: 'POST' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
      ]);
    } catch (err) {
      console.error(err);
    }
    
    window.location.href = '/';
  };

  return (
    <header className="topbar" style={{ height: '72px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'relative', zIndex: 50 }}>
      <div className="topbar-left">
        <h1 className="page-title" style={{ fontSize: '20px', fontWeight: 600 }}>{title}</h1>
      </div>
      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {showSearch && (
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '20px', width: '280px' }}>
            <Icon icon="lucide:search" color="#64748b" />
            <input type="text" placeholder="Tìm kiếm thông tin..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
          </div>
        )}
        <div 
          className="notification" 
          style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer' }}
          onClick={() => {
            setIsNotificationsOpen(!isNotificationsOpen);
            setIsMenuOpen(false);
          }}
        >
          <Icon icon="lucide:bell" fontSize={20} />
          {unreadCount > 0 && (
            <span className="badge" style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
          )}
          
          {isNotificationsOpen && (
            <div 
              className="notifications-dropdown" 
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '320px', backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', cursor: 'default'
              }}
              onClick={(e) => e.stopPropagation()}
            >
               <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Thông báo</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} style={{ fontSize: '12px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}>Đánh dấu đã đọc</button>
                )}
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map((noti: any) => (
                  <div key={noti.id} onClick={() => handleNotificationClick(noti)} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', backgroundColor: noti.isRead ? 'transparent' : '#f0f7ff', transition: 'background 0.2s', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{noti.title}</span>
                      {!noti.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }} />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '4px' }}>{noti.message}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(noti.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                )) : (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Không có thông báo mới</div>
                )}
              </div>
              <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                <button style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>Xem tất cả thông báo</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="user-menu-wrapper" style={{ position: 'relative' }}>
          <div 
            className="user-menu" 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsNotificationsOpen(false);
            }}
          >
            <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: (userProfile?.avatarUrl || userProfile?.avatar || user?.avatarUrl) ? 'transparent' : '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e0e7ff' }}>
              {(userProfile?.avatarUrl || userProfile?.avatar || user?.avatarUrl) ? (
                <img className="avatar" src={userProfile?.avatarUrl || userProfile?.avatar || user?.avatarUrl} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#4f46e5' }}>
                  {(userProfile?.fullName || user?.fullName || user?.email || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="name" style={{ fontWeight: 600, fontSize: '14px' }}>{userProfile?.fullName || user?.fullName || 'Gia sư'}</span>
              <span className="role" style={{ fontSize: '12px', color: '#64748b' }}>{userProfile?.roleName || 'Gia sư hệ thống'}</span>
            </div>
            <Icon 
              icon="lucide:chevron-down" 
              fontSize={16} 
              color="#64748b" 
              style={{ transition: 'transform 0.2s', transform: isMenuOpen ? 'rotate(180deg)' : 'none' }} 
            />
          </div>

          {isMenuOpen && (
            <div className="dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '180px', overflow: 'hidden' }}>
              <button 
                onClick={handleLogout}
                className="logout-btn"
                style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', fontWeight: 500 }}
              >
                <Icon icon="lucide:log-out" fontSize={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}