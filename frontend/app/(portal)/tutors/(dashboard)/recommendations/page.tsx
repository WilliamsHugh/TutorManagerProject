"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  getMyRecommendations,
  acceptRecommendation,
  declineRecommendation,
} from "@/lib/api";
import Header from "@/components/tutor/Header";

type Recommendation = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  gradeLevel: string;
  subject: string;
  preferredArea: string;
  preferredSchedule: string;
  requirements: string;
  createdAt: string;
  status: string;
};

export default function TutorRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getMyRecommendations();
      setRecommendations(data || []);
    } catch (err: any) {
      console.error("Failed to fetch recommendations:", err);
      showToast(err.message || "Không thể tải danh sách đề xuất", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await acceptRecommendation(id);
      showToast(result.message || "Đã chấp nhận đề xuất thành công!", "success");
      // Remove from list
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      showToast(err.message || "Không thể chấp nhận đề xuất", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await declineRecommendation(id);
      showToast(
        result.message || "Đã từ chối đề xuất",
        "info"
      );
      // Remove from list
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      showToast(err.message || "Không thể từ chối đề xuất", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <>
      <Header title="Đề xuất từ học sinh" userProfile={profile} />

      <main className="p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Đề xuất từ học sinh
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Học sinh đã đề xuất bạn làm gia sư. Hãy xem xét và phản hồi
            </p>
          </div>
          <button
            onClick={fetchRecommendations}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Icon icon="lucide:refresh-cw" fontSize={16} />
            Làm mới
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Icon
              icon="lucide:loader-2"
              className="animate-spin mr-3 text-xl"
            />
            Đang tải danh sách đề xuất...
          </div>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Icon
              icon="lucide:inbox"
              fontSize={56}
              className="text-slate-300 mb-4"
            />
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              Chưa có đề xuất nào
            </h3>
            <p className="text-sm">
              Khi học sinh đề xuất bạn làm gia sư, danh sách sẽ hiển thị ở đây
            </p>
          </div>
        )}

        {/* Recommendations List */}
        {!loading &&
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                    {rec.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {rec.studentName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                      {rec.gradeLevel && (
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:graduation-cap" fontSize={14} />
                          {rec.gradeLevel}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Icon icon="lucide:clock" fontSize={14} />
                        {timeAgo(rec.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Icon icon="lucide:star" fontSize={12} />
                  Đề xuất gia sư
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Icon
                      icon="lucide:book-open"
                      fontSize={18}
                      className="text-blue-500 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Môn học
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {rec.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Icon
                      icon="lucide:map-pin"
                      fontSize={18}
                      className="text-blue-500 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Khu vực
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {rec.preferredArea}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Icon
                      icon="lucide:calendar-clock"
                      fontSize={18}
                      className="text-blue-500 mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Lịch học
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">
                        {rec.preferredSchedule}
                      </p>
                    </div>
                  </div>
                </div>

                {rec.requirements && (
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                      Yêu cầu thêm
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {rec.requirements}
                    </p>
                  </div>
                )}

                {(rec.studentPhone || rec.studentEmail) && (
                  <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-slate-50">
                    {rec.studentPhone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon
                          icon="lucide:phone"
                          fontSize={14}
                          className="text-slate-400"
                        />
                        {rec.studentPhone}
                      </div>
                    )}
                    {rec.studentEmail && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon
                          icon="lucide:mail"
                          fontSize={14}
                          className="text-slate-400"
                        />
                        {rec.studentEmail}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => handleDecline(rec.id)}
                  disabled={actionLoading === rec.id}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading === rec.id ? (
                    <Icon
                      icon="lucide:loader-2"
                      className="animate-spin"
                      fontSize={16}
                    />
                  ) : (
                    <Icon icon="lucide:x" fontSize={16} />
                  )}
                  Từ chối
                </button>
                <button
                  onClick={() => handleAccept(rec.id)}
                  disabled={actionLoading === rec.id}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading === rec.id ? (
                    <Icon
                      icon="lucide:loader-2"
                      className="animate-spin"
                      fontSize={16}
                    />
                  ) : (
                    <Icon icon="lucide:check" fontSize={16} />
                  )}
                  Chấp nhận dạy
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border:
              toast.type === "success"
                ? "1px solid #bbf7d0"
                : toast.type === "error"
                ? "1px solid #fecaca"
                : "1px solid #bfdbfe",
            background:
              toast.type === "success"
                ? "#f0fdf4"
                : toast.type === "error"
                ? "#fef2f2"
                : "#eff6ff",
            color:
              toast.type === "success"
                ? "#166534"
                : toast.type === "error"
                ? "#991b1b"
                : "#1e40af",
            animation: "slideIn 0.3s ease-out forwards",
            maxWidth: "350px",
          }}
        >
          <Icon
            icon={
              toast.type === "success"
                ? "lucide:check-circle"
                : toast.type === "error"
                ? "lucide:alert-circle"
                : "lucide:info"
            }
            fontSize={20}
            color={
              toast.type === "success"
                ? "#15803d"
                : toast.type === "error"
                ? "#dc2626"
                : "#2563eb"
            }
          />
          <div style={{ fontSize: "13.5px", fontWeight: 550, lineHeight: 1.4 }}>
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginLeft: "auto",
              color:
                toast.type === "success"
                  ? "#166534"
                  : toast.type === "error"
                  ? "#991b1b"
                  : "#1e40af",
              opacity: 0.6,
            }}
          >
            <Icon icon="lucide:x" fontSize={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
