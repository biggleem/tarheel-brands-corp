'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getBills } from '@/lib/supabase/queries'
import { SortableHeader } from '@/components/shared/sortable-header'
import { useSortableData } from '@/lib/hooks/use-sortable-data'
import type { Bill, BillStatus, Organization } from '@/lib/types'
import {
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit3,
  Search,
  Landmark,
  CreditCard,
  Upload,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────

type BillRow = Bill & { organization: Pick<Organization, 'id' | 'name'> }

type TabFilter = 'all' | 'pending' | 'paid' | 'overdue'

// ── Helpers ───────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  utility_electric: 'Electric',
  utility_gas: 'Gas',
  utility_water: 'Water',
  utility_internet: 'Internet',
  utility_phone: 'Phone',
  rent: 'Rent',
  insurance: 'Insurance',
  subscription: 'Subscription',
  supplies: 'Supplies',
  equipment: 'Equipment',
  services: 'Services',
  tax: 'Tax',
  payroll: 'Payroll',
  other: 'Other',
}

const typeColors: Record<string, string> = {
  utility_electric: 'bg-yellow-500/15 text-yellow-400',
  utility_gas: 'bg-orange-500/15 text-orange-400',
  utility_water: 'bg-blue-500/15 text-blue-400',
  utility_internet: 'bg-cyan-500/15 text-cyan-400',
  utility_phone: 'bg-indigo-500/15 text-indigo-400',
  rent: 'bg-purple-500/15 text-purple-400',
  insurance: 'bg-emerald-500/15 text-emerald-400',
  subscription: 'bg-pink-500/15 text-pink-400',
  supplies: 'bg-amber-500/15 text-amber-400',
  equipment: 'bg-slate-500/15 text-slate-400',
  services: 'bg-violet-500/15 text-violet-400',
  tax: 'bg-red-500/15 text-red-400',
  payroll: 'bg-green-500/15 text-green-400',
  other: 'bg-dark-700 text-dark-300',
}

const statusConfig: Record<BillStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-yellow-500/15 text-yellow-400' },
  paid: { label: 'Paid', classes: 'bg-green-500/15 text-green-400' },
  overdue: { label: 'Overdue', classes: 'bg-red-500/15 text-red-400' },
  partial: { label: 'Partial', classes: 'bg-blue-500/15 text-blue-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-dark-700 text-dark-400' },
}

// ── Loading Skeleton ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-dark-800/50">
              <th>Vendor</th><th>Business</th><th>Type</th><th className="text-right">Amount</th><th>Due Date</th><th>Status</th><th className="text-center">Recurring</th><th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td><div className="h-3.5 w-28 bg-dark-700 rounded animate-pulse" /></td>
                <td><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
                <td><div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" /></td>
                <td><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse ml-auto" /></td>
                <td><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
                <td><div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" /></td>
                <td><div className="h-4 w-4 bg-dark-700 rounded animate-pulse mx-auto" /></td>
                <td><div className="h-4 w-16 bg-dark-700 rounded animate-pulse mx-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page Component ────────────────────────────────────────────

export default function BillsPage() {
  const [bills, setBills] = useState<BillRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchBills() {
      try {
        const data = await getBills()
        if (!cancelled) setBills(data as BillRow[])
      } catch (err) {
        console.error('Failed to fetch bills:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchBills()
    return () => { cancelled = true }
  }, [])

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' },
  ]

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      if (activeTab !== 'all' && bill.status !== activeTab) return false
      if (
        search &&
        !bill.vendor_name.toLowerCase().includes(search.toLowerCase()) &&
        !(bill.organization?.name ?? '').toLowerCase().includes(search.toLowerCase()) &&
        !(bill.description ?? '').toLowerCase().includes(search.toLowerCase())
      ) return false
      return true
    })
  }, [bills, activeTab, search])

  const sortableBills = useMemo(() =>
    filtered.map((b) => ({
      ...b,
      _amount: b.total_amount ?? b.amount,
      _business: b.organization?.name ?? '',
    })),
    [filtered]
  )
  const { sortedData: sortedBills, sortConfig, requestSort } = useSortableData(
    sortableBills as unknown as Record<string, unknown>[],
    { key: 'due_date', direction: 'asc' }
  )

  const stats = useMemo(() => {
    const totalBills = bills.length
    const paidThisMonth = bills
      .filter((b) => b.status === 'paid')
      .reduce((s, b) => s + (b.total_amount ?? b.amount), 0)
    const pendingTotal = bills
      .filter((b) => b.status === 'pending')
      .reduce((s, b) => s + (b.total_amount ?? b.amount), 0)
    const overdueTotal = bills
      .filter((b) => b.status === 'overdue')
      .reduce((s, b) => s + (b.total_amount ?? b.amount), 0)
    const pendingCount = bills.filter((b) => b.status === 'pending').length
    const overdueCount = bills.filter((b) => b.status === 'overdue').length
    return { totalBills, paidThisMonth, pendingTotal, overdueTotal, pendingCount, overdueCount }
  }, [bills])

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bills & Banking"
        description="Track and manage all business bills and payments"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/bills/import"
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700"
            >
              <Upload className="w-4 h-4" />
              Import
            </Link>
            <Link
              href="/bills/plaid"
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700"
            >
              <Landmark className="w-4 h-4" />
              Bank Accounts
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Add Bill
            </button>
          </div>
        }
      />

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bills"
          value={loading ? '-' : String(stats.totalBills)}
          icon={Receipt}
          iconColor="text-brand-400"
          subtitle="Active bills tracked"
        />
        <StatCard
          title="Paid This Month"
          value={loading ? '-' : formatCurrency(stats.paidThisMonth)}
          icon={CheckCircle2}
          iconColor="text-green-400"
        />
        <StatCard
          title="Pending"
          value={loading ? '-' : formatCurrency(stats.pendingTotal)}
          icon={Clock}
          iconColor="text-yellow-400"
          subtitle={!loading ? `${stats.pendingCount} bills pending` : undefined}
        />
        <StatCard
          title="Overdue"
          value={loading ? '-' : formatCurrency(stats.overdueTotal)}
          icon={AlertTriangle}
          iconColor="text-red-400"
          subtitle={!loading ? `${stats.overdueCount} bills overdue` : undefined}
        />
      </div>

      {/* ── Tabs & Search ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex bg-dark-900 border border-dark-700 rounded-lg overflow-hidden">
          {tabs.map((tab) => {
            const count = tab.key === 'all' ? bills.length : bills.filter((b) => b.status === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5',
                  activeTab === tab.key
                    ? 'bg-brand-600 text-white'
                    : 'text-dark-400 hover:text-dark-200'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  activeTab === tab.key ? 'bg-white/20' : 'bg-dark-800 text-dark-500'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
          />
        </div>
      </div>

      {/* ── Bills Table ──────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-800/50">
                  <SortableHeader label="Vendor" sortKey="vendor_name" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Business" sortKey="_business" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Type" sortKey="bill_type" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Amount" sortKey="_amount" currentSort={sortConfig} onSort={requestSort} className="text-right" />
                  <SortableHeader label="Due Date" sortKey="due_date" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={requestSort} />
                  <th className="text-center">Recurring</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(sortedBills as unknown as BillRow[]).map((bill) => {
                  const billAmount = bill.total_amount ?? bill.amount
                  const billType = bill.bill_type ?? 'other'
                  const statusInfo = statusConfig[bill.status] ?? statusConfig.pending
                  return (
                    <tr key={bill.id}>
                      <td className="font-medium text-dark-100 whitespace-nowrap">
                        {bill.vendor_name}
                      </td>
                      <td className="text-dark-300 text-xs whitespace-nowrap">
                        {bill.organization?.name ?? '-'}
                      </td>
                      <td>
                        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', typeColors[billType] || 'bg-dark-700 text-dark-300')}>
                          {typeLabels[billType] ?? billType}
                        </span>
                      </td>
                      <td className="text-right font-mono text-dark-100 whitespace-nowrap">
                        {formatCurrency(billAmount)}
                      </td>
                      <td className={cn(
                        'whitespace-nowrap',
                        bill.status === 'overdue' ? 'text-red-400' : 'text-dark-300'
                      )}>
                        {formatDate(bill.due_date)}
                      </td>
                      <td>
                        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', statusInfo.classes)}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="text-center">
                        {bill.recurring ? (
                          <CreditCard className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-dark-600">--</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 hover:bg-dark-800 rounded-lg transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5 text-dark-400" />
                          </button>
                          <button className="p-1.5 hover:bg-dark-800 rounded-lg transition-colors" title="Edit">
                            <Edit3 className="w-3.5 h-3.5 text-dark-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Receipt className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-sm text-dark-500">No bills match your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Summary ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-dark-500 px-1">
        <span>Showing {filtered.length} of {bills.length} bills</span>
        <span>
          Total shown: <span className="text-dark-200 font-mono">{formatCurrency(filtered.reduce((s, b) => s + (b.total_amount ?? b.amount), 0))}</span>
        </span>
      </div>
    </div>
  )
}
