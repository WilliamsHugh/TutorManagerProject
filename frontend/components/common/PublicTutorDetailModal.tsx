"use client";

import { X, MapPin, GraduationCap, Star, BookOpen, Mail, Award, CalendarDays, Send } from "lucide-react";
import { Tutor } from "@/types/tutor";

type PublicTutorDetailModalProps = {
  tutor: Tutor | null;
  onClose: () => void;
  onRecommend?: (tutor: Tutor) => void;
};

export default function PublicTutorDetailModal({ tutor, onClose, onRecommend }: PublicTutorDetailModalProps) {
  if (!tutor) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      role="dialog"
      style={{ animation: "modalFadeIn 0.2s ease-out forwards" }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
        style={{ animation: "modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {tutor.avatar ? (
                <img
                  src={tutor.avatar}
                  alt={tutor.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl">
                  {(tutor.name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{tutor.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{tutor.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-amber-500">{tutor.rating}</span>
                <span className="text-sm text-gray-400">({tutor.reviews} đánh giá)</span>
              </div>
            </div>
          </div>
          <button
            aria-label="Đóng chi tiết gia sư"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                <MapPin size={14} className="text-blue-500" />
                Khu vực
              </div>
              <p className="text-sm font-semibold text-gray-900">{tutor.location}</p>
            </div>
            {tutor.experience && (
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                  <Award size={14} className="text-purple-500" />
                  Kinh nghiệm
                </div>
                <p className="text-sm font-semibold text-gray-900">{tutor.experience}</p>
              </div>
            )}
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                <GraduationCap size={14} className="text-orange-500" />
                Học vấn
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {[tutor.educationLevel, tutor.major].filter(Boolean).join(" - ") || "Chưa cập nhật"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                <CalendarDays size={14} className="text-emerald-500" />
                Học phí
              </div>
              <p className="text-sm font-semibold text-blue-600">
                {tutor.price.toLocaleString("vi-VN")}đ / giờ
              </p>
            </div>
          </div>

          {/* Bio */}
          {tutor.bio && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Giới thiệu</h4>
              <p className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm leading-6 text-gray-600">
                {tutor.bio}
              </p>
            </div>
          )}

          {/* Subjects */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <BookOpen size={15} className="text-blue-500" />
              Môn học giảng dạy
            </h4>
            <div className="flex flex-wrap gap-2">
              {tutor.tags.length > 0 ? (
                tutor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">Chưa cập nhật môn học</span>
              )}
            </div>
          </div>

          {/* Contact Info — chỉ hiển thị email, không hiển thị số điện thoại */}
          {tutor.email && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Thông tin liên hệ</h4>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{tutor.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 p-5 sm:p-6">
          <p className="text-xs text-gray-400">
            Liên hệ qua trung tâm để được hỗ trợ kết nối với gia sư
          </p>
          <div className="flex gap-3">
            {onRecommend && (
              <button
                className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 flex items-center gap-2"
                onClick={() => { onRecommend(tutor); onClose(); }}
                type="button"
              >
                <Send size={15} />
                Đề xuất gia sư này
              </button>
            )}
            <button
              className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={onClose}
              type="button"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
