"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

interface AlertWindowProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}

export function AlertWindow({ isOpen, title, message, type, onClose }: AlertWindowProps) {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
      accentLine: "bg-emerald-500",
    },
    error: {
      icon: <XCircle className="text-rose-500" size={20} />,
      accentLine: "bg-rose-500",
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      accentLine: "bg-amber-500",
    },
  };

  const currentType = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed top-20 right-6 z-[100] w-full max-w-[320px] p-0 animate-in slide-in-from-right-10 fade-in duration-300">
      {/* Alert Window (Floating Toast) */}
      <div className="relative overflow-hidden rounded-xl bg-white shadow-lg border border-slate-200/80 p-4">
        {/* Accent Side Indicator Line */}
        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${currentType.accentLine}`} />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>

        {/* Content */}
        <div className="pl-2 pr-4 flex items-start gap-2.5">
          <div className="shrink-0 pt-0.5">{currentType.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#0f172a] tracking-tight">{title}</h4>
            <p className="mt-1 text-[12px] text-[#64748b] leading-relaxed break-words">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
