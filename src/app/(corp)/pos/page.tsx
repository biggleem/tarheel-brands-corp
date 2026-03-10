'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
  getToastDailySales,
  getToastSalesSummary,
  getToastRecentSales,
  getToastYearlySales,
} from '@/lib/supabase/queries'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Upload,
  ArrowRight,
  Users,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ── Types ──────────────────────────────────────────────────

type SalesSummary = {
  total_net_sales: number
  total_tax: number
  total_tips: number
  total_revenue: number
  total_orders: number
  total_guests: number
  total_days: number
  first_date: string
  last_date: string
  avg_daily_sales: number
}

type DailySale = {
  business_date: string
  net_sales: number
  tax: number
  tips: number
  total: number
  total_orders: number
  total_guests: number
}

type YearlySale = {
  year: number
  net_sales: number
  total_orders: number
  total_guests: number
  days_with_sales: number
  avg_daily_sales: number
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

function POSSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Toast POS" description="Sales and order data from Toast point-of-sale system" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-dark-700 rounded animate-pulse" />
                <div className="h-7 w-20 bg-dark-700 rounded animate-pulse" />
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

export default function POSPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [recentSales, setRecentSales] = useState<DailySale[]>([])
  const [yearlySales, setYearlySales] = useState<YearlySale[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [summ, daily, recent, yearly] = await Promise.all([
          getToastSalesSummary(),
          getToastDailySales(),
          getToastRecentSales(30),
          getToastYearlySales(),
        ])
        if (!cancelled) {
          setSummary(summ)
          setDailySales(daily as DailySale[])
          setRecentSales(recent as DailySale[])
          setYearlySales(yearly as YearlySale[])
        }
      } catch (err) {
        console.error('POS load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const chartData = useMemo(() =>
    dailySales
      .sort((a, b) => a.business_date.localeCompare(b.business_date))
      .map((d) => ({
        date: new Date(d.business_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        sales: d.net_sales,
        orders: d.total_orders,
      })),
    [dailySales]
  )

  if (loading) return <POSSkeleton />

  const avgOrderValue = summary && summary.total_orders > 0
    ? summary.total_net_sales / summary.total_orders
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Toast POS"
        description="Sales and order data from Toast point-of-sale system"
        actions={
          <Link
            href="/pos/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </Link>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Sales"
          value={formatCurrency(summary?.total_net_sales ?? 0)}
          icon={DollarSign}
          iconColor="text-green-400"
          subtitle={summary ? `${summary.total_days} days tracked` : undefined}
        />
        <StatCard
          title="Average Daily Sales"
          value={formatCurrency(summary?.avg_daily_sales ?? 0)}
          icon={TrendingUp}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Total Orders"
          value={(summary?.total_orders ?? 0).toLocaleString()}
          icon={ShoppingCart}
          iconColor="text-purple-400"
          subtitle={summary ? `${(summary.total_guests ?? 0).toLocaleString()} total guests` : undefined}
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          icon={BarChart3}
          iconColor="text-gold-400"
          subtitle={summary ? `Since ${formatDate(summary.first_date)}` : undefined}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Daily Sales (Last 90 Days)</h3>
          <div className="h-72">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-dark-500">No daily sales data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="date"
                    stroke="#525252"
                    tick={{ fill: '#737373', fontSize: 11 }}
                    interval={Math.max(1, Math.floor(chartData.length / 10))}
                  />
                  <YAxis
                    stroke="#525252"
                    tick={{ fill: '#737373', fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Net Sales"
                    stroke="#C8102E"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#C8102E', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Yearly Sales Breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Sales by Year</h3>
          <div className="h-72">
            {yearlySales.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-dark-500">No yearly data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="year"
                    stroke="#525252"
                    tick={{ fill: '#737373', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#525252"
                    tick={{ fill: '#737373', fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="net_sales"
                    name="Net Sales"
                    fill="#C8102E"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Daily Sales Table ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-dark-200">Recent Daily Sales</h3>
          <div className="flex items-center gap-3">
            <Link
              href="/pos/customers"
              className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              View Customers
            </Link>
            <Link
              href="/pos/sales"
              className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              View All Sales
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th>Date</th>
                <th className="text-right">Net Sales</th>
                <th className="text-right">Orders</th>
                <th className="text-right">Guests</th>
                <th className="text-right">Avg / Order</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => {
                const avgPerOrder = sale.total_orders > 0 ? sale.net_sales / sale.total_orders : 0
                return (
                  <tr key={sale.business_date}>
                    <td className="whitespace-nowrap">{formatDate(sale.business_date)}</td>
                    <td className="text-right font-mono font-medium text-dark-100">{formatCurrency(sale.net_sales)}</td>
                    <td className="text-right">{sale.total_orders}</td>
                    <td className="text-right">{sale.total_guests}</td>
                    <td className="text-right font-mono text-dark-300">{formatCurrency(avgPerOrder)}</td>
                  </tr>
                )
              })}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-dark-500">No sales data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-xs text-dark-500 mt-3 px-1">
          <span>Showing {recentSales.length} most recent days</span>
          <span>Total: <span className="text-dark-200 font-mono">{formatCurrency(recentSales.reduce((s, r) => s + r.net_sales, 0))}</span></span>
        </div>
      </div>
    </div>
  )
}
