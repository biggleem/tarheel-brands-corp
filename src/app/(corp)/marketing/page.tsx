'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getMarketingPlans } from '@/lib/supabase/queries'
type PlanStatus = 'draft' | 'active' | 'completed' | 'archived'
import {
  Plus,
  BarChart3,
  Target,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Share2,
  Megaphone,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// ── Config ─────────────────────────────────────────────────

const statusConfig: Record<PlanStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-dark-300', bg: 'bg-dark-600/20' },
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/10' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  archived: { label: 'Archived', color: 'text-dark-400', bg: 'bg-dark-700/30' },
}

const channelConfig: Record<string, { color: string; bg: string }> = {
  Email: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  SMS: { color: 'text-green-400', bg: 'bg-green-500/10' },
  Social: { color: 'text-pink-400', bg: 'bg-pink-500/10' },
  'In-Store': { color: 'text-gold-400', bg: 'bg-gold-400/10' },
  Event: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

// ── Types ─────────────────────────────────────────────────

interface MappedPlan {
  id: string
  name: string
  quarter: string
  year: number
  status: PlanStatus
  budget: number
  allocatedBudget: number
  spentBudget: number
  goalsTotal: number
  goalsCompleted: number
}

interface CalendarEvent {
  id: string
  title: string
  channel: string
  date: string
  assignedTo: string
}

const calendarEvents: CalendarEvent[] = []

// ── Helper for Calendar ────────────────────────────────────

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

// ── Skeleton Loader ────────────────────────────────────────

function PlanCardSkeleton() {
  return (
    <div className="glass-card p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-40 bg-dark-700 rounded" />
          <div className="h-5 w-16 bg-dark-700 rounded" />
        </div>
        <div className="h-4 w-16 bg-dark-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-32 bg-dark-700 rounded" />
        <div className="h-3.5 w-28 bg-dark-700 rounded" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="h-3 w-24 bg-dark-700 rounded" />
          <div className="h-3 w-20 bg-dark-700 rounded" />
        </div>
        <div className="w-full h-2 bg-dark-800 rounded-full" />
      </div>
    </div>
  )
}

// ── Page Component ─────────────────────────────────────────

export default function MarketingPage() {
  const [plans, setPlans] = useState<MappedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [calMonth, setCalMonth] = useState(2) // March (0-indexed)
  const [calYear, setCalYear] = useState(2026)
  const { firstDay, daysInMonth } = getMonthDays(calYear, calMonth)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const raw = await getMarketingPlans()
        if (cancelled) return
        const mapped: MappedPlan[] = raw.map((p) => ({
          id: p.id,
          name: p.name,
          quarter: `Q${p.quarter}`,
          year: p.fiscal_year,
          status: p.status as PlanStatus,
          budget: p.budget,
          allocatedBudget: p.allocated_budget,
          spentBudget: p.spent_budget,
          goalsTotal: p.goals.total,
          goalsCompleted: p.goals.completed,
        }))
        setPlans(mapped)
      } catch (err) {
        console.error('Failed to load marketing plans:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function getEventsForDay(day: number) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarEvents.filter((e) => e.date === dateStr)
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
    else setCalMonth(calMonth - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
    else setCalMonth(calMonth + 1)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Marketing Plans"
        description="Quarterly marketing plans and campaign calendar"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        }
      />

      {/* ── Plans Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlanCardSkeleton />
          <PlanCardSkeleton />
          <PlanCardSkeleton />
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const statusInfo = statusConfig[plan.status]
            const progressPct = plan.goalsTotal > 0 ? (plan.goalsCompleted / plan.goalsTotal) * 100 : 0

            return (
              <div key={plan.id} className="glass-card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-dark-100 truncate">{plan.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                          statusInfo.bg,
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-dark-400 whitespace-nowrap">{plan.quarter} {plan.year}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Budget: {formatCurrency(plan.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Spent: {formatCurrency(plan.spentBudget)} of {formatCurrency(plan.allocatedBudget)} allocated</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-dark-400">Goals Progress</span>
                    <span className="text-dark-300">{plan.goalsCompleted}/{plan.goalsTotal} completed</span>
                  </div>
                  <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        progressPct >= 100 ? 'bg-green-500' : progressPct > 0 ? 'bg-brand-600' : 'bg-dark-700'
                      )}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-xl bg-dark-800/60 mb-4">
            <Target className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-sm font-semibold text-dark-200 mb-1">No marketing plans yet</h3>
          <p className="text-xs text-dark-500 max-w-xs">
            Create your first quarterly marketing plan to start tracking budgets, goals, and campaigns across your brands.
          </p>
        </div>
      )}

      {/* ── Marketing Calendar ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-dark-200">Marketing Calendar</h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-dark-100 min-w-[120px] text-center">
              {monthNames[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-dark-800 transition-colors text-dark-400 hover:text-dark-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-dark-500 uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-lg bg-dark-900/30" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const events = getEventsForDay(day)
            const isToday = calYear === 2026 && calMonth === 2 && day === 8

            return (
              <div
                key={day}
                className={cn(
                  'h-20 rounded-lg p-1.5 transition-colors',
                  isToday ? 'bg-brand-600/10 border border-brand-600/30' : 'bg-dark-800/20 hover:bg-dark-800/40'
                )}
              >
                <span className={cn('text-xs font-medium', isToday ? 'text-brand-400' : 'text-dark-400')}>
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {events.map((evt) => {
                    const ch = channelConfig[evt.channel] || { color: 'text-dark-300', bg: 'bg-dark-700/30' }
                    return (
                      <div
                        key={evt.id}
                        className={cn('px-1 py-0.5 rounded text-[9px] font-medium truncate', ch.bg, ch.color)}
                        title={`${evt.title} - ${evt.assignedTo}`}
                      >
                        {evt.title}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Calendar Events List ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Upcoming Events</h3>
        {calendarEvents.length > 0 ? (
          <div className="space-y-1">
            {calendarEvents.map((evt) => {
              const ch = channelConfig[evt.channel] || { color: 'text-dark-300', bg: 'bg-dark-700/30' }
              return (
                <div
                  key={evt.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800/40 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-dark-800">
                    <Calendar className="w-4 h-4 text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100">{evt.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
                          ch.bg,
                          ch.color
                        )}
                      >
                        {evt.channel}
                      </span>
                      <span className="text-xs text-dark-500">{formatDate(evt.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-dark-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{evt.assignedTo}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-xl bg-dark-800/60 mb-4">
              <Calendar className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-sm font-semibold text-dark-200 mb-1">No upcoming events</h3>
            <p className="text-xs text-dark-500 max-w-xs">
              Schedule campaigns and events to see them appear on your marketing calendar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
