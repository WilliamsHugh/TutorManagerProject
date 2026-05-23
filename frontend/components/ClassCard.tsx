"use client";
import { Banknote, Calendar, Clock, GraduationCap, MapPin } from "lucide-react";
import { ClassListing } from "@/types/class";

function ModeBadge({ mode }: { mode: "Online" | "Offline" }) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
      style={
        mode === "Online"
          ? { backgroundColor: "#d1fae5", color: "#065f46" }
          : { backgroundColor: "#fef3c7", color: "#92400e" }
      }
    >
      {mode}
    </span>
  );
}

function LevelBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
      style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
    >
      {label}
    </span>
  );
}

export default function ClassCard({ cls, priority }: { cls: ClassListing; priority?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
      {/* Top */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{cls.title}</h3>
          <div className="flex flex-wrap gap-2">
            <ModeBadge mode={cls.mode} />
            <LevelBadge label={cls.levelTag} />
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded whitespace-nowrap shrink-0"
          style={{ backgroundColor: "var(--secondary)", color: "var(--muted-foreground)" }}
        >
          {cls.code}
        </span>
      </div>

      {/* Info list */}
      <div className="flex flex-col gap-3">
        {/* Salary */}
        <div className="flex items-start gap-2.5 text-sm">
          <Banknote size={16} className="shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
          <div>
            <span className="font-bold text-base" style={{ color: "var(--warning)" }}>
              {cls.salary}
            </span>
            <span className="text-sm font-medium text-gray-500 ml-1">{cls.salaryNote}</span>
          </div>
        </div>

        {/* Schedule */}
        {cls.schedule && (
          <div className="flex items-start gap-2.5 text-sm text-gray-700">
            <Calendar size={16} className="shrink-0 mt-0.5 text-gray-400" />
            <span>{cls.schedule}</span>
          </div>
        )}

        {/* Location */}
        {cls.location && (
          <div className="flex items-start gap-2.5 text-sm text-gray-700">
            <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
            <span>{cls.location}</span>
          </div>
        )}

        {/* Requirement */}
        {cls.requirement && (
          <div className="flex items-start gap-2.5 text-sm text-gray-700">
            <GraduationCap size={16} className="shrink-0 mt-0.5 text-gray-400" />
            <span>{cls.requirement}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={13} />
          <span>{cls.postedAt}</span>
        </div>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
