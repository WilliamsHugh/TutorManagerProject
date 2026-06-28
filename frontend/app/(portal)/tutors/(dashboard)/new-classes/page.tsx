'use client';

import React, { useState, useEffect } from 'react';
import ClassCard from '@/components/common/ClassCard';
import { Icon } from '@iconify/react';
import { getNewClasses, acceptClassRequest } from '@/lib/api';
import Header from '@/components/tutor/Header';
import { useToast } from '@/components/common/Toast';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function NewClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  
  // States cho Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả môn học');
  const [selectedMode, setSelectedMode] = useState('Hình thức dạy');
  const [selectedArea, setSelectedArea] = useState('Khu vực');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Toast & Confirm Modal
  const { showToast, ToastComponent } = useToast();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

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
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject !== "Tất cả môn học") {
      result = result.filter(c => c.title.includes(selectedSubject));
    }

    if (selectedMode !== "Hình thức dạy") {
      result = result.filter(c => c.mode === selectedMode);
    }

    if (selectedArea !== "Khu vực") {
      result = result.filter(c => c.location.includes(selectedArea));
    }

    setFilteredClasses(result);
    setCurrentPage(1); // Reset pagination on filter change
  }, [searchTerm, selectedSubject, selectedMode, selectedArea, classes]);

  const paginatedClasses = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClasses.slice(start, start + itemsPerPage);
  }, [filteredClasses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleAcceptClass = (classItem: any) => {
    setConfirmModal({
      isOpen: true,
      message: `Bạn có chắc chắn muốn nhận lớp "${classItem.title}" (${classItem.code})? Sau khi nhận, lịch dạy sẽ được tự động tạo dựa trên lịch yêu cầu.`,
      onConfirm: async () => {
        try {
          setAcceptingId(classItem.id);
          await acceptClassRequest(classItem.id);
          showToast(`Nhận lớp "${classItem.title}" thành công! Lịch dạy đã được tạo tự động.`, 'success');
          // Refresh danh sách
          await fetchClasses();
        } catch (error: any) {
          showToast(error.message || 'Không thể nhận lớp. Vui lòng thử lại.', 'error');
        } finally {
          setAcceptingId(null);
        }
      },
    });
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
              <div onClick={() => toggleDropdown('area')} className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100">
                <span className="flex-1 text-sm text-slate-700">{selectedArea}</span>
                <Icon icon="lucide:chevron-down" className="text-slate-400" />
              </div>
              {activeDropdown === 'area' && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto">
                  {['Khu vực', 'Quận 1', 'Quận 7', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Online'].map(opt => (
                    <div key={opt} onClick={() => { setSelectedArea(opt); setActiveDropdown(null); }} className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer">{opt}</div>
                  ))}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              <Icon icon="lucide:sliders-horizontal" />
              Lọc kết quả
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={32} />
              <p className="text-slate-500 font-medium text-sm">Đang tải dữ liệu lớp học...</p>
            </div>
          ) : filteredClasses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedClasses.map((c) => (
                  <ClassCard 
                    key={c.id} 
                    cls={{
                      ...c,
                      requirement: c.studentInfo,
                      salaryNote: "/ buổi"
                    }} 
                    onAccept={() => handleAcceptClass(c)}
                    accepting={acceptingId === c.id}
                  />
                ))}
              </div>
              
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    <Icon icon="lucide:chevron-left" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                        currentPage === idx + 1 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    <Icon icon="lucide:chevron-right" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 px-6 text-center bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-8">
              <p className="text-slate-500">Không tìm thấy lớp học nào khớp với bộ lọc của bạn.</p>
            </div>
        )}
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title="Xác nhận nhận lớp"
        confirmText="Nhận lớp"
      />

      {/* Toast */}
      {ToastComponent}
    </>
  );
}