"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, MapPin, ChevronDown, Search } from "lucide-react";
import { useProvinces } from "@/lib/hooks/useProvinces";

export default function HeroSection() {
  const router = useRouter();
  const { provinces, loading: provincesLoading } = useProvinces();

  const [subject, setSubject] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [isOpenSubject, setIsOpenSubject] = useState(false);
  const [isOpenLocation, setIsOpenLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const subjectsList = [
    { label: "Chọn môn học...", value: "" },
    { label: "Toán học", value: "Toán" },
    { label: "Tiếng Anh", value: "Tiếng Anh" },
    { label: "Vật lí", value: "Vật Lý" },
    { label: "Hóa học", value: "Hóa Học" },
    { label: "Ngữ văn", value: "Ngữ Văn" },
  ];

  const selectedSubjectLabel = subjectsList.find(s => s.value === subject)?.label || "Chọn môn học...";
  const selectedLocationLabel = selectedProvince || "Chọn tỉnh/thành...";

  // Lọc danh sách tỉnh theo từ khóa tìm kiếm
  const filteredProvinces = useMemo(() => {
    if (!locationSearch.trim()) return provinces;
    const q = locationSearch.toLowerCase();
    return provinces.filter(p => p.name.toLowerCase().includes(q));
  }, [provinces, locationSearch]);

  const handleSearch = () => {
    let url = "/tutors";
    const params = new URLSearchParams();
    if (selectedProvince) params.append("province", selectedProvince);
    if (subject) params.append("subject", subject);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    router.push(url);
  };

  return (
    <section
      className="py-12 sm:py-16 md:py-[100px] pb-16 sm:pb-20 md:pb-[120px] text-center"
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      }}
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 max-w-[800px] mx-auto leading-tight">
          Khám Phá Tiềm Năng Cùng Gia Sư Xuất Sắc
        </h1>
        <p
          className="text-sm sm:text-base md:text-lg mb-8 sm:mb-12 max-w-[600px] mx-auto"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Hệ thống quản lý và kết nối gia sư uy tín hàng đầu. Trải nghiệm học
          tập thông minh hơn, đạt điểm cao hơn cùng TutorEdu.
        </p>

        {/* Search Box */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center max-w-[860px] mx-auto rounded-lg sm:rounded-xl p-3 gap-3 sm:gap-0"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Subject Field */}
          <div className="relative flex items-center gap-2 sm:gap-4 flex-1 px-3 sm:px-6 py-3 sm:py-3 select-none">
            {isOpenSubject && (
              <div className="fixed inset-0 z-30" onClick={() => setIsOpenSubject(false)} />
            )}
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <BookOpen
                size={20}
                className="sm:w-6 sm:h-6"
                style={{ color: "var(--muted-foreground)" }}
              />
            </div>
            <div 
              className="flex flex-col items-start gap-0.5 sm:gap-1 flex-1 text-left w-full cursor-pointer z-40"
              onClick={() => {
                setIsOpenSubject(!isOpenSubject);
                setIsOpenLocation(false);
              }}
            >
              <label
                className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wide cursor-pointer"
                style={{ color: "var(--foreground)" }}
              >
                Môn học
              </label>
              <div className="flex items-center justify-between w-full text-[13px] sm:text-[15px] font-semibold text-slate-700 dark:text-slate-300">
                <span className="truncate">{selectedSubjectLabel}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpenSubject ? 'rotate-180' : ''}`} />
              </div>
              
              {isOpenSubject && (
                <div 
                  className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1.5 z-50"
                  style={{
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)"
                  }}
                >
                  {subjectsList.map((item) => (
                    <div
                      key={item.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubject(item.value);
                        setIsOpenSubject(false);
                      }}
                      className={`px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer hover:bg-slate-800 text-left ${
                        subject === item.value 
                          ? "text-yellow-500 font-bold bg-slate-800/40" 
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className="hidden sm:block w-px h-12 shrink-0"
            style={{ backgroundColor: "var(--border)" }}
          />

          {/* Location Field — Custom dropdown with search from API */}
          <div className="relative flex items-center gap-2 sm:gap-4 flex-1 px-3 sm:px-6 py-3 sm:py-3 select-none">
            {isOpenLocation && (
              <div className="fixed inset-0 z-30" onClick={() => { setIsOpenLocation(false); setLocationSearch(""); }} />
            )}
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0">
              <MapPin size={20} className="sm:w-6 sm:h-6" style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div 
              className="flex flex-col items-start gap-0.5 sm:gap-1 flex-1 text-left w-full cursor-pointer z-40"
              onClick={() => {
                setIsOpenLocation(!isOpenLocation);
                setIsOpenSubject(false);
                setLocationSearch("");
              }}
            >
              <label
                className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wide cursor-pointer"
                style={{ color: "var(--foreground)" }}
              >
                Khu vực
              </label>
              <div className="flex items-center justify-between w-full text-[13px] sm:text-[15px] font-semibold text-slate-700 dark:text-slate-300">
                <span className="truncate">{selectedLocationLabel}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpenLocation ? 'rotate-180' : ''}`} />
              </div>
              
              {isOpenLocation && (
                <div 
                  className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                  style={{
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Search input inside dropdown */}
                  <div className="p-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-lg">
                      <Search size={14} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Tìm tỉnh/thành phố..."
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-200 placeholder-slate-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  {/* Options list */}
                  <div className="max-h-[220px] overflow-y-auto py-1">
                    {/* Option: Tất cả */}
                    <div
                      onClick={() => {
                        setSelectedProvince("");
                        setIsOpenLocation(false);
                        setLocationSearch("");
                      }}
                      className={`px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer hover:bg-slate-800 text-left ${
                        !selectedProvince
                          ? "text-yellow-500 font-bold bg-slate-800/40" 
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Tất cả khu vực
                    </div>

                    {provincesLoading ? (
                      <div className="px-4 py-3 text-xs text-slate-500 text-center">Đang tải...</div>
                    ) : filteredProvinces.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-500 text-center">Không tìm thấy</div>
                    ) : (
                      filteredProvinces.map((p) => (
                        <div
                          key={p.code}
                          onClick={() => {
                            setSelectedProvince(p.name);
                            setIsOpenLocation(false);
                            setLocationSearch("");
                          }}
                          className={`px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer hover:bg-slate-800 text-left ${
                            selectedProvince === p.name
                              ? "text-yellow-500 font-bold bg-slate-800/40" 
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          {p.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 h-10 sm:h-14 px-4 sm:px-8 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl border-none cursor-pointer transition-opacity hover:opacity-90 shrink-0 w-full"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
