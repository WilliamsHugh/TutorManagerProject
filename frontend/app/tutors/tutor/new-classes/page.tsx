'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getNewClasses } from '@/lib/api';

export default function NewClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getNewClasses();
        setClasses(data || []);
      } catch (error) {
        console.error("Lỗi tải danh sách lớp mới:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <Header title="Tìm lớp học mới" showSearch={false} />
      
      <main className="p-8 space-y-6">
        {/* Filter Section */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-md bg-slate-50">
              <Icon icon="lucide:search" className="text-slate-400 text-lg" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo môn học, mã lớp..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
            
            {['Tất cả môn học', 'Hình thức dạy', 'Khu vực'].map((filter) => (
              <div key={filter} className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-md bg-slate-50 cursor-pointer min-w-[160px]">
                <span className="flex-1 text-sm text-slate-700">{filter}</span>
                <Icon icon="lucide:chevron-down" className="text-slate-400" />
              </div>
            ))}

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
        ) : classes.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
            Không tìm thấy lớp học nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {classes.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 border-bottom border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">{item.title}</h3>
                      <div className="text-xs text-slate-500 mt-1">Mã lớp: {item.id}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.badgeClass}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1">
                  <DetailRow icon="lucide:map-pin" label="Hình thức & Địa điểm" value={item.location} />
                  <DetailRow icon="lucide:calendar-clock" label="Lịch học dự kiến" value={item.schedule} />
                  <DetailRow icon="lucide:users" label="Thông tin học viên" value={item.studentInfo} />
                  <DetailRow icon="lucide:banknote" label="Mức lương đề xuất" value={item.salary} isPrimary />
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-lg flex gap-3">
                  <button className="flex-1 py-2 px-4 border border-slate-200 rounded-md text-sm font-medium bg-white hover:bg-slate-50 transition-colors">
                    Xem chi tiết
                  </button>
                  <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Nhận lớp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function DetailRow({ icon, label, value, isPrimary = false }: { icon: string; label: string; value: string; isPrimary?: boolean }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="text-slate-400 mt-1">
        <Icon icon={icon} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className={`font-medium ${isPrimary ? 'text-blue-600' : 'text-slate-700'}`}>{value}</span>
      </div>
    </div>
  );
}