"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserRole, clearAuth } from "@/lib/auth";
import { getStudentTutors, getAllSubjects, createClassRequest, getStudentProfile } from "@/lib/api";

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
  }, [page, search]);

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

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#0f172a]"
      style={{ fontFamily: "var(--font-family-body)" }}
    >

      <main className="mx-auto w-full max-w-332 px-4 py-6 sm:px-6 lg:px-8">
        <TutorRequestPageHeader />



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
