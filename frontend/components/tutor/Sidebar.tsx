'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { clearAuth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/tutors/dashboard', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
  { href: '/tutors/calendar', icon: 'lucide:calendar', label: 'Lịch dạy' },
  { href: '/tutors/new-classes', icon: 'lucide:search', label: 'Lớp học mới' },
  { href: '/tutors/recommendations', icon: 'lucide:user-check', label: 'Đề xuất từ HS' },
  { href: '/tutors/students', icon: 'lucide:users', label: 'Học viên của tôi' },
  { href: '/tutors/earnings', icon: 'lucide:wallet', label: 'Thu nhập' },
  { href: '/tutors/profile', icon: 'lucide:user', label: 'Hồ sơ chuyên môn' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
    }
    router.push('/');
  };

  return (
    <aside className="sidebar" style={{ position: 'sticky', top: 0, height: '100vh', width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-header" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="logo-icon" style={{ width: '36px', height: '36px', background: '#2563eb', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="lucide:graduation-cap" fontSize={24} />
        </div>
        <span className="logo-text" style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>TutorHub</span>
      </div>
      <nav className="sidebar-nav" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 500,
              backgroundColor: pathname === item.href ? '#eff6ff' : 'transparent',
              color: pathname === item.href ? '#2563eb' : '#64748b'
            }}
          >
            <Icon icon={item.icon} fontSize={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer" style={{ padding: '24px', marginTop: 'auto' }}>
        <button onClick={handleLogout} className="logout-button" style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
          textDecoration: 'none', fontWeight: 500,
          backgroundColor: 'transparent',
          color: '#64748b',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left'
        }}>
          <Icon icon="lucide:log-out" fontSize={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}