'use client'

import { cn } from '@/lib/utils/cn'
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface SortableHeaderProps {
  label: string
  sortKey: string
  currentSort: SortConfig | null
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({ label, sortKey, currentSort, onSort, className }: SortableHeaderProps) {
  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  return (
    <th
      className={cn('cursor-pointer select-none group', className)}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className={cn(
          'inline-flex transition-colors',
          isActive ? 'text-brand-400' : 'text-dark-600 group-hover:text-dark-400'
        )}>
          {direction === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : direction === 'desc' ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      </div>
    </th>
  )
}
