'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getTransactions } from '@/lib/supabase/queries'
import type { TransactionRow } from '@/lib/supabase/queries'
import { SortableHeader } from '@/components/shared/sortable-header'
import { DateRangeFilter, presetRange } from '@/components/shared/date-range-filter'
import type { DateRange } from '@/components/shared/date-range-filter'
import { useSortableData } from '@/lib/hooks/use-sortable-data'
import {
  DollarSign,
  TrendingDown,
  Receipt,
  Search,
  ArrowLeft,
  Home,
  Car,
  Zap,
  ShoppingCart,
  CreditCard,
} from 'lucide-react'

// Personal bill categories to filter for
const BILL_CATEGORIES = [
  'Rent & Mortgage', 'Utilities', 'Insurance', 'Auto & Transport',
  'Subscriptions', 'Phone', 'Internet', 'Loan Payment', 'Medical',
  'Groceries', 'Personal Care', 'Education',
]

function getCategoryIcon(cat: string) {
  if (cat.includes('Rent') || cat.includes('Mortgage')) return <Home className="w-3.5 h-3.5" />
  if (cat.includes('Auto') || cat.includes('Transport')) return <Car className="w-3.5 h-3.5" />
  if (cat.includes('Util') || cat.includes('Electric') || cat.includes('Energy')) return <Zap className="w-3.5 h-3.5" />
  if (cat.includes('Shop') || cat.includes('Grocer')) return <ShoppingCart className="w-3.5 h-3.5" />
  return <CreditCard className="w-3.5 h-3.5" />
}

function TableSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Personal Bills" description="Personal recurring bills and expenses" />
      <div className="glass-card p-5"><div className="h-96 bg-dark-800/50 rounded-lg animate-pulse" /></div>
    </div>
  )
}

export default function PersonalBillsPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [dateRange, setDateRange] = useState<DateRange>(presetRange('90d'))
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Get personal transactions that look like bills (negative amounts, recurring categories)
        const txns = await getTransactions({
          is_personal: true,
          start_date: dateRange.start || undefined,
          end_date: dateRange.end || undefined,
          limit: 500,
        })
        if (!cancelled) {
          // Filter to expense transactions only
          setTransactions(txns.filter((t) => t.amount < 0))
        }
      } catch (err) {
        console.error('Personal bills load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [dateRange])

  const filtered = useMemo(() => {
    if (!search) return transactions
    const q = search.toLowerCase()
    return transactions.filter((t) =>
      t.vendor_name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
  }, [transactions, search])

  const { sortedData, sortConfig, requestSort } = useSortableData(
    filtered as unknown as Record<string, unknown>[],
    { key: 'transaction_date', direction: 'desc' }
  )

  if (loading) return <TableSkeleton />

  const totalExpenses = filtered.reduce((s, t) => s + Math.abs(t.amount), 0)
  const avgPerTxn = filtered.length > 0 ? totalExpenses / filtered.length : 0

  // Group by category for quick stats
  const byCat: Record<string, { count: number; total: number }> = {}
  filtered.forEach((t) => {
    const cat = t.category || 'Other'
    if (!byCat[cat]) byCat[cat] = { count: 0, total: 0 }
    byCat[cat].count++
    byCat[cat].total += Math.abs(t.amount)
  })
  const topCats = Object.entries(byCat).sort((a, b) => b[1].total - a[1].total).slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Personal Bills & Expenses"
        description="Personal spending from Rocket Money accounts"
        actions={
          <Link href="/personal" className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconColor="text-red-400" />
        <StatCard title="Transactions" value={filtered.length.toLocaleString()} icon={Receipt} iconColor="text-blue-400" />
        <StatCard title="Avg / Transaction" value={formatCurrency(avgPerTxn)} icon={DollarSign} iconColor="text-gold-400" />
        <StatCard title="Categories" value={Object.keys(byCat).length.toLocaleString()} icon={CreditCard} iconColor="text-purple-400" />
      </div>

      <DateRangeFilter value={dateRange} onChange={setDateRange} options={['30d', '90d', 'this_year', 'last_year', 'all']} />

      {/* Top Categories Quick View */}
      {topCats.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {topCats.map(([cat, data]) => (
            <button
              key={cat}
              onClick={() => setSearch(cat)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                search === cat
                  ? 'bg-brand-600/15 text-brand-400 border-brand-600/30'
                  : 'bg-dark-800/60 text-dark-300 border-dark-700/50 hover:border-dark-600'
              )}
            >
              {getCategoryIcon(cat)}
              {cat}
              <span className="text-dark-500">{formatCurrency(data.total)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input
          type="text"
          placeholder="Search vendor, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-dark-700/50">
                <SortableHeader label="Date" sortKey="transaction_date" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Vendor" sortKey="vendor_name" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Category" sortKey="category" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Account" sortKey="account_name" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Amount" sortKey="amount" currentSort={sortConfig} onSort={requestSort} className="text-right" />
              </tr>
            </thead>
            <tbody>
              {sortedData.map((txn) => (
                <tr key={txn.id as string}>
                  <td className="whitespace-nowrap">{formatDate(txn.transaction_date as string)}</td>
                  <td className="text-dark-100 font-medium max-w-[250px] truncate">{txn.vendor_name as string}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-dark-800 text-dark-300 border border-dark-700/50">
                      {getCategoryIcon(txn.category as string)}
                      {txn.category as string}
                    </span>
                  </td>
                  <td className="text-dark-400 text-xs">{txn.account_name as string}</td>
                  <td className="text-right font-mono font-medium text-red-400">
                    {formatCurrency(Math.abs(txn.amount as number))}
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-dark-500">No expenses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
          <p className="text-xs text-dark-500">Showing {sortedData.length} of {transactions.length} expenses</p>
          <p className="text-xs text-dark-500">
            Total: <span className="font-mono font-medium text-red-400">{formatCurrency(totalExpenses)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
