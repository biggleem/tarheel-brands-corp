'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  Upload,
  ArrowRight,
  CreditCard,
  Banknote,
  Users,
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

// ── Mock Data ──────────────────────────────────────────────

const salesTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 7 + i)
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    sales: Math.floor(1200 + Math.random() * 1800 + (i > 20 ? 400 : 0)),
  }
})

const salesByBusiness = [
  { business: 'Brax BBQ', revenue: 42850 },
  { business: 'Tarheel Burger', revenue: 38200 },
  { business: 'SA Smoothie', revenue: 21600 },
  { business: 'The Kickback', revenue: 18400 },
  { business: 'Cafe 1876', revenue: 14200 },
]

const recentSales = [
  { id: '1', date: '2026-03-08', orderId: 'TOS-8842', business: 'Brax BBQ', items: 4, total: 67.48, paymentType: 'Credit Card', server: 'Marcus J.' },
  { id: '2', date: '2026-03-08', orderId: 'TOS-8841', business: 'Tarheel Burger', items: 2, total: 24.99, paymentType: 'Cash', server: 'DeShawn W.' },
  { id: '3', date: '2026-03-08', orderId: 'TOS-8840', business: 'Brax BBQ', items: 6, total: 112.30, paymentType: 'Credit Card', server: 'Aaliyah R.' },
  { id: '4', date: '2026-03-07', orderId: 'TOS-8839', business: 'SA Smoothie', items: 3, total: 28.50, paymentType: 'Debit Card', server: 'Tyler M.' },
  { id: '5', date: '2026-03-07', orderId: 'TOS-8838', business: 'The Kickback', items: 8, total: 186.75, paymentType: 'Credit Card', server: 'Jordan P.' },
  { id: '6', date: '2026-03-07', orderId: 'TOS-8837', business: 'Cafe 1876', items: 2, total: 19.80, paymentType: 'Mobile Pay', server: 'Kayla S.' },
  { id: '7', date: '2026-03-07', orderId: 'TOS-8836', business: 'Brax BBQ', items: 5, total: 94.25, paymentType: 'Credit Card', server: 'Marcus J.' },
  { id: '8', date: '2026-03-06', orderId: 'TOS-8835', business: 'Tarheel Burger', items: 3, total: 38.97, paymentType: 'Cash', server: 'DeShawn W.' },
  { id: '9', date: '2026-03-06', orderId: 'TOS-8834', business: 'SA Smoothie', items: 1, total: 8.99, paymentType: 'Debit Card', server: 'Tyler M.' },
  { id: '10', date: '2026-03-06', orderId: 'TOS-8833', business: 'The Kickback', items: 4, total: 72.50, paymentType: 'Credit Card', server: 'Jordan P.' },
]

function getPaymentIcon(type: string) {
  switch (type) {
    case 'Credit Card':
    case 'Debit Card':
      return <CreditCard className="w-3.5 h-3.5 text-blue-400" />
    case 'Cash':
      return <Banknote className="w-3.5 h-3.5 text-green-400" />
    case 'Mobile Pay':
      return <ShoppingCart className="w-3.5 h-3.5 text-purple-400" />
    default:
      return <DollarSign className="w-3.5 h-3.5 text-dark-400" />
  }
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

// ── Page Component ─────────────────────────────────────────

export default function POSPage() {
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
          title="Total Sales (MTD)"
          value="$135,250"
          change={8.4}
          icon={DollarSign}
          iconColor="text-green-400"
        />
        <StatCard
          title="Average Order Value"
          value="$42.80"
          change={3.2}
          icon={TrendingUp}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Total Orders"
          value="3,160"
          change={5.7}
          icon={ShoppingCart}
          iconColor="text-purple-400"
        />
        <StatCard
          title="Top Item"
          value="Brisket Plate"
          icon={UtensilsCrossed}
          iconColor="text-gold-400"
          subtitle="426 sold this month"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Trend Line Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Daily Sales (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="date"
                  stroke="#525252"
                  tick={{ fill: '#737373', fontSize: 11 }}
                  interval={4}
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
                  name="Sales"
                  stroke="#C8102E"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#C8102E', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Business Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-dark-200 mb-4">Sales by Business (Top 5)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBusiness} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#525252"
                  tick={{ fill: '#737373', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="business"
                  stroke="#525252"
                  tick={{ fill: '#a3a3a3', fontSize: 12 }}
                  width={110}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#C8102E"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Sales Table ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-dark-200">Recent Sales</h3>
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
                <th>Order ID</th>
                <th>Business</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Server</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="whitespace-nowrap">{formatDate(sale.date)}</td>
                  <td className="font-mono text-xs text-dark-300">{sale.orderId}</td>
                  <td className="text-dark-100 font-medium">{sale.business}</td>
                  <td className="text-center">{sale.items}</td>
                  <td className="font-mono font-medium text-dark-100">{formatCurrency(sale.total)}</td>
                  <td>
                    <div className="inline-flex items-center gap-1.5">
                      {getPaymentIcon(sale.paymentType)}
                      <span className="text-xs">{sale.paymentType}</span>
                    </div>
                  </td>
                  <td className="text-dark-300">{sale.server}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
