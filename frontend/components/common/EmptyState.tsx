import React from 'react';
import { Icon } from '@iconify/react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

export default function EmptyState({ 
  title = 'Không có dữ liệu', 
  message = 'Chưa có thông tin nào để hiển thị lúc này.', 
  icon = 'lucide:inbox' 
}: EmptyStateProps) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '64px', 
      background: '#f8fafc', 
      borderRadius: '12px', 
      border: '2px dashed #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      margin: '24px 0'
    }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon icon={icon} fontSize={32} color="#94a3b8" />
      </div>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#334155' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '300px' }}>{message}</p>
    </div>
  );
}
