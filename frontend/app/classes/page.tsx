"use client";

import { useState, useEffect } from "react";
import ClassCard from "@/components/ClassCard";
import ListingLayout from "@/components/ListingLayout";
import { ClassListing } from "@/types/class";
import { getNewClasses } from "@/lib/api";
import { CLASS_FILTERS, CLASS_SORT_OPTIONS, TOTAL_CLASS_PAGES } from "@/lib/mock-data";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [profile, setProfile] = useState<any>(null);

  const [checked, setChecked] = useState<Record<string, boolean>>({
    "subject:Toán": true,
    "level:Cấp 2 (THCS)": true,
    "mode:Học trực tiếp (Offline)": true,
  });

  const [sort, setSort] = useState(CLASS_SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const [items, setItems] = useState<ClassListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFilter = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  // Fetch thực tế từ API (Đã loại bỏ mã mock và sửa lỗi unreachable code)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    getNewClasses()
      .then((data) => {
        setItems(data.classes || []);
        setProfile(data.profile);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách lớp học");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedSearch, checked, sort, currentPage]);

  return (
    <ListingLayout
      heroTitle="Danh Sách Lớp Học Mới"
      heroDescription="Cập nhật liên tục các lớp học đang tìm kiếm gia sư. Đăng ký nhận lớp ngay hôm nay để bắt đầu hành trình giảng dạy của bạn."
      items={items}
      isLoading={isLoading}
      error={error}
      totalItems={342} // Thường lấy từ dữ liệu fetch được (totalCount)
      totalPages={TOTAL_CLASS_PAGES}
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
      renderItem={(cls) => <ClassCard key={cls.id} cls={cls} />}
    />
  );
}
