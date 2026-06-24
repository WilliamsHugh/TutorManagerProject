'use client';

import React from 'react';
import Calendar from '@/components/common/Calendar';
import { getStudentMySchedule } from '@/lib/api/classes.api';

export default function StudentCalendarPage() {
  return (
    <Calendar
      fetchSchedules={async () => getStudentMySchedule()}
      title="Lịch học của tôi"
      description="Theo dõi lịch học các lớp đang tham gia."
      emptyMessage="Bạn chưa có lớp học nào đang hoạt động. Sau khi được xếp lớp, lịch học sẽ hiển thị tại đây."
    />
  );
}
