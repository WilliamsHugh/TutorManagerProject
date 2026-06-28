'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  title = 'Xác nhận',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
}: ConfirmModalProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
            <Icon icon="lucide:alert-triangle" fontSize={24} />
          </div>
          <div className="flex-grow">
            <h3 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-1" style={{ margin: 0 }}>
              {message}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            disabled={isConfirming}
            onClick={async () => {
              setIsConfirming(true);
              try {
                await onConfirm();
              } finally {
                setIsConfirming(false);
                onCancel();
              }
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isConfirming && <Icon icon="lucide:loader-2" className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
