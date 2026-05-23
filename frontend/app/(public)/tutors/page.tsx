"use client";

import { useState, useEffect } from "react";
import TutorCard from "@/components/common/TutorCard";
import ListingLayout from "@/components/common/ListingLayout";
import { Tutor } from "@/types/tutor";
import { getPublicTutors } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";

const TUTOR_FILTERS = [
  {
    id: "subject", label: "Môn học",
    options: [
      { label: "Toán" }, { label: "Tiếng Anh" },
      { label: "Vật Lý" }, { label: "Hóa Học" },
      { label: "Ngữ Văn" },
    ],
  },
  {
    id: "level", label: "Cấp học",
    options: [
      { label: "Cấp 1 (Tiểu học)" }, { label: "Cấp 2 (THCS)" },
      { label: "Cấp 3 (THPT)" }, { label: "Luyện thi Đại học" },
      { label: "Chứng chỉ (IELTS, TOEIC)" },
    ],
  },
  {
    id: "mode", label: "Hình thức học",
    options: [
      { label: "Học trực tuyến (Online)" },
      { label: "Học trực tiếp (Offline)" },
    ],
  },
];

const TUTOR_SORT_OPTIONS = [
  "Đánh giá cao nhất",
  "Giá thấp nhất",
  "Giá cao nhất",
  "Nhiều đánh giá nhất",
];

export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState(TUTOR_SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const [items, setItems] = useState<Tutor[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFilter = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const subject = Object.keys(checked)
      .filter((k) => k.startsWith("subject:") && checked[k])
      .map((k) => k.replace("subject:", ""))
      .join(",");

    getPublicTutors({ search: debouncedSearch, subject, page: currentPage })
      .then((res) => {
        setItems(res.data ?? []);
        setTotalItems(res.meta?.total ?? 0);
        setTotalPages(Math.ceil((res.meta?.total ?? 0) / (res.meta?.limit ?? 12)) || 1);
      })
      .catch((err) => setError(err.message || "Không thể tải danh sách gia sư"))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, checked, sort, currentPage]);

  return (
    <ListingLayout
      heroTitle="Tìm Gia Sư Phù Hợp"
      heroDescription="Hàng ngàn gia sư chất lượng cao đang sẵn sàng đồng hành cùng bạn trên con đường chinh phục tri thức."
      items={items}
      isLoading={isLoading}
      error={error}
      totalItems={totalItems}
      totalPages={totalPages}
      entityName="gia sư phù hợp"
      filtersConfig={TUTOR_FILTERS}
      sortOptions={TUTOR_SORT_OPTIONS}
      sort={sort}
      setSort={setSort}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      search={search}
      setSearch={setSearch}
      checked={checked}
      toggleFilter={toggleFilter}
      renderItem={(tutor) => <TutorCard key={tutor.id} tutor={tutor} />}
    />
  );
}