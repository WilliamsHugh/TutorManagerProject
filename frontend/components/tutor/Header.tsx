'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getAuthUser, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getTutorNotifications } from '@/lib/api';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  userProfile?: {
    fullName: string;
    roleName: string;
    avatar: string;
  };
}

export default function Header({ title, showSearch = false, userProfile }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userData = getAuthUser();
    setUser(userData);

    // Lấy thông báo từ database khi load component
    getTutorNotifications()
      .then(data => {
        // Kiểm tra chắc chắn dữ liệu là mảng trước khi set
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(err => console.error("Lỗi tải thông báo:", err));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    clearAuth(); // Xóa localStorage
    // Xóa cookie để middleware nhận diện đã đăng xuất
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
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
                <button style={{ fontSize: '12px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}>Đánh dấu đã đọc</button>
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.map((noti: any) => (
                  <div key={noti.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', backgroundColor: noti.isRead ? 'transparent' : '#f0f7ff', transition: 'background 0.2s' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', color: '#1e293b' }}>{noti.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '4px' }}>{noti.message}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(noti.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                ))}
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
            <img className="avatar" src={userProfile?.avatarUrl || userProfile?.avatar || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1"} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
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