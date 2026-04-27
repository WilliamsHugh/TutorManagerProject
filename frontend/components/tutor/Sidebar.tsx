'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

const NAV_ITEMS = [
  { href: '/tutors/tutor/dashboard', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
  { href: '/tutors/tutor/calendar', icon: 'lucide:calendar', label: 'Lịch dạy' },
  { href: '/tutors/tutor/new-classes', icon: 'lucide:search', label: 'Lớp học mới' },
  { href: '/tutors/tutor/students', icon: 'lucide:users', label: 'Học viên của tôi' },
  { href: '/tutors/tutor/profile', icon: 'lucide:user', label: 'Hồ sơ chuyên môn' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
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
    </aside>
  );
}