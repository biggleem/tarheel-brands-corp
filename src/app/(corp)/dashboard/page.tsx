'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import {
  getDashboardStats,
  getRevenueExpenseData,
  getRecentActivity,
  getBills,
  getToastMonthlySales,
} from '@/lib/supabase/queries'
import type { AuditLog, StaffProfile, Bill, Organization } from '@/lib/types'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Building2,
  Users,
  FileWarning,
  UserPlus,
  Receipt,
  Upload,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────

type DashboardStats = {
  activeBusinesses: number
  activeStaff: number
  pendingBills: number
  overdueBills: number
}

type RevenueExpenseRow = {
  month: string
  revenue: number
  expenses: number
}

type ActivityEntry = AuditLog & {
  staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null
}

type OverdueBill = Bill & {
  organization: Pick<Organization, 'id' | 'name'>
}

type MonthlySalesRow = {
  month: string
  net_sales: number
  total_orders: number
  total_guests: number
}

const quickActions = [
  { label: 'Add Business', href: '/businesses?action=new', icon: Building2, color: 'text-blue-400' },
  { label: 'Add Employee', href: '/hr?action=new', icon: UserPlus, color: 'text-green-400' },
  { label: 'Create Bill', href: '/bills?action=new', icon: Receipt, color: 'text-gold-400' },
  { label: 'Import Toast Data', href: '/pos?action=import', icon: Upload, color: 'text-purple-400' },
]

// ── Helpers ───────────────────────────────────────────────

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(yyyymm: string): string {
  const monthIdx = parseInt(yyyymm.split('-')[1], 10) - 1
  return MONTH_SHORT[monthIdx] ?? yyyymm
}

function activityTypeFromAction(action: string): string {
  const a = action.toLowerCase()
  if (a.includes('employee') || a.includes('staff') || a.includes('hire')) return 'employee'
  if (a.includes('bill') || a.includes('payment') || a.includes('paid')) return 'bill'
  if (a.includes('import') || a.includes('toast')) return 'import'
  if (a.includes('business') || a.includes('organization')) return 'business'
  if (a.includes('payroll')) return 'payroll'
  return 'other'
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'employee': return <UserPlus className="w-4 h-4 text-green-400" />
    case 'bill': return <CreditCard className="w-4 h-4 text-gold-400" />
    case 'import': return <Upload className="w-4 h-4 text-purple-400" />
    case 'business': return <Building2 className="w-4 h-4 text-blue-400" />
    case 'payroll': return <DollarSign className="w-4 h-4 text-brand-400" />
    default: return <Activity className="w-4 h-4 text-dark-400" />
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

function daysOverdue(dueDate: string): number {
  const diff = Date.now() - new Date(dueDate).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

// ── Custom Tooltip ─────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-dark-300 font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-400">{entry.name}:</span>
          <span className="text-dark-100 font-medium">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ── Loading Skeleton ───────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" description="South Armz Global overview across all businesses" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-dark-700 rounded animate-pulse" />
                <div className="h-7 w-16 bg-dark-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-dark-800 rounded animate-pulse" />
              </div>
              <div className="h-10 w-10 bg-dark-800 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-4 w-40 bg-dark-700 rounded animate-pulse mb-4" />
            <div className="h-72 bg-dark-800/50 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page Component ─────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({ activeBusinesses: 0, activeStaff: 0, pendingBills: 0, overdueBills: 0 })
  const [revenueData, setRevenueData] = useState<RevenueExpenseRow[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [overdueBillsList, setOverdueBillsList] = useState<OverdueBill[]>([])
  const [monthlySales, setMonthlySales] = useState<MonthlySalesRow[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [dashStats, revExp, recent, bills, toastMonthly] = await Promise.all([
          getDashboardStats(),
          getRevenueExpenseData(6),
          getRecentActivity(5),
          getBills({ status: 'overdue' }),
          getToastMonthlySales(12),
        ])
        if (!cancelled) {
          setStats(dashStats)
          setRevenueData(revExp)
          setActivity(recent as ActivityEntry[])
          setOverdueBillsList(bills as OverdueBill[])
          setMonthlySales(toastMonthly as MonthlySalesRow[])
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <DashboardSkeleton />

  const chartData = revenueData.map((row) => ({
    ...row,
    month: formatMonthLabel(row.month),
  }))

  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0)
  const totalExpenses = revenueData.reduce((sum, r) => sum + r.expenses, 0)
  const currentMonth = revenueData.length > 0 ? revenueData[revenueData.length - 1] : null
  const netIncome = currentMonth ? currentMonth.revenue - currentMonth.expenses : 0

  const fmtCurrency = (n: number) => {
    if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}K`
    return `$${n.toLocaleString()}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" description="South Armz Global overview across all businesses" />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={fmtCurrency(totalRevenue)} icon={DollarSign} iconColor="text-green-400" />
        <StatCard title="Total Expenses" value={fmtCurrency(totalExpenses)} icon={CreditCard} iconColor="text-red-400" />
        <StatCard title="Net Income" value={fmtCurrency(netIncome)} icon={TrendingUp} iconColor="text-gold-400" />
        <StatCard title="Active Businesses" value={String(stats.activeBusinesses)} icon={Building2} iconColor="text-blue-400" />
        <StatCard title="Active Employees" value={String(stats.activeStaff)} icon={Users} iconColor="text-purple-400" />
        <StatCard title="Bills Due" value={String(stats.pendingBills)} icon={FileWarning} iconColor="text-brand-400" subtitle={stats.overdueBills > 0 ? `${stats.overdueBills} overdue` : undefined} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Revenue vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} />
                <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#737373' }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" fill="url(#gradRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gradExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Monthly POS Sales (Toast)</h3>
          <div className="h-72">
            {monthlySales.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-dark-500">No Toast POS data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySales
                    .sort((a, b) => a.month.localeCompare(b.month))
                    .map((r) => ({
                      ...r,
                      label: formatMonthLabel(r.month.slice(0, 7)),
                      revenue: r.net_sales,
                    }))}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="label" stroke="#525252" tick={{ fill: '#737373', fontSize: 11 }} />
                  <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" name="Net Sales" fill="#C8102E" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-200">Recent Activity</h3>
            <Link href="/settings/audit" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all</Link>
          </div>
          <div className="space-y-1">
            {activity.length === 0 && <p className="text-sm text-dark-500 text-center py-6">No recent activity</p>}
            {activity.map((item) => {
              const type = activityTypeFromAction(item.action)
              const staffName = item.staff ? `${item.staff.first_name} ${item.staff.last_name}` : null
              const description = (item.metadata as Record<string, unknown>)?.description as string | undefined
              const detail = description || (staffName ? `${item.action} by ${staffName}` : item.action)
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-800/40 transition-colors">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-dark-800">{getActivityIcon(type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100">{item.action}</p>
                    <p className="text-xs text-dark-400 truncate">{detail}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dark-500 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {relativeTime(item.created_at)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-medium text-dark-200">Overdue Bills</h3>
          </div>
          <div className="space-y-3">
            {overdueBillsList.length === 0 && <p className="text-sm text-dark-500 text-center py-6">No overdue bills</p>}
            {overdueBillsList.map((bill) => {
              const overdue = daysOverdue(bill.due_date)
              const displayAmount = bill.total_amount ?? bill.amount
              return (
                <div key={bill.id} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-dark-100">{bill.vendor_name}</span>
                    <span className="text-xs font-mono font-semibold text-red-400">${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-400">{bill.organization?.name ?? ''}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-400">{overdue}d overdue</span>
                  </div>
                </div>
              )
            })}
            <Link href="/bills?filter=overdue" className="flex items-center justify-center gap-1 w-full py-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              View all overdue bills
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700/30 hover:border-brand-600/30 hover:bg-dark-800 transition-all group">
              <div className={cn('p-2.5 rounded-xl bg-dark-900 group-hover:scale-105 transition-transform', action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-dark-300 group-hover:text-dark-100 transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
