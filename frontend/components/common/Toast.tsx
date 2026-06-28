'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const colors = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '#15803d' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#dc2626' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '#2563eb' },
  };
  const c = colors[type];
  const iconName = type === 'success' ? 'lucide:check-circle' : type === 'error' ? 'lucide:alert-circle' : 'lucide:info';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        animation: 'toastSlideIn 0.3s ease-out forwards',
        maxWidth: '350px',
      }}
    >
      <Icon icon={iconName} fontSize={20} color={c.icon} />
      <div style={{ fontSize: '13.5px', fontWeight: 550, lineHeight: 1.4 }}>{message}</div>
      <button
        onClick={() => { setVisible(false); onClose(); }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginLeft: 'auto',
          color: c.text,
          opacity: 0.6,
        }}
      >
        <Icon icon="lucide:x" fontSize={16} />
      </button>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Hook tiện ích để sử dụng Toast
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
}
