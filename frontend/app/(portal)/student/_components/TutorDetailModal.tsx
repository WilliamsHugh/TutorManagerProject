import Image from "next/image";
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

type TutorDetailModalProps = {
  tutor: TutorSuggestion | null;
  onClose: () => void;
};

export function TutorDetailModal({ tutor, onClose }: TutorDetailModalProps) {
  if (!tutor) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
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
            className="h-10 rounded-md bg-[#0b5fff] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            type="button"
          >
            Đề xuất gia sư này
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
