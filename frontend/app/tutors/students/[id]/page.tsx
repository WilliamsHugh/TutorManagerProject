'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import {
  ChevronRight,
  Hash,
  GraduationCap,
  CalendarDays,
  MessageSquare,
  ClipboardEdit,
  TrendingUp,
  ClipboardList,
  Target,
  BarChart2,
  Contact,
  Check,
  Star,
} from 'lucide-react';
import { getTutorStudents } from '@/lib/api'; // Sử dụng lại API lấy danh sách để tìm chi tiết
import { useParams } from 'next/navigation';

export default function StudentDetailPage() {
  const [student, setStudent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const studentId = params.id;

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        const data = await getTutorStudents(); // Lấy toàn bộ danh sách học viên
        const foundStudent = data.students.find((s: any) => s.id === studentId);
        if (foundStudent) {
          setStudent(foundStudent);
        } else {
          alert("Không tìm thấy học viên này.");
        }
        setProfile(data.profile);
      } catch (error) {
        console.error("Lỗi tải chi tiết học viên:", error);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) {
      fetchStudentDetail();
    }
  }, [studentId]);

  if (loading) {
    return (
      <>
        <Header title="Chi tiết học viên" userProfile={profile} />
        <div className="content" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          <Icon icon="lucide:loader-2" className="animate-spin" style={{ fontSize: '32px', margin: '0 auto' }} />
          <p style={{ marginTop: '12px' }}>Đang tải thông tin học viên...</p>
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Header title="Chi tiết học viên" userProfile={profile} />
        <div className="content" style={{ padding: '32px', textAlign: 'center', color: '#ef4444' }}>
          Không tìm thấy thông tin học viên.
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Chi tiết học viên" userProfile={profile} />
      
      <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
          <Link href="/tutors/students" style={{ color: '#64748b', textDecoration: 'none' }}>Học viên của tôi</Link>
          <div className="separator" style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={16} color="#64748b" />
          </div>
          <span style={{ color: '#0f172a', fontWeight: 500 }}>{student.fullName}</span>
        </div>

        {/* Profile Card */}
        <div className="profile-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <img
            src={student.avatar}
            className="profile-avatar"
            alt="Student Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
          />
          <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
            <h2 className="profile-name" style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{student.fullName}</h2>
            <div className="profile-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '14px' }}>
              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Hash size={16} color="#64748b" /> <span>{student.id?.substring(0, 8).toUpperCase()}</span></div>
              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={16} color="#64748b" /> <span>{student.gradeLevel}</span></div>
              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={16} color="#64748b" /> <span>Tham gia: {new Date(student.createdAt).toLocaleDateString('vi-VN')}</span></div>
            </div>
          </div>
          <div className="profile-actions" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => alert("Tính năng nhắn tin đang phát triển")} className="btn btn-outline" style={{ border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', cursor: 'pointer' }}>
              <MessageSquare size={16} color="#64748b" /> Nhắn tin
            </button>
            <button onClick={() => alert("Tính năng thêm đánh giá đang phát triển")} className="btn btn-primary" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <ClipboardEdit size={16} color="#fff" /> Thêm đánh giá
            </button>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SectionPanel title="Hồ sơ năng lực & Tiến độ" icon={<TrendingUp size={20} color="#2563eb" />}> {/* Dữ liệu cứng */}
              <div className="progress-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 500 }}>
                  <span>Tiến độ khóa học (13/20 buổi)</span>
                  <span>65%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#2563eb', width: '65%' }}></div> {/* Dữ liệu cứng */}
                </div>
              </div>
              {/* Thêm các điểm thành phần Reading, Listening... tương tự */}
            </SectionPanel>

            <SectionPanel title="Đánh giá quá trình" icon={<ClipboardList size={20} color="#2563eb" />}> {/* Dữ liệu cứng */}
               {/* Timeline Content từ Studentdetail.html */}
               <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                  <TimelineItem title="Đánh giá giữa kỳ" date="15/09/2023" text="Tuấn đã có sự tiến bộ rõ rệt ở kỹ năng Reading..." /> {/* Dữ liệu cứng */}
                  <TimelineItem title="Đánh giá đầu vào" date="15/08/2023" text="Học viên có nền tảng ngữ pháp khá..." icon={<Target size={14} />} /> {/* Dữ liệu cứng */}
               </div>
            </SectionPanel>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SectionPanel title="Thống kê nhanh" icon={<BarChart2 size={20} color="#2563eb" />}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}> {/* Dữ liệu cứng */}
                <StatBox value="0" label="Đã học (buổi)" /> {/* Dữ liệu cứng */}
                <StatBox value="0%" label="Làm BTVN" /> {/* Dữ liệu cứng */}
                <StatBox value="0" label="Vắng mặt" color="#ef4444" /> {/* Dữ liệu cứng */}
                <StatBox value="0" label="Điểm chuyên cần" color="#f59e0b" hasStar /> {/* Dữ liệu cứng */}
              </div>
            </SectionPanel>

            <SectionPanel title="Thông tin liên hệ" icon={<Contact size={20} color="#2563eb" />}> {/* Dữ liệu cứng */}
               {/* Contact info list từ HTML */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InfoItem label="Email" value={student.email} />
                  <InfoItem label="Số điện thoại" value={student.phone} />
               </div>
            </SectionPanel>
          </div>
        </div>
      </div>
    </>
  );
}

// Các Helper Components để tái sử dụng
function SectionPanel({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  );
}

function TimelineItem({ title, date, text, icon = <Check size={14} /> }: { title: string, date: string, text: string, icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 24, height: 24, border: '2px solid #2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>{date}</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  );
}

function StatBox({ value, label, color = "#2563eb", hasStar = false }: { value: string, label: string, color?: string, hasStar?: boolean }) {
  return (
    <div style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {value} {hasStar && <Star size={20} />}
      </div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  );
}