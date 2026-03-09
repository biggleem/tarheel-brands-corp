'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getJournalEntries, getAccountBalances, getRevenueExpenseData } from '@/lib/supabase/queries'
import type { JournalEntry, JournalEntryLine, ChartOfAccounts, Organization } from '@/lib/types'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calculator,
  BookOpen,
  FileText,
  BarChart3,
  Scale,
  ListChecks,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────

type JournalEntryRow = JournalEntry & {
  lines?: (JournalEntryLine & { account?: ChartOfAccounts })[]
  organization?: Pick<Organization, 'id' | 'name'>
}

type AccountBalance = {
  account_id: string
  account_number: string
  name: string
  account_type: string
  total_debit: number
  total_credit: number
  balance: number
}

// ── Quick links ──────────────────────────────────────────────

const quickLinks = [
  { label: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: BookOpen, color: 'text-blue-400' },
  { label: 'Journal Entries', href: '/accounting/journal-entries', icon: FileText, color: 'text-purple-400' },
  { label: 'P&L Report', href: '/accounting/reports/pnl', icon: BarChart3, color: 'text-green-400' },
  { label: 'Balance Sheet', href: '/accounting/reports/balance-sheet', icon: Scale, color: 'text-yellow-400' },
  { label: 'Trial Balance', href: '/accounting/reports/trial-balance', icon: ListChecks, color: 'text-brand-400' },
]

// ── Helpers ───────────────────────────────────────────────────

function getSourceBadge(source: string) {
  const map: Record<string, { label: string; classes: string }> = {
    manual: { label: 'Manual', classes: 'bg-dark-700 text-dark-200' },
    plaid: { label: 'Plaid', classes: 'bg-blue-500/15 text-blue-400' },
    toast: { label: 'Toast', classes: 'bg-orange-500/15 text-orange-400' },
    recurring: { label: 'Recurring', classes: 'bg-purple-500/15 text-purple-400' },
    system: { label: 'System', classes: 'bg-dark-600 text-dark-300' },
  }
  const badge = map[source] || { label: source, classes: 'bg-dark-700 text-dark-300' }
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', badge.classes)}>
      {badge.label}
    </span>
  )
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; classes: string }> = {
    posted: { label: 'Posted', classes: 'bg-green-500/15 text-green-400' },
    draft: { label: 'Draft', classes: 'bg-yellow-500/15 text-yellow-400' },
    void: { label: 'Void', classes: 'bg-red-500/15 text-red-400' },
  }
  const badge = map[status] || { label: status, classes: 'bg-dark-700 text-dark-300' }
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', badge.classes)}>
      {badge.label}
    </span>
  )
}

function computeEntryTotals(lines: (JournalEntryLine & { account?: ChartOfAccounts })[]) {
  let debitTotal = 0
  let creditTotal = 0
  for (const line of lines) {
    debitTotal += Number(line.debit) || 0
    creditTotal += Number(line.credit) || 0
  }
  return { debitTotal, creditTotal }
}

function formatMonthLabel(monthStr: string): string {
  const [, month] = monthStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[parseInt(month, 10) - 1] ?? monthStr
}

// ── Custom tooltip ───────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="glass-card p-3 text-xs border border-dark-600">
      <p className="text-dark-300 font-medium mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-400">{entry.name}:</span>
          <span className="text-dark-100 font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────

function AccountingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-3 w-20 bg-dark-700 rounded mb-3" />
            <div className="h-6 w-24 bg-dark-700 rounded" />
          </div>
        ))}
      </div>
      <div className="glass-card p-4 animate-pulse">
        <div className="h-4 w-40 bg-dark-700 rounded mb-4" />
        <div className="h-[200px] bg-dark-800 rounded" />
      </div>
    </div>
  )
}

// ── Page Component ────────────────────────────────────────────

export default function AccountingPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntryRow[]>([])
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([])
  const [pnlData, setPnlData] = useState<{ month: string; revenue: number; expenses: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [entries, balances, revExp] = await Promise.all([
          getJournalEntries(),
          getAccountBalances(),
          getRevenueExpenseData(6),
        ])
        if (!cancelled) {
          setJournalEntries(entries as JournalEntryRow[])
          setAccountBalances(balances as AccountBalance[])
          setPnlData(revExp)
        }
      } catch (err) {
        console.error('Failed to fetch accounting data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const stats = useMemo(() => {
    const revenueAccounts = accountBalances.filter((a) => a.account_type === 'revenue')
    const expenseAccounts = accountBalances.filter((a) => a.account_type === 'expense')
    const assetAccounts = accountBalances.filter((a) => a.account_type === 'asset')
    const liabilityAccounts = accountBalances.filter((a) => a.account_type === 'liability')

    const totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0)
    const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0)
    const totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0)
    const totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0)
    const netIncome = totalRevenue - totalExpenses

    return { totalRevenue, totalExpenses, totalAssets, totalLiabilities, netIncome }
  }, [accountBalances])

  const chartData = useMemo(() => {
    return pnlData.map((d) => ({
      month: formatMonthLabel(d.month),
      revenue: d.revenue,
      expenses: d.expenses,
      netIncome: d.revenue - d.expenses,
    }))
  }, [pnlData])

  const recentEntries = journalEntries.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Accounting"
        description="Financial overview and general ledger management"
      />

      {loading ? <AccountingSkeleton /> : (
        <>
          {/* ── Stat Cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard title="Total Assets" value={formatCurrency(stats.totalAssets)} icon={DollarSign} iconColor="text-green-400" />
            <StatCard title="Total Liabilities" value={formatCurrency(stats.totalLiabilities)} icon={CreditCard} iconColor="text-red-400" />
            <StatCard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} iconColor="text-brand-400" />
            <StatCard title="Expenses" value={formatCurrency(stats.totalExpenses)} icon={TrendingDown} iconColor="text-yellow-400" />
            <StatCard title="Net Income" value={formatCurrency(stats.netIncome)} icon={Calculator} iconColor="text-emerald-400" />
          </div>

          {/* ── Quick Links ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-dark-800/40 transition-colors group"
              >
                <link.icon className={cn('w-6 h-6', link.color)} />
                <span className="text-xs font-medium text-dark-300 text-center group-hover:text-dark-100 transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* ── Main Content Grid ────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Recent Journal Entries */}
            <div className="xl:col-span-3 glass-card">
              <div className="flex items-center justify-between p-4 border-b border-dark-800/50">
                <h2 className="text-sm font-semibold text-dark-100">Recent Journal Entries</h2>
                <Link
                  href="/accounting/journal-entries"
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr className="border-b border-dark-800/50">
                      <th>Date</th>
                      <th>Entry #</th>
                      <th>Description</th>
                      <th>Source</th>
                      <th className="text-right">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-dark-500 py-8">
                          No journal entries found
                        </td>
                      </tr>
                    ) : recentEntries.map((entry) => {
                      const { debitTotal } = computeEntryTotals(entry.lines || [])
                      return (
                        <tr key={entry.id}>
                          <td className="text-dark-300 whitespace-nowrap">{formatDate(entry.entry_date)}</td>
                          <td className="font-mono text-xs text-dark-400">JE-{String(entry.entry_number).padStart(4, '0')}</td>
                          <td className="max-w-[200px] truncate">{entry.description ?? '-'}</td>
                          <td>{getSourceBadge(entry.source)}</td>
                          <td className="text-right font-mono text-dark-200">{formatCurrency(debitTotal)}</td>
                          <td>{getStatusBadge(entry.status)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly P&L Chart */}
            <div className="xl:col-span-2 glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-dark-100">Monthly P&L Summary</h2>
                <Link
                  href="/accounting/reports/pnl"
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                >
                  Full report <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[280px] text-dark-500 text-sm">
                  No financial data available yet
                </div>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#737373', fontSize: 11 }}
                        axisLine={{ stroke: '#262626' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#737373', fontSize: 11 }}
                        axisLine={{ stroke: '#262626' }}
                        tickLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={6}
                      />
                      <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="netIncome" name="Net Income" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
