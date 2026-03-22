'use client'

import { useState, useMemo } from 'react'
import type { SortConfig } from '@/components/shared/sortable-header'

/**
 * Hook for client-side sorting of any data array.
 *
 * Usage:
 *   const { sortedData, sortConfig, requestSort } = useSortableData(data)
 *   <SortableHeader sortKey="name" currentSort={sortConfig} onSort={requestSort} />
 */
export function useSortableData<T extends Record<string, unknown>>(
  data: T[],
  defaultSort?: SortConfig | null
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort ?? null)

  function requestSort(key: string) {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        // Toggle direction or clear
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        if (prev.direction === 'desc') return null // clear sort
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const { key, direction } = sortConfig
    const sorted = [...data].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      // Handle nulls — push to end
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Date string comparison (YYYY-MM-DD)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const aDate = Date.parse(aVal)
        const bDate = Date.parse(bVal)
        if (!isNaN(aDate) && !isNaN(bDate) && aVal.match(/^\d{4}-\d{2}/)) {
          return direction === 'asc' ? aDate - bDate : bDate - aDate
        }
        // String comparison
        const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
        return direction === 'asc' ? cmp : -cmp
      }

      // Fallback: string coercion
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
      return direction === 'asc' ? cmp : -cmp
    })

    return sorted
  }, [data, sortConfig])

  return { sortedData, sortConfig, requestSort }
}
