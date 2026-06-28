"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  getMyRecommendations,
  getMyPendingProposals,
  proposeToStudent,
  declineRecommendation,
  modifyProposal,
  withdrawProposal,
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

type PendingProposal = {
  id: string;
  studentName: string;
  studentEmail: string;
  gradeLevel: string;
  subject: string;
  preferredArea: string;
  preferredSchedule: string;
  requirements: string;
  proposedFee: number;
  proposedSessions: number;
  totalFee: number;
  status: string;
  proposedAt: string;
  createdAt: string;
};

export default function TutorRecommendationsClient() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [profile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"new" | "pending">("new");
  const [proposeModal, setProposeModal] = useState<{
    requestId: string;
    studentName: string;
  } | null>(null);
  const [proposeForm, setProposeForm] = useState({
    feePerSession: 200000,
    totalSessions: 15,
  });
  const [modifyModal, setModifyModal] = useState<{
    proposal: PendingProposal;
  } | null>(null);
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
    fetchPendingProposals();
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

  const fetchPendingProposals = async () => {
    try {
      setLoadingPending(true);
      const data = await getMyPendingProposals();
      setPendingProposals(data || []);
    } catch (err: any) {
      console.error("Failed to fetch pending proposals:", err);
    } finally {
      setLoadingPending(false);
    }
  };

  const openProposeModal = (id: string, name: string) => {
    setProposeForm({ feePerSession: 200000, totalSessions: 15 });
    setProposeModal({ requestId: id, studentName: name });
  };

  const handlePropose = async () => {
    if (!proposeModal) return;
    setActionLoading(proposeModal.requestId);
    try {
      const result = await proposeToStudent(
        proposeModal.requestId,
        proposeForm.feePerSession,
        proposeForm.totalSessions,
      );
      showToast(result.message || "Đã gửi đề xuất thành công!", "success");
      setRecommendations((prev) =>
        prev.filter((r) => r.id !== proposeModal.requestId)
      );
      setProposeModal(null);
    } catch (err: any) {
      showToast(err.message || "Không thể gửi đề xuất", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await withdrawProposal(id);
      showToast(result.message || "Đã rút đề xuất", "info");
      setPendingProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      showToast(err.message || "Không thể rút đề xuất", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleModify = async () => {
    if (!modifyModal) return;
    setActionLoading(modifyModal.proposal.id);
    try {
      const result = await modifyProposal(
        modifyModal.proposal.id,
        proposeForm.feePerSession,
        proposeForm.totalSessions,
      );
      showToast(result.message || "Đã điều chỉnh đề xuất", "success");
      setModifyModal(null);
      // Tự động làm mới danh sách sau khi điều chỉnh
      fetchPendingProposals();
    } catch (err: any) {
      showToast(err.message || "Không thể điều chỉnh đề xuất", "error");
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
            onClick={() => {
              fetchRecommendations();
              fetchPendingProposals();
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Icon icon="lucide:refresh-cw" fontSize={16} />
            Làm mới
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "new"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Đề xuất mới
            {recommendations.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {recommendations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Đang chờ phản hồi
            {pendingProposals.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {pendingProposals.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "new" && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <Icon icon="lucide:loader-2" className="animate-spin mr-3 text-xl" />
                Đang tải danh sách đề xuất...
              </div>
            )}

            {!loading && recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Icon icon="lucide:inbox" fontSize={56} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-1">Chưa có đề xuất nào</h3>
                <p className="text-sm">Khi học sinh đề xuất bạn làm gia sư, danh sách sẽ hiển thị ở đây</p>
              </div>
            )}

            {!loading &&
              recommendations.map((rec) => (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                        {rec.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{rec.studentName}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                          {rec.gradeLevel && (
                            <span className="flex items-center gap-1"><Icon icon="lucide:graduation-cap" fontSize={14} />{rec.gradeLevel}</span>
                          )}
                          <span className="flex items-center gap-1"><Icon icon="lucide:clock" fontSize={14} />{timeAgo(rec.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Icon icon="lucide:star" fontSize={12} /> Đề xuất gia sư
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Icon icon="lucide:book-open" fontSize={18} className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Môn học</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{rec.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Icon icon="lucide:map-pin" fontSize={18} className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Khu vực</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{rec.preferredArea}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Icon icon="lucide:calendar-clock" fontSize={18} className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lịch học</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{rec.preferredSchedule}</p>
                        </div>
                      </div>
                    </div>

                    {rec.requirements && (
                      <div className="p-3 rounded-lg bg-slate-50">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Yêu cầu thêm</p>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{rec.requirements}</p>
                      </div>
                    )}

                    {(rec.studentPhone || rec.studentEmail) && (
                      <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-slate-50">
                        {rec.studentPhone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Icon icon="lucide:phone" fontSize={14} className="text-slate-400" />
                            {rec.studentPhone}
                          </div>
                        )}
                        {rec.studentEmail && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Icon icon="lucide:mail" fontSize={14} className="text-slate-400" />
                            {rec.studentEmail}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => handleDecline(rec.id)}
                      disabled={actionLoading === rec.id}
                      className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === rec.id ? <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} /> : <Icon icon="lucide:x" fontSize={16} />}
                      Từ chối
                    </button>
                    <button
                      onClick={() => openProposeModal(rec.id, rec.studentName)}
                      disabled={actionLoading === rec.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === rec.id ? <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} /> : <Icon icon="lucide:send" fontSize={16} />}
                      Gửi đề xuất dạy
                    </button>
                  </div>
                </div>
              ))}
          </>
        )}

        {activeTab === "pending" && (
          <>
            {loadingPending && (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <Icon icon="lucide:loader-2" className="animate-spin mr-3 text-xl" />
                Đang tải danh sách đề xuất đang chờ...
              </div>
            )}

            {!loadingPending && pendingProposals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Icon icon="lucide:inbox" fontSize={56} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-1">Không có đề xuất đang chờ</h3>
                <p className="text-sm">Các đề xuất đã gửi cho học sinh và đang chờ phản hồi sẽ hiển thị ở đây</p>
              </div>
            )}

            {!loadingPending &&
              pendingProposals.map((prop) => (
                <div key={prop.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg shrink-0">
                        {prop.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{prop.studentName}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                          {prop.gradeLevel && (
                            <span className="flex items-center gap-1"><Icon icon="lucide:graduation-cap" fontSize={14} />{prop.gradeLevel}</span>
                          )}
                          <span className="flex items-center gap-1"><Icon icon="lucide:clock" fontSize={14} />{timeAgo(prop.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      prop.status === "negotiating"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      <Icon icon="lucide:clock" fontSize={12} />
                      {prop.status === "negotiating" ? "Chờ điều chỉnh" : "Chờ xác nhận"}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <Icon icon="lucide:book-open" fontSize={18} className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Môn học</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{prop.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                        <Icon icon="lucide:dollar-sign" fontSize={18} className="text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Học phí/buổi</p>
                          <p className="text-sm font-semibold text-blue-700 mt-0.5">{prop.proposedFee?.toLocaleString("vi-VN")}đ</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
                        <Icon icon="lucide:layers" fontSize={18} className="text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Số buổi</p>
                          <p className="text-sm font-semibold text-emerald-700 mt-0.5">{prop.proposedSessions} buổi</p>
                        </div>
                      </div>
                    </div>

                    {prop.requirements && (
                      <div className="p-3 rounded-lg bg-slate-50">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Ghi chú</p>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{prop.requirements}</p>
                      </div>
                    )}

                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-800">Tổng chi phí dự kiến</p>
                      <p className="mt-1 text-2xl font-bold text-blue-600">{prop.totalFee?.toLocaleString("vi-VN")}đ</p>
                      <p className="text-xs text-blue-500">{prop.proposedFee?.toLocaleString("vi-VN")}đ × {prop.proposedSessions} buổi</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      {prop.proposedAt
                        ? new Date(prop.proposedAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleWithdraw(prop.id)}
                        disabled={actionLoading === prop.id}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === prop.id ? <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} /> : <Icon icon="lucide:undo-2" fontSize={16} />}
                        Rút đề xuất
                      </button>
                      {prop.status === "negotiating" && (
                        <button
                          onClick={() => setModifyModal({ proposal: prop })}
                          disabled={actionLoading === prop.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Icon icon="lucide:refresh-cw" fontSize={16} />
                          Điều chỉnh đề xuất
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
      </main>

      {/* Propose Modal */}
      {proposeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={() => setProposeModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Gửi đề xuất dạy
              </h3>
              <button
                onClick={() => setProposeModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="lucide:x" fontSize={20} />
              </button>
            </div>

            <p className="mb-5 text-sm text-slate-600">
              Gửi đề xuất học phí và số buổi cho{" "}
              <strong>{proposeModal.studentName}</strong>. Học viên sẽ xem xét
              và xác nhận trước khi lớp được tạo.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Học phí mỗi buổi (VNĐ)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={proposeForm.feePerSession}
                  onChange={(e) =>
                    setProposeForm((prev) => ({
                      ...prev,
                      feePerSession: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Tối thiểu 50.000đ/buổi
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Số buổi học
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={proposeForm.totalSessions}
                  onChange={(e) =>
                    setProposeForm((prev) => ({
                      ...prev,
                      totalSessions: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">
                  Tổng chi phí dự kiến
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {(proposeForm.feePerSession * proposeForm.totalSessions).toLocaleString(
                    "vi-VN"
                  )}
                  đ
                </p>
                <p className="text-xs text-blue-500">
                  {proposeForm.feePerSession.toLocaleString("vi-VN")}đ ×{" "}
                  {proposeForm.totalSessions} buổi
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setProposeModal(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePropose}
                disabled={actionLoading === proposeModal.requestId}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === proposeModal.requestId ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon
                      icon="lucide:loader-2"
                      className="animate-spin"
                      fontSize={16}
                    />
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi đề xuất"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {modifyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={() => setModifyModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Điều chỉnh đề xuất
              </h3>
              <button
                onClick={() => setModifyModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="lucide:x" fontSize={20} />
              </button>
            </div>

            <p className="mb-5 text-sm text-slate-600">
              Học viên{" "}
              <strong>{modifyModal.proposal.studentName}</strong> đã yêu cầu
              điều chỉnh đề xuất. Hãy nhập học phí và số buổi mới.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Học phí mỗi buổi (VNĐ)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={proposeForm.feePerSession}
                  onChange={(e) =>
                    setProposeForm((prev) => ({
                      ...prev,
                      feePerSession: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Số buổi học
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={proposeForm.totalSessions}
                  onChange={(e) =>
                    setProposeForm((prev) => ({
                      ...prev,
                      totalSessions: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">Tổng chi phí mới</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {(proposeForm.feePerSession * proposeForm.totalSessions).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setModifyModal(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleModify}
                disabled={actionLoading === modifyModal.proposal.id}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === modifyModal.proposal.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} />
                    Đang cập nhật...
                  </span>
                ) : (
                  "Cập nhật đề xuất"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
