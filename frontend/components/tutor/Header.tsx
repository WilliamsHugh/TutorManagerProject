'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

export default function Header({ title, showSearch = false }: HeaderProps) {
  return (
    <header className="topbar" style={{ height: '72px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
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
        <div className="notification" style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
          <Icon icon="lucide:bell" fontSize={20} />
          <span className="badge" style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
        </div>
        <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid #e2e8f0', cursor: 'pointer' }}>
          <img className="avatar" src="https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="name" style={{ fontWeight: 600, fontSize: '14px' }}>Trần Lê Thu</span>
            <span className="role" style={{ fontSize: '12px', color: '#64748b' }}>Gia sư Tiếng Anh</span>
          </div>
          <Icon icon="lucide:chevron-down" fontSize={16} color="#64748b" />
        </div>
      </div>
    </header>
  );
}