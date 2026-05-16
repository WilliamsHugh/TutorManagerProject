'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/tutor/Header';
import { Icon } from '@iconify/react';
import { getTutorDashboard } from '@/lib/api'; 
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';

export default function TutorDashboard() {
  // 1. Khởi tạo State rỗng để đợi dữ liệu từ backend
  const [stats, setStats] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [suggestedClasses, setSuggestedClasses] = useState<any[]>([]);
  const [currentClasses, setCurrentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 2. Tự động lấy dữ liệu từ Backend khi load trang
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Gọi API thực tế
        const data = await getTutorDashboard(currentDate.toISOString().split('T')[0]);
        
        setStats(data.stats || []);
        setCalendar(data.calendar || []);
        setSuggestedClasses(data.suggestedClasses || []);
        setCurrentClasses(data.currentClasses || []);
        setProfile(data.profile);
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentDate]);

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const formatWeekRange = () => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate);
    monday.setDate(diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${monday.getDate()}/${monday.getMonth() + 1} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
  };

  return (
    <>
      <Header title="Dashboard Gia sư" showSearch={true} userProfile={profile} />
      
      <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* User Info Welcome Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold'
          }}>
            {profile?.fullName?.charAt(0) || 'G'}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Chào mừng trở lại, {profile?.fullName || 'Gia sư'}!</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            <Icon icon="lucide:loader-2" className="animate-spin inline-block mr-2" /> Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* Stats Row */}
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {stats.length > 0 ? stats.map((stat, i) => (
                <div key={i} className="stat-card" style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`stat-icon ${stat.color}`} style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                    <Icon icon={stat.icon} />
                  </div>
                  <div className="stat-data" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="stat-label" style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
                    <span className="stat-value" style={{ fontSize: '24px', fontWeight: 700 }}>
                      {stat.value} {stat.sub && <span style={{ fontSize: '13px', color: '#64748b' }}>{stat.sub}</span>}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  Chưa có dữ liệu thống kê.
                </div>
              )}
            </div>

            {/* Main Grid: Calendar & Suggestions */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Weekly Calendar */}
              <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Lịch dạy tuần này</h2>
                  <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => changeWeek(-1)}
                      style={{ border: '1px solid #e2e8f0', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    ><Icon icon="lucide:chevron-left" /></button>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatWeekRange()}</span>
                    <button 
                      onClick={() => changeWeek(1)}
                      style={{ border: '1px solid #e2e8f0', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    ><Icon icon="lucide:chevron-right" /></button>
                  </div>
                </div>
                <div className="calendar-container" style={{ padding: '24px' }}>
                  {calendar.length > 0 ? (
                    <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                      {calendar.map((item, i) => (
                        <div key={i} className={`c-day ${item.isToday ? 'today' : ''}`} style={{ background: item.isToday ? '#eff6ff' : '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '180px' }}>
                          <div className="c-day-header" style={{ textAlign: 'center', borderBottom: '1px dashed #e2e8f0', marginBottom: '12px', paddingBottom: '8px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{item.day}</div>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>{item.date}</div>
                          </div>
                          {item.event && (
                            <div className={`event ${item.event.color}`} style={{ padding: '8px', borderRadius: '4px', fontSize: '11px', background: '#dbeafe', borderLeft: '3px solid #3b82f6' }}>
                              <div style={{ fontWeight: 700 }}>{item.event.time}</div>
                              <div style={{ fontWeight: 600 }}>{item.event.title}</div>
                              <div style={{ marginTop: '4px' }}>{item.event.student}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>Không có lịch dạy nào trong tuần này.</div>
                  )}
                </div>
              </div>

              {/* Suggested Classes */}
              <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Lớp học mới gợi ý</h2>
                  <Link href="/classes" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>Xem tất cả</Link>
                </div>
                <div className="suggested-list" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {suggestedClasses.length > 0 ? suggestedClasses.map((cls, i) => (
                    <div key={i} className="s-item" style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>{cls.subject}</span>
                        {cls.isNew && <span style={{ background: '#fef08a', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>MỚI</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:map-pin" /> {cls.location}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:calendar-clock" /> {cls.schedule}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon icon="lucide:banknote" /> {cls.price}</div>
                      </div>
                      <button style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'none', cursor: 'pointer' }}>Xem chi tiết</button>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>Chưa có lớp học gợi ý lúc này.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Classes Table */}
            <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Danh sách lớp đang phụ trách</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>
                    <th style={{ padding: '16px 24px' }}>Mã lớp</th>
                    <th style={{ padding: '16px 24px' }}>Môn học</th>
                    <th style={{ padding: '16px 24px' }}>Học viên</th>
                    <th style={{ padding: '16px 24px' }}>Tiến độ</th>
                    <th style={{ padding: '16px 24px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClasses.length > 0 ? currentClasses.map((cls, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 500 }}>{cls.id}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500 }}>{cls.subject}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{cls.type}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>{cls.student}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{ height: '100%', background: '#2563eb', width: `${cls.progress}%` }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{cls.sessions}</span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }} title="Báo cáo"><Icon icon="lucide:file-text" fontSize={18} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Nhắn tin"><Icon icon="lucide:message-square" fontSize={18} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Bạn chưa phụ trách lớp nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}