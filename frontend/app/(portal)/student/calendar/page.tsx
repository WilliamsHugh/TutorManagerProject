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
    // Log event data for debugging
    console.log('[Calendar] Event clicked:', { id: event.id, classId: event.class?.id, sessionDate: event.sessionDate });

    // Extract classId from various possible locations in the event data
    const classId = event.class?.id || event.classId || (event as any).class_id;
    let sessionDate = event.sessionDate || (event as any).date;
    const subjectName = event.class?.subject?.name || event.subject || 'Môn học';
    const tutorName = event.class?.tutor?.user?.fullName || (event as any).tutorName || '';

    if (!classId) {
      console.error('[Calendar] Missing classId in event:', event);
      setReportError('Không thể xác định lớp học cho buổi này.');
      setReportData([]);
      setSelectedSession({ classId: '', sessionDate: '', title: subjectName });
      setReportOpen(true);
      setReportLoading(false);
      return;
    }

    const dateStr = !sessionDate
      ? ''
      : typeof sessionDate === 'string'
        ? sessionDate.split('T')[0]
        : new Date(sessionDate).toISOString().split('T')[0];

    setSelectedSession({ classId, sessionDate: dateStr, title: `${subjectName}${tutorName ? ` - ${tutorName}` : ''}` });
    setReportOpen(true);
    setReportLoading(true);
    setReportError(null);

    if (!dateStr) {
      console.error('[Calendar] Missing sessionDate in event:', event);
      setReportError('Không thể xác định ngày học cho buổi này.');
      setReportData([]);
      setReportLoading(false);
      return;
    }

    try {
      const data = await getStudentScheduleReport(classId, dateStr);
      setReportData(data);
    } catch (err: any) {
      console.error('[Calendar] Failed to fetch report:', err);
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
