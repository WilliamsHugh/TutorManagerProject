"use client";

import { useState, useEffect } from "react";
import ClassCard from "@/components/common/ClassCard";
import ListingLayout from "@/components/common/ListingLayout";
import { ClassListing } from "@/types/class";
import { getPublicClasses } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import PublicClassDetailModal from "@/components/common/PublicClassDetailModal";

const CLASS_FILTERS = [
  {
    id: "subject",
    label: "Môn học",
    options: [
      { label: "Toán" },
      { label: "Tiếng Anh" },
      { label: "Vật Lý" },
      { label: "Hóa Học" },
      { label: "Ngữ Văn" },
    ],
  },
  {
    id: "level",
    label: "Cấp học",
    options: [
      { label: "Cấp 1 (Tiểu học)" },
      { label: "Cấp 2 (THCS)" },
      { label: "Cấp 3 (THPT)" },
      { label: "Luyện thi Đại học" },
      { label: "Chứng chỉ (IELTS, TOEIC)" },
    ],
  },
  {
    id: "mode",
    label: "Hình thức học",
    options: [
      { label: "Học trực tuyến (Online)" },
      { label: "Học trực tiếp (Offline)" },
    ],
  },
];

const CLASS_SORT_OPTIONS = ["Mới nhất", "Lương cao nhất", "Lương thấp nhất"];

export default function PublicClassesClient() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState(CLASS_SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const [items, setItems] = useState<ClassListing[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail modal state
  const [selectedClass, setSelectedClass] = useState<ClassListing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewClassDetail = (cls: ClassListing) => {
    setSelectedClass(cls);
    setShowDetailModal(true);
  };

  const toggleFilter = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const subject = Object.keys(checked)
      .filter((k) => k.startsWith("subject:") && checked[k])
      .map((k) => k.replace("subject:", ""))
      .join(",");

    const mode = Object.keys(checked)
      .filter((k) => k.startsWith("mode:") && checked[k])
      .map((k) => k.replace("mode:", ""))
      .join(",");

    getPublicClasses({ search: debouncedSearch, subject, mode, page: currentPage })
      .then((res) => {
        setItems(res.data ?? []);
        setTotalItems(res.meta?.total ?? 0);
        setTotalPages(Math.ceil((res.meta?.total ?? 0) / (res.meta?.limit ?? 12)) || 1);
      })
      .catch((err) => setError(err.message || "Không thể tải danh sách lớp học"))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, checked, sort, currentPage]);

  return (
    <>
      <ListingLayout
        heroTitle="Danh Sách Lớp Học Mới"
        heroDescription="Cập nhật liên tục các lớp học đang tìm kiếm gia sư. Đăng ký nhận lớp ngay hôm nay để bắt đầu hành trình giảng dạy của bạn."
        items={items}
        isLoading={isLoading}
        error={error}
        totalItems={totalItems}
        totalPages={totalPages}
        entityName="lớp chờ gia sư"
        filtersConfig={CLASS_FILTERS}
        sortOptions={CLASS_SORT_OPTIONS}
        sort={sort}
        setSort={setSort}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        search={search}
        setSearch={setSearch}
        checked={checked}
        toggleFilter={toggleFilter}
        renderItem={(cls) => (
          <ClassCard
            key={cls.id}
            cls={cls}
            onViewDetail={() => handleViewClassDetail(cls)}
          />
        )}
      />

      {/* Class Detail Modal */}
      {showDetailModal && (
        <PublicClassDetailModal
          classItem={selectedClass}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClass(null);
          }}
        />
      )}
    </>
  );
}
