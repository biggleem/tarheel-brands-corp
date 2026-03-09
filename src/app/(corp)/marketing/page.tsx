'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
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

// ── Mock Data ──────────────────────────────────────────────

interface MockPlan {
  id: string
  name: string
  business: string
  quarter: number
  year: number
  status: PlanStatus
  budget: number
  goalsTotal: number
  goalsCompleted: number
}

const plans: MockPlan[] = [
  { id: '1', name: 'Brax BBQ Q1 Growth', business: 'Brax BBQ', quarter: 1, year: 2026, status: 'active', budget: 5000, goalsTotal: 6, goalsCompleted: 3 },
  { id: '2', name: 'Tarheel Burger Spring Push', business: 'Tarheel Burger', quarter: 1, year: 2026, status: 'active', budget: 3500, goalsTotal: 4, goalsCompleted: 1 },
  { id: '3', name: 'SA Smoothie Summer Launch', business: 'SA Smoothie', quarter: 2, year: 2026, status: 'draft', budget: 4200, goalsTotal: 5, goalsCompleted: 0 },
  { id: '4', name: 'The Kickback Q2 Events', business: 'The Kickback', quarter: 2, year: 2026, status: 'draft', budget: 6000, goalsTotal: 8, goalsCompleted: 0 },
]

interface CalendarEvent {
  id: string
  title: string
  channel: string
  date: string
  assignedTo: string
}

const calendarEvents: CalendarEvent[] = [
  { id: '1', title: 'March Madness Email Blast', channel: 'Email', date: '2026-03-05', assignedTo: 'Angela D.' },
  { id: '2', title: 'New Menu Social Posts', channel: 'Social', date: '2026-03-10', assignedTo: 'Tyler B.' },
  { id: '3', title: 'Double Points Weekend', channel: 'In-Store', date: '2026-03-15', assignedTo: 'Kayla S.' },
  { id: '4', title: 'Spring Launch SMS', channel: 'SMS', date: '2026-03-18', assignedTo: 'Marcus T.' },
  { id: '5', title: 'Live Music Night Promo', channel: 'Event', date: '2026-03-22', assignedTo: 'Jordan M.' },
  { id: '6', title: 'Easter Special Campaign', channel: 'Email', date: '2026-03-28', assignedTo: 'Angela D.' },
]

// ── Helper for Calendar ────────────────────────────────────

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

// ── Page Component ─────────────────────────────────────────

export default function MarketingPage() {
  const [calMonth, setCalMonth] = useState(2) // March (0-indexed)
  const [calYear, setCalYear] = useState(2026)
  const { firstDay, daysInMonth } = getMonthDays(calYear, calMonth)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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
                <span className="text-xs text-dark-400 whitespace-nowrap">Q{plan.quarter} {plan.year}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{plan.business}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Budget: {formatCurrency(plan.budget)}</span>
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
      </div>
    </div>
  )
}
