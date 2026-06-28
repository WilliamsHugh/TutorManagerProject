'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { getTutorStudents } from '@/lib/api';
import Header from '@/components/tutor/Header';

export default function MyStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Đang học', 'Tạm dừng'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTutorStudents();
        setStudents(data.students || []);
        setProfile(data.profile);
      } catch (error) {
        console.error("Lỗi tải danh sách học viên:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats dynamically
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.status === 'Đang học').length;
    const paused = students.filter(s => s.status !== 'Đang học').length;
    return { total, active, paused };
  }, [students]);

  // Filter students dynamically based on search & filter dropdown
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastSubject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.gradeLevel?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = 
        statusFilter === 'ALL' || 
        student.status === statusFilter;
        
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Apply pagination
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <>
      <Header title="Học viên của tôi" userProfile={profile} />
      
      <main className="p-8 flex flex-col gap-8 animate-in fade-in duration-300">
        
        {/* Page Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Danh sách học viên</h1>
            <p className="text-sm text-slate-500 mt-1">Theo dõi tiến trình, nộp báo cáo giảng dạy và quản lý học tập của học viên bạn phụ trách.</p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 font-semibold px-3.5 py-2 rounded-full border border-blue-100 shadow-sm self-start md:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Hệ thống quản lý trực tuyến
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Total Students */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số học viên</span>
              <span className="text-3xl font-black text-slate-800">{loading ? '...' : stats.total}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon icon="lucide:users" fontSize={24} />
            </div>
          </div>

          {/* Card 2: Active Students */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang học tích cực</span>
              <span className="text-3xl font-black text-emerald-600">{loading ? '...' : stats.active}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon icon="lucide:graduation-cap" fontSize={24} />
            </div>
          </div>

          {/* Card 3: Paused Students */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tạm dừng / Đã xong</span>
              <span className="text-3xl font-black text-amber-600">{loading ? '...' : stats.paused}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon icon="lucide:clock" fontSize={24} />
            </div>
          </div>
        </div>

        {/* Main List Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col">
          
          {/* Search, Filter & Actions Bar */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/20">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon icon="lucide:search" fontSize={18} />
              </span>
              <input 
                type="text" 
                placeholder="Tìm học viên theo tên, môn học, lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Icon icon="lucide:x" fontSize={16} />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 w-full sm:w-auto shrink-0 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Đang học', 'Tạm dừng'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    statusFilter === status 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status === 'ALL' ? 'Tất cả học viên' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Table / List View */}
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Icon icon="lucide:loader-2" className="animate-spin text-blue-600" fontSize={40} />
              <p className="text-slate-500 font-medium text-sm">Đang tải danh sách học viên...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Học viên</th>
                    <th className="py-4 px-6">Cấp học</th>
                    <th className="py-4 px-6">Môn học gần nhất</th>
                    <th className="py-4 px-6">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-blue-50/10 transition-colors duration-150 group"
                    >
                      {/* Name & Email Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img 
                              src={student.avatar || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1"} 
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all duration-200" 
                              alt={student.fullName} 
                            />
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                              student.status === 'Đang học' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors duration-150">{student.fullName}</span>
                            <span className="text-slate-400 text-xs mt-0.5">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Grade Level */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-655 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/30">
                          {student.gradeLevel}
                        </span>
                      </td>

                      {/* Last Subject */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                          <Icon icon="lucide:book-open" className="text-blue-500" fontSize={16} />
                          {student.lastSubject}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${
                          student.status === 'Đang học' 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' 
                            : 'bg-slate-50 text-slate-500 ring-slate-650/10'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            student.status === 'Đang học' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                          }`} />
                          {student.status}
                        </span>
                      </td>

                      {/* Actions Button */}
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => router.push(`/tutors/students/${student.id}`)} 
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border border-blue-100/30"
                        >
                          <Icon icon="lucide:eye" fontSize={14} />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Hiển thị <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> trong số <span className="font-semibold text-slate-800">{filteredStudents.length}</span> học viên
                  </span>
                  <div className="flex gap-1">
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
                        className={`w-9 h-9 rounded-lg border text-sm font-semibold cursor-pointer ${
                          currentPage === idx + 1 
                            ? 'bg-blue-600 border-blue-600 text-white' 
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
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 px-6 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 shadow-sm">
                <Icon icon="lucide:users" fontSize={32} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-slate-800">Không tìm thấy học viên</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {searchQuery || statusFilter !== 'ALL' 
                    ? "Chúng tôi không tìm thấy học viên nào khớp với bộ lọc tìm kiếm hiện tại của bạn. Hãy thử thay đổi từ khóa."
                    : "Hiện tại hệ thống chưa ghi nhận học viên nào trong danh sách quản lý trực tiếp của bạn."
                  }
                </p>
              </div>
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/60 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-blue-100/20"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}