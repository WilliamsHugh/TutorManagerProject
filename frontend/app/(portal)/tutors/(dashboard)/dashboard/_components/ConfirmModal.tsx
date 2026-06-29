'use client';

import { Icon } from '@iconify/react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({ isOpen, message, onConfirm, onClose }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex flex-col items-center text-center gap-3">
          <div style={{ width: 48, height: 48, borderRadius: 24, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon="lucide:alert-triangle" fontSize={24} color="#ef4444" style={{ margin: 'auto' }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>Xác nhận</h3>
            <p className="text-sm text-slate-500 mt-1" style={{ margin: 0 }}>{message}</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors bg-white cursor-pointer text-xs"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer border-none text-xs"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
