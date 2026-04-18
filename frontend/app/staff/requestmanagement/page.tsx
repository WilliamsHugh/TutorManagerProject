"use client"

import { useMemo, useState } from "react"

import { requests, tutors } from "../components/data"
import { MatchTutorDialog } from "../components/MatchTutorDialog"
import { RequestManagementPanel } from "../components/RequestManagementPanel"
import { StaffHeader } from "../components/StaffHeader"
import { StaffSidebar } from "../components/StaffSidebar"
import type { RequestItem } from "../../../types/class_request"

export default function RequestList() {
  const [search, setSearch] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null
  )

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return requests
    }

    return requests.filter((request) =>
      [
        request.id,
        request.name,
        request.phone,
        request.subject,
        request.level,
        request.area,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [search])

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-foreground">
      <div className="flex min-h-screen">
        <StaffSidebar />

        <div className="min-w-0 flex-1">
          <StaffHeader />

          <main className="p-5">
            <RequestManagementPanel
              requests={filteredRequests}
              search={search}
              totalCount={requests.length}
              onSearchChange={setSearch}
              onSelectRequest={setSelectedRequest}
            />
          </main>
        </div>
      </div>

      {selectedRequest ? (
        <MatchTutorDialog
          request={selectedRequest}
          tutors={tutors}
          onClose={() => setSelectedRequest(null)}
        />
      ) : null}
    </div>
  )
}
