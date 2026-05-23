import Sidebar from '@/components/tutor/Sidebar';

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Nội dung Header sẽ được quản lý bởi từng trang để thay đổi tiêu đề */}
        {children}
      </div>
    </div>
  );
}