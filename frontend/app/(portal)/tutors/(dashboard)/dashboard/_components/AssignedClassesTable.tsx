'use client';

import { Icon } from '@iconify/react';

interface AssignedClassesTableProps {
  currentClasses: any[];
  onReportClick: (cls: any) => void;
  onMessageClick: () => void;
}

export function AssignedClassesTable({
  currentClasses,
  onReportClick,
  onMessageClick,
}: AssignedClassesTableProps) {
  return (
    <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>Danh sách lớp đang phụ trách</h2>
      </div>
      <div className="overflow-x-auto">
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
              <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }} className="hover:bg-slate-50 transition-colors">
                <td style={{ padding: '16px 24px', fontWeight: 500 }} className="text-slate-800">{cls.id}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 500 }} className="text-slate-800">{cls.subject}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{cls.type}</div>
                </td>
                <td style={{ padding: '16px 24px' }} className="text-slate-700">{cls.student}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div style={{ height: '100%', background: '#2563eb', width: `${cls.progress}%` }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{cls.sessions}</span>
                </td>
                <td style={{ padding: '16px 24px' }} className="space-x-2">
                  <button 
                    onClick={() => onReportClick({ id: cls.id, classId: cls.rawId, name: cls.subject, student: cls.student })}
                    className="hover:text-blue-600 text-slate-500 cursor-pointer"
                    title="Báo cáo"
                  >
                    <Icon icon="lucide:file-text" fontSize={18} />
                  </button>
                  <button 
                    onClick={onMessageClick}
                    className="hover:text-blue-600 text-slate-500 cursor-pointer"
                    title="Nhắn tin"
                  >
                    <Icon icon="lucide:message-square" fontSize={18} />
                  </button>
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
    </div>
  );
}
