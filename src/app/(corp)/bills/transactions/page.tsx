'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getTransactions, getTransactionSummary } from '@/lib/supabase/queries'
import type { TransactionRow, TransactionSummary } from '@/lib/supabase/queries'
import { SortableHeader } from '@/components/shared/sortable-header'
import { DateRangeFilter, presetRange } from '@/components/shared/date-range-filter'
import type { DateRange } from '@/components/shared/date-range-filter'
import { useSortableData } from '@/lib/hooks/use-sortable-data'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Search,
  ArrowLeft,
} from 'lucide-react'

function TableSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Business Transactions" description="All business financial transactions from Rocket Money" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5"><div className="h-7 w-20 bg-dark-700 rounded animate-pulse" /></div>
        ))}
      </div>
      <div className="glass-card p-5"><div className="h-96 bg-dark-800/50 rounded-lg animate-pulse" /></div>
    </div>
  )
}

export default function BusinessTransactionsPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(presetRange('all'))
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [accountFilter, setAccountFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [txns, summ] = await Promise.all([
          getTransactions({
            is_personal: false,
            start_date: dateRange.start || undefined,
            end_date: dateRange.end || undefined,
            limit: 500,
          }),
          getTransactionSummary(false),
        ])
        if (!cancelled) {
          setTransactions(txns)
          setSummary(summ)
        }
      } catch (err) {
        console.error('Transactions load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [dateRange])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    transactions.forEach((t) => { if (t.category) cats.add(t.category) })
    return Array.from(cats).sort()
  }, [transactions])

  const accounts = useMemo(() => {
    const accts = new Set<string>()
    transactions.forEach((t) => { if (t.account_name) accts.add(t.account_name) })
    return Array.from(accts).sort()
  }, [transactions])

  const filtered = useMemo(() => {
    let result = transactions
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) =>
        t.vendor_name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.account_name.toLowerCase().includes(q)
      )
    }
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter)
    }
    if (accountFilter) {
      result = result.filter((t) => t.account_name === accountFilter)
    }
    return result
  }, [transactions, search, categoryFilter, accountFilter])

  const { sortedData, sortConfig, requestSort } = useSortableData(
    filtered as unknown as Record<string, unknown>[],
    { key: 'transaction_date', direction: 'desc' }
  )

  if (loading) return <TableSkeleton />

  const totalIncome = filtered.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0)
  const totalExpenses = filtered.reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Business Transactions"
        description="All business financial transactions from Rocket Money"
        actions={
          <Link href="/bills" className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
            <ArrowLeft className="w-4 h-4" />
            Back to Bills
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Transactions" value={filtered.length.toLocaleString()} icon={CreditCard} iconColor="text-blue-400" />
        <StatCard title="Income" value={formatCurrency(totalIncome)} icon={TrendingUp} iconColor="text-green-400" />
        <StatCard title="Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconColor="text-red-400" />
        <StatCard title="Net" value={formatCurrency(totalIncome - totalExpenses)} icon={DollarSign} iconColor="text-gold-400" />
      </div>

      <DateRangeFilter value={dateRange} onChange={setDateRange} options={['30d', '90d', 'this_year', 'last_year', 'all']} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search vendor, description, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600/50"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-3 py-2.5 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600/50"
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
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
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-dark-800 text-dark-300 border border-dark-700/50">
                      {txn.category as string}
                    </span>
                  </td>
                  <td>
                    <span className="text-dark-200 text-xs font-medium">{txn.account_name as string}</span>
                  </td>
                  <td className="text-right">
                    <span className={cn(
                      'font-mono font-medium text-sm',
                      (txn.amount as number) >= 0 ? 'text-green-400' : 'text-dark-100'
                    )}>
                      {(txn.amount as number) >= 0 ? '+' : ''}{formatCurrency(txn.amount as number)}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-dark-500">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
          <p className="text-xs text-dark-500">Showing {sortedData.length} of {transactions.length} transactions</p>
          <p className="text-xs text-dark-500">
            Net: <span className={cn('font-mono font-medium', (totalIncome - totalExpenses) >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatCurrency(totalIncome - totalExpenses)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
