'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/utils/formatters'
type PTOType = 'vacation' | 'sick' | 'personal' | 'bereavement' | 'jury_duty'
type PTORequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface PTORequestRow {
  id: string
  employee_id: string
  employee_name: string
  avatar_initials: string
  pto_type: PTOType
  start_date: string
  end_date: string
  hours: number
  reason: string
  status: PTORequestStatus
  submitted_at: string
}

const initialRequests: PTORequestRow[] = [
  {
    id: 'pto-r1', employee_id: 'staff-001', employee_name: 'Marcus Johnson',
    avatar_initials: 'MJ', pto_type: 'vacation',
    start_date: '2026-04-14', end_date: '2026-04-18', hours: 40,
    reason: 'Spring break family trip to Myrtle Beach',
    status: 'pending', submitted_at: '2026-03-05',
  },
  {
    id: 'pto-r2', employee_id: 'staff-007', employee_name: 'Ray Thompson',
    avatar_initials: 'RT', pto_type: 'sick',
    start_date: '2026-03-10', end_date: '2026-03-11', hours: 16,
    reason: 'Dentist appointment and recovery',
    status: 'pending', submitted_at: '2026-03-07',
  },
  {
    id: 'pto-r3', employee_id: 'staff-010', employee_name: 'Shanice Davis',
    avatar_initials: 'SD', pto_type: 'personal',
    start_date: '2026-03-20', end_date: '2026-03-20', hours: 8,
    reason: 'Moving to new apartment',
    status: 'pending', submitted_at: '2026-03-06',
  },
  {
    id: 'pto-r4', employee_id: 'staff-003', employee_name: 'Devon Carter',
    avatar_initials: 'DC', pto_type: 'vacation',
    start_date: '2026-02-17', end_date: '2026-02-21', hours: 40,
    reason: 'Ski trip to Beech Mountain',
    status: 'approved', submitted_at: '2026-01-28',
  },
  {
    id: 'pto-r5', employee_id: 'staff-012', employee_name: 'Whitney Harris',
    avatar_initials: 'WH', pto_type: 'sick',
    start_date: '2026-02-03', end_date: '2026-02-04', hours: 16,
    reason: 'Flu symptoms',
    status: 'approved', submitted_at: '2026-02-03',
  },
  {
    id: 'pto-r6', employee_id: 'staff-005', employee_name: 'Terrance Brooks',
    avatar_initials: 'TB', pto_type: 'personal',
    start_date: '2026-01-10', end_date: '2026-01-10', hours: 4,
    reason: 'DMV appointment',
    status: 'rejected', submitted_at: '2026-01-08',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ptoTypeColor: Record<string, string> = {
  vacation: 'bg-brand-600/10 text-brand-400 border border-brand-600/20',
  sick: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  bereavement: 'bg-dark-600/40 text-dark-300 border border-dark-600/40',
  unpaid: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

const ptoStatusColor: Record<PTORequestStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  cancelled: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PTORequestsPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return requests
    return requests.filter((r) => r.status === activeFilter)
  }, [requests, activeFilter])

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests])

  function handleApprove(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' as PTORequestStatus } : r)))
  }

  function handleReject(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as PTORequestStatus } : r)))
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
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
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
                <th className="hidden lg:table-cell">Reason</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-brand-400">{req.avatar_initials}</span>
                      </div>
                      <span className="text-sm font-medium text-dark-100 whitespace-nowrap">{req.employee_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', ptoTypeColor[req.pto_type])}>
                      {req.pto_type}
                    </span>
                  </td>
                  <td className="text-dark-300 whitespace-nowrap">{formatDate(req.start_date)}</td>
                  <td className="text-dark-300 whitespace-nowrap">{formatDate(req.end_date)}</td>
                  <td className="text-center text-dark-200 font-medium">{req.hours}</td>
                  <td className="hidden lg:table-cell text-dark-400 max-w-[220px] truncate">{req.reason}</td>
                  <td>
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', ptoStatusColor[req.status])}>
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
            Showing {filtered.length} of {requests.length} requests
          </p>
        </div>
      </div>
    </div>
  )
}
