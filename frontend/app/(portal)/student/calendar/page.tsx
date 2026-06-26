'use client';

import React, { useState, useCallback } from 'react';
import Calendar from '@/components/common/Calendar';
import { getStudentMySchedule, getStudentScheduleReport } from '@/lib/api/classes.api';
import LearningReportPopup, { LearningReport } from '@/components/common/LearningReportPopup';
import type { CalendarEvent } from '@/components/common/Calendar';

export default function StudentCalendarPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<LearningReport[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<{
    classId: string;
    sessionDate: string;
    title: string;
  } | null>(null);

  const handleEventClick = useCallback(async (event: CalendarEvent) => {
    const classId = event.class?.id;
    const sessionDate = event.sessionDate;

    if (!classId || !sessionDate) {
      // If no class ID or date, can't fetch report
      return;
    }

    const dateStr = typeof sessionDate === 'string' ? sessionDate.split('T')[0] : new Date(sessionDate).toISOString().split('T')[0];
    const subjectName = event.class?.subject?.name || 'Môn học';
    const tutorName = event.class?.tutor?.user?.fullName || '';

    setSelectedSession({ classId, sessionDate: dateStr, title: `${subjectName}${tutorName ? ` - ${tutorName}` : ''}` });
    setReportOpen(true);
    setReportLoading(true);
    setReportError(null);

    try {
      const data = await getStudentScheduleReport(classId, dateStr);
      setReportData(data);
    } catch (err: any) {
      setReportError(err.message || 'Không thể tải báo cáo buổi học');
      setReportData([]);
    } finally {
      setReportLoading(false);
    }
  }, []);

  const handleCloseReport = useCallback(() => {
    setReportOpen(false);
    setSelectedSession(null);
    setReportData([]);
    setReportError(null);
  }, []);

  return (
    <>
      <Calendar
        fetchSchedules={async () => getStudentMySchedule()}
        title="Lịch học của tôi"
        description="Theo dõi lịch học các lớp đang tham gia. Nhấp vào buổi học để xem báo cáo từ gia sư."
        emptyMessage="Bạn chưa có lớp học nào đang hoạt động. Sau khi được xếp lớp, lịch học sẽ hiển thị tại đây."
        onEventClick={handleEventClick}
      />

      {reportOpen && (
        <LearningReportPopup
          reports={reportData}
          isLoading={reportLoading}
          error={reportError}
          title="Báo cáo buổi học"
          subtitle={selectedSession?.title}
          onClose={handleCloseReport}
          singleReportMode
        />
      )}
    </>
  );
}
