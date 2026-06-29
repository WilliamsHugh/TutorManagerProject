"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";

const WEEK_DAYS = [
  { label: "Thứ 2", value: "T2" },
  { label: "Thứ 3", value: "T3" },
  { label: "Thứ 4", value: "T4" },
  { label: "Thứ 5", value: "T5" },
  { label: "Thứ 6", value: "T6" },
  { label: "Thứ 7", value: "T7" },
  { label: "Chủ nhật", value: "CN" },
];

type TimeSlot = { start: string; end: string };

type SchedulePickerProps = {
  value: string;
  onChange: (schedule: string) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
};

/**
 * Parse an existing schedule string back into day/time state.
 * Supports formats like: "Thứ 3 (19:00-21:00), Thứ 5 (19:00-21:00)"
 * and "Tối Thứ 2, Thứ 4 · 19:00 - 21:00"
 */
function parseScheduleString(scheduleStr: string): {
  activeDays: Record<string, boolean>;
  dayTimes: Record<string, TimeSlot>;
} {
  const activeDays: Record<string, boolean> = {};
  const dayTimes: Record<string, TimeSlot> = {};

  if (!scheduleStr) return { activeDays, dayTimes };

  const labelToVal: Record<string, string> = {
    "thứ 2": "T2", "thứ 3": "T3", "thứ 4": "T4",
    "thứ 5": "T5", "thứ 6": "T6", "thứ 7": "T7",
    "chủ nhật": "CN", "cn": "CN",
  };

  // Format 1: "Thứ 3 (19:00-21:00), Thứ 5 (19:00-21:00)"
  if (scheduleStr.includes("(")) {
    const items = scheduleStr.split(",");
    items.forEach((item) => {
      const trimmed = item.trim().toLowerCase();
      const timeMatch = trimmed.match(/\(([^)]+)\)/);
      if (timeMatch) {
        const timeStr = timeMatch[1].trim();
        const [start, end] = timeStr.split("-").map((t) => t.trim());
        Object.keys(labelToVal).forEach((key) => {
          if (trimmed.split("(")[0].includes(key)) {
            const val = labelToVal[key];
            activeDays[val] = true;
            dayTimes[val] = { start: start || "19:00", end: end || "21:00" };
          }
        });
      }
    });
    return { activeDays, dayTimes };
  }

  // Format 2: "Tối Thứ 2, Thứ 4 · 19:00 - 21:00"
  if (scheduleStr.includes("·")) {
    const parts = scheduleStr.split("·");
    if (parts.length === 2) {
      const daysPart = parts[0].trim().toLowerCase();
      const timePart = parts[1].trim();
      const [start, end] = timePart.split("-").map((t) => t.trim());
      Object.keys(labelToVal).forEach((key) => {
        if (daysPart.includes(key)) {
          const val = labelToVal[key];
          activeDays[val] = true;
          dayTimes[val] = { start: start || "19:00", end: end || "21:00" };
        }
      });
    }
    return { activeDays, dayTimes };
  }

  return { activeDays, dayTimes };
}

export default function SchedulePicker({
  value,
  onChange,
  label = "Lịch học mong muốn",
  required = false,
  error = false,
}: SchedulePickerProps) {
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({});
  const [dayTimes, setDayTimes] = useState<Record<string, TimeSlot>>({});
  const [initialized, setInitialized] = useState(false);

  // Parse initial value once
  useEffect(() => {
    if (!initialized && value) {
      const parsed = parseScheduleString(value);
      if (Object.keys(parsed.activeDays).length > 0) {
        setActiveDays(parsed.activeDays);
        setDayTimes(parsed.dayTimes);
      }
      setInitialized(true);
    } else if (!initialized && !value) {
      setInitialized(true);
    }
  }, [value, initialized]);

  // Reset if external value is cleared
  useEffect(() => {
    if (initialized && !value) {
      setActiveDays({});
      setDayTimes({});
    }
  }, [value, initialized]);

  const syncSchedule = useCallback(
    (days: Record<string, boolean>, times: Record<string, TimeSlot>) => {
      const formatted = WEEK_DAYS
        .filter((d) => days[d.value])
        .map((d) => {
          const time = times[d.value] || { start: "19:00", end: "21:00" };
          return `${d.label} (${time.start}-${time.end})`;
        })
        .join(", ");
      onChange(formatted);
    },
    [onChange]
  );

  const handleDayToggle = (dayVal: string) => {
    const nextDays = { ...activeDays, [dayVal]: !activeDays[dayVal] };
    const nextTimes = { ...dayTimes };

    if (nextDays[dayVal] && !nextTimes[dayVal]) {
      nextTimes[dayVal] = { start: "19:00", end: "21:00" };
    }

    setActiveDays(nextDays);
    setDayTimes(nextTimes);
    syncSchedule(nextDays, nextTimes);
  };

  const handleTimeChange = (dayVal: string, type: "start" | "end", val: string) => {
    const nextTimes = {
      ...dayTimes,
      [dayVal]: {
        ...(dayTimes[dayVal] || { start: "19:00", end: "21:00" }),
        [type]: val,
      },
    };
    setDayTimes(nextTimes);
    syncSchedule(activeDays, nextTimes);
  };

  const selectedDays = WEEK_DAYS.filter((d) => activeDays[d.value]);

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={`rounded-lg border bg-white p-3 space-y-3 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        {/* Day toggle buttons */}
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((day) => {
            const isActive = !!activeDays[day.value];
            return (
              <button
                type="button"
                key={day.value}
                onClick={() => handleDayToggle(day.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all border ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        {/* Time pickers for selected days */}
        {selectedDays.length > 0 && (
          <div className="space-y-2">
            {selectedDays.map((day) => {
              const time = dayTimes[day.value] || { start: "19:00", end: "21:00" };
              return (
                <div
                  key={day.value}
                  className="grid grid-cols-[64px_minmax(0,1fr)_28px_minmax(0,1fr)_28px] items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 sm:grid-cols-[72px_minmax(120px,1fr)_32px_minmax(120px,1fr)_28px] sm:gap-3"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    {day.label}
                  </span>
                  <input
                    type="time"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={time.start}
                    onChange={(e) => handleTimeChange(day.value, "start", e.target.value)}
                  />
                  <span className="text-center text-xs font-medium text-slate-400">đến</span>
                  <input
                    type="time"
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={time.end}
                    onChange={(e) => handleTimeChange(day.value, "end", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className="flex size-7 items-center justify-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Xóa"
                  >
                    <Icon icon="lucide:x" fontSize={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedDays.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-1">
            Chọn ngày học ở trên để thiết lập giờ học
          </p>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">
          Vui lòng chọn ít nhất 1 buổi học
        </p>
      )}
    </div>
  );
}
