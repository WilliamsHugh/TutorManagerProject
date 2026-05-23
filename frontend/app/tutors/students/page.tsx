'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getTutorStudents } from '@/lib/api';
import Link from 'next/link';

export default function MyStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
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

  return (
    <>
      <Header title="Học viên của tôi" userProfile={profile} />
      
      <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Danh sách học viên</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Quản lý và theo dõi tiến độ của tất cả học viên bạn đang giảng dạy.</p>
          </div>
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <Icon icon="lucide:loader-2" className="animate-spin" fontSize={32} />
              <p style={{ marginTop: '12px' }}>Đang tải danh sách...</p>
            </div>
          ) : students.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>
                  <th style={{ padding: '16px 24px' }}>Học viên</th>
                  <th style={{ padding: '16px 24px' }}>Cấp học</th>
                  <th style={{ padding: '16px 24px' }}>Môn học gần nhất</th>
                  <th style={{ padding: '16px 24px' }}>Trạng thái</th>
                  <th style={{ padding: '16px 24px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={student.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{student.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{student.gradeLevel}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{student.lastSubject}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, background: student.status === 'Đang học' ? '#dcfce7' : '#f1f5f9', color: student.status === 'Đang học' ? '#15803d' : '#64748b' }}>
                        {student.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button onClick={() => router.push(`/tutors/students/${student.id}`)} style={{ color: '#2563eb', fontSize: '14px', fontWeight: 500, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Bạn chưa có học viên nào trong danh sách.</div>
          )}
        </div>
      </div>
    </>
  );
}