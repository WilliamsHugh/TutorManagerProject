import React from 'react';
import { Icon } from '@iconify/react';

interface LoadingSpinnerProps {
  message?: string;
  fullHeight?: boolean;
}

export default function LoadingSpinner({ message = 'Đang tải dữ liệu...', fullHeight = true }: LoadingSpinnerProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: fullHeight ? '400px' : 'auto',
      padding: '48px',
      color: '#64748b' 
    }}>
      <Icon icon="lucide:loader-2" className="animate-spin" fontSize={32} style={{ marginBottom: '16px', color: '#3b82f6' }} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
    </div>
  );
}
