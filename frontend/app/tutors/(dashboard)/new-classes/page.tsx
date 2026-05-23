'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/tutor/Header';
import ClassCard from '@/components/ClassCard';
import { Icon } from '@iconify/react';
import { getNewClasses } from '@/lib/api';

export default function NewClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // States cho Lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả môn học");
  const [selectedMode, setSelectedMode] = useState("Hình thức dạy");
  const [selectedArea, setSelectedArea] = useState("Khu vực");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
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
  }, [searchTerm, selectedSubject, selectedMode, selectedArea, classes]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <>
      <Header title="Tìm lớp học mới" showSearch={false} userProfile={profile} />
      
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
                  {['Tất cả môn học', 'Toán học', 'Tiếng Anh', 'Vật Lý', 'Hóa học'].map(opt => (
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
          <div className="text-center py-10 text-slate-500 flex justify-center items-center gap-2">
            <Icon icon="lucide:loader-2" className="animate-spin text-xl" /> Đang tải danh sách lớp...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
            Không tìm thấy lớp học nào khớp với bộ lọc của bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map((item, index) => (
              <ClassCard 
                key={item.id} 
                cls={{
                  ...item,
                  requirement: item.studentInfo, // Map dữ liệu từ API vào prop requirement của ClassCard
                  salaryNote: "/ buổi"
                }} 
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}