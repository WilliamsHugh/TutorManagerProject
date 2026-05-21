"use client";

import { useState, useEffect } from "react";
import TutorCard from "@/components/TutorCard";
import ListingLayout from "@/components/ListingLayout";
import { Tutor } from "@/types/tutor";
import { TUTORS, TUTOR_FILTERS, TUTOR_SORT_OPTIONS, TOTAL_TUTOR_PAGES } from "@/lib/mock-data";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [checked, setChecked] = useState<Record<string, boolean>>({
    "subject:Toán": true,
    "level:Cấp 2 (THCS)": true,
    "level:Cấp 3 (THPT)": true,
    "mode:Học trực tiếp (Offline)": true,
  });

  const [sort, setSort] = useState(TUTOR_SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const [items, setItems] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFilter = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  // Simulate API Call
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      // Simulate filtering by debouncedSearch, checked, sort, currentPage
      // For now, we mock the return to just the tutors array
      setItems(TUTORS);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [debouncedSearch, checked, sort, currentPage]);

  return (
    <ListingLayout
      heroTitle="Tìm Gia Sư Phù Hợp"
      heroDescription="Hàng ngàn gia sư chất lượng cao đang sẵn sàng đồng hành cùng bạn trên con đường chinh phục tri thức."
      items={items}
      isLoading={isLoading}
      error={error}
      totalItems={342} // Sẽ là meta.total từ API trong tương lai
      totalPages={TOTAL_TUTOR_PAGES}
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