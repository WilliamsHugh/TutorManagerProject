'use client';

export default function PageLoader() {
  return (
    <div className="w-full min-h-[75vh] p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Title skeleton */}
      <div className="space-y-2.5 animate-pulse">
        <div className="h-7 w-64 bg-[#e2e8f0] rounded-md" />
        <div className="h-4 w-full max-w-[450px] bg-[#f1f5f9] rounded-md" />
      </div>

      {/* Main card representation */}
      <div className="space-y-4 animate-pulse">
        <div className="h-48 w-full bg-slate-100 rounded-2xl border border-slate-200/40" />
        
        {/* Grid cards representation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-36 bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5">
              <div className="h-4 w-1/2 bg-[#e2e8f0] rounded-md" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-[#f1f5f9] rounded-md" />
                <div className="h-3.5 w-5/6 bg-[#f1f5f9] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
