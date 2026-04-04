'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getTransactionSummary, getTransactions } from '@/lib/supabase/queries'
import type { TransactionSummary, TransactionRow } from '@/lib/supabase/queries'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  ArrowRight,
  Wallet,
  FileText,
  Receipt,
  PieChart,
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

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(yyyymm: string): string {
  const parts = yyyymm.split('-')
  const monthIdx = parseInt(parts[1], 10) - 1
  return `${MONTH_SHORT[monthIdx]} ${parts[0].slice(2)}`
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-dark-300 font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-400">{entry.name}:</span>
          <span className="text-dark-100 font-medium">${Math.abs(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Personal Finance" description="Personal financial overview for Kalim Hasan" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-dark-700 rounded animate-pulse" />
              <div className="h-7 w-20 bg-dark-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PersonalFinancePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [recentTxns, setRecentTxns] = useState<TransactionRow[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [summ, recent] = await Promise.all([
          getTransactionSummary(true),
          getTransactions({ is_personal: true, limit: 10 }),
        ])
        if (!cancelled) {
          setSummary(summ)
          setRecentTxns(recent)
        }
      } catch (err) {
        console.error('Personal finance load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <DashboardSkeleton />

  const monthlyChart = (summary?.monthly ?? [])
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((m) => ({
      ...m,
      label: formatMonthLabel(m.month),
    }))

  const topCategories = (summary?.categories ?? [])
    .filter((c) => c.category !== 'Internal Transfers')
    .slice(0, 8)

  const quickLinks = [
    { label: 'All Transactions', href: '/personal/transactions', icon: CreditCard, color: 'text-blue-400' },
    { label: 'Tax Documents', href: '/personal/tax', icon: FileText, color: 'text-green-400' },
    { label: 'Personal Bills', href: '/personal/bills', icon: Receipt, color: 'text-gold-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Personal Finance"
        description="Personal financial overview for Kalim Hasan"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={(summary?.total_transactions ?? 0).toLocaleString()}
          icon={Wallet}
          iconColor="text-blue-400"
          subtitle={summary ? `Since ${formatDate(summary.first_date)}` : undefined}
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.total_income ?? 0)}
          icon={TrendingUp}
          iconColor="text-green-400"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.total_expenses ?? 0)}
          icon={TrendingDown}
          iconColor="text-red-400"
        />
        <StatCard
          title="Net Cash Flow"
          value={formatCurrency((summary?.total_income ?? 0) - (summary?.total_expenses ?? 0))}
          icon={DollarSign}
          iconColor="text-gold-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Monthly Income vs Expenses</h3>
          <div className="h-72">
            {monthlyChart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-dark-500">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="label" stroke="#525252" tick={{ fill: '#737373', fontSize: 11 }} />
                  <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#737373' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-200">Top Spending Categories</h3>
            <PieChart className="w-4 h-4 text-dark-500" />
          </div>
          <div className="space-y-3">
            {topCategories.map((cat, i) => {
              const maxCount = topCategories[0]?.count ?? 1
              const pct = (cat.count / maxCount) * 100
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-dark-200">{cat.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-400">{cat.count} txns</span>
                      <span className="text-sm font-mono font-medium text-dark-100 w-24 text-right">
                        {formatCurrency(Math.abs(cat.total))}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-dark-800 rounded-full h-1.5">
                    <div
                      className="bg-brand-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {topCategories.length === 0 && (
              <p className="text-sm text-dark-500 text-center py-8">No category data</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-200">Recent Transactions</h3>
            <Link href="/personal/transactions" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'p-1.5 rounded-lg',
                    txn.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  )}>
                    {txn.amount >= 0
                      ? <TrendingUp className="w-4 h-4 text-green-400" />
                      : <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">{txn.vendor_name}</p>
                    <p className="text-xs text-dark-400">{txn.category} &middot; {txn.account_name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className={cn(
                    'text-sm font-mono font-medium',
                    txn.amount >= 0 ? 'text-green-400' : 'text-dark-100'
                  )}>
                    {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                  </p>
                  <p className="text-xs text-dark-500">{formatDate(txn.transaction_date)}</p>
                </div>
              </div>
            ))}
            {recentTxns.length === 0 && (
              <p className="text-sm text-dark-500 text-center py-8">No personal transactions</p>
            )}
          </div>
        </div>

        {/* Quick Links + Accounts */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-dark-200 mb-4">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-700/30 hover:border-brand-600/30 hover:bg-dark-800 transition-all group"
                >
                  <div className={cn('p-2 rounded-lg bg-dark-900', link.color)}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-dark-300 group-hover:text-dark-100 transition-colors">{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dark-600 ml-auto group-hover:text-dark-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-dark-200 mb-4">Accounts</h3>
            <div className="space-y-3">
              {(summary?.accounts ?? []).map((acct) => (
                <div key={`${acct.account_name}-${acct.institution_name}`} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-200">{acct.account_name}</p>
                    <p className="text-xs text-dark-500">{acct.institution_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-400">{acct.count} txns</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
