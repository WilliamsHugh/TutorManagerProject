"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { isLoggedIn, getUserRole, clearAuth } from "@/lib/auth";
import {
  getStudentTutors,
  getAllSubjects,
  createClassRequest,
  getStudentProfile,
  getStudentProposals,
  confirmProposal,
  declineProposal,
  counterProposal,
} from "@/lib/api";

import type { TutorSuggestion } from "./types";
import { TutorRequestForm } from "./_components/TutorRequestForm";
import { TutorRequestPageHeader } from "./_components/TutorRequestPageHeader";
import { TutorSuggestionsPanel } from "./_components/TutorSuggestionsPanel";
import { AlertWindow } from "./_components/AlertWindow";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [school, setSchool] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tutors, setTutors] = useState<TutorSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Student info for API calls
  const [studentId, setStudentId] = useState<string | null>(null);
  const [dbSubjects, setDbSubjects] = useState<{ id: string; name: string }[]>([]);
  const [vnProvinces, setVnProvinces] = useState<any[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [recommendedTutorIds, setRecommendedTutorIds] = useState<string[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
  });

  const triggerAlert = useCallback((message: string, type: "success" | "error" | "warning" = "warning") => {
    let title = "Thông báo";
    if (type === "success") title = "Thành công";
    if (type === "error") title = "Lỗi xảy ra";
    if (type === "warning") title = "Cảnh báo";
    
    const cleanMsg = message.replace(/^[⚠️✅❌]\s*/, "");
    
    setAlertConfig({
      isOpen: true,
      title,
      message: cleanMsg,
      type,
    });
  }, []);

  // Proposals state (đề xuất từ gia sư chờ xác nhận)
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [counterModal, setCounterModal] = useState<any | null>(null);
  const [counterNote, setCounterNote] = useState("");
  const [proposalToast, setProposalToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"request" | "proposals">("request");

  // Auth protection
  const loggedIn = isLoggedIn();
  const userRole = getUserRole();

  useEffect(() => {
    if (!loggedIn || userRole !== "student") {
      clearAuth();
      window.location.replace("/login");
    }
  }, [loggedIn, userRole]);

  // Fetch student profile, subjects, and Vietnam provinces list
  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== "student") return;
    async function init() {
      try {
        // Fetch subjects to build name→id map
        const subjects = await getAllSubjects();
        setDbSubjects(subjects);
        const map: Record<string, string> = {};
        for (const s of subjects) {
          map[s.name] = s.id;
        }
        setSubjectMap(map);
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }

      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=2");
        if (res.ok) {
          const data = await res.json();
          setVnProvinces(data);
        }
      } catch (err) {
        console.error("Failed to load Vietnam provinces:", err);
      }

      try {
        const profile = await getStudentProfile();
        if (profile?.id) {
          setStudentId(profile.id);
        }
      } catch (err) {
        console.error("Failed to load student profile:", err);
      }
    }
    init();
  }, []);

  // Restore recommended tutors from localStorage
  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== "student") return;
    if (studentId) {
      const saved = localStorage.getItem(`recommended_tutors_${studentId}`);
      if (saved) {
        try {
          setRecommendedTutorIds(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [studentId]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 5;

  // Fetch tutors from API when page or search changes
  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== "student") return;
    async function fetchTutors() {
      try {
        setLoading(true);
        const result = await getStudentTutors({
          page,
          limit: LIMIT,
          search: search.trim() || undefined
        });
        setTutors(result.data);
        setTotalPages(result.meta?.totalPages || Math.ceil((result.meta?.total || 0) / LIMIT) || 1);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTutors();

    // Fetch pending proposals
    async function fetchProposals() {
      try {
        setProposalsLoading(true);
        const data = await getStudentProposals();
        setProposals(data || []);
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
      } finally {
        setProposalsLoading(false);
      }
    }
    fetchProposals();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1); // reset to page 1 on new search
  };

  const combinedArea = useMemo(() => {
    return district && province ? `${district}, ${province}` : "";
  }, [district, province]);

  const selectedTags = [
    subject || "Toán học",
    level || "Lớp 10",
    combinedArea || "Quận 1, TP. Hồ Chí Minh",
    schedule || "Học tối",
  ];

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subject || !level || !province || !district || !schedule) {
      setSubmitted(true);
      triggerAlert("Vui lòng điền đầy đủ các thông tin bắt buộc.", "warning");
      return;
    }

    const subjectId = subjectMap[subject];
    if (!subjectId) {
      triggerAlert("Môn học không hợp lệ. Vui lòng chọn lại.", "warning");
      return;
    }

    if (!studentId) {
      triggerAlert("Không tìm thấy thông tin học viên. Vui lòng đăng nhập lại.", "error");
      return;
    }

    setSubmitting(true);
    setSubmitted(true);

    try {
      const payload = {
        studentId,
        subjectId,
        preferredArea: combinedArea || undefined,
        preferredSchedule: schedule || undefined,
        requirements: [
          level ? `Cấp học: ${level}` : "",
          school ? `Trường: ${school}` : "",
          note ? `Yêu cầu: ${note}` : "",
        ]
          .filter(Boolean)
          .join("\n") || undefined,
      };

      await createClassRequest(payload);
      triggerAlert("Yêu cầu tìm gia sư đã được gửi thành công! Nhân viên trung tâm sẽ liên hệ với bạn sớm nhất.", "success");
      
      // Clear form states on success
      setSubject("");
      setLevel("");
      setSchool("");
      setProvince("");
      setDistrict("");
      setSchedule("");
      setNote("");
      setSubmitted(false);
    } catch (err: any) {
      triggerAlert(err?.message || "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.", "error");
      console.error("Submit request error:", err);
    } finally {
      setSubmitting(false);
    }
  }, [subject, level, province, district, schedule, subjectMap, studentId, combinedArea, school, note, triggerAlert]);

  const handleRecommendTutor = useCallback(async (tutor: TutorSuggestion) => {
    if (!subject || !level || !province || !district || !schedule) {
      setSubmitted(true);
      
      // Alert and scroll to form area
      triggerAlert("Vui lòng điền đầy đủ các thông tin bắt buộc (Môn học, Cấp học, Khu vực, Lịch học) ở Form đăng ký bên trái trước khi đề xuất gia sư.", "warning");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const subjectId = subjectMap[subject];
    if (!subjectId) {
      triggerAlert("Môn học không hợp lệ. Vui lòng chọn lại.", "warning");
      return;
    }

    if (!studentId) {
      triggerAlert("Không tìm thấy thông tin học viên. Vui lòng đăng nhập lại.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const tutorId = typeof tutor.id === 'string' ? tutor.id : String(tutor.id);
      const payload = {
        studentId,
        subjectId,
        preferredTutorId: tutorId,
        preferredArea: combinedArea || undefined,
        preferredSchedule: schedule || undefined,
        requirements: [
          level ? `Cấp học: ${level}` : '',
          school ? `Trường: ${school}` : '',
          note ? `Yêu cầu: ${note}` : '',
          `Đề xuất gia sư: ${tutor.name}`,
        ]
          .filter(Boolean)
          .join('\n') || undefined,
      };

      await createClassRequest(payload);
      triggerAlert(`Đã gửi yêu cầu và đề xuất gia sư ${tutor.name} thành công!`, "success");
      setRecommendedTutorIds((prev) => {
        const next = [...prev, tutorId];
        localStorage.setItem(`recommended_tutors_${studentId}`, JSON.stringify(next));
        return next;
      });
      
      // Clear form states on success
      setSubject("");
      setLevel("");
      setSchool("");
      setProvince("");
      setDistrict("");
      setSchedule("");
      setNote("");
      setSubmitted(false);
    } catch (err: any) {
      triggerAlert(err?.message || "Có lỗi xảy ra khi đề xuất gia sư. Vui lòng thử lại.", "error");
    } finally {
      setSubmitting(false);
    }
  }, [subject, level, province, district, schedule, subjectMap, studentId, combinedArea, school, note, triggerAlert]);

  if (!isLoggedIn() || getUserRole() !== "student") {
    return null;
  }

  const handleDeclineProposal = async (requestId: string) => {
    setDecliningId(requestId);
    try {
      const result = await declineProposal(requestId);
      setProposalToast({
        message: result.message || "Đã từ chối đề xuất của gia sư",
        type: "info",
      });
      setProposals((prev) => prev.filter((p: any) => p.id !== requestId));
      setTimeout(() => setProposalToast(null), 5000);
    } catch (err: any) {
      setProposalToast({
        message: err.message || "Không thể từ chối đề xuất",
        type: "error",
      });
      setTimeout(() => setProposalToast(null), 5000);
    } finally {
      setDecliningId(null);
    }
  };

  const openCounterModal = (prop: any) => {
    setCounterModal(prop);
    setCounterNote("");
  };

  const handleCounterProposal = async () => {
    if (!counterModal || !counterNote.trim()) return;
    setDecliningId(counterModal.id);
    try {
      const result = await counterProposal(counterModal.id, counterNote);
      setProposalToast({
        message: result.message || "Đã gửi yêu cầu điều chỉnh",
        type: "info",
      });
      setProposals((prev) => prev.filter((p: any) => p.id !== counterModal.id));
      setCounterModal(null);
      setCounterNote("");
      setTimeout(() => setProposalToast(null), 5000);
    } catch (err: any) {
      setProposalToast({
        message: err.message || "Không thể gửi yêu cầu điều chỉnh",
        type: "error",
      });
      setTimeout(() => setProposalToast(null), 5000);
    } finally {
      setDecliningId(null);
    }
  };

  const handleConfirmProposal = async (requestId: string) => {
    setConfirmingId(requestId);
    try {
      const result = await confirmProposal(requestId);
      setProposalToast({
        message: result.message || "Đã xác nhận đề xuất thành công!",
        type: "success",
      });
      setProposals((prev) => prev.filter((p: any) => p.id !== requestId));
      setTimeout(() => setProposalToast(null), 5000);
    } catch (err: any) {
      setProposalToast({
        message: err.message || "Không thể xác nhận đề xuất",
        type: "error",
      });
      setTimeout(() => setProposalToast(null), 5000);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#0f172a]"
      style={{ fontFamily: "var(--font-family-body)" }}
    >
      <main className="mx-auto w-full max-w-332 px-4 py-6 sm:px-6 lg:px-8">
        <TutorRequestPageHeader />

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("request")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "request"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Tìm gia sư
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "proposals"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Đề xuất từ gia sư
            {proposals.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {proposals.length}
              </span>
            )}
          </button>
        </div>

        {/* Proposal Toast */}
        {proposalToast && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
              proposalToast.type === "success"
                ? "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
                : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
            }`}
          >
            {proposalToast.type === "success" ? "✅ " : "❌ "}
            {proposalToast.message}
          </div>
        )}




        {activeTab === "request" ? (
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <TutorRequestForm
              province={province}
              district={district}
              level={level}
              note={note}
              school={school}
              schedule={schedule}
              subject={subject}
              submitted={submitted}
              subjectsList={dbSubjects}
              provincesList={vnProvinces}
              onProvinceChange={setProvince}
              onDistrictChange={setDistrict}
              onLevelChange={setLevel}
              onNoteChange={setNote}
              onSchoolChange={setSchool}
              onScheduleChange={setSchedule}
              onSubjectChange={setSubject}
              onSubmit={handleSubmit}
            />

            <TutorSuggestionsPanel
              search={search}
              selectedTags={selectedTags}
              tutors={tutors}
              onSearchChange={handleSearchChange}
              loading={loading}
              onRecommendTutor={handleRecommendTutor}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              subjectsList={dbSubjects}
              provincesList={vnProvinces}
              recommendedTutorIds={recommendedTutorIds}
            />
          </div>
        ) : (
          /* Proposals Tab */
          <div className="space-y-4">
            {proposalsLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Icon icon="lucide:loader-2" className="animate-spin mr-2" fontSize={20} />
                Đang tải đề xuất...
              </div>
            ) : proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
                <Icon icon="lucide:inbox" fontSize={48} className="text-slate-300 mb-3" />
                <p className="text-sm">Chưa có đề xuất nào từ gia sư</p>
              </div>
            ) : (
              proposals.map((prop: any) => (
                <div
                  key={prop.id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex items-start justify-between p-5 border-b border-slate-100">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {prop.tutorName}{" "}
                        <span className="font-normal text-slate-500">
                          đề xuất dạy
                        </span>{" "}
                        {prop.subject}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Icon icon="lucide:map-pin" fontSize={12} />
                        {prop.preferredArea}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                      <Icon icon="lucide:clock" fontSize={12} />
                      Chờ xác nhận
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Học phí/buổi
                      </p>
                      <p className="mt-1 text-lg font-bold text-blue-600">
                        {prop.proposedFee?.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Số buổi
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {prop.proposedSessions}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Tổng chi phí
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        {prop.totalFee?.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-5 py-3 bg-white border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      {prop.proposedAt
                        ? new Date(prop.proposedAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCounterModal(prop)}
                        disabled={confirmingId === prop.id || decliningId === prop.id}
                        className="flex items-center gap-2 rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Icon icon="lucide:edit" fontSize={16} />
                        Yêu cầu sửa
                      </button>
                      <button
                        onClick={() => handleDeclineProposal(prop.id)}
                        disabled={confirmingId === prop.id || decliningId === prop.id}
                        className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {decliningId === prop.id ? (
                          <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} />
                        ) : (
                          <Icon icon="lucide:x" fontSize={16} />
                        )}
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleConfirmProposal(prop.id)}
                        disabled={confirmingId === prop.id || decliningId === prop.id}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {confirmingId === prop.id ? (
                          <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} />
                        ) : (
                          <Icon icon="lucide:check-circle" fontSize={16} />
                        )}
                        Đồng ý & tạo lớp
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Counter-offer Modal */}
        {counterModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={() => setCounterModal(null)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Yêu cầu điều chỉnh đề xuất
                </h3>
                <button
                  onClick={() => setCounterModal(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Icon icon="lucide:x" fontSize={20} />
                </button>
              </div>

              <p className="mb-5 text-sm text-slate-600">
                Gửi yêu cầu điều chỉnh cho{" "}
                <strong>{counterModal.tutorName}</strong> về mức học phí hoặc số
                buổi học phù hợp hơn.
              </p>

              <div className="rounded-lg bg-slate-50 p-4 mb-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Đề xuất hiện tại
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {counterModal.proposedFee?.toLocaleString("vi-VN")}đ/buổi ×{" "}
                  {counterModal.proposedSessions} buổi =
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {counterModal.totalFee?.toLocaleString("vi-VN")}đ
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Ghi chú yêu cầu điều chỉnh
                </label>
                <textarea
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="Ví dụ: Em mong muốn học phí khoảng 150.000đ/buổi hoặc rút xuống còn 10 buổi..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setCounterModal(null)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCounterProposal}
                  disabled={!counterNote.trim() || decliningId === counterModal.id}
                  className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {decliningId === counterModal.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon icon="lucide:loader-2" className="animate-spin" fontSize={16} />
                      Đang gửi...
                    </span>
                  ) : (
                    "Gửi yêu cầu điều chỉnh"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submitting overlay */}
        {submitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50">
            <div className="rounded-lg bg-white px-8 py-6 text-center shadow-xl">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#0b5fff]" />
              <p className="text-sm font-medium text-[#0f172a]">
                Đang gửi yêu cầu tìm gia sư...
              </p>
            </div>
          </div>
        )}

        <AlertWindow
          isOpen={alertConfig.isOpen}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        />
      </main>
    </div>
  );
}
