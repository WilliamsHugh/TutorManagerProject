"use client";

/**
 * Skeleton loading components for Student portal pages.
 * Provides shimmer-animated placeholders matching the real UI layout.
 */

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

/* ─── Reusable primitives ─── */

function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-[#e2e8f0] ${shimmer} ${className}`} />;
}

/* ─── Tutor Card Skeleton (for main /student page) ─── */

export function TutorCardSkeleton() {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[#e2e8f0] bg-white p-4 sm:flex-row sm:items-start animate-pulse">
      {/* Avatar */}
      <div className="h-14 w-14 rounded-full bg-[#e2e8f0] shrink-0" />

      {/* Body */}
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-4 w-36" />
          <SkeletonBox className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBox className="h-3.5 w-48" />
        <div className="flex gap-1.5">
          <SkeletonBox className="h-6 w-16 rounded" />
          <SkeletonBox className="h-6 w-14 rounded" />
          <SkeletonBox className="h-6 w-20 rounded" />
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:w-35 sm:grid-cols-1">
        <SkeletonBox className="h-9 rounded-md" />
        <SkeletonBox className="h-9 rounded-md" />
      </div>
    </article>
  );
}

export function TutorListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TutorCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Class Card Skeleton (for /student/classes page) ─── */

export function ClassCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-5 w-48" />
          <SkeletonBox className="h-3.5 w-32" />
        </div>
        <SkeletonBox className="h-6 w-24 rounded-full" />
      </div>

      {/* Info rows */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-4 w-4 rounded" />
          <SkeletonBox className="h-3.5 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-4 w-4 rounded" />
          <SkeletonBox className="h-3.5 w-52" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-4 w-4 rounded" />
          <SkeletonBox className="h-3.5 w-36" />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2 pt-3 border-t border-[#f1f5f9]">
        <SkeletonBox className="h-9 w-28 rounded-lg" />
        <SkeletonBox className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function ClassListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ClassCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Profile Page Skeleton (for /student/profile page) ─── */

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        {/* Avatar + Name header */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-[#e2e8f0] shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonBox className="h-6 w-48" />
              <SkeletonBox className="h-4 w-36" />
              <SkeletonBox className="h-3.5 w-28" />
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm space-y-6">
          {/* Field 1 */}
          <div className="space-y-2">
            <SkeletonBox className="h-3.5 w-20" />
            <SkeletonBox className="h-11 w-full rounded-md" />
          </div>
          {/* Field 2 */}
          <div className="space-y-2">
            <SkeletonBox className="h-3.5 w-24" />
            <SkeletonBox className="h-11 w-full rounded-md" />
          </div>
          {/* Field 3 */}
          <div className="space-y-2">
            <SkeletonBox className="h-3.5 w-20" />
            <SkeletonBox className="h-11 w-full rounded-md" />
          </div>
          {/* Field 4 */}
          <div className="space-y-2">
            <SkeletonBox className="h-3.5 w-16" />
            <SkeletonBox className="h-11 w-full rounded-md" />
          </div>
          {/* Save button */}
          <div className="flex justify-end pt-2">
            <SkeletonBox className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Calendar Page Skeleton (for /student/calendar page) ─── */

export function CalendarSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBox className="h-7 w-40" />
            <SkeletonBox className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <SkeletonBox className="h-10 w-10 rounded-lg" />
            <SkeletonBox className="h-10 w-28 rounded-lg" />
            <SkeletonBox className="h-10 w-10 rounded-lg" />
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonBox key={i} className="h-8 rounded" />
            ))}
          </div>
          {/* Day cells */}
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid grid-cols-7 gap-2 mb-2">
              {Array.from({ length: 7 }).map((_, col) => (
                <SkeletonBox key={col} className="h-20 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <main className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-48 bg-[#cbd5e1] rounded" />
          <div className="h-4.5 w-96 bg-[#cbd5e1] rounded" />
        </div>
        
        {/* Tabs skeleton */}
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />

        {/* Form and panel grid skeleton */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 animate-pulse">
          {/* Left Form skeleton */}
          <div className="xl:col-span-5 bg-white border border-[#e2e8f0] p-6 rounded-2xl space-y-4">
            <div className="h-5 w-32 bg-[#cbd5e1] rounded" />
            <div className="space-y-3">
              <div className="h-9 w-full bg-[#e2e8f0] rounded" />
              <div className="h-9 w-full bg-[#e2e8f0] rounded" />
              <div className="h-9 w-full bg-[#e2e8f0] rounded" />
              <div className="h-9 w-full bg-[#e2e8f0] rounded" />
            </div>
          </div>
          {/* Right Panel skeleton */}
          <div className="xl:col-span-7 space-y-4">
            <div className="h-9 w-full bg-[#e2e8f0] rounded" />
            <div className="space-y-3">
              <div className="h-28 w-full bg-white border border-[#e2e8f0] rounded-xl" />
              <div className="h-28 w-full bg-white border border-[#e2e8f0] rounded-xl" />
              <div className="h-28 w-full bg-white border border-[#e2e8f0] rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
