"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserRole, clearAuth } from "@/lib/auth";
import { getStudentClasses, submitReview, getClassReview, getStudentClassReports, recreateClassRequest } from "@/lib/api/classes.api";
import { Star, Calendar, MapPin, Clock, Award, BookOpen, User, CheckCircle2, AlertCircle, RefreshCw, Loader2, X, FileText } from "lucide-react";
import LearningReportPopup, { LearningReport } from "@/components/common/LearningReportPopup";
import { ClassListSkeleton } from "../_components/StudentSkeletons";
import { TutorDetailModal } from "../_components/TutorDetailModal";
import type { TutorSuggestion } from "../types";

interface ClassItem {
  id: string;
  location: string;
  feePerSession: number;
  totalSessions: number;
  status: string;
  startDate: string;
  endDate: string;
  notes: string;
  subject: {
    id: string;
    name: string;
  };
  tutor: {
    id: string;
    educationLevel: string;
    major: string;
    experience: string;
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  };
  suspendedBy?: {
    id: string;
    fullName: string;
  } | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
}

export default function StudentClassesClient() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [reviews, setReviews] = useState<Record<string, ReviewItem | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State (Review)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reports State
  const [reportsData, setReportsData] = useState<LearningReport[]>([]);
  const [selectedClassForReports, setSelectedClassForReports] = useState<ClassItem | null>(null);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [recreatingClassId, setRecreatingClassId] = useState<string | null>(null);

  const handleRecreateClass = async (classId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng ký học lại lớp học này với gia sư cũ không?")) {
      return;
    }
    setRecreatingClassId(classId);
    try {
      await recreateClassRequest(classId);
      alert("Đăng ký học lại thành công! Yêu cầu ghép lớp học lại của bạn đã được chuyển tới nhân viên duyệt lớp.");
      router.push("/student"); // redirect to dashboard where request history is tracked
    } catch (err: any) {
      alert(err.message || "Đăng ký học lại thất bại. Vui lòng thử lại.");
    } finally {
      setRecreatingClassId(null);
    }
  };

  // Selected tutor for detail modal
  const [selectedTutorForDetail, setSelectedTutorForDetail] = useState<TutorSuggestion | null>(null);

  const handleOpenTutorDetail = (tutor: any) => {
    if (!tutor) return;
    const mappedTutor: TutorSuggestion = {
      id: tutor.id,
      name: tutor.user?.fullName || "Gia sư",
      avatar: tutor.avatarUrl || "https://randomuser.me/api/portraits/women/1.jpg",
      match: 95,
      experience: tutor.experience || "Chưa cập nhật",
      education: [tutor.educationLevel, tutor.major].filter(Boolean).join(" · ") || "Chưa cập nhật",
      location: tutor.availableAreas || "Toàn quốc",
      price: "Thỏa thuận",
      rating: 5,
      reviews: 0,
      teachingMode: "Linh hoạt",
      availableTime: "Linh hoạt",
      phone: tutor.user?.phone || "",
      email: tutor.user?.email || "",
      bio: tutor.bio || "Chưa cập nhật giới thiệu.",
      tags: [],
    };
    setSelectedTutorForDetail(mappedTutor);
  };

  // Auth protection
  const loggedIn = isLoggedIn();
  const userRole = getUserRole();

  useEffect(() => {
    if (!loggedIn || userRole !== "student") {
      clearAuth();
      window.location.replace("/login");
    }
  }, [loggedIn, userRole]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentClasses();
      setClasses(data);

      // Load reviews for completed/active classes
      const reviewsMap: Record<string, ReviewItem | null> = {};
      await Promise.all(
        data.map(async (cls: ClassItem) => {
          try {
            const review = await getClassReview(cls.id);
            reviewsMap[cls.id] = review;
          } catch {
            reviewsMap[cls.id] = null;
          }
        })
      );
      setReviews(reviewsMap);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn() && getUserRole() === "student") {
      loadData();
    }
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenReviewModal = (cls: ClassItem) => {
    setSelectedClass(cls);
    setRating(5);
    setComment("");
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenReports = async (cls: ClassItem) => {
    setSelectedClassForReports(cls);
    setIsReportsOpen(true);
    setIsReportsLoading(true);
    setReportsError(null);
    try {
      const data = await getStudentClassReports(cls.id);
      setReportsData(data);
    } catch (err: any) {
      setReportsError(err.message || "Không thể tải báo cáo học tập");
      setReportsData([]);
    } finally {
      setIsReportsLoading(false);
    }
  };

  const handleCloseReports = () => {
    setIsReportsOpen(false);
    setSelectedClassForReports(null);
    setReportsData([]);
    setReportsError(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newReview = await submitReview({
        classId: selectedClass.id,
        rating,
        comment,
      });

      // Update local state
      setReviews((prev) => ({
        ...prev,
        [selectedClass.id]: newReview,
      }));

      handleCloseReviewModal();
    } catch (err: any) {
      setSubmitError(err.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang học
          </span>
        );
      case "pending":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-2.5 py-1 text-xs font-semibold text-[#b45309] border border-[#fde68a]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ xử lý
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} />
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <X size={12} />
            Đã hủy
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <AlertCircle size={12} />
            Tạm dừng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (!mounted) return <ClassListSkeleton />;

  if (!isLoggedIn() || getUserRole() !== "student") return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
              Lớp học của tôi
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              Theo dõi danh sách các lớp học đang tham gia, lịch giảng dạy và thực hiện đánh giá chất lượng gia sư.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm hover:bg-[#f8fafc] active:scale-95 transition-all disabled:opacity-60 shrink-0"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <ClassListSkeleton count={4} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center shadow-sm">
            <AlertCircle size={32} className="text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rose-800">Đã xảy ra lỗi</h3>
            <p className="mt-1 text-sm text-rose-600">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-md shadow-rose-200"
            >
              Thử lại
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#0b5fff]/10 flex items-center justify-center text-[#0b5fff] mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">Chưa có lớp học nào</h3>
            <p className="mt-1 text-sm text-[#64748b] max-w-sm mx-auto">
              Bạn chưa có lớp học nào đang diễn ra hoặc đã kết thúc. Hãy gửi yêu cầu tìm gia sư ngay hôm nay!
            </p>
            <button
              onClick={() => router.push("/student")}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5fff] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 shadow-md shadow-blue-200 transition-all"
            >
              Gửi yêu cầu tìm gia sư
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => {
              const isPending = cls.status === "pending" || cls.status === "processing";
              const hasTutor = !!cls.tutor;
              const review = reviews[cls.id];
              return (
                <div
                  key={cls.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div>
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="inline-block rounded-lg bg-[#0b5fff]/10 px-2.5 py-1 text-xs font-bold text-[#0b5fff] mb-2">
                          {cls.subject.name}
                        </span>
                        <h3 className="text-lg font-bold text-[#0f172a]">
                          {isPending 
                            ? (hasTutor ? `Yêu cầu đề xuất: ${cls.tutor.user.fullName}` : "Yêu cầu tìm gia sư mới")
                            : `Lớp học với ${cls.tutor?.user?.fullName || "Gia sư"}`}
                        </h3>
                      </div>
                      {getStatusBadge(cls.status)}
                    </div>

                    <p className="text-xs text-[#64748b] mb-4 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      {hasTutor 
                        ? `${cls.tutor.educationLevel} · ${cls.tutor.major}` 
                        : "Đang chờ nhân viên xếp lớp"}
                    </p>

                    <div className="h-px bg-slate-100 my-4" />

                    {/* Class Details */}
                    <div className="space-y-3 text-sm text-[#475569]">
                      <div className="flex items-center gap-2.5">
                        <MapPin size={16} className="text-[#64748b] shrink-0" />
                        <span className="truncate">{cls.location || "Chưa cập nhật địa điểm"}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Calendar size={16} className="text-[#64748b] shrink-0" />
                        <span>
                          {isPending ? "Thời gian đề xuất: " : ""}
                          {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "Chưa bắt đầu"}
                          {!isPending && ` - ${cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "Chưa kết thúc"}`}
                        </span>
                      </div>
                      {!isPending && (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Clock size={16} className="text-[#64748b] shrink-0" />
                            <span>Tổng số: {cls.totalSessions} buổi</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="font-semibold text-xs text-[#64748b] w-4 text-center">₫</div>
                            <span>
                              Học phí:{" "}
                              <strong className="text-[#0b5fff]">
                                {cls.feePerSession?.toLocaleString("vi-VN")}đ
                              </strong>{" "}
                              / buổi
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {cls.notes && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-[#64748b] leading-relaxed border border-slate-100">
                        <strong>Yêu cầu / Ghi chú:</strong> {cls.notes}
                      </div>
                    )}

                    {cls.status === "suspended" && (
                      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 leading-relaxed border border-amber-200/60 flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <strong>Lớp học tạm dừng:</strong> Lớp học này đã bị tạm dừng bởi nhân viên{" "}
                          <span className="font-bold">{cls.suspendedBy?.fullName || "Quản trị viên"}</span> (ID:{" "}
                          <span className="font-mono">{cls.suspendedBy?.id ? cls.suspendedBy.id.slice(0, 8) : "ADMIN"}</span>).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    {isPending ? (
                      hasTutor ? (
                        <button
                          onClick={() => handleOpenTutorDetail(cls.tutor)}
                          className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b5fff] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 active:scale-95 shadow-md shadow-blue-200 transition-all cursor-pointer"
                        >
                          <User size={15} />
                          Xem hồ sơ & Lịch gia sư đề xuất
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
                        >
                          Đang chờ trung tâm đề xuất gia sư
                        </button>
                      )
                    ) : (
                      <>
                        {/* View Reports Button */}
                        <button
                          onClick={() => handleOpenReports(cls)}
                          className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                        >
                          <FileText size={15} className="text-[#0b5fff]" />
                          Xem báo cáo học tập
                        </button>

                        {review ? (
                          // Display Submitted Review
                          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-semibold text-[#15803d] flex items-center gap-1">
                                <CheckCircle2 size={13} /> Bạn đã đánh giá
                              </span>
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    fill={i < review.rating ? "currentColor" : "transparent"}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-[#166534] italic font-medium leading-relaxed">
                                &ldquo;{review.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          // Add Review Button
                          (cls.status === "completed" || cls.status === "active") && (
                            <button
                              onClick={() => handleOpenReviewModal(cls)}
                              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b5fff] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 active:scale-95 shadow-md shadow-blue-200 transition-all cursor-pointer"
                            >
                              <Star size={15} fill="currentColor" />
                              Đánh giá gia sư này
                            </button>
                          )
                        )}

                        {(cls.status === "cancelled" || cls.status === "completed") && (
                          <button
                            disabled={recreatingClassId === cls.id}
                            onClick={() => handleRecreateClass(cls.id)}
                            className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {recreatingClassId === cls.id ? (
                              <>
                                <Loader2 size={15} className="animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={15} />
                                Đăng ký học lại với Gia sư này
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0f172a]">Đánh giá gia sư</h3>
              <button
                onClick={handleCloseReviewModal}
                className="rounded-lg p-1.5 text-[#64748b] hover:bg-slate-100 hover:text-[#0f172a] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-xs text-[#64748b] uppercase font-semibold tracking-wider">Gia sư</p>
                <p className="text-sm font-bold text-[#0f172a] mt-0.5">
                  {selectedClass.tutor.user.fullName}
                </p>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Môn học: {selectedClass.subject.name}
                </p>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                  Đánh giá chất lượng (1-5 sao)
                </label>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    const isFilled = hoverRating !== null ? starVal <= hoverRating : starVal <= rating;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-amber-400 hover:scale-110 active:scale-95 transition-transform p-0.5 border-none bg-transparent cursor-pointer"
                      >
                        <Star size={32} fill={isFilled ? "currentColor" : "transparent"} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                  Ý kiến phản hồi / Nhận xét khác
                </label>
                <textarea
                  required
                  placeholder="Nhập ý kiến nhận xét của bạn về phương pháp giảng dạy, sự tận tình, kỹ năng truyền đạt của gia sư..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-24 w-full resize-none rounded-xl border border-[#e2e8f0] bg-white p-3 text-sm text-[#0f172a] outline-none focus:border-[#0b5fff] transition-colors placeholder:text-[#94a3b8]"
                />
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#475569] hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5fff] px-5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md shadow-blue-200 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>Gửi đánh giá</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports Popup */}
      {isReportsOpen && selectedClassForReports && (
        <LearningReportPopup
          reports={reportsData}
          isLoading={isReportsLoading}
          error={reportsError}
          title={`Báo cáo học tập`}
          subtitle={`Lớp: ${selectedClassForReports.subject.name} - ${selectedClassForReports.tutor.user.fullName}`}
          onClose={handleCloseReports}
        />
      )}

      {/* Tutor Detail Modal */}
      <TutorDetailModal
        tutor={selectedTutorForDetail}
        onClose={() => setSelectedTutorForDetail(null)}
      />
    </div>
  );
}
