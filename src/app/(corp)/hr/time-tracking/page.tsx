'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatDate } from '@/lib/utils/formatters'
type TimeEntryStatus = 'active' | 'completed' | 'edited' | 'void' | 'pending' | 'approved' | 'rejected'
import {
  Clock,
  Users,
  AlertTriangle,
  Timer,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface WeeklyTimeRow {
  id: string
  employee_id: string
  name: string
  avatar_initials: string
  hours: (number | null)[] // Mon-Sun
  total: number
  status: TimeEntryStatus
  overtime: boolean
}

const weekStart = '2026-03-02'
const weekEnd = '2026-03-08'
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const mockWeeklyTime: WeeklyTimeRow[] = [
  { id: 'tw1', employee_id: 'staff-001', name: 'Marcus Johnson', avatar_initials: 'MJ', hours: [8.0, 8.5, 8.0, 8.25, 8.0, 4.0, null], total: 44.75, status: 'pending', overtime: true },
  { id: 'tw2', employee_id: 'staff-003', name: 'Devon Carter', avatar_initials: 'DC', hours: [8.0, 8.0, 8.0, 8.0, 8.0, null, null], total: 40.0, status: 'approved', overtime: false },
  { id: 'tw3', employee_id: 'staff-005', name: 'Terrance Brooks', avatar_initials: 'TB', hours: [4.0, 4.0, null, 4.0, 4.0, 6.0, null], total: 22.0, status: 'pending', overtime: false },
  { id: 'tw4', employee_id: 'staff-007', name: 'Ray Thompson', avatar_initials: 'RT', hours: [8.0, 8.0, 8.5, 8.0, 9.0, 5.0, null], total: 46.5, status: 'pending', overtime: true },
  { id: 'tw5', employee_id: 'staff-009', name: 'Andre Mitchell', avatar_initials: 'AM', hours: [4.0, 4.0, 4.0, 4.0, null, null, null], total: 16.0, status: 'approved', overtime: false },
  { id: 'tw6', employee_id: 'staff-010', name: 'Shanice Davis', avatar_initials: 'SD', hours: [8.0, 8.0, 8.0, 8.0, 8.0, null, null], total: 40.0, status: 'approved', overtime: false },
  { id: 'tw7', employee_id: 'staff-012', name: 'Whitney Harris', avatar_initials: 'WH', hours: [8.0, 8.0, 7.5, 8.0, 8.0, null, null], total: 39.5, status: 'pending', overtime: false },
  { id: 'tw8', employee_id: 'staff-004', name: 'Jasmine Patel', avatar_initials: 'JP', hours: [8.0, 9.0, 8.0, 8.5, 8.0, null, null], total: 41.5, status: 'approved', overtime: true },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const timeStatusColor: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TimeTrackingPage() {
  const [data, setData] = useState(mockWeeklyTime)

  const totalHours = data.reduce((s, r) => s + r.total, 0)
  const avgHours = totalHours / data.length
  const pendingCount = data.filter((r) => r.status === 'pending').length
  const overtimeHours = data
    .filter((r) => r.overtime)
    .reduce((s, r) => s + Math.max(0, r.total - 40), 0)

  function handleApprove(id: string) {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' as TimeEntryStatus } : r)))
  }

  function handleReject(id: string) {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as TimeEntryStatus } : r)))
  }

  function handleApproveAll() {
    setData((prev) => prev.map((r) => (r.status === 'pending' ? { ...r, status: 'approved' as TimeEntryStatus } : r)))
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Time Tracking"
        description="Weekly timesheet overview and approval"
        actions={
          <div className="flex items-center gap-3">
            {/* Week navigator */}
            <div className="flex items-center gap-2 glass-card px-3 py-2">
              <button className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-dark-200 font-medium whitespace-nowrap">
                {formatDate(weekStart)} &ndash; {formatDate(weekEnd)}
              </span>
              <button className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleApproveAll}
              disabled={pendingCount === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                pendingCount > 0
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'bg-dark-800 text-dark-500 cursor-not-allowed'
              )}
            >
              <Check className="w-4 h-4" />
              Approve All ({pendingCount})
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Hours This Week" value={totalHours.toFixed(1)} icon={Clock} iconColor="text-brand-400" />
        <StatCard title="Avg Hours / Employee" value={avgHours.toFixed(1)} icon={Users} iconColor="text-blue-400" />
        <StatCard title="Pending Approvals" value={String(pendingCount)} icon={AlertTriangle} iconColor="text-yellow-400" />
        <StatCard title="Overtime Hours" value={overtimeHours.toFixed(1)} icon={Timer} iconColor="text-red-400" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th>Employee</th>
                {dayLabels.map((d) => (
                  <th key={d} className="text-center">{d}</th>
                ))}
                <th className="text-center">Total</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-brand-400">{row.avatar_initials}</span>
                      </div>
                      <span className="text-sm font-medium text-dark-100 whitespace-nowrap">{row.name}</span>
                    </div>
                  </td>
                  {row.hours.map((h, i) => (
                    <td key={i} className="text-center">
                      <span className={cn(
                        'text-sm',
                        h === null ? 'text-dark-600' : h > 8 ? 'text-yellow-400 font-medium' : 'text-dark-300'
                      )}>
                        {h !== null ? h.toFixed(1) : '--'}
                      </span>
                    </td>
                  ))}
                  <td className="text-center">
                    <span className={cn(
                      'text-sm font-semibold',
                      row.overtime ? 'text-yellow-400' : 'text-dark-100'
                    )}>
                      {row.total.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', timeStatusColor[row.status])}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {row.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprove(row.id)}
                            className="p-2 rounded-lg hover:bg-green-500/10 text-dark-400 hover:text-green-400 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(row.id)}
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

        {/* Footer */}
        <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
          <p className="text-xs text-dark-500">
            {data.length} employees &middot; Week of {formatDate(weekStart)}
          </p>
        </div>
      </div>
    </div>
  )
}
