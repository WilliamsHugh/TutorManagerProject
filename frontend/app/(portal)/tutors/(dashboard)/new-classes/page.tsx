'use client';

import { useState, useEffect } from 'react';
import ClassCard from '@/components/common/ClassCard';
import { Icon } from '@iconify/react';
import { getNewClasses, proposeToStudent, getClassRequestDetail } from '@/lib/api';
import Header from '@/components/tutor/Header';
import { Skeleton } from '@/components/common/Skeleton';
import { useProvinces, useDistricts } from '@/lib/hooks/useProvinces';
import Pagination from '@/components/common/Pagination';

const weekDays = [
  { label: "Thứ 2", value: "T2" },
  { label: "Thứ 3", value: "T3" },
  { label: "Thứ 4", value: "T4" },
  { label: "Thứ 5", value: "T5" },
  { label: "Thứ 6", value: "T6" },
  { label: "Thứ 7", value: "T7" },
  { label: "Chủ nhật", value: "CN" }
];

export default function NewClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Detail & Action states
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Proposal inputs
  const [proposedFee, setProposedFee] = useState<number>(200000);
  const [proposedSessions, setProposedSessions] = useState<number>(10);
  const [proposedSchedule, setProposedSchedule] = useState<string>('');

  // Interactive schedule states
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({});
  const [dayTimes, setDayTimes] = useState<Record<string, { start: string; end: string }>>({});

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  // States cho Lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả môn học");
  const [selectedMode, setSelectedMode] = useState("Hình thức dạy");
  const [selectedArea, setSelectedArea] = useState("Khu vực");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("Quận/Huyện");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { provinces, loading: provincesLoading } = useProvinces();
  const { districts, loading: districtsLoading } = useDistricts(selectedProvinceCode);

  // Lọc danh sách tỉnh thành trong dropdown
  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(locationSearch.toLowerCase())
  );
  
  // Lọc danh sách quận huyện trong dropdown
  const filteredDistricts = districts.filter(d => 
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await getNewClasses();
      setClasses(data.classes || []);
      setFilteredClasses(data.classes || []);
      setProfile(data.profile);
    } catch (error) {
      console.error("Lỗi tải danh sách lớp mới:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Logic xử lý lọc dữ liệu
  useEffect(() => {
    let result = classes;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title?.toLowerCase().includes(q) || 
        c.code?.toLowerCase().includes(q) ||
        c.requirements?.toLowerCase().includes(q)
      );
    }

    if (selectedSubject !== "Tất cả môn học") {
      result = result.filter(c => c.title?.toLowerCase().includes(selectedSubject.toLowerCase()));
    }

    if (selectedMode !== "Hình thức dạy") {
      result = result.filter(c => c.mode === selectedMode);
    }

    if (selectedArea !== "Khu vực") {
      result = result.filter(c => {
        const loc = c.location || c.preferredArea || "";
        return loc.toLowerCase().includes(selectedArea.toLowerCase());
      });
    }

    if (selectedDistrict !== "Quận/Huyện") {
      result = result.filter(c => {
        const loc = c.location || c.preferredArea || "";
        return loc.toLowerCase().includes(selectedDistrict.toLowerCase());
      });
    }

    setFilteredClasses(result);
    setCurrentPage(1); // Reset page on filter changes
  }, [searchTerm, selectedSubject, selectedMode, selectedArea, selectedDistrict, classes]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Schedule functions
  const handleDayToggle = (dayVal: string) => {
    const nextDays = { ...activeDays, [dayVal]: !activeDays[dayVal] };
    const nextTimes = { ...dayTimes };
    
    if (nextDays[dayVal] && !nextTimes[dayVal]) {
      nextTimes[dayVal] = { start: "19:00", end: "21:00" };
    }
    
    setActiveDays(nextDays);
    setDayTimes(nextTimes);
    syncSchedule(nextDays, nextTimes);
  };

  const handleTimeChange = (dayVal: string, type: "start" | "end", val: string) => {
    const nextTimes = {
      ...dayTimes,
      [dayVal]: {
        ...(dayTimes[dayVal] || { start: "19:00", end: "21:00" }),
        [type]: val
      }
    };
    setDayTimes(nextTimes);
    syncSchedule(activeDays, nextTimes);
  };

  const syncSchedule = (
    days: Record<string, boolean>,
    times: Record<string, { start: string; end: string }>
  ) => {
    const formatted = weekDays
      .filter((d) => days[d.value])
      .map((d) => {
        const time = times[d.value] || { start: "19:00", end: "21:00" };
        return `${d.label} (${time.start}-${time.end})`;
      })
      .join(", ");
    setProposedSchedule(formatted);
  };

  // Xem chi tiết lớp học
  const handleViewDetail = async (classId: string) => {
    try {
      setDetailLoading(true);
      const data = await getClassRequestDetail(classId);
      setSelectedClass(data);
      setProposedFee(200000);
      setProposedSessions(10);
      setProposedSchedule(data.preferredSchedule || '');
      
      // Parse current schedule if possible, or reset schedule picker
      setActiveDays({});
      setDayTimes({});
    } catch (err: any) {
      showToast(err.message || 'Không thể tải chi tiết lớp học', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  // Gửi đề xuất học phí & nhận lớp
  const handleProposeClass = async () => {
    if (!selectedClass) return;
    if (proposedFee < 50000) {
      showToast('Học phí đề xuất tối thiểu là 50.000đ/buổi', 'error');
      return;
    }
    if (proposedSessions < 1) {
      showToast('Số buổi học đề xuất tối thiểu là 1', 'error');
      return;
    }
    if (!proposedSchedule) {
      showToast('Vui lòng chọn ít nhất một thứ và khung giờ học', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await proposeToStudent(selectedClass.id, proposedFee, proposedSessions, proposedSchedule);
      showToast('Gửi đề xuất học phí thành công! Đang chờ học viên xác nhận.', 'success');
      setSelectedClass(null);
      // Refresh list
      fetchClasses();
    } catch (err: any) {
      showToast(err.message || 'Gửi đề xuất thất bại', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Header title="Lớp học mới gợi ý" userProfile={profile} />
      
      <main className="p-8 space-y-6">
        {/* Filter Section */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-lg bg-slate-50 focus-within:border-blue-500 transition-colors">
              <Icon icon="lucide:search" className="text-slate-400 text-lg" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo môn học, mã lớp..." 
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Dropdown Môn học */}
            <div className="relative min-w-[160px]">
              <div 
                onClick={() => toggleDropdown('subject')}
                className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <span className="flex-1 text-sm text-slate-700 truncate">{selectedSubject}</span>
                <Icon icon="lucide:chevron-down" className={`text-slate-400 transition-transform ${activeDropdown === 'subject' ? 'rotate-180' : ''}`} />
              </div>
              {activeDropdown === 'subject' && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl py-1">
                  {['Tất cả môn học', 'Toán học', 'Tiếng Anh', 'Vật lí', 'Hóa học'].map(opt => (
                    <div key={opt} onClick={() => { setSelectedSubject(opt); setActiveDropdown(null); }} className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer">{opt}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Hình thức */}
            <div className="relative min-w-[160px]">
              <div onClick={() => toggleDropdown('mode')} className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="flex-1 text-sm text-slate-700">{selectedMode}</span>
                <Icon icon="lucide:chevron-down" className="text-slate-400" />
              </div>
              {activeDropdown === 'mode' && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl py-1">
                  {['Hình thức dạy', 'Online', 'Offline'].map(opt => (
                    <div key={opt} onClick={() => { setSelectedMode(opt); setActiveDropdown(null); }} className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer">{opt}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown Khu vực */}
            <div className="relative min-w-[160px]">
              <div 
                onClick={() => {
                  toggleDropdown('area');
                  setLocationSearch("");
                }} 
                className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100"
              >
                <span className="flex-1 text-sm text-slate-700 truncate">{selectedArea}</span>
                <Icon icon="lucide:chevron-down" className={`text-slate-400 transition-transform ${activeDropdown === 'area' ? 'rotate-180' : ''}`} />
              </div>
              {activeDropdown === 'area' && (
                <div 
                  className="absolute z-50 w-64 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Tìm Tỉnh/Thành..."
                      className="w-full h-8 px-2 rounded border border-slate-200 text-xs outline-none bg-white text-slate-900"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div 
                      onClick={() => { 
                        setSelectedArea("Khu vực"); 
                        setSelectedProvinceCode(null); 
                        setSelectedDistrict("Quận/Huyện"); 
                        setActiveDropdown(null); 
                      }} 
                      className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 font-medium"
                    >
                      Tất cả khu vực
                    </div>
                    {provincesLoading ? (
                      <div className="p-3 space-y-2">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-3/4"></div>
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-1/2"></div>
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-5/6"></div>
                      </div>
                    ) : filteredProvinces.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-slate-400 text-center">Không tìm thấy</div>
                    ) : (
                      filteredProvinces.map(p => (
                        <div 
                          key={p.code} 
                          onClick={() => { 
                            setSelectedArea(p.name); 
                            setSelectedProvinceCode(p.code); 
                            setSelectedDistrict("Quận/Huyện"); // Reset district
                            setActiveDropdown(null); 
                          }} 
                          className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700"
                        >
                          {p.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Quận/Huyện */}
            <div className="relative min-w-[160px]">
              <div 
                onClick={() => {
                  if (!selectedProvinceCode) return;
                  toggleDropdown('district');
                  setDistrictSearch("");
                }} 
                className={`flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-lg bg-slate-50 ${
                  selectedProvinceCode ? 'cursor-pointer hover:bg-slate-100' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <span className="flex-1 text-sm text-slate-700 truncate">{selectedDistrict}</span>
                <Icon icon="lucide:chevron-down" className={`text-slate-400 transition-transform ${activeDropdown === 'district' ? 'rotate-180' : ''}`} />
              </div>
              {activeDropdown === 'district' && selectedProvinceCode && (
                <div 
                  className="absolute z-50 w-64 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                    <input
                      type="text"
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      placeholder="Tìm Quận/Huyện..."
                      className="w-full h-8 px-2 rounded border border-slate-200 text-xs outline-none bg-white text-slate-900"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div 
                      onClick={() => { setSelectedDistrict("Quận/Huyện"); setActiveDropdown(null); }} 
                      className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 font-medium"
                    >
                      Tất cả Quận/Huyện
                    </div>
                    {districtsLoading ? (
                      <div className="p-3 space-y-2">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-3/4"></div>
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-1/2"></div>
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse w-5/6"></div>
                      </div>
                    ) : filteredDistricts.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-slate-400 text-center">Không tìm thấy</div>
                    ) : (
                      filteredDistricts.map(d => (
                        <div 
                          key={d.code} 
                          onClick={() => { setSelectedDistrict(d.name); setActiveDropdown(null); }} 
                          className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700"
                        >
                          {d.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedSubject("Tất cả môn học");
                setSelectedMode("Hình thức dạy");
                setSelectedArea("Khu vực");
                setSelectedProvinceCode(null);
                setSelectedDistrict("Quận/Huyện");
                setLocationSearch("");
                setDistrictSearch("");
              }}
              className="flex items-center gap-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Icon icon="lucide:refresh-cw" className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-5 flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
            Không tìm thấy lớp học nào khớp với bộ lọc của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
              <ClassCard 
                key={item.id} 
                cls={{
                  ...item,
                  requirement: item.requirements || item.studentInfo,
                  salaryNote: "/ buổi"
                }} 
                priority={index < 3}
                onViewDetail={() => handleViewDetail(item.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && (
          <Pagination 
            currentPage={currentPage}
            totalItems={filteredClasses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            label="lớp gợi ý"
          />
        )}
      </main>

      {/* Class Detail Modal */}
      {selectedClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Chi tiết yêu cầu lớp học & Gửi đề xuất</h3>
                <p className="text-xs text-slate-500 m-0">Xem thông tin chi tiết và đề xuất học phí phù hợp với bạn</p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-1"
              >
                <Icon icon="lucide:x" fontSize={22} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">MÔN HỌC</span>
                  <span className="text-base font-bold text-slate-950 block mt-0.5">{selectedClass.subject?.name || 'Chưa cập nhật'}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
                  #LH{selectedClass.id.substring(0, 4).toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">THÔNG TIN CHI TIẾT HỌC VIÊN</span>
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Họ & Tên học viên:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedClass.student?.user?.fullName || 'Ẩn danh'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Cấp lớp học:</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedClass.student?.gradeLevel || 'Mọi cấp học'}</p>
                  </div>
                  {selectedClass.student?.parentName && (
                    <div>
                      <span className="text-slate-400 font-medium">Đại diện phụ huynh:</span>
                      <p className="font-semibold text-slate-950 mt-0.5">{selectedClass.student.parentName}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 font-medium">Số điện thoại liên hệ:</span>
                    <p className="font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5 italic">
                      <Icon icon="lucide:lock" className="text-amber-500 shrink-0" fontSize={11} />
                      Ẩn (Hiển thị sau khi nhận lớp)
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                    <span className="text-slate-400 font-medium">Email học tập:</span>
                    <p className="font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5 italic">
                      <Icon icon="lucide:lock" className="text-amber-500 shrink-0" fontSize={11} />
                      Ẩn (Hiển thị sau khi nhận lớp)
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                    <span className="text-slate-400 font-medium">Địa chỉ học tập:</span>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Icon icon="lucide:map-pin" className="text-slate-400 shrink-0" fontSize={12} />
                      {selectedClass.preferredArea || 'Toàn quốc'}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                    <span className="text-slate-400 font-medium">Lịch học mong muốn:</span>
                    <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      <Icon icon="lucide:calendar" className="text-slate-400 shrink-0" fontSize={12} />
                      {selectedClass.preferredSchedule || 'Linh hoạt'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedClass.requirements && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold block mb-1">MÔ TẢ CHI TIẾT & YÊU CẦU</span>
                  <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">{selectedClass.requirements}</p>
                </div>
              )}

              {/* Form đề xuất học phí và số buổi */}
              <div className="bg-blue-50/40 border border-blue-100 p-5 rounded-xl space-y-4">
                <span className="text-xs text-blue-800 font-black block tracking-wider uppercase">ĐỀ XUẤT GIẢNG DẠY CỦA BẠN</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Học phí đề xuất (/ buổi)</label>
                    <div className="flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 rounded-lg focus-within:border-blue-500">
                      <input
                        type="number"
                        min={50000}
                        step={10000}
                        value={proposedFee}
                        onChange={(e) => setProposedFee(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-950 w-full"
                      />
                      <span className="text-xs font-bold text-slate-400">đ</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Số buổi đề xuất</label>
                    <div className="flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 rounded-lg focus-within:border-blue-500">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={proposedSessions}
                        onChange={(e) => setProposedSessions(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-950 w-full"
                      />
                      <span className="text-xs font-bold text-slate-400">buổi</span>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-600 block">Lịch dạy đề xuất của bạn (Chọn các thứ học)</label>
                    
                    {/* Compact Interactive Schedule Selector */}
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {weekDays.map((day) => {
                          const isActive = !!activeDays[day.value];
                          return (
                            <button
                              type="button"
                              key={day.value}
                              onClick={() => handleDayToggle(day.value)}
                              className={`h-7 px-2 text-[10px] font-bold rounded transition-colors border cursor-pointer ${
                                isActive
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>

                      {Object.keys(activeDays).some((k) => activeDays[k]) && (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5 mt-2 border-t border-slate-100 pt-2">
                          {weekDays
                            .filter((d) => activeDays[d.value])
                            .map((day) => {
                              const time = dayTimes[day.value] || { start: "19:00", end: "21:00" };
                              return (
                                <div key={day.value} className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-slate-50 border border-slate-150">
                                  <span className="text-[11px] font-bold text-slate-600">{day.label}</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="time"
                                      className="h-6 rounded border border-slate-305 px-1 text-[10px] bg-white text-slate-900 outline-none"
                                      value={time.start}
                                      onChange={(e) => handleTimeChange(day.value, "start", e.target.value)}
                                    />
                                    <span className="text-[10px] text-slate-400">đến</span>
                                    <input
                                      type="time"
                                      className="h-6 rounded border border-slate-305 px-1 text-[10px] bg-white text-slate-900 outline-none"
                                      value={time.end}
                                      onChange={(e) => handleTimeChange(day.value, "end", e.target.value)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                    {proposedSchedule && (
                      <div className="text-[11px] font-semibold text-blue-600 bg-blue-50/50 p-2 rounded-md border border-blue-100/50">
                        Lịch đã tạo: {proposedSchedule}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-blue-100/50 pt-3 flex justify-between items-center text-xs font-semibold text-blue-800">
                  <span>Tổng giá trị đề xuất:</span>
                  <span className="text-sm font-extrabold text-blue-700">
                    {((proposedFee || 0) * (proposedSessions || 0)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="px-5 py-2 rounded-lg border border-slate-350 bg-white hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleProposeClass}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white cursor-pointer text-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <Icon icon="lucide:loader-2" className="animate-spin" />
                    Đang gửi đề xuất...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:send" />
                    Gửi đề xuất học phí
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Loader skeleton overlay */}
      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="bg-white p-5 rounded-xl flex items-center gap-3 shadow-2xl">
            <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={24} />
            <span className="text-sm font-semibold text-slate-700">Đang tải thông tin chi tiết...</span>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border animate-in slide-in-from-bottom-4 max-w-[350px]"
          style={{
            background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
            borderColor: toast.type === 'success' ? '#bbf7d0' : '#fecaca',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
          }}>
          <Icon icon={toast.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'} fontSize={20} />
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="bg-transparent border-none cursor-pointer p-0 ml-auto opacity-60 hover:opacity-100">
            <Icon icon="lucide:x" fontSize={16} />
          </button>
        </div>
      )}
    </>
  );
}
