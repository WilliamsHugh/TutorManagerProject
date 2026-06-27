import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState, useEffect } from "react";
import { RequestField } from "./RequestField";
import { CustomSelect } from "./CustomSelect";
import { gradeLevels, schoolsMap, weekDays } from "../_config/constants";

type TutorRequestFormProps = {
  province: string;
  district: string;
  level: string;
  note: string;
  school: string;
  schedule: string;
  subject: string;
  submitted: boolean;
  subjectsList: { id: string; name: string }[];
  provincesList: any[];
  onProvinceChange: (val: string) => void;
  onDistrictChange: (val: string) => void;
  onLevelChange: Dispatch<SetStateAction<string>>;
  onNoteChange: Dispatch<SetStateAction<string>>;
  onSchoolChange: Dispatch<SetStateAction<string>>;
  onScheduleChange: (val: string) => void;
  onSubjectChange: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "h-9 w-full rounded-md border border-[#e2e8f0] bg-white px-2.5 text-xs text-[#0f172a] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#0b5fff]";

export function TutorRequestForm({
  province,
  district,
  level,
  note,
  school,
  schedule,
  subject,
  submitted,
  subjectsList,
  provincesList,
  onProvinceChange,
  onDistrictChange,
  onLevelChange,
  onNoteChange,
  onSchoolChange,
  onScheduleChange,
  onSubjectChange,
  onSubmit,
}: TutorRequestFormProps) {
  const hasSubjectError = submitted && !subject;
  const hasLevelError = submitted && !level;
  const hasProvinceError = submitted && !province;
  const hasDistrictError = submitted && !district;
  const hasScheduleError = submitted && !schedule;

  // Local state for schedule builder
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({});
  const [dayTimes, setDayTimes] = useState<Record<string, { start: string; end: string }>>({});

  // Reset local state if schedule string is cleared externally (e.g. after successful submit)
  useEffect(() => {
    if (!schedule) {
      setActiveDays({});
      setDayTimes({});
    }
  }, [schedule]);

  const handleDayToggle = (dayVal: string) => {
    const nextDays = { ...activeDays, [dayVal]: !activeDays[dayVal] };
    const nextTimes = { ...dayTimes };
    
    // Set default time if newly activated
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
        [type]: val
      }
    };
    setDayTimes(nextTimes);
    syncSchedule(activeDays, nextTimes);
  };

  const syncSchedule = (
    days: Record<string, boolean>,
    times: Record<string, { start: string; end: string }>
  ) => {
    const formatted = weekDays
      .filter((d) => days[d.value])
      .map((d) => {
        const time = times[d.value] || { start: "19:00", end: "21:00" };
        return `${d.label} (${time.start}-${time.end})`;
      })
      .join(", ");
    onScheduleChange(formatted);
  };

  // Dynamic filter for districts and schools
  const selectedProvinceObj = (provincesList || []).find((p) => p.name === province);
  const availableDistricts = selectedProvinceObj
    ? (selectedProvinceObj.districts || []).map((d: any) => d.name)
    : [];
  const availableSchools = province ? schoolsMap[province] || [] : [];

  return (
    <section className="rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm xl:col-span-5 xl:sticky xl:top-6">
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <RequestField label="Môn học" required>
            <CustomSelect
              value={subject}
              onChange={onSubjectChange}
              options={subjectsList.map((item) => ({ value: item.name, label: item.name }))}
              placeholder="Chọn môn học"
              error={hasSubjectError}
            />
            {hasSubjectError && (
              <p className="mt-1 text-[10px] font-medium text-[#ef4444]">
                Chọn môn học
              </p>
            )}
          </RequestField>

          <RequestField label="Cấp học" required>
            <CustomSelect
              value={level}
              onChange={onLevelChange}
              options={gradeLevels.map((item) => ({ value: item, label: item }))}
              placeholder="Chọn cấp học"
              error={hasLevelError}
            />
            {hasLevelError && (
              <p className="mt-1 text-[10px] font-medium text-[#ef4444]">
                Chọn cấp học
              </p>
            )}
          </RequestField>
        </div>

        {/* Dynamic Province / District Selection */}
        <div className="grid grid-cols-2 gap-3">
          <RequestField label="Tỉnh/Thành phố" required>
            <CustomSelect
              value={province}
              onChange={(val) => {
                onProvinceChange(val);
                onDistrictChange(""); // reset district
              }}
              options={(provincesList || []).map((item) => ({ value: item.name, label: item.name }))}
              placeholder="Chọn Tỉnh/Thành"
              error={hasProvinceError}
            />
            {hasProvinceError && (
              <p className="mt-1 text-[10px] font-medium text-[#ef4444]">
                Chọn Tỉnh/Thành
              </p>
            )}
          </RequestField>

          <RequestField label="Quận/Huyện" required>
            <CustomSelect
              value={district}
              onChange={onDistrictChange}
              options={availableDistricts.map((item: string) => ({ value: item, label: item }))}
              placeholder="Chọn Quận/Huyện"
              disabled={!province}
              error={hasDistrictError}
            />
            {hasDistrictError && (
              <p className="mt-1 text-[10px] font-medium text-[#ef4444]">
                Chọn Quận/Huyện
              </p>
            )}
          </RequestField>
        </div>

        {/* Dynamic schools list */}
        <RequestField label="Trường đang học">
          <input
            className={inputClassName}
            placeholder={province ? `Gợi ý trường tại ${province}...` : "Chọn Tỉnh/Thành để gợi ý trường..."}
            value={school}
            onChange={(event) => onSchoolChange(event.target.value)}
            list="schools-list"
          />
          <datalist id="schools-list">
            {availableSchools.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </RequestField>

        {/* Interactive Compact Schedule Builder */}
        <RequestField label="Lịch học mong muốn" required>
          <div className="rounded-md border border-[#e2e8f0] bg-white p-2.5 space-y-2">
            {/* Horizontal weekDays selection buttons */}
            <div className="flex flex-wrap gap-1.5">
              {weekDays.map((day) => {
                const isActive = !!activeDays[day.value];
                return (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    className={`h-7 px-2 text-[10px] font-bold rounded transition-colors border ${
                      isActive
                        ? "bg-[#0b5fff] border-[#0b5fff] text-white"
                        : "bg-[#f8fafc] border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            {/* Display time pickers only for selected active days */}
            {Object.keys(activeDays).some((k) => activeDays[k]) && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5 mt-2">
                {weekDays
                  .filter((d) => activeDays[d.value])
                  .map((day) => {
                    const time = dayTimes[day.value] || { start: "19:00", end: "21:00" };
                    return (
                      <div key={day.value} className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0]">
                        <span className="text-[11px] font-bold text-[#475569]">{day.label}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            className="h-6 rounded border border-[#cbd5e1] px-1 text-[10px] bg-white text-[#0f172a]"
                            value={time.start}
                            onChange={(e) => handleTimeChange(day.value, "start", e.target.value)}
                          />
                          <span className="text-[10px] text-[#64748b]">đến</span>
                          <input
                            type="time"
                            className="h-6 rounded border border-[#cbd5e1] px-1 text-[10px] bg-white text-[#0f172a]"
                            value={time.end}
                            onChange={(e) => handleTimeChange(day.value, "end", e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          {hasScheduleError && (
            <p className="mt-1 text-[10px] font-medium text-[#ef4444]">
              Vui lòng chọn ít nhất 1 buổi học
            </p>
          )}
        </RequestField>

        <RequestField label="Yêu cầu đặc biệt về gia sư">
          <textarea
            className="min-h-14 h-14 w-full resize-y rounded-md border border-[#e2e8f0] bg-white p-2 text-xs text-[#0f172a] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#0b5fff]"
            placeholder="VD: Ưu tiên sinh viên Bách Khoa, có kinh nghiệm dạy kèm..."
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </RequestField>

        {submitted && subject && level && province && district && schedule && (
          <p className="mt-2 rounded bg-[#dcfce7] border border-[#bbf7d0] px-2.5 py-1.5 text-[11px] font-medium text-[#166534]">
            Đã ghi nhận yêu cầu. Bạn có thể chọn đề xuất gia sư bên phải.
          </p>
        )}

        <button
          className="h-9 w-full rounded-md bg-[#0b5fff] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          type="submit"
        >
          Tìm gia sư theo yêu cầu
        </button>
      </form>
    </section>
  );
}
