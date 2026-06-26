"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserRole } from "@/lib/auth";
import { getStudentTutors, getAllSubjects, createClassRequest, getStudentProfile } from "@/lib/api";

import type { TutorSuggestion } from "./types";
import { TutorRequestForm } from "./_components/TutorRequestForm";
import { TutorRequestPageHeader } from "./_components/TutorRequestPageHeader";
import { TutorSuggestionsPanel } from "./_components/TutorSuggestionsPanel";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [school, setSchool] = useState("");
  const [area, setArea] = useState("");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tutors, setTutors] = useState<TutorSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Student info for API calls
  const [studentId, setStudentId] = useState<string | null>(null);
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recommendSuccess, setRecommendSuccess] = useState<string | null>(null);

  // Auth protection
  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== "student") {
      router.replace("/login");
    }
  }, [router]);

  // Fetch student profile (for studentId) and subjects (for name→id mapping)
  useEffect(() => {
    async function init() {
      try {
        // Fetch subjects to build name→id map
        const subjects = await getAllSubjects();
        const map: Record<string, string> = {};
        for (const s of subjects) {
          map[s.name] = s.id;
        }
        setSubjectMap(map);
      } catch (err) {
        console.error("Failed to load subjects:", err);
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

  // Fetch tutors from API
  useEffect(() => {
    async function fetchTutors() {
      try {
        setLoading(true);
        const result = await getStudentTutors({ limit: 20 });
        setTutors(result.data);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTutors();
  }, []);

  const filteredTutors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tutors;

    return tutors.filter((tutor) => {
      const searchable = [
        tutor.name,
        tutor.experience,
        tutor.education,
        ...tutor.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [search, tutors]);

  const selectedTags = [
    subject || "Toán học",
    level || "Lớp 10",
    area || "Quận 1",
    schedule || "Học tối",
  ];

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!subject) {
      setSubmitted(true);
      return;
    }

    const subjectId = subjectMap[subject];
    if (!subjectId) {
      setSubmitError("Môn học không hợp lệ. Vui lòng chọn lại.");
      return;
    }

    if (!studentId) {
      setSubmitError("Không tìm thấy thông tin học viên. Vui lòng đăng nhập lại.");
      return;
    }

    setSubmitting(true);
    setSubmitted(true);

    try {
      const payload = {
        studentId,
        subjectId,
        preferredArea: area || undefined,
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
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.");
      console.error("Submit request error:", err);
    } finally {
      setSubmitting(false);
    }
  }, [subject, subjectMap, studentId, area, schedule, level, school, note]);

  const handleRecommendTutor = useCallback(async (tutor: TutorSuggestion) => {
    setRecommendSuccess(null);
    setSubmitError(null);

    if (!subject) {
      setSubmitError('Vui lòng chọn môn học trước khi đề xuất gia sư.');
      return;
    }

    const subjectId = subjectMap[subject];
    if (!subjectId) {
      setSubmitError('Môn học không hợp lệ. Vui lòng chọn lại.');
      return;
    }

    if (!studentId) {
      setSubmitError('Không tìm thấy thông tin học viên. Vui lòng đăng nhập lại.');
      return;
    }

    setSubmitting(true);
    try {
      const tutorId = typeof tutor.id === 'string' ? tutor.id : String(tutor.id);
      const payload = {
        studentId,
        subjectId,
        preferredTutorId: tutorId,
        preferredArea: area || undefined,
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
      setRecommendSuccess(`Đã gửi yêu cầu và đề xuất gia sư ${tutor.name} thành công!`);
      setTimeout(() => setRecommendSuccess(null), 5000);
    } catch (err: any) {
      setSubmitError(err?.message || 'Có lỗi xảy ra khi đề xuất gia sư. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }, [subject, subjectMap, studentId, area, schedule, level, school, note]);

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#0f172a]"
      style={{ fontFamily: "var(--font-family-body)" }}
    >

      <main className="mx-auto w-full max-w-332 px-4 py-6 sm:px-6 lg:px-8">
        <TutorRequestPageHeader />

        {/* Success banner - submit */}
        {submitSuccess && (
          <div className="mb-6 rounded-lg border border-[#bbf7d0] bg-[#dcfce7] px-4 py-3 text-sm font-medium text-[#166534]">
            ✅ Yêu cầu tìm gia sư đã được gửi thành công! Nhân viên trung tâm sẽ liên hệ với bạn sớm nhất.
          </div>
        )}

        {/* Success banner - recommend */}
        {recommendSuccess && (
          <div className="mb-6 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#166534]">
            ✅ {recommendSuccess}
          </div>
        )}

        {/* Error banner */}
        {submitError && (
          <div className="mb-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#991b1b]">
            ❌ {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <TutorRequestForm
            area={area}
            level={level}
            note={note}
            school={school}
            schedule={schedule}
            subject={subject}
            submitted={submitted}
            onAreaChange={setArea}
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
            tutors={filteredTutors}
            onSearchChange={setSearch}
            loading={loading}
            onRecommendTutor={handleRecommendTutor}
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
      </main>
    </div>
  );
}
