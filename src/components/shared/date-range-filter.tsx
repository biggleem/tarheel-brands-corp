'use client'

import { cn } from '@/lib/utils/cn'

export interface DateRange {
  start: string
  end: string
  label: string
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const presets: { key: string; label: string; range: () => DateRange }[] = [
  {
    key: '7d',
    label: '7 Days',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return { start: toISODate(start), end: toISODate(end), label: '7 Days' }
    },
  },
  {
    key: '30d',
    label: '30 Days',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return { start: toISODate(start), end: toISODate(end), label: '30 Days' }
    },
  },
  {
    key: '90d',
    label: '90 Days',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 90)
      return { start: toISODate(start), end: toISODate(end), label: '90 Days' }
    },
  },
  {
    key: 'this_month',
    label: 'This Month',
    range: () => {
      const now = new Date()
      return { start: toISODate(startOfMonth(now)), end: toISODate(now), label: 'This Month' }
    },
  },
  {
    key: 'last_month',
    label: 'Last Month',
    range: () => {
      const now = new Date()
      const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: toISODate(start), end: toISODate(end), label: 'Last Month' }
    },
  },
  {
    key: 'this_year',
    label: 'This Year',
    range: () => {
      const now = new Date()
      return { start: `${now.getFullYear()}-01-01`, end: toISODate(now), label: 'This Year' }
    },
  },
  {
    key: 'all',
    label: 'All Time',
    range: () => ({ start: '2000-01-01', end: '2099-12-31', label: 'All Time' }),
  },
]

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
  /** Optional subset of preset keys to show, e.g. ['30d','90d','this_year','all'] */
  options?: string[]
}

export function DateRangeFilter({ value, onChange, className, options }: DateRangeFilterProps) {
  const visiblePresets = options
    ? presets.filter((p) => options.includes(p.key))
    : presets

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visiblePresets.map((preset) => {
        const isActive = value.label === preset.label
        return (
          <button
            key={preset.key}
            onClick={() => onChange(preset.range())}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-brand-600/15 text-brand-400 border border-brand-600/30'
                : 'bg-dark-800/60 text-dark-400 border border-dark-700/50 hover:text-dark-200 hover:border-dark-600'
            )}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}

/** Helper: get default "All Time" range */
export function allTimeRange(): DateRange {
  return presets.find((p) => p.key === 'all')!.range()
}

/** Helper: get a preset range by key */
export function presetRange(key: string): DateRange {
  const p = presets.find((pr) => pr.key === key)
  return p ? p.range() : allTimeRange()
}
