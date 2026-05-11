"use client";

import { useMemo, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUserRole } from "@/lib/auth";

import { TutorRequestForm } from "./components/TutorRequestForm";
import { TutorRequestPageHeader } from "./components/TutorRequestPageHeader";
import { TutorSuggestionsPanel } from "./components/TutorSuggestionsPanel";
import Header from "../../../components/Header";
import { tutors } from "./data";

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

  // Auth protection
  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== "student") {
      router.replace("/login");
    }
  }, [router]);

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
  }, [search]);

  const selectedTags = [
    subject || "Toán học",
    level || "Lớp 10",
    area || "Quận 1",
    schedule || "Học tối",
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (!isLoggedIn()) return null;

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#0f172a]"
      style={{ fontFamily: "var(--font-family-body)" }}
    >
      <Header />

      <main className="mx-auto w-full max-w-[1328px] px-4 py-6 sm:px-6 lg:px-8">
        <TutorRequestPageHeader />

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
          />
        </div>
      </main>
    </div>
  );
}
