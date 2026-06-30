"use client";

import { X, Banknote, Calendar, MapPin, GraduationCap, Clock, BookOpen, Tag } from "lucide-react";
import { ClassListing } from "@/types/class";

type PublicClassDetailModalProps = {
  classItem: ClassListing | null;
  onClose: () => void;
};

export default function PublicClassDetailModal({ classItem, onClose }: PublicClassDetailModalProps) {
  if (!classItem) return null;

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
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{classItem.title}</h3>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                {classItem.code}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold"
                style={
                  classItem.mode === "Online"
                    ? { backgroundColor: "#d1fae5", color: "#065f46" }
                    : { backgroundColor: "#fef3c7", color: "#92400e" }
                }
              >
                {classItem.mode === "Online" ? "Học trực tuyến (Online)" : "Học trực tiếp (Offline)"}
              </span>
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#eef2ff", color: "#4338ca" }}
              >
                {classItem.levelTag}
              </span>
            </div>
          </div>
          <button
            aria-label="Đóng chi tiết lớp học"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* Mô tả lớp học */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <BookOpen size={15} className="text-blue-500" />
              Thông tin lớp học
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Học phí */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                  <Banknote size={14} className="text-amber-500" />
                  Học phí
                </div>
                <p className="text-base font-bold text-amber-600">
                  {classItem.salary}
                  <span className="text-sm font-medium text-gray-500 ml-1">{classItem.salaryNote}</span>
                </p>
              </div>

              {/* Lịch học */}
              {classItem.schedule && (
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                    <Calendar size={14} className="text-emerald-500" />
                    Lịch học
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{classItem.schedule}</p>
                </div>
              )}

              {/* Địa điểm */}
              {classItem.location && (
                <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                    <MapPin size={14} className="text-blue-500" />
                    Địa điểm
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{classItem.location}</p>
                </div>
              )}

              {/* Hình thức */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                  <Tag size={14} className="text-purple-500" />
                  Hình thức
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {classItem.mode === "Online" ? "Học trực tuyến" : "Học trực tiếp"}
                </p>
              </div>
            </div>
          </div>

          {/* Yêu cầu */}
          {classItem.requirement && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <GraduationCap size={15} className="text-orange-500" />
                Yêu cầu gia sư
              </h4>
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-sm leading-6 text-gray-700">
                {classItem.requirement}
              </div>
            </div>
          )}

          {/* Thời gian đăng */}
          <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
            <Clock size={13} />
            <span>Đăng cách đây {classItem.postedAt}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 p-5 sm:p-6">
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
  );
}
