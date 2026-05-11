import type { Dispatch, FormEvent, SetStateAction } from "react";

import { subjects } from "../data";
import { RequestField } from "./RequestField";

type TutorRequestFormProps = {
  area: string;
  level: string;
  note: string;
  school: string;
  schedule: string;
  subject: string;
  submitted: boolean;
  onAreaChange: Dispatch<SetStateAction<string>>;
  onLevelChange: Dispatch<SetStateAction<string>>;
  onNoteChange: Dispatch<SetStateAction<string>>;
  onSchoolChange: Dispatch<SetStateAction<string>>;
  onScheduleChange: Dispatch<SetStateAction<string>>;
  onSubjectChange: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClassName =
  "h-10 w-full rounded-md border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#0b5fff]";

export function TutorRequestForm({
  area,
  level,
  note,
  school,
  schedule,
  subject,
  submitted,
  onAreaChange,
  onLevelChange,
  onNoteChange,
  onSchoolChange,
  onScheduleChange,
  onSubjectChange,
  onSubmit,
}: TutorRequestFormProps) {
  const hasSubjectError = submitted && !subject;

  return (
    <section className="rounded-lg border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 xl:col-span-5">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <RequestField label="Môn học" required>
            <select
              className={`h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition-colors ${
                hasSubjectError
                  ? "border-[#ef4444]"
                  : "border-[#e2e8f0] focus:border-[#0b5fff]"
              } ${subject ? "text-[#0f172a]" : "text-[#64748b]"}`}
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {hasSubjectError && (
              <p className="mt-1.5 text-xs font-medium text-[#ef4444]">
                Vui lòng chọn môn học
              </p>
            )}
          </RequestField>

          <RequestField label="Cấp học" required>
            <input
              className={inputClassName}
              placeholder="VD: Lớp 10, Luyện thi Đại học..."
              value={level}
              onChange={(event) => onLevelChange(event.target.value)}
            />
          </RequestField>
        </div>

        <RequestField label="Trường đang học" className="mt-5">
          <input
            className={inputClassName}
            placeholder="VD: THPT Bùi Thị Xuân"
            value={school}
            onChange={(event) => onSchoolChange(event.target.value)}
          />
        </RequestField>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <RequestField label="Khu vực học mong muốn" required>
            <input
              className={inputClassName}
              placeholder="VD: Quận 1, TP.HCM"
              value={area}
              onChange={(event) => onAreaChange(event.target.value)}
            />
          </RequestField>

          <RequestField label="Lịch học mong muốn" required>
            <input
              className={inputClassName}
              placeholder="VD: Tối Thứ 3, Thứ 5 từ 19h-21h"
              value={schedule}
              onChange={(event) => onScheduleChange(event.target.value)}
            />
          </RequestField>
        </div>

        <RequestField label="Yêu cầu đặc biệt về gia sư" className="mt-5">
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-[#e2e8f0] bg-white p-3 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#64748b] focus:border-[#0b5fff]"
            placeholder="VD: Ưu tiên sinh viên Bách Khoa, có kinh nghiệm dạy kèm, kiên nhẫn..."
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </RequestField>

        {submitted && subject && (
          <p className="mt-4 rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-3 py-2 text-sm font-medium text-[#166534]">
            Đã ghi nhận yêu cầu. Danh sách gia sư bên phải đã sẵn sàng để bạn
            chọn đề xuất.
          </p>
        )}

        <button
          className="mt-5 h-10 w-full rounded-md bg-[#0b5fff] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          type="submit"
        >
          Tìm gia sư theo yêu cầu
        </button>
      </form>
    </section>
  );
}
