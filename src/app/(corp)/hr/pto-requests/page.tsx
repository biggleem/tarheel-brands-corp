'use client'

import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/utils/formatters'
import { getPtoRequestsRpc } from '@/lib/supabase/queries'
import { SortableHeader } from '@/components/shared/sortable-header'
import { useSortableData } from '@/lib/hooks/use-sortable-data'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PTORequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

interface PTORequestRow {
  id: string
  staff_id: string
  organization_id: string
  pto_type: string
  start_date: string
  end_date: string
  total_hours: number
  notes: string | null
  status: PTORequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  first_name: string
  last_name: string
  role: string | null
  department: string | null
  title: string | null
  organization_name: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

const ptoTypeColor: Record<string, string> = {
  vacation: 'bg-brand-600/10 text-brand-400 border border-brand-600/20',
  sick: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  bereavement: 'bg-dark-600/40 text-dark-300 border border-dark-600/40',
  unpaid: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  jury_duty: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
}

const ptoStatusColor: Record<PTORequestStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  cancelled: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-dark-700/50">
              <th>Employee</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th className="text-center">Hours</th>
              <th className="hidden lg:table-cell">Notes</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-700/50 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-dark-700/50 animate-pulse" />
                  </div>
                </td>
                <td><div className="h-5 w-16 rounded-full bg-dark-700/50 animate-pulse" /></td>
                <td><div className="h-4 w-20 rounded bg-dark-700/50 animate-pulse" /></td>
                <td><div className="h-4 w-20 rounded bg-dark-700/50 animate-pulse" /></td>
                <td className="text-center"><div className="h-4 w-8 rounded bg-dark-700/50 animate-pulse mx-auto" /></td>
                <td className="hidden lg:table-cell"><div className="h-4 w-32 rounded bg-dark-700/50 animate-pulse" /></td>
                <td><div className="h-5 w-16 rounded-full bg-dark-700/50 animate-pulse" /></td>
                <td><div className="h-4 w-16 rounded bg-dark-700/50 animate-pulse ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PTORequestsPage() {
  const [requests, setRequests] = useState<PTORequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchPtoRequests() {
      setLoading(true)
      try {
        const data = await getPtoRequestsRpc()
        if (!cancelled) {
          setRequests(
            data.map((row) => ({
              ...row,
              status: row.status as PTORequestStatus,
            }))
          )
        }
      } catch (err) {
        console.error('Failed to fetch PTO requests:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPtoRequests()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return requests
    return requests.filter((r) => r.status === activeFilter)
  }, [requests, activeFilter])

  const searchFiltered = useMemo(() => {
    if (!search) return filtered
    const q = search.toLowerCase()
    return filtered.filter((r) =>
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
      r.pto_type.toLowerCase().includes(q)
    )
  }, [filtered, search])

  const { sortedData: sortedRequests, sortConfig, requestSort } = useSortableData(
    searchFiltered as unknown as Record<string, unknown>[],
    { key: 'start_date', direction: 'desc' }
  )

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests])

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as PTORequestStatus } : r))
    )
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as PTORequestStatus } : r))
    )
  }

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="PTO Requests"
        description="Review and manage time-off requests from your team"
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
              activeFilter === tab.key
                ? 'bg-brand-600/10 text-brand-400 border border-brand-600/20'
                : 'bg-dark-900/60 text-dark-400 border border-dark-700/50 hover:text-dark-200 hover:border-dark-600'
            )}
          >
            {tab.label}
            <span className={cn(
              'px-1.5 py-0.5 text-xs rounded-full',
              activeFilter === tab.key
                ? 'bg-brand-600/20 text-brand-400'
                : 'bg-dark-800 text-dark-500'
            )}>
              {loading ? '-' : counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          type="text"
          placeholder="Search by employee or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-3 py-2 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50 w-64"
        />
      </div>

      {loading && <TableSkeleton />}

      {/* Table */}
      {!loading && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <SortableHeader label="Employee" sortKey="first_name" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Type" sortKey="pto_type" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Start Date" sortKey="start_date" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="End Date" sortKey="end_date" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Hours" sortKey="total_hours" currentSort={sortConfig} onSort={requestSort} className="text-center" />
                  <th className="hidden lg:table-cell">Notes</th>
                  <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={requestSort} />
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(sortedRequests as unknown as PTORequestRow[]).map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-brand-400">
                            {getInitials(req.first_name, req.last_name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-dark-100 whitespace-nowrap block">
                            {getFullName(req.first_name, req.last_name)}
                          </span>
                          {req.department && (
                            <span className="text-xs text-dark-500 block truncate">
                              {req.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full capitalize',
                        ptoTypeColor[req.pto_type] ?? 'bg-dark-600/40 text-dark-300 border border-dark-600/40'
                      )}>
                        {req.pto_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-dark-300 whitespace-nowrap">{formatDate(req.start_date)}</td>
                    <td className="text-dark-300 whitespace-nowrap">{formatDate(req.end_date)}</td>
                    <td className="text-center text-dark-200 font-medium">{req.total_hours}</td>
                    <td className="hidden lg:table-cell text-dark-400 max-w-[220px] truncate">
                      {req.notes ?? '--'}
                    </td>
                    <td>
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full capitalize',
                        ptoStatusColor[req.status]
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="p-2 rounded-lg hover:bg-green-500/10 text-dark-400 hover:text-green-400 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-dark-600 pr-2">--</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-8 h-8 text-dark-500 mb-3" />
              <p className="text-dark-300 font-medium">No requests found</p>
              <p className="text-dark-500 text-sm mt-1">
                {activeFilter === 'all'
                  ? 'No PTO requests have been submitted yet'
                  : `No ${activeFilter} requests`}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
            <p className="text-xs text-dark-500">
              Showing {sortedRequests.length} of {requests.length} requests
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
