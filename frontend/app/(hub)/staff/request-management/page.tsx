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

export default function RequestManagementPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null)
  const [tutors, setTutors] = useState<TutorRecommendation[]>([])
  const [loadingTutors, setLoadingTutors] = useState(false)

  const loadRequests = useCallback(async () => {
    setError(null)
    try {
      const data = await getClassRequests({ search: search.trim() })
      setRequests(data.map(mapClassRequest))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách yêu cầu.")
    } finally {
      setLoading(false)
    }
  }, [search])

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

  const visibleRequests = useMemo(() => requests, [requests])

  if (loading) {
    return (
      <StaffShell>
        <div className="rounded border border-border bg-white p-5 text-sm text-muted-foreground">
          Đang tải dữ liệu yêu cầu...
        </div>
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
        requests={visibleRequests}
        search={search}
        totalCount={requests.length}
        onSearchChange={setSearch}
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
