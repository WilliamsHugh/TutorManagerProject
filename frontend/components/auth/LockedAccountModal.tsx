"use client";

import { useRouter } from "next/navigation";

interface LockedAccountModalProps {
  message: string;
  onClose: () => void;
}

export function LockedAccountModal({ message, onClose }: LockedAccountModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-slate-950/65 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4 border border-rose-100 text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-950 mb-2">Tài khoản bị khóa</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="w-full">
          <button
            onClick={() => {
              onClose();
              router.push("/");
            }}
            className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-[#0b5fff] hover:opacity-90 text-white font-semibold text-sm transition-all shadow-md shadow-blue-100"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
