"use client"

import { useEffect, useState } from "react"
import { BookOpen, FileText, GraduationCap, UsersRound, TrendingUp, BarChart2, PieChart } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { StaffShell } from "../_components/StaffShell"
import { getStaffStats } from "@/lib/api"

interface ChartData {
  activeClasses: number
  completedClasses: number
  newRequests: number
  activeTutors: number
  learningStudents: number
  classStatusDistribution: {
    active: number
    completed: number
    cancelled: number
    suspended: number
  }
  requestStatusDistribution: {
    pending: number
    processing: number
    matched: number
    cancelled: number
  }
  subjectPopularity: Array<{ subject: string; count: number }>
  monthlyRequestTrend: Array<{ month: string; count: number }>
}

const statConfig = [
  { label: "Yêu cầu cần xử lý", key: "newRequests" as const, icon: FileText, color: "bg-amber-500" },
  { label: "Gia sư khả dụng", key: "activeTutors" as const, icon: UsersRound, color: "bg-blue-600" },
  { label: "Lớp đang hoạt động", key: "activeClasses" as const, icon: BookOpen, color: "bg-emerald-600" },
  { label: "Học viên đang học", key: "learningStudents" as const, icon: GraduationCap, color: "bg-indigo-600" },
]

// Smooth Number Counter using requestAnimationFrame
function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const duration = 1200 // 1.2s duration
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing function for smoother end (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value])

  return <>{count.toLocaleString('vi-VN')}</>
}

const emptyStats: ChartData = {
  activeClasses: 0,
  completedClasses: 0,
  newRequests: 0,
  activeTutors: 0,
  learningStudents: 0,
  classStatusDistribution: {
    active: 0,
    completed: 0,
    cancelled: 0,
    suspended: 0,
  },
  requestStatusDistribution: {
    pending: 0,
    processing: 0,
    matched: 0,
    cancelled: 0,
  },
  subjectPopularity: [
    { subject: "Môn học 1", count: 0 },
    { subject: "Môn học 2", count: 0 },
    { subject: "Môn học 3", count: 0 },
    { subject: "Môn học 4", count: 0 },
    { subject: "Môn học 5", count: 0 },
  ],
  monthlyRequestTrend: [
    { month: "T1", count: 0 },
    { month: "T2", count: 0 },
    { month: "T3", count: 0 },
    { month: "T4", count: 0 },
    { month: "T5", count: 0 },
    { month: "T6", count: 0 },
  ],
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStaffStats() as any
        setStats(data)
        // Trigger animations slightly after data loaded
        setTimeout(() => setIsAnimated(true), 150)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê.")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  // Use loaded stats or fallback to emptyStats structure for initial render
  const activeStats = stats || emptyStats

  // Calculate SVG dimensions and path for Monthly Trend
  const trendData = activeStats.monthlyRequestTrend
  const maxTrendVal = Math.max(...trendData.map(d => d.count), 5)
  const width = 500
  const height = 180
  const padding = 30
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = trendData.map((d, index) => {
    const x = padding + (index / (trendData.length - 1 || 1)) * chartWidth
    const y = height - padding - (d.count / maxTrendVal) * chartHeight
    return { x, y, label: d.month, value: d.count }
  })

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : ""

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : ""

  // Calculate Subject Popularity Max Value
  const subjectData = activeStats.subjectPopularity
  const maxSubjectVal = Math.max(...subjectData.map(d => d.count), 5)

  // Status lists
  const classStatuses = [
    { label: "Đang học", count: activeStats.classStatusDistribution.active, color: "bg-emerald-500", rawColor: "#10b981" },
    { label: "Hoàn thành", count: activeStats.classStatusDistribution.completed, color: "bg-blue-500", rawColor: "#3b82f6" },
    { label: "Tạm dừng", count: activeStats.classStatusDistribution.suspended, color: "bg-amber-500", rawColor: "#f59e0b" },
    { label: "Đã hủy", count: activeStats.classStatusDistribution.cancelled, color: "bg-rose-500", rawColor: "#f43f5e" },
  ]

  const requestStatuses = [
    { label: "Đang chờ", count: activeStats.requestStatusDistribution.pending, color: "bg-amber-500" },
    { label: "Đang xử lý", count: activeStats.requestStatusDistribution.processing, color: "bg-indigo-500" },
    { label: "Đã khớp", count: activeStats.requestStatusDistribution.matched, color: "bg-emerald-500" },
    { label: "Đã hủy", count: activeStats.requestStatusDistribution.cancelled, color: "bg-rose-500" },
  ]

  const totalClasses = classStatuses.reduce((acc, curr) => acc + curr.count, 0)
  const totalRequests = requestStatuses.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <StaffShell current="Tổng quan" parent="Nhân viên">
      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {statConfig.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.key} className="rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      <div className={`flex size-9 items-center justify-center rounded-lg ${item.color} text-white shadow-sm`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">
                      <AnimatedNumber value={activeStats[item.key]} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            
            {/* Trend Area Chart */}
            <Card className="rounded-xl border border-border shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2 p-5 border-b border-border/50">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" /> Xu hướng yêu cầu mới
                  </h3>
                  <p className="text-xs text-muted-foreground">Số lượng yêu cầu gia sư nhận được trong 6 tháng qua</p>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="relative">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = padding + ratio * chartHeight
                      const val = Math.round(maxTrendVal * (1 - ratio))
                      return (
                        <g key={i} className="opacity-20">
                          <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                          <text x={padding - 6} y={y + 4} textAnchor="end" className="text-[10px] fill-muted-foreground font-medium">{val}</text>
                        </g>
                      )
                    })}

                    {/* Shaded Area */}
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {areaD && (
                      <path 
                        d={areaD} 
                        fill="url(#trendGradient)" 
                        style={{
                          opacity: isAnimated ? 1 : 0.05,
                          transition: "opacity 1.5s ease-out, d 0.8s ease-in-out"
                        }}
                      />
                    )}

                    {/* Trend Line (Animated using strokeDashoffset) */}
                    {pathD && (
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        style={{
                          strokeDasharray: 2000,
                          strokeDashoffset: isAnimated ? 0 : 2000,
                          transition: "stroke-dashoffset 2s cubic-bezier(0.25, 1, 0.5, 1), d 0.8s ease-in-out"
                        }}
                      />
                    )}

                    {/* Interactive Points (Animated staggered scale) */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredTrendIndex === idx ? 6 : 4}
                          className={`fill-white stroke-blue-600 cursor-pointer`}
                          strokeWidth={hoveredTrendIndex === idx ? 3 : 2}
                          style={{
                            transform: `scale(${isAnimated ? 1 : 0.4})`,
                            transformOrigin: `${p.x}px ${p.y}px`,
                            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), cx 0.8s ease-in-out, cy 0.8s ease-in-out",
                            transitionDelay: `${idx * 80}ms`
                          }}
                          onMouseEnter={() => setHoveredTrendIndex(idx)}
                          onMouseLeave={() => setHoveredTrendIndex(null)}
                        />
                        <text
                          x={p.x}
                          y={height - padding + 16}
                          textAnchor="middle"
                          className="text-[10px] fill-muted-foreground font-medium"
                          style={{
                            opacity: 1,
                            transition: "opacity 0.8s ease-out",
                          }}
                        >
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Hover Tooltip */}
                  {hoveredTrendIndex !== null && points[hoveredTrendIndex] && (
                    <div 
                      className="absolute bg-background border rounded-lg shadow-lg p-2 text-xs font-semibold z-10 pointer-events-none transition-all duration-150"
                      style={{
                        left: `${(points[hoveredTrendIndex].x / width) * 100}%`,
                        top: `${(points[hoveredTrendIndex].y / height) * 100 - 25}%`,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      Tháng {points[hoveredTrendIndex].label}: {points[hoveredTrendIndex].value} yêu cầu
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subjects Popularity Bar Chart */}
            <Card className="rounded-xl border border-border shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2 p-5 border-b border-border/50">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <BarChart2 className="size-4 text-primary" /> Môn học phổ biến nhất
                  </h3>
                  <p className="text-xs text-muted-foreground">Tỉ lệ đăng ký tìm gia sư phân bố theo môn học</p>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="space-y-3.5 h-[180px] overflow-y-auto pr-1">
                  {subjectData.slice(0, 5).map((item, idx) => {
                    const percent = maxSubjectVal > 0 ? (item.count / maxSubjectVal) * 100 : 0
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-foreground">{item.subject}</span>
                          <span className="text-muted-foreground">
                            <AnimatedNumber value={item.count} /> yêu cầu
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: isAnimated ? `${percent}%` : "0%" }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Operational Funnel and Status */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            
            {/* Classes Status Chart */}
            <Card className="rounded-xl border border-border shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2 p-5 border-b border-border/50">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <PieChart className="size-4 text-primary" /> Phân bố trạng thái lớp học
                  </h3>
                  <p className="text-xs text-muted-foreground">Tổng số lớp được quản lý: {totalClasses}</p>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 h-[140px]">
                  <div className="w-full space-y-4">
                    <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex">
                      {classStatuses.map((item, idx) => {
                        const share = totalClasses > 0 ? (item.count / totalClasses) * 100 : 0
                        return (
                          <div 
                            key={idx} 
                            className={`h-full ${item.color} transition-all duration-1000 ease-out`} 
                            style={{ width: isAnimated ? `${share}%` : "0%" }} 
                            title={`${item.label}: ${item.count} (${share.toFixed(0)}%)`}
                          />
                        )
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {classStatuses.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`size-3 rounded-full ${item.color}`} />
                          <span className="font-medium">{item.label}:</span>
                          <span className="text-muted-foreground">
                            <AnimatedNumber value={item.count} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests Status Chart */}
            <Card className="rounded-xl border border-border shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2 p-5 border-b border-border/50">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <PieChart className="size-4 text-primary" /> Phân bố trạng thái yêu cầu
                  </h3>
                  <p className="text-xs text-muted-foreground">Tổng số yêu cầu: {totalRequests}</p>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 h-[140px]">
                  <div className="w-full space-y-4">
                    <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex">
                      {requestStatuses.map((item, idx) => {
                        const share = totalRequests > 0 ? (item.count / totalRequests) * 100 : 0
                        return (
                          <div 
                            key={idx} 
                            className={`h-full ${item.color} transition-all duration-1000 ease-out`} 
                            style={{ width: isAnimated ? `${share}%` : "0%" }} 
                            title={`${item.label}: ${item.count} (${share.toFixed(0)}%)`}
                          />
                        )
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {requestStatuses.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`size-3 rounded-full ${item.color}`} />
                          <span className="font-medium">{item.label}:</span>
                          <span className="text-muted-foreground">
                            <AnimatedNumber value={item.count} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </StaffShell>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overview Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="rounded-xl border border-border shadow-sm">
            <CardContent className="space-y-3 p-5">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                <div className="size-9 bg-muted rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl border border-border shadow-sm">
          <div className="pb-2 p-5 border-b border-border/50 space-y-1">
            <div className="h-5 w-44 bg-muted rounded animate-pulse" />
            <div className="h-3 w-64 bg-muted rounded animate-pulse" />
          </div>
          <CardContent className="pt-4">
            <div className="h-[180px] w-full bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm">
          <div className="pb-2 p-5 border-b border-border/50 space-y-1">
            <div className="h-5 w-44 bg-muted rounded animate-pulse" />
            <div className="h-3 w-64 bg-muted rounded animate-pulse" />
          </div>
          <CardContent className="pt-4">
            <div className="space-y-3.5 h-[180px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3.5 w-12 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Skeletons */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card key={idx} className="rounded-xl border border-border shadow-sm">
            <div className="pb-2 p-5 border-b border-border/50 space-y-1">
              <div className="h-5 w-44 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
            <CardContent className="pt-4">
              <div className="space-y-4 h-[140px] flex flex-col justify-center">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-muted animate-pulse" />
                      <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
