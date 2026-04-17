"use client";
import { MapPin } from "lucide-react";
import StarRating from "./StarRating";
import { Tutor } from "@/types/tutor";

export default function TutorCard({ tutor }: { tutor: Tutor }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5 hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-300">
      {/* Header */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <img
            src={tutor.avatar}
            alt={tutor.name}
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{tutor.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{tutor.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={tutor.rating} />
            <span className="text-xs font-semibold text-amber-500">{tutor.rating}</span>
            <span className="text-xs text-gray-400">({tutor.reviews} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MapPin size={14} className="text-blue-400 shrink-0" />
        <span>{tutor.location}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tutor.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div>
          <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {tutor.price.toLocaleString("vi-VN")}đ
          </span>
          <span className="text-sm text-gray-400 ml-1">/ giờ</span>
        </div>
        <button
          className="text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-200 text-[var(--primary)] border-[var(--primary)] hover:bg-blue-700 hover:text-white hover:border-blue-700"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}