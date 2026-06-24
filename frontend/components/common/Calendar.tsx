'use client';

import React, { useEffect, useState, useMemo, ReactNode } from 'react';
import { Icon } from '@iconify/react';

// ─── Constants ───────────────────────────────────────────
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HOUR_HEIGHT = 60;
const START_HOUR = 6;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;

export type ViewMode = 'week' | 'day' | 'month';

// ─── Helpers ─────────────────────────────────────────────
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) + parseInt(parts[1] || '0', 10) / 60;
}

function getDayLabelIndex(dayOfWeek: string): number {
  return DAY_LABELS.indexOf(dayOfWeek);
}

// ─── Types ───────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  sessionStatus?: string;
  sessionDate?: string;
  note?: string;
  class?: {
    id?: string;
    subject?: { name?: string };
    tutor?: { user?: { fullName?: string } };
    student?: { user?: { fullName?: string } };
    location?: string;
  };
  [key: string]: any;
}

export interface CalendarProps {
  /** Async function to fetch schedule data. Receives current date and view mode. */
  fetchSchedules: (date: Date, viewMode: ViewMode) => Promise<CalendarEvent[]>;
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Extra toolbar buttons on the right (e.g. "Tạo lịch nghỉ" for tutor) */
  extraToolbarActions?: ReactNode;
  /** Called when an event card is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Whether this calendar is in a loading state externally */
  externalLoading?: boolean;
  /** Custom header component (e.g. tutor Header with userProfile) */
  headerComponent?: ReactNode;
}

// ─── EventBadge Component ────────────────────────────────
function EventBadge({ event, compact = false, onClick }: {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (event: CalendarEvent) => void;
}) {
  const isCancelled = event.sessionStatus === 'cancelled';
  const isCompleted = event.sessionStatus === 'completed';
  const subjectName = event.class?.subject?.name || 'Môn học';
  const personName = event.class?.tutor?.user?.fullName || event.class?.student?.user?.fullName || '';
  const start = event.startTime?.slice(0, 5) || '';
  const end = event.endTime?.slice(0, 5) || '';

  let bg = '#eff6ff';
  let border = '#bfdbfe';
  let text = '#1e40af';
  let badgeLabel = '';
  let badgeBg = '';
  let borderLeftColor = '#3b82f6';

  if (isCancelled) {
    bg = '#fef2f2';
    border = '#fca5a5';
    text = '#991b1b';
    badgeLabel = 'Đã hủy';
    badgeBg = '#fee2e2';
    borderLeftColor = '#ef4444';
  } else if (isCompleted) {
    bg = '#f0fdf4';
    border = '#bbf7d0';
    text = '#166534';
    badgeLabel = 'Xong';
    badgeBg = '#dcfce7';
    borderLeftColor = '#22c55e';
  }

  if (compact) {
    return (
      <div
        className="rounded px-1.5 py-1 text-[11px] font-semibold leading-tight truncate shadow-sm border-l-2 cursor-pointer hover:shadow-md transition-shadow"
        style={{ background: bg, borderColor: border, borderLeftColor, color: text }}
        title={`${subjectName}\n${start} - ${end}`}
        onClick={() => onClick?.(event)}
      >
        {start} {subjectName}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-3 text-sm shadow-sm border-l-4 transition-shadow hover:shadow-md cursor-pointer"
      style={{
        background: bg,
        borderColor: border,
        borderLeftColor,
        color: text,
        opacity: isCancelled ? 0.8 : 1,
      }}
      onClick={() => onClick?.(event)}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-bold text-xs" style={{ color: isCancelled ? '#ef4444' : isCompleted ? '#16a34a' : '#2563eb' }}>
          {start} - {end}
        </span>
        {badgeLabel && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: badgeBg, color: isCancelled ? '#ef4444' : '#16a34a' }}
          >
            {badgeLabel}
          </span>
        )}
      </div>
      <div className={`font-semibold mb-0.5 ${isCancelled ? 'line-through' : ''}`}>
        {subjectName}
      </div>
      <div className="text-xs flex items-center gap-2 opacity-75">
        <span className="flex items-center gap-1">
          <Icon icon="lucide:user" fontSize={11} />
          {personName}
        </span>
      </div>
      {event.note && (
        <div className="mt-1.5 text-[11px] bg-white/60 rounded px-2 py-1 leading-relaxed opacity-75">
          {event.note}
        </div>
      )}
    </div>
  );
}

// ─── Calendar Component ──────────────────────────────────
export default function Calendar({
  fetchSchedules,
  title,
  description,
  emptyMessage,
  extraToolbarActions,
  onEventClick,
  externalLoading,
  headerComponent,
}: CalendarProps) {
  const [schedules, setSchedules] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  /** Derive dayOfWeek label from a date string or Date object */
  function deriveDayOfWeek(d: string | Date | undefined): string | undefined {
    if (!d) return undefined;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return undefined;
    const day = date.getDay(); // 0=Sun, 1=Mon...
    return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day === 0 ? 0 : day];
  }

  /** Normalize events from various API response shapes to CalendarEvent */
  const normalizeEvents = (raw: any[]): CalendarEvent[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((ev: any) => {
      // If already in CalendarEvent shape (has id + class.subject), use as-is
      if (ev?.class?.subject?.name) return ev as CalendarEvent;

      // If in tutor API shape: flat fields like time, subject, student, status
      const timeParts = ev.time?.split(' - ') || [];
      return {
        id: ev.id || '',
        dayOfWeek: ev.dayOfWeek || deriveDayOfWeek(ev.date || ev.sessionDate),
        startTime: ev.startTime || timeParts[0] || '',
        endTime: ev.endTime || timeParts[1] || '',
        sessionStatus: ev.sessionStatus || ev.status || 'scheduled',
        sessionDate: ev.sessionDate || ev.date || null,
        note: ev.note,
        class: ev.class || {
          subject: { name: ev.subject || 'Môn học' },
          tutor: { user: { fullName: ev.tutorName || ev.student || '' } },
          location: ev.location,
        },
      };
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const raw = await fetchSchedules(currentDate, viewMode);
      setSchedules(normalizeEvents(raw));
    } catch (error) {
      console.error('Lỗi tải lịch:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentDate, viewMode]);

  // ── Navigation ──
  const navigateDate = (offset: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + offset);
    else if (viewMode === 'week') d.setDate(d.getDate() + offset * 7);
    else d.setDate(d.getDate() + offset);
    setCurrentDate(d);
  };

  const titleStr = useMemo(() => {
    if (viewMode === 'month')
      return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    if (viewMode === 'day')
      return formatDate(currentDate);
    const start = getStartOfWeek(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  }, [currentDate, viewMode]);

  // ── Month helpers ──
  const monthDays = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days: { date: Date; currentMonth: boolean }[] = [];
    const startDow = start.getDay() || 7;
    for (let i = startDow - 1; i > 0; i--) {
      const d = new Date(start);
      d.setDate(start.getDate() - i);
      days.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= end.getDate(); i++)
      days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), currentMonth: true });
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() + i);
      days.push({ date: d, currentMonth: false });
    }
    return days;
  }, [currentDate]);

  // ── Week grid ──
  const weekGrid = useMemo(() => {
    const weekStart = getStartOfWeek(currentDate);
    const timeSlots: { label: string; hour: number }[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      timeSlots.push({ label: `${String(h).padStart(2, '0')}:00`, hour: h });
    }
    const dayCols = DAY_LABELS.map((label, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const isToday = date.toDateString() === new Date().toDateString();
      return { label, date: date.getDate().toString(), isToday, fullDate: date };
    });
    return { weekStart, timeSlots, dayCols };
  }, [currentDate]);

  /** Check if an event's sessionDate falls within a date range [start, end] */
  function isEventInRange(event: CalendarEvent, start: Date, end: Date): boolean {
    if (!event.sessionDate) {
      // No date — fall back to dayOfWeek matching for recurring events
      return true;
    }
    const d = typeof event.sessionDate === 'string' ? new Date(event.sessionDate) : event.sessionDate;
    if (isNaN(d.getTime())) return true; // can't determine, show it
    return d >= start && d <= end;
  }

  /** Get the current week's Monday 00:00 and Sunday 23:59:59 */
  function getWeekRange(date: Date) {
    const start = getStartOfWeek(date); // Monday 00:00
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /** Get today's date range (00:00 - 23:59:59) */
  function getDayRange(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // ── Week events positioned ──
  const weekEvents = useMemo(() => {
    if (!schedules.length) return [];
    const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);
    return schedules
      .filter((s: any) => isEventInRange(s, weekStart, weekEnd) && s.dayOfWeek)
      .map((s: any) => {
        const dayIdx = getDayLabelIndex(s.dayOfWeek);
        if (dayIdx === -1) return null;
        const startH = parseTime(s.startTime);
        const endH = parseTime(s.endTime);
        return {
          event: s,
          dayIdx,
          top: (startH - START_HOUR) * HOUR_HEIGHT,
          height: Math.max((endH - startH) * HOUR_HEIGHT, 28),
        };
      }).filter(Boolean);
  }, [schedules, currentDate]);

  // ── Day events ──
  const dayEvents = useMemo(() => {
    if (!schedules.length) return [];
    const { start, end } = getDayRange(currentDate);
    return schedules.filter((s: any) => isEventInRange(s, start, end) && s.dayOfWeek);
  }, [schedules, currentDate]);

  const isLoading = loading || externalLoading;

  // ── Render ──
  const renderCalendar = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <Icon icon="lucide:loader-2" className="animate-spin" fontSize={36} color="#64748b" />
          <p className="mt-3 text-sm text-[#64748b]">Đang tải lịch...</p>
        </div>
      );
    }

    if (schedules.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#e0e7ff] flex items-center justify-center mb-4">
            <Icon icon="lucide:calendar" fontSize={32} color="#4f46e5" />
          </div>
          <h3 className="text-lg font-bold text-[#0f172a]">Chưa có lịch</h3>
          <p className="mt-1 text-sm text-[#64748b] max-w-sm">
            {emptyMessage || 'Chưa có dữ liệu lịch để hiển thị.'}
          </p>
        </div>
      );
    }

    return (
      <>
        {/* ═══ WEEK VIEW ═══ */}
        {viewMode === 'week' && (
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
            <div className="grid border-b border-[#e2e8f0]" style={{ gridTemplateColumns: '70px repeat(7, 1fr)' }}>
              <div className="border-r border-[#e2e8f0] bg-[#f8fafc]" />
              {weekGrid.dayCols.map((col, i) => (
                <div
                  key={i}
                  className={`py-3 px-1 text-center border-r last:border-r-0 ${col.isToday ? 'bg-[#eff6ff]' : 'bg-[#f8fafc]'}`}
                >
                  <div className="text-xs font-medium text-[#64748b]">{col.label}</div>
                  <div className={`text-xl font-bold ${col.isToday ? 'text-white bg-[#2563eb] w-9 h-9 rounded-full flex items-center justify-center mx-auto' : 'text-[#1e293b]'}`}>
                    {col.date}
                  </div>
                </div>
              ))}
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <div className="relative" style={{ gridTemplateColumns: '70px repeat(7, 1fr)', display: 'grid' }}>
                <div className="border-r border-[#e2e8f0] relative">
                  {weekGrid.timeSlots.map((slot, i) => (
                    <div key={i} className="border-b border-[#f1f5f9] text-[11px] text-[#94a3b8] font-medium pr-2 text-right relative" style={{ height: HOUR_HEIGHT }}>
                      <span className="absolute -top-2 right-2">{slot.label}</span>
                    </div>
                  ))}
                </div>
                {weekGrid.dayCols.map((col, colIdx) => (
                  <div key={colIdx} className={`border-r last:border-r-0 relative ${col.isToday ? 'bg-[#fafcff]' : 'bg-white'}`}>
                    {weekGrid.timeSlots.map((_, i) => (
                      <div key={i} className="border-b border-[#f1f5f9]" style={{ height: HOUR_HEIGHT }} />
                    ))}
                    {weekEvents.filter((ew: any) => ew.dayIdx === colIdx).map((ew: any, idx: number) => {
                      const e = ew.event;
                      const isCancelled = e.sessionStatus === 'cancelled';
                      const isCompleted = e.sessionStatus === 'completed';
                      let bg = '#eff6ff', border = '#bfdbfe', text = '#1e40af';
                      if (isCancelled) { bg = '#fef2f2'; border = '#fca5a5'; text = '#991b1b'; }
                      else if (isCompleted) { bg = '#f0fdf4'; border = '#bbf7d0'; text = '#166534'; }
                      return (
                        <div
                          key={idx}
                          className="absolute left-0.5 right-0.5 rounded px-1.5 py-1 text-[11px] font-semibold leading-tight overflow-hidden shadow-sm border-l-[3px] z-10 cursor-pointer hover:shadow-md transition-shadow"
                          style={{
                            top: ew.top, height: ew.height, background: bg, borderColor: border,
                            borderLeftColor: isCancelled ? '#ef4444' : isCompleted ? '#22c55e' : '#3b82f6',
                            color: text, opacity: isCancelled ? 0.7 : 1,
                          }}
                          title={`${e.class?.subject?.name || 'Môn học'}\n${e.startTime?.slice(0, 5)} - ${e.endTime?.slice(0, 5)}`}
                          onClick={() => onEventClick?.(e)}
                        >
                          <div className="font-bold truncate">{e.startTime?.slice(0, 5)}</div>
                          <div className={`truncate ${isCancelled ? 'line-through' : ''}`}>{e.class?.subject?.name || 'Môn'}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ DAY VIEW ═══ */}
        {viewMode === 'day' && (
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-6 py-4">
              <div className="text-xs font-medium text-[#64748b]">
                {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][currentDate.getDay()]}
              </div>
              <div className="text-2xl font-bold text-[#1e293b]">{formatDate(currentDate)}</div>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <div className="relative px-6 py-4">
                {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                  const hour = START_HOUR + i;
                  const hourLabel = `${String(hour).padStart(2, '0')}:00`;
                  const eventsAtHour = dayEvents.filter(e => Math.floor(parseTime(e.startTime)) === hour);
                  return (
                    <div key={i} className="flex gap-4 group" style={{ minHeight: HOUR_HEIGHT }}>
                      <div className="w-16 shrink-0 text-right pt-0">
                        <span className="text-[11px] font-medium text-[#94a3b8]">{hourLabel}</span>
                      </div>
                      <div className="flex-1 border-t border-[#f1f5f9] relative min-h-15 pb-1">
                        {eventsAtHour.map((ev: any, idx: number) => (
                          <div key={idx} className="mt-1">
                            <EventBadge event={ev} onClick={onEventClick} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {dayEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-xl bg-[#f1f5f9] flex items-center justify-center mb-3">
                      <Icon icon="lucide:calendar-off" fontSize={28} color="#94a3b8" />
                    </div>
                    <p className="text-sm font-medium text-[#64748b]">Không có lịch trong ngày này.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MONTH VIEW ═══ */}
        {viewMode === 'month' && (
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-7">
              {DAY_LABELS.map(h => (
                <div key={h} className="py-3 text-center text-xs font-bold text-[#94a3b8] bg-[#f8fafc] border-b border-[#e2e8f0] border-r last:border-r-0">
                  {h}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((item, i) => {
                const dayIdx = i % 7;
                const label = DAY_LABELS[dayIdx];
                // Filter by exact date match: events whose sessionDate === item.date
                const daySchedules = schedules.filter((s: any) => {
                  if (s.sessionDate) {
                    const d = typeof s.sessionDate === 'string' ? new Date(s.sessionDate) : s.sessionDate;
                    if (!isNaN(d.getTime())) {
                      return d.toDateString() === item.date.toDateString();
                    }
                  }
                  // Fallback: no date — match by dayOfWeek column
                  return s.dayOfWeek === label;
                });
                const isToday = item.date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`min-h-25 border-r border-b border-[#f1f5f9] p-1.5 ${item.currentMonth ? 'bg-white' : 'bg-[#fafbfc]'} ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                  >
                    <div className={`text-xs font-bold text-right mb-1 w-7 h-7 flex items-center justify-center ml-auto rounded-full ${isToday ? 'bg-[#2563eb] text-white' : item.currentMonth ? 'text-[#64748b]' : 'text-[#cbd5e1]'}`}>
                      {item.date.getDate()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {daySchedules.slice(0, 3).map((ev: any, idx: number) => (
                        <EventBadge key={idx} event={ev} compact onClick={onEventClick} />
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-[10px] text-[#94a3b8] font-medium pl-1">+{daySchedules.length - 3} buổi</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748b]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#eff6ff] border border-[#bfdbfe] inline-block" />
            Đang học
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#f0fdf4] border border-[#bbf7d0] inline-block" />
            Đã hoàn thành
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#fef2f2] border border-[#fca5a5] inline-block" />
            Đã hủy
          </span>
        </div>
      </>
    );
  };

  return (
    <>
      {headerComponent}
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-[#64748b]">{description}</p>
            </div>
            <div className="flex bg-[#f1f5f9] rounded-lg p-0.5 self-start">
              {(['week', 'day', 'month'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold cursor-pointer border-none transition-all ${viewMode === mode ? 'bg-white text-[#2563eb] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
                >
                  {mode === 'week' ? 'Tuần' : mode === 'day' ? 'Ngày' : 'Tháng'}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0f172a] hover:bg-[#f8fafc] transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
            <div className="flex items-center bg-white rounded-lg border border-[#e2e8f0]">
              <button onClick={() => navigateDate(-1)} className="border-none bg-transparent p-2 cursor-pointer text-[#64748b] hover:text-[#0f172a] transition-colors">
                <Icon icon="lucide:chevron-left" fontSize={20} />
              </button>
              <button onClick={() => navigateDate(1)} className="border-none bg-transparent p-2 cursor-pointer text-[#64748b] hover:text-[#0f172a] transition-colors">
                <Icon icon="lucide:chevron-right" fontSize={20} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-[#1e293b] m-0">{titleStr}</h2>
            <div className="ml-auto flex items-center gap-2">
              {extraToolbarActions}
            </div>
          </div>

          {renderCalendar()}
        </div>
      </div>
    </>
  );
}
