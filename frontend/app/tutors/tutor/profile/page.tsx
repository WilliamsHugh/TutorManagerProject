'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getTutorProfile } from '@/lib/api';

export default function ProfessionalProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getTutorProfile();
        setProfile(data);
      } catch (error) {
        console.error("Lỗi tải thông tin hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      <Header title="Hồ sơ chuyên môn" />

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Icon icon="lucide:loader-2" className="animate-spin text-3xl text-blue-600" />
        </div>
      ) : (
      <main className="p-8 flex flex-col gap-6">
        {/* Content Header */}
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Cập nhật hồ sơ</h2>
            <p className="text-sm text-slate-500">
              Quản lý thông tin cá nhân, kinh nghiệm giảng dạy và chứng chỉ của bạn.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium bg-white hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              <Icon icon="lucide:save" />
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Personal Info Card */}
            <SectionCard icon="lucide:user" title="Thông tin cá nhân">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DisplayField label="Họ và tên" value={profile?.fullName || 'Chưa cập nhật'} />
                <DisplayField label="Ngày sinh" value={profile?.dob || 'Chưa cập nhật'} />
                <DisplayField label="Email" value={profile?.email || 'Chưa cập nhật'} />
                <DisplayField label="Số điện thoại" value={profile?.phone || 'Chưa cập nhật'} />
              </div>
              <DisplayField label="Địa chỉ hiện tại" value={profile?.address || 'Chưa cập nhật'} className="mt-4" />
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-900 mb-2 block">Giới thiệu bản thân</label>
                <div className="p-3 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 leading-relaxed min-h-[100px]">
                  {profile?.bio || 'Chưa cập nhật thông tin giới thiệu bản thân.'}
                </div>
              </div>
            </SectionCard>

            {/* Education Card */}
            <SectionCard icon="lucide:graduation-cap" title="Học vấn & Kinh nghiệm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DisplayField label="Trường Đại học / Cao đẳng" value={profile?.university || 'Chưa cập nhật'} />
                <DisplayField label="Chuyên ngành" value={profile?.major || 'Chưa cập nhật'} />
                <DisplayField label="Năm tốt nghiệp" value={profile?.graduationYear || 'Chưa cập nhật'} />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-900">Nghề nghiệp hiện tại</label>
                  <div className="flex items-center justify-between p-2.5 border border-slate-200 rounded-md bg-slate-50 text-sm">
                    {profile?.currentJob || 'Giáo viên tự do'}
                    <Icon icon="lucide:chevron-down" className="text-slate-400" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-900 mb-2 block">Kinh nghiệm giảng dạy</label>
                <div className="p-3 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 leading-relaxed min-h-[100px] whitespace-pre-line">
                  {profile?.experience || 'Chưa cập nhật kinh nghiệm giảng dạy.'}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* Avatar Panel */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center text-center gap-4 shadow-sm">
              <div className="relative">
                <img 
                  src={profile?.avatarUrl || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSoutheast%20Asian%2F1"}
                  alt="Tutor Avatar" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-100"
                />
                <button className="absolute bottom-0 right-0 bg-white border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 shadow-sm hover:bg-slate-50">
                  <Icon icon="lucide:camera" />
                </button>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-1">Ảnh đại diện</h4>
                <p className="text-xs text-slate-500">Định dạng JPG, PNG. Kích thước tối đa 5MB.</p>
              </div>
              <button className="w-full py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                Tải ảnh mới
              </button>
            </div>

            {/* Specialization Panel */}
            <SectionCard 
              icon="lucide:book-open" 
              title="Môn dạy & Năng lực" 
              action={<button className="text-blue-600 text-sm font-medium flex items-center gap-1"><Icon icon="lucide:plus" /> Thêm</button>}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Môn học giảng dạy</label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.subjects?.length > 0 
                      ? profile.subjects.map((sub: any, i: number) => <Tag key={i} label={sub} primary />)
                      : <span className="text-sm text-slate-500">Chưa cập nhật</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Cấp độ / Mục tiêu</label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.levels?.length > 0
                      ? profile.levels.map((lvl: any, i: number) => <Tag key={i} label={lvl} />)
                      : <>
                          <Tag label="Luyện thi IELTS" />
                          <Tag label="Tiếng Anh Giao tiếp" />
                        </>}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Hình thức dạy</label>
                  <div className="flex flex-col gap-2 mt-2">
                    <CheckboxLabel label="Online" checked />
                    <CheckboxLabel label="Offline (Tại nhà học viên)" checked />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Certificates Panel */}
            <SectionCard icon="lucide:award" title="Chứng chỉ & Bằng cấp">
              <div className="flex flex-col gap-3">
                {profile?.certificates?.length > 0
                  ? profile.certificates.map((cert: any, i: number) => (
                      <CertificateItem key={i} title={cert.title} desc={cert.desc} />
                    ))
                  : <div className="text-sm text-slate-500">Chưa tải lên chứng chỉ nào.</div>}
                
                <div className="mt-2 p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <Icon icon="lucide:upload-cloud" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">Tải lên chứng chỉ mới</span>
                  <span className="text-xs text-slate-400">PDF, JPG hoặc PNG (Tối đa 10MB)</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SectionCard({ icon, title, children, action }: { icon: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Icon icon={icon} className="text-blue-600 text-lg" /> {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function DisplayField({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <div className="p-2.5 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 min-h-[40px] flex items-center">
        {value}
      </div>
    </div>
  );
}

function Tag({ label, primary = false, removable = false }: { label: string; primary?: boolean; removable?: boolean }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${primary ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700'}`}>
      {label}
      {removable && <Icon icon="lucide:x" className="cursor-pointer text-slate-400 hover:text-slate-600" />}
    </span>
  );
}

function CheckboxLabel({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <div className={`w-4 h-4 rounded flex items-center justify-center border ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
        {checked && <Icon icon="lucide:check" className="text-xs" />}
      </div>
      {label}
    </label>
  );
}

function CertificateItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-md bg-slate-50">
      <div className="w-10 h-10 bg-slate-200 text-blue-600 flex items-center justify-center rounded flex-shrink-0">
        <Icon icon="lucide:file-badge-2" className="text-xl" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900 truncate">{title}</div>
        <div className="text-xs text-slate-500 truncate">{desc}</div>
      </div>
      <button className="p-1 text-slate-400 hover:text-red-500 transition-colors">
        <Icon icon="lucide:trash-2" className="text-lg" />
      </button>
    </div>
  );
}