'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Icon } from '@iconify/react';
import { getTutorProfile, updateTutorProfile, getAllSubjects } from '@/lib/api';
import Header from '@/components/tutor/Header';

export default function ProfessionalProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsUpdating] = useState(false);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileAndSubjects = async () => {
      try {
        const data = await getTutorProfile(); 
        setProfile(data.profile || {});
        setFormData(data.profile || {}); // Khởi tạo dữ liệu form từ profile

        const subjectsData = await getAllSubjects();
        setAllSubjects(subjectsData || []);
      } catch (error) {
        console.error("Lỗi tải thông tin hồ sơ hoặc môn học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndSubjects();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await updateTutorProfile(formData);
      setProfile(formData);
      alert("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Không thể lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh phải nhỏ hơn 5MB');
      return;
    }

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.message || 'Tải ảnh lên thất bại');
      }

      const { url } = await uploadRes.json();
      setFormData((prev: any) => ({ ...prev, avatarUrl: url }));
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      alert(error.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newCert = {
        title: file.name,
        desc: `Đã tải lên vào ${new Date().toLocaleDateString('vi-VN')}`
      };
      setFormData((prev: any) => ({
        ...prev,
        certificates: [...(prev.certificates || []), newCert]
      }));
    }
  };

  return (
    <>
      <Header title="Cập nhật hồ sơ" userProfile={profile} />
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
            <button 
              onClick={() => setFormData(profile)}
              className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium bg-white hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Icon icon={isSaving ? "lucide:loader-2" : "lucide:save"} className={isSaving ? "animate-spin" : ""} />
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
                <InputField label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                <InputField label="Ngày sinh" name="dob" value={formData.dob} onChange={handleInputChange} type="date" />
                <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} />
                <InputField label="Số điện thoại" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <InputField label="Địa chỉ hiện tại" name="address" value={formData.address} onChange={handleInputChange} className="mt-4" />
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-900 mb-2 block">Giới thiệu bản thân</label>
                <textarea 
                  name="bio" value={formData.bio || ''} onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 leading-relaxed min-h-[100px] outline-none focus:border-blue-500 transition-colors"
                  placeholder="Giới thiệu ngắn gọn về bản thân..."
                />
              </div>
            </SectionCard>

            {/* Education Card */}
            <SectionCard icon="lucide:graduation-cap" title="Học vấn & Kinh nghiệm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Trường Đại học / Cao đẳng" name="university" value={formData.university} onChange={handleInputChange} />
                <InputField label="Chuyên ngành" name="major" value={formData.major} onChange={handleInputChange} />
                <InputField label="Năm tốt nghiệp" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} />
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
                <textarea 
                  name="experience" value={formData.experience || ''} onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 leading-relaxed min-h-[100px] outline-none focus:border-blue-500 transition-colors"
                  placeholder="Mô tả các lớp đã dạy, thành tích..."
                />
              </div>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* Avatar Panel */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center text-center gap-4 shadow-sm">
              <div className="relative">
                <div className="relative">
                  {formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl}
                      alt="Tutor Avatar" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-slate-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-slate-100" style={{ backgroundColor: '#e0e7ff' }}>
                      {(formData.fullName || formData.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <Icon icon="lucide:loader-2" className="text-white text-2xl animate-spin" />
                    </div>
                  )}
                </div>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="absolute bottom-0 right-0 bg-white border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                  <Icon icon="lucide:camera" />
                </button>
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-1">Ảnh đại diện</h4>
                <p className="text-xs text-slate-500">Định dạng JPG, PNG. Kích thước tối đa 5MB.</p>
              </div>
              <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="w-full py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
                Tải ảnh mới
              </button>
            </div>

            {/* Specialization Panel */}
            <SectionCard 
              icon="lucide:book-open" 
              title="Môn dạy & Năng lực" 
              action={
                <div className="relative">
                  <button 
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-800 transition-colors"
                  >
                    <Icon icon="lucide:plus" /> Thêm
                  </button>
                  {showSubjectDropdown && (
                    <div className="absolute right-0 mt-2 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto">
                      {Array.from(new Set(allSubjects.map(sub => sub.name)))
                        .filter(name => !(formData.subjects || []).includes(name))
                        .map((name, index) => (
                          <div 
                            key={index} 
                            onClick={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                subjects: [...(prev.subjects || []), name]
                              }));
                              setShowSubjectDropdown(false);
                            }} 
                            className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer text-slate-700 hover:text-blue-700 font-medium transition-colors text-left"
                          >
                            {name}
                          </div>
                        ))
                      }
                      {Array.from(new Set(allSubjects.map(sub => sub.name))).filter(name => !(formData.subjects || []).includes(name)).length === 0 && (
                        <div className="px-4 py-2 text-xs text-slate-400 text-center">Đã thêm tất cả môn học</div>
                      )}
                    </div>
                  )}
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Môn học giảng dạy</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects?.length > 0 
                      ? formData.subjects.map((sub: any, i: number) => (
                          <Tag 
                            key={i} 
                            label={sub} 
                            primary 
                            removable 
                            onRemove={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                subjects: (prev.subjects || []).filter((s: string) => s !== sub)
                              }));
                            }}
                          />
                        ))
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
                {formData.certificates?.length > 0
                  ? formData.certificates.map((cert: any, i: number) => (
                      <CertificateItem key={i} title={cert.title} desc={cert.desc} />
                    ))
                  : <div className="text-sm text-slate-500">Chưa tải lên chứng chỉ nào.</div>}
                
                <input type="file" ref={certInputRef} className="hidden" onChange={handleCertUpload} />
                <div onClick={() => certInputRef.current?.click()} className="mt-2 p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
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
    </>
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

function InputField({ label, value, name, onChange, className = "", type = "text" }: { label: string; value: string; name: string; onChange: any; className?: string; type?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-slate-900">{label}</label>
      <input 
        type={type} name={name} value={value || ''} onChange={onChange}
        className="p-2.5 border border-slate-200 rounded-md bg-slate-50 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
        placeholder={`Nhập ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function Tag({ label, primary = false, removable = false, onRemove }: { label: string; primary?: boolean; removable?: boolean; onRemove?: () => void }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${primary ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-700'}`}>
      {label}
      {removable && <Icon icon="lucide:x" className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors" onClick={onRemove} />}
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