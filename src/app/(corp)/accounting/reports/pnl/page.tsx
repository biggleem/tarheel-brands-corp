'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
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

// ── Period options ────────────────────────────────────────────
type PeriodType = 'month' | 'quarter' | 'year'

// ── Mock P&L data ────────────────────────────────────────────
const pnlData = {
  revenue: [
    { accountNumber: '4000', name: 'Food Sales', current: 28400, previous: 26100 },
    { accountNumber: '4100', name: 'Beverage Sales', current: 8600, previous: 7800 },
    { accountNumber: '4200', name: 'Catering Revenue', current: 3200, previous: 4500 },
    { accountNumber: '4300', name: 'Merchandise Sales', current: 1000, previous: 800 },
  ],
  cogs: [
    { accountNumber: '5000', name: 'Food Cost', current: 9240, previous: 8700 },
    { accountNumber: '5100', name: 'Beverage Cost', current: 2150, previous: 1950 },
    { accountNumber: '5200', name: 'Packaging & Disposables', current: 1340, previous: 1200 },
  ],
  expenses: [
    { accountNumber: '6000', name: 'Rent Expense', current: 4500, previous: 4500 },
    { accountNumber: '6100', name: 'Utilities', current: 1480, previous: 1320 },
    { accountNumber: '6200', name: 'Payroll Expense', current: 12480, previous: 11900 },
    { accountNumber: '6210', name: 'Payroll Taxes', current: 1870, previous: 1785 },
    { accountNumber: '6300', name: 'Marketing & Advertising', current: 2100, previous: 1800 },
    { accountNumber: '6400', name: 'Insurance Expense', current: 1200, previous: 1200 },
    { accountNumber: '6500', name: 'Repairs & Maintenance', current: 640, previous: 480 },
    { accountNumber: '6600', name: 'Office Supplies', current: 380, previous: 290 },
    { accountNumber: '6700', name: 'Professional Fees', current: 1500, previous: 1500 },
    { accountNumber: '6800', name: 'Depreciation Expense', current: 2375, previous: 2375 },
  ],
}

const totalRevenue = pnlData.revenue.reduce((s, r) => s + r.current, 0)
const totalRevenuePrev = pnlData.revenue.reduce((s, r) => s + r.previous, 0)
const totalCOGS = pnlData.cogs.reduce((s, r) => s + r.current, 0)
const totalCOGSPrev = pnlData.cogs.reduce((s, r) => s + r.previous, 0)
const grossProfit = totalRevenue - totalCOGS
const grossProfitPrev = totalRevenuePrev - totalCOGSPrev
const totalExpenses = pnlData.expenses.reduce((s, r) => s + r.current, 0)
const totalExpensesPrev = pnlData.expenses.reduce((s, r) => s + r.previous, 0)
const netIncome = grossProfit - totalExpenses
const netIncomePrev = grossProfitPrev - totalExpensesPrev

// Comparison chart data
const comparisonData = [
  { label: 'Revenue', current: totalRevenue, previous: totalRevenuePrev },
  { label: 'COGS', current: totalCOGS, previous: totalCOGSPrev },
  { label: 'Gross Profit', current: grossProfit, previous: grossProfitPrev },
  { label: 'Expenses', current: totalExpenses, previous: totalExpensesPrev },
  { label: 'Net Income', current: netIncome, previous: netIncomePrev },
]

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

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null
  const pct = ((current - previous) / Math.abs(previous)) * 100
  return (
    <span className={cn('text-[11px] font-medium', pct >= 0 ? 'text-green-400' : 'text-red-400')}>
      {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

export default function PnLReportPage() {
  const [period, setPeriod] = useState<PeriodType>('month')
  const [businessFilter, setBusinessFilter] = useState('all')

  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'
  const netMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Profit & Loss Statement"
        description="Income and expense summary for the reporting period"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        }
      />

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dark-500" />
            <div className="flex bg-dark-900 border border-dark-700 rounded-lg overflow-hidden">
              {(['month', 'quarter', 'year'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                    period === p
                      ? 'bg-brand-600 text-white'
                      : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-dark-500" />
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
            >
              <option value="all">All - Consolidated</option>
              <option value="kitchen">Metal Brixx Cafe</option>
              <option value="fitness">Koshu Sake Bar</option>
              <option value="media">Carolina Cannabar</option>
            </select>
          </div>
          <div className="text-xs text-dark-500 flex items-center ml-auto">
            Period: March 1 - March 8, 2026 &nbsp;|&nbsp; vs. Feb 1 - Feb 8, 2026
          </div>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* P&L Report */}
        <div className="xl:col-span-2 glass-card overflow-hidden">
          {/* Revenue Section */}
          <div className="px-5 py-3 bg-dark-800/30 border-b border-dark-800/50">
            <h3 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Revenue
            </h3>
          </div>
          <div className="divide-y divide-dark-800/30">
            {pnlData.revenue.map((item) => (
              <div key={item.accountNumber} className="grid grid-cols-12 items-center px-5 py-2.5 hover:bg-dark-800/20 transition-colors">
                <div className="col-span-1 text-xs font-mono text-dark-500">{item.accountNumber}</div>
                <div className="col-span-5 text-sm text-dark-200">{item.name}</div>
                <div className="col-span-2 text-right text-sm font-mono text-dark-300">{formatCurrency(item.previous)}</div>
                <div className="col-span-2 text-right text-sm font-mono text-dark-100 font-medium">{formatCurrency(item.current)}</div>
                <div className="col-span-2 text-right">
                  <ChangeIndicator current={item.current} previous={item.previous} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-12 items-center px-5 py-3 bg-dark-800/20">
              <div className="col-span-1" />
              <div className="col-span-5 text-sm font-semibold text-dark-100">Total Revenue</div>
              <div className="col-span-2 text-right text-sm font-mono font-semibold text-dark-300">{formatCurrency(totalRevenuePrev)}</div>
              <div className="col-span-2 text-right text-sm font-mono font-semibold text-green-400">{formatCurrency(totalRevenue)}</div>
              <div className="col-span-2 text-right">
                <ChangeIndicator current={totalRevenue} previous={totalRevenuePrev} />
              </div>
            </div>
          </div>

          {/* COGS Section */}
          <div className="px-5 py-3 bg-dark-800/30 border-b border-t border-dark-800/50">
            <h3 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              Cost of Goods Sold
            </h3>
          </div>
          <div className="divide-y divide-dark-800/30">
            {pnlData.cogs.map((item) => (
              <div key={item.accountNumber} className="grid grid-cols-12 items-center px-5 py-2.5 hover:bg-dark-800/20 transition-colors">
                <div className="col-span-1 text-xs font-mono text-dark-500">{item.accountNumber}</div>
                <div className="col-span-5 text-sm text-dark-200">{item.name}</div>
                <div className="col-span-2 text-right text-sm font-mono text-dark-300">{formatCurrency(item.previous)}</div>
                <div className="col-span-2 text-right text-sm font-mono text-dark-100 font-medium">{formatCurrency(item.current)}</div>
                <div className="col-span-2 text-right">
                  <ChangeIndicator current={item.current} previous={item.previous} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-12 items-center px-5 py-3 bg-dark-800/20">
              <div className="col-span-1" />
              <div className="col-span-5 text-sm font-semibold text-dark-100">Total COGS</div>
              <div className="col-span-2 text-right text-sm font-mono font-semibold text-dark-300">{formatCurrency(totalCOGSPrev)}</div>
              <div className="col-span-2 text-right text-sm font-mono font-semibold text-orange-400">{formatCurrency(totalCOGS)}</div>
              <div className="col-span-2 text-right">
                <ChangeIndicator current={totalCOGS} previous={totalCOGSPrev} />
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="grid grid-cols-12 items-center px-5 py-4 bg-dark-800/40 border-y border-dark-700/50">
            <div className="col-span-1" />
            <div className="col-span-5 text-sm font-bold text-dark-50">
              Gross Profit
              <span className="text-xs font-normal text-dark-400 ml-2">({grossMargin}% margin)</span>
            </div>
            <div className="col-span-2 text-right text-sm font-mono font-bold text-dark-300">{formatCurrency(grossProfitPrev)}</div>
            <div className="col-span-2 text-right text-sm font-mono font-bold text-blue-400">{formatCurrency(grossProfit)}</div>
            <div className="col-span-2 text-right">
              <ChangeIndicator current={grossProfit} previous={grossProfitPrev} />
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="px-5 py-3 bg-dark-800/30 border-b border-dark-800/50">
            <h3 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Operating Expenses
            </h3>
          </div>
          <div className="divide-y divide-dark-800/30">
            {pnlData.expenses.map((item) => (
              <div key={item.accountNumber} className="grid grid-cols-12 items-center px-5 py-2.5 hover:bg-dark-800/20 transition-colors">
                <div className="col-span-1 text-xs font-mono text-dark-500">{item.accountNumber}</div>
                <div className="col-span-5 text-sm text-dark-200">{item.name}</div>
                <div className="col-span-2 text-right text-sm font-mono text-dark-300">{formatCurrency(item.previous)}</div>
                <div className="col-span-2 text-right text-sm font-mono text-dark-100 font-medium">{formatCurrency(item.current)}</div>
                <div className="col-span-2 text-right">
                  <ChangeIndicator current={item.current} previous={item.previous} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-12 items-center px-5 py-3 bg-dark-800/20">
              <div className="col-span-1" />
              <div className="col-span-5 text-sm font-semibold text-dark-100">Total Operating Expenses</div>
              <div className="col-span-2 text-right text-sm font-mono font-semibold text-dark-300">{formatCurrency(totalExpensesPrev)}</div>
              <div className="col-span-2 text-right text-sm font-mono font-semibold text-red-400">{formatCurrency(totalExpenses)}</div>
              <div className="col-span-2 text-right">
                <ChangeIndicator current={totalExpenses} previous={totalExpensesPrev} />
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="grid grid-cols-12 items-center px-5 py-4 bg-dark-800/50 border-t border-dark-700/50">
            <div className="col-span-1" />
            <div className="col-span-5 text-base font-bold text-dark-50">
              Net Income
              <span className="text-xs font-normal text-dark-400 ml-2">({netMargin}% margin)</span>
            </div>
            <div className="col-span-2 text-right text-sm font-mono font-bold text-dark-300">{formatCurrency(netIncomePrev)}</div>
            <div className={cn(
              'col-span-2 text-right text-base font-mono font-bold',
              netIncome >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {formatCurrency(netIncome)}
            </div>
            <div className="col-span-2 text-right">
              <ChangeIndicator current={netIncome} previous={netIncomePrev} />
            </div>
          </div>

          {/* Column headers label */}
          <div className="grid grid-cols-12 items-center px-5 py-2 bg-dark-900/40 text-[10px] text-dark-600 uppercase tracking-wider">
            <div className="col-span-1">Acct</div>
            <div className="col-span-5">Account</div>
            <div className="col-span-2 text-right">Previous</div>
            <div className="col-span-2 text-right">Current</div>
            <div className="col-span-2 text-right">Change</div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-dark-100 mb-4">Current vs Previous Period</h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#737373', fontSize: 10 }}
                    axisLine={{ stroke: '#262626' }}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    axisLine={{ stroke: '#262626' }}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={6} />
                  <Bar dataKey="previous" name="Previous" fill="#525252" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="current" name="Current" fill="#C8102E" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="glass-card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-dark-100">Key Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Gross Margin</span>
                <span className="text-sm font-mono font-medium text-dark-100">{grossMargin}%</span>
              </div>
              <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${grossMargin}%` }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-dark-400">Net Margin</span>
                <span className={cn('text-sm font-mono font-medium', parseFloat(netMargin) >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {netMargin}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', parseFloat(netMargin) >= 0 ? 'bg-green-500' : 'bg-red-500')}
                  style={{ width: `${Math.abs(parseFloat(netMargin))}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-dark-400">Food Cost %</span>
                <span className="text-sm font-mono font-medium text-dark-100">
                  {totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Labor Cost %</span>
                <span className="text-sm font-mono font-medium text-dark-100">
                  {totalRevenue > 0 ? (((pnlData.expenses[2].current + pnlData.expenses[3].current) / totalRevenue) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-400">Revenue Growth</span>
                <span className={cn(
                  'text-sm font-mono font-medium',
                  totalRevenue >= totalRevenuePrev ? 'text-green-400' : 'text-red-400'
                )}>
                  {totalRevenuePrev > 0 ? (((totalRevenue - totalRevenuePrev) / totalRevenuePrev) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
