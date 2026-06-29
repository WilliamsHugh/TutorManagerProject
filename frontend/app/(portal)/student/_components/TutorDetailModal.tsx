import Image from "next/image";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react";

import type { TutorSuggestion } from "../types";
import { Skeleton } from "@/components/common/Skeleton";

type TutorDetailModalProps = {
  tutor: TutorSuggestion | null;
  onClose: () => void;
  onRecommend?: (tutor: TutorSuggestion) => void;
  isRecommended?: boolean;
};

export function TutorDetailModal({ tutor, onClose, onRecommend, isRecommended = false }: TutorDetailModalProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    if (!tutor) return;
    setLoadingSchedule(true);
    // Fetch schedule for the tutor dynamically
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    fetch(`/api/classes/tutor/${tutor.id}/schedule`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load schedule');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        }
      })
      .catch(err => {
        console.error("Error fetching tutor schedule:", err);
        setSchedules([]);
      })
      .finally(() => setLoadingSchedule(false));
  }, [tutor]);

  if (!tutor) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
      style={{
        animation: "tutorModalFadeIn 0.2s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes tutorModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tutorModalScaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        style={{
          animation: "tutorModalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e8f0] p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Image
              src={tutor.avatar}
              alt={`Ảnh đại diện ${tutor.name}`}
              className="h-16 w-16 rounded-full object-cover"
              width={64}
              height={64}
            />
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-[#0f172a]">
                  {tutor.name}
                </h3>
                <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
                  {tutor.match}% match
                </span>
              </div>
              <p className="text-sm text-[#64748b]">
                {tutor.experience} · {tutor.education}
              </p>
            </div>
          </div>

          <button
            aria-label="Đóng chi tiết gia sư"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#e2e8f0] bg-white text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<MapPin size={16} />}
              label="Khu vực"
              value={tutor.location}
            />
            <DetailItem
              icon={<CalendarDays size={16} />}
              label="Lịch rảnh"
              value={tutor.availableTime}
            />
            <DetailItem
              icon={<GraduationCap size={16} />}
              label="Hình thức học"
              value={tutor.teachingMode}
            />
            <DetailItem
              icon={<Star size={16} />}
              label="Đánh giá"
              value={`${tutor.rating}/5 từ ${tutor.reviews} học viên`}
            />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-[#0f172a]">
              Môn học phù hợp
            </h4>
            <div className="flex flex-wrap gap-2">
              {tutor.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-[#64748b]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-[#0f172a]">
              Giới thiệu
            </h4>
            <p className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm leading-6 text-[#475569]">
              {tutor.bio}
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-[#0f172a] flex items-center gap-1.5">
              <CalendarDays size={16} className="text-[#0b5fff]" />
              Lịch giảng dạy / Lịch bận
            </h4>
            {loadingSchedule ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                    <Skeleton className="mb-2 h-3.5 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : schedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {Object.entries(
                  schedules.reduce((acc: any, curr) => {
                    const weekdaysMap: Record<string, string> = {
                      Mon: "Thứ 2",
                      Tue: "Thứ 3",
                      Wed: "Thứ 4",
                      Thu: "Thứ 5",
                      Fri: "Thứ 6",
                      Sat: "Thứ 7",
                      Sun: "Chủ nhật",
                    };
                    const day = weekdaysMap[curr.dayOfWeek] || curr.dayOfWeek;
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(`${curr.startTime.slice(0, 5)} - ${curr.endTime.slice(0, 5)} (${curr.class?.subject?.name || "Lớp bận"})`);
                    return acc;
                  }, {})
                ).map(([day, slots]: any) => (
                  <div key={day} className="rounded-md border border-slate-100 bg-slate-50 p-2 text-xs">
                    <span className="font-bold text-[#0f172a]">{day}</span>
                    <ul className="mt-1 space-y-0.5 pl-4 list-disc text-[#64748b]">
                      {slots.map((slot: string, idx: number) => (
                        <li key={idx}>{slot}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748b] italic py-1">Hiện tại gia sư chưa có lịch giảng dạy cố định.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-md border border-[#e2e8f0] p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-[#64748b]">Học phí</p>
              <p className="mt-1 text-sm font-semibold text-[#0b5fff]">
                {tutor.price}
              </p>
            </div>
            <DetailContact
              icon={<Phone size={15} />}
              label="Số điện thoại"
              value={tutor.phone}
            />
            <DetailContact
              icon={<Mail size={15} />}
              label="Email"
              value={tutor.email}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#e2e8f0] p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            className="h-10 rounded-md border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#0f172a] transition-colors hover:bg-[#f8fafc]"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
          <button
            className={`h-10 rounded-md px-4 text-sm font-medium transition-all ${
              isRecommended
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-not-allowed"
                : "bg-[#0b5fff] text-white hover:opacity-90 active:scale-95"
            }`}
            type="button"
            disabled={isRecommended}
            onClick={() => {
              if (!isRecommended) {
                onRecommend?.(tutor);
                onClose();
              }
            }}
          >
            {isRecommended ? "Đã đề xuất" : "Đề xuất gia sư này"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[#e2e8f0] p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#64748b]">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
}

function DetailContact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748b]">
        {icon}
        {label}
      </p>
      <p className="mt-1 wrap-break-word text-sm font-semibold text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}
