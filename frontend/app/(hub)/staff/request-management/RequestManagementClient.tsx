"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  getClassRequests,
  getTutorRecommendations,
  updateClassRequestStatus,
} from "@/lib/api"
import type { RequestItem, RequestStatus, TutorRecommendation } from "@/types/class_request"
import {
  mapClassRequest,
  mapTutorRecommendation,
  requestStatusValues,
} from "@/types/staff"

import { MatchTutorDialog } from "../_components/MatchTutorDialog"
import { RequestManagementPanel } from "../_components/RequestManagementPanel"
import { StaffShell } from "../_components/StaffShell"

export default function RequestManagementClient() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null)
  const [tutors, setTutors] = useState<TutorRecommendation[]>([])
  const [loadingTutors, setLoadingTutors] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const loadRequests = useCallback(async () => {
    setError(null)
    try {
      const data = await getClassRequests({
        search: search.trim(),
        status: statusFilter || undefined,
      })
      setRequests(data.map(mapClassRequest))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách yêu cầu.")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    if (!selectedRequest) return
    loadTutorRecommendations(selectedRequest.rawId)
  }, [selectedRequest])

  async function loadTutorRecommendations(requestId: string) {
    setLoadingTutors(true)
    try {
      const data = await getTutorRecommendations(requestId)
      setTutors(data.map(mapTutorRecommendation))
    } catch {
      setTutors([])
    } finally {
      setLoadingTutors(false)
    }
  }

  async function handleStatusChange(status: RequestStatus) {
    if (!selectedRequest) return
    let mapped: RequestItem
    try {
      const updated = await updateClassRequestStatus(
        selectedRequest.rawId,
        requestStatusValues[status],
      )
      mapped = mapClassRequest(updated)
    } catch {
      mapped = { ...selectedRequest, status }
    }
    setRequests((current) =>
      current.map((item) => (item.rawId === mapped.rawId ? mapped : item)),
    )
    setSelectedRequest(mapped)
  }

  const paginatedRequests = useMemo(() => {
    return requests.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }, [requests, currentPage])

  if (loading) {
    return (
      <StaffShell>
        <RequestTableSkeleton />
      </StaffShell>
    )
  }

  return (
    <StaffShell>
      {error ? (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <RequestManagementPanel
        requests={paginatedRequests}
        search={search}
        statusFilter={statusFilter}
        totalCount={requests.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onSearchChange={(val) => {
          setSearch(val)
          setCurrentPage(1)
        }}
        onStatusFilterChange={(val) => {
          setStatusFilter(val)
          setCurrentPage(1)
        }}
        onSelectRequest={setSelectedRequest}
      />

      {selectedRequest ? (
        <MatchTutorDialog
          loadingTutors={loadingTutors}
          request={selectedRequest}
          tutors={tutors}
          onClose={() => setSelectedRequest(null)}
          onRefreshTutors={() => loadTutorRecommendations(selectedRequest.rawId)}
          onStatusChange={handleStatusChange}
        />
      ) : null}
    </StaffShell>
  )
}

function RequestTableSkeleton() {
  return (
    <div className="rounded border border-border bg-white p-5 space-y-4 shadow-sm">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4.5 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex justify-between items-center gap-3">
        <div className="h-9 w-64 bg-muted rounded animate-pulse" />
        <div className="h-9 w-24 bg-muted rounded animate-pulse" />
      </div>

      {/* Table skeleton structure */}
      <div className="overflow-hidden rounded border border-border">
        {/* Header row */}
        <div className="grid grid-cols-[120px_170px_170px_1fr_100px_90px] bg-[#e9eff7] px-3 py-3 gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-3.5 bg-slate-300 rounded animate-pulse" />
          ))}
        </div>
        
        {/* Rows skeletons */}
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-[120px_170px_170px_1fr_100px_90px] items-center border-t border-border bg-white px-3 py-4 gap-4">
            <div className="space-y-2">
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3.5 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div>
              <div className="h-6 w-16 bg-muted rounded-md animate-pulse" />
            </div>
            <div>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
