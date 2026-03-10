'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatDate } from '@/lib/utils/formatters'
import { getTimeEntriesRpc } from '@/lib/supabase/queries'
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
// Types
// ---------------------------------------------------------------------------

type TimeEntryStatus = 'active' | 'completed' | 'edited' | 'void' | 'pending' | 'approved' | 'rejected'

interface RawTimeEntry {
  id: string
  staff_id: string
  organization_id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  total_hours: number | null
  notes: string | null
  status: string
  approved_by: string | null
  approved_at: string | null
  first_name: string
  last_name: string
  role: string | null
  department: string | null
  title: string | null
  organization_name: string
}

interface WeeklyTimeRow {
  staff_id: string
  name: string
  avatar_initials: string
  department: string | null
  hours: (number | null)[] // Mon-Sun (7 slots)
  total: number
  status: TimeEntryStatus
  overtime: boolean
  entryIds: string[] // all entry IDs for this employee this week
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const timeStatusColor: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  edited: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  void: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
}

/** Return the Monday (ISO weekday 1) of the week containing the given date */
function getMonday(d: Date): Date {
  const copy = new Date(d)
  const day = copy.getDay() // 0=Sun .. 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** Return YYYY-MM-DD string from a Date (local time) */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Get initials from first and last name */
function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

/**
 * Determine the "overall" status for an employee row.
 * Priority: if any entry is pending -> pending; if any rejected -> rejected; else approved/completed.
 */
function resolveRowStatus(entries: RawTimeEntry[]): TimeEntryStatus {
  const statuses = new Set(entries.map((e) => e.status))
  if (statuses.has('pending')) return 'pending'
  if (statuses.has('rejected')) return 'rejected'
  if (statuses.has('active')) return 'active'
  if (statuses.has('edited')) return 'edited'
  if (statuses.has('approved')) return 'approved'
  if (statuses.has('completed')) return 'completed'
  return 'completed'
}

/**
 * Given an array of raw time entries (all from the same week),
 * group by employee and build WeeklyTimeRow objects.
 */
function buildWeeklyGrid(entries: RawTimeEntry[], weekMonday: Date): WeeklyTimeRow[] {
  // Group entries by staff_id
  const grouped = new Map<string, RawTimeEntry[]>()
  for (const entry of entries) {
    const existing = grouped.get(entry.staff_id) ?? []
    existing.push(entry)
    grouped.set(entry.staff_id, existing)
  }

  const rows: WeeklyTimeRow[] = []

  for (const [staffId, staffEntries] of grouped) {
    const first = staffEntries[0]
    const hours: (number | null)[] = [null, null, null, null, null, null, null]

    for (const entry of staffEntries) {
      // Parse clock_in to get the day of week index (0=Mon .. 6=Sun)
      const clockInDate = new Date(entry.clock_in)
      const entryMonday = getMonday(clockInDate)
      // Only include entries in the target week
      if (toDateStr(entryMonday) !== toDateStr(weekMonday)) continue

      const dow = clockInDate.getDay() // 0=Sun .. 6=Sat
      const idx = dow === 0 ? 6 : dow - 1 // convert to 0=Mon .. 6=Sun

      const h = entry.total_hours ?? 0
      // If multiple entries on the same day, sum them
      hours[idx] = (hours[idx] ?? 0) + h
    }

    const total = hours.reduce((s: number, h) => s + (h ?? 0), 0)

    rows.push({
      staff_id: staffId,
      name: `${first.first_name} ${first.last_name}`,
      avatar_initials: initials(first.first_name, first.last_name),
      department: first.department,
      hours,
      total,
      status: resolveRowStatus(staffEntries),
      overtime: total > 40,
      entryIds: staffEntries.map((e) => e.id),
    })
  }

  // Sort by name
  rows.sort((a, b) => a.name.localeCompare(b.name))
  return rows
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-dark-700 rounded animate-pulse" />
                <div className="h-7 w-16 bg-dark-700 rounded animate-pulse" />
              </div>
              <div className="w-10 h-10 bg-dark-700 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
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
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-dark-700 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-dark-800 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="text-center">
                      <div className="h-3.5 w-8 bg-dark-700 rounded animate-pulse mx-auto" />
                    </td>
                  ))}
                  <td className="text-center">
                    <div className="h-3.5 w-10 bg-dark-700 rounded animate-pulse mx-auto" />
                  </td>
                  <td>
                    <div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" />
                  </td>
                  <td>
                    <div className="h-4 w-16 bg-dark-700 rounded animate-pulse ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TimeTrackingPage() {
  const [rawEntries, setRawEntries] = useState<RawTimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week

  // Fetch time entries from Supabase RPC
  useEffect(() => {
    let cancelled = false
    async function fetchTimeEntries() {
      try {
        const data = await getTimeEntriesRpc()
        if (!cancelled) setRawEntries(data as RawTimeEntry[])
      } catch (err) {
        console.error('Failed to fetch time entries:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTimeEntries()
    return () => { cancelled = true }
  }, [])

  // Compute week boundaries based on offset
  const weekMonday = useMemo(() => {
    const today = new Date()
    const monday = getMonday(today)
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday
  }, [weekOffset])

  const weekSunday = useMemo(() => {
    const sun = new Date(weekMonday)
    sun.setDate(sun.getDate() + 6)
    return sun
  }, [weekMonday])

  const weekStart = toDateStr(weekMonday)
  const weekEnd = toDateStr(weekSunday)

  // Filter entries to the current week and build the weekly grid
  const weeklyData = useMemo(() => {
    if (rawEntries.length === 0) return []

    // Pre-filter entries that fall within the target week
    const weekEntries = rawEntries.filter((entry) => {
      const clockInDate = new Date(entry.clock_in)
      const entryMonday = getMonday(clockInDate)
      return toDateStr(entryMonday) === weekStart
    })

    return buildWeeklyGrid(weekEntries, weekMonday)
  }, [rawEntries, weekStart, weekMonday])

  // Local state for approve/reject (mirrors weeklyData but with status overrides)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TimeEntryStatus>>({})

  // Reset overrides when week changes
  useEffect(() => {
    setStatusOverrides({})
  }, [weekOffset])

  // Merge statusOverrides into data for display
  const data = useMemo(() => {
    return weeklyData.map((row) => {
      const override = statusOverrides[row.staff_id]
      if (override) {
        return { ...row, status: override }
      }
      return row
    })
  }, [weeklyData, statusOverrides])

  // Stats
  const totalHours = data.reduce((s, r) => s + r.total, 0)
  const avgHours = data.length > 0 ? totalHours / data.length : 0
  const pendingCount = data.filter((r) => r.status === 'pending').length
  const overtimeHours = data
    .filter((r) => r.overtime)
    .reduce((s, r) => s + Math.max(0, r.total - 40), 0)

  // Actions
  function handleApprove(staffId: string) {
    setStatusOverrides((prev) => ({ ...prev, [staffId]: 'approved' }))
  }

  function handleReject(staffId: string) {
    setStatusOverrides((prev) => ({ ...prev, [staffId]: 'rejected' }))
  }

  function handleApproveAll() {
    const overrides: Record<string, TimeEntryStatus> = {}
    for (const row of data) {
      if (row.status === 'pending') {
        overrides[row.staff_id] = 'approved'
      }
    }
    setStatusOverrides((prev) => ({ ...prev, ...overrides }))
  }

  // Loading state
  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Time Tracking"
          description="Weekly timesheet overview and approval"
        />
        <TableSkeleton />
      </div>
    )
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
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-dark-200 font-medium whitespace-nowrap">
                {formatDate(weekStart)} &ndash; {formatDate(weekEnd)}
              </span>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              >
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
              {data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12">
                    <div className="text-dark-500 text-sm">
                      No time entries found for this week.
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.staff_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-brand-400">{row.avatar_initials}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-dark-100 whitespace-nowrap block">{row.name}</span>
                          {row.department && (
                            <span className="text-xs text-dark-500">{row.department}</span>
                          )}
                        </div>
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
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', timeStatusColor[row.status] ?? timeStatusColor.completed)}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {row.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(row.staff_id)}
                              className="p-2 rounded-lg hover:bg-green-500/10 text-dark-400 hover:text-green-400 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(row.staff_id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
          <p className="text-xs text-dark-500">
            {data.length} employee{data.length !== 1 ? 's' : ''} &middot; Week of {formatDate(weekStart)}
          </p>
        </div>
      </div>
    </div>
  )
}
