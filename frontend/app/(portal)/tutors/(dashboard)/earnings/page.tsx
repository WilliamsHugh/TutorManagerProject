'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getTutorEarnings } from '@/lib/api';
import Header from '@/components/tutor/Header';
import { Skeleton, SkeletonTable } from '@/components/common/Skeleton';

export default function TutorEarnings() {
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await getTutorEarnings();
        setEarnings(data);
      } catch (error) {
        console.error("Lỗi tải báo cáo thu nhập:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return (
      <>
        <Header title="Thu nhập" />
        <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
                <Skeleton className="size-14 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-7 w-32" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <Skeleton className="mb-6 h-5 w-48" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <SkeletonTable rows={5} columns={5} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Thu nhập" />
      
      <div className="content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#6366f1' }}>
              <Icon icon="lucide:wallet" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Tổng thu nhập</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(earnings?.totalEarnings || 0)}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#22c55e' }}>
              <Icon icon="lucide:trending-up" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Thu nhập tháng này</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(earnings?.currentMonthEarnings || 0)}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#ef4444' }}>
              <Icon icon="lucide:book-open" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Số buổi đã dạy</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {earnings?.totalSessions || 0} buổi
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#a855f7' }}>
              <Icon icon="lucide:calculator" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Trung bình mỗi buổi</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(earnings?.averagePerSession || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              <Icon icon="lucide:bar-chart-3" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Thu nhập theo tháng
            </h2>
          </div>
          <div style={{ padding: '24px' }}>
            {earnings?.monthly && earnings.monthly.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {earnings.monthly.map((item: any, i: number) => {
                  const maxAmount = Math.max(...earnings.monthly.map((m: any) => m.amount));
                  const percent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Tháng {item.month}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb' }}>{formatCurrency(item.amount)}</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percent}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '99px', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                Chưa có dữ liệu thu nhập theo tháng.
              </div>
            )}
          </div>
        </div>

        {/* Per-Class Breakdown */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              <Icon icon="lucide:layers" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Thu nhập theo lớp học
            </h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', fontSize: '13px', color: '#64748b' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Môn học</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600 }}>Học viên</th>
                <th style={{ padding: '12px 24px', textAlign: 'center', fontWeight: 600 }}>Số buổi</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600 }}>Học phí/buổi</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 600 }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {earnings?.byClass && earnings.byClass.length > 0 ? earnings.byClass.map((cls: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 500 }}>{cls.subject}</td>
                  <td style={{ padding: '14px 24px', color: '#475569' }}>{cls.studentName}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'center' }}>{cls.sessions}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'right', color: '#64748b' }}>{formatCurrency(cls.feePerSession)}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{formatCurrency(cls.totalEarnings)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    Chưa có dữ liệu thu nhập. Hãy bắt đầu gửi báo cáo buổi học để theo dõi thu nhập!
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc' }}>
                <td colSpan={4} style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 600 }}>Tổng cộng:</td>
                <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 700, color: '#16a34a', fontSize: '16px' }}>
                  {formatCurrency(earnings?.totalEarnings || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </>
  );
}
