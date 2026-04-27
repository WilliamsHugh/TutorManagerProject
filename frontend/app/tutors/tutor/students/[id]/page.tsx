'use client';

import React from 'react';
import Header from '@/components/tutor/Header';
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

export default function StudentDetailPage() {
  return (
    <>
      <Header title="Chi tiết học viên" />
      
      <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
          <Link href="/tutors/tutor/students" style={{ color: '#64748b', textDecoration: 'none' }}>Học viên của tôi</Link>
          <div className="separator" style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={16} />
          </div>
          <span style={{ color: '#0f172a', fontWeight: 500 }}>Lê Minh Tuấn</span>
        </div>

        {/* Profile Card */}
        <div className="profile-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <img
            src="https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F13-17%2FSoutheast%20Asian%2F2"
            className="profile-avatar"
            alt="Student Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
          />
          <div className="profile-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
            <h2 className="profile-name" style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Lê Minh Tuấn</h2>
            <div className="profile-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '14px' }}>
              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Hash size={16} /> <span>ST-10294</span></div>
              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={16} /> <span>Lớp 12</span></div>
              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={16} /> <span>Tham gia: 15/08/2023</span></div>
            </div>
          </div>
          <div className="profile-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 8, background: 'transparent' }}>
              <MessageSquare size={16} /> Nhắn tin
            </button>
            <button className="btn btn-primary" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardEdit size={16} /> Thêm đánh giá
            </button>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SectionPanel title="Hồ sơ năng lực & Tiến độ" icon={<TrendingUp size={20} color="#2563eb" />}>
              <div className="progress-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 500 }}>
                  <span>Tiến độ khóa học (13/20 buổi)</span>
                  <span>65%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#2563eb', width: '65%' }}></div>
                </div>
              </div>
              {/* Thêm các điểm thành phần Reading, Listening... tương tự */}
            </SectionPanel>

            <SectionPanel title="Đánh giá quá trình" icon={<ClipboardList size={20} color="#2563eb" />}>
               {/* Timeline Content từ Studentdetail.html */}
               <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                  <TimelineItem title="Đánh giá giữa kỳ" date="15/09/2023" text="Tuấn đã có sự tiến bộ rõ rệt ở kỹ năng Reading..." />
                  <TimelineItem title="Đánh giá đầu vào" date="15/08/2023" text="Học viên có nền tảng ngữ pháp khá..." icon={<Target size={14} />} />
               </div>
            </SectionPanel>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SectionPanel title="Thống kê nhanh" icon={<BarChart2 size={20} color="#2563eb" />}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <StatBox value="13" label="Đã học (buổi)" />
                <StatBox value="95%" label="Làm BTVN" />
                <StatBox value="01" label="Vắng mặt" color="#ef4444" />
                <StatBox value="4.8" label="Điểm chuyên cần" color="#f59e0b" hasStar />
              </div>
            </SectionPanel>

            <SectionPanel title="Thông tin liên hệ" icon={<Contact size={20} color="#2563eb" />}>
               {/* Contact info list từ HTML */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <InfoItem label="Người liên hệ" value="Lê Hải Phong (Bố)" />
                  <InfoItem label="Số điện thoại" value="090 123 4567" />
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