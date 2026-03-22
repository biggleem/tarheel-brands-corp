'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
  ArrowLeft,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  CheckCircle2,
  CircleDashed,
  Filter,
  Calendar,
  Download,
  ChevronDown,
  Building2,
  Landmark,
  RefreshCw,
} from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────

type TxStatus = 'categorized' | 'uncategorized' | 'excluded'
type TxCategory =
  | 'food_supplies'
  | 'utilities'
  | 'rent'
  | 'payroll'
  | 'equipment'
  | 'marketing'
  | 'insurance'
  | 'subscriptions'
  | 'office'
  | 'travel'
  | 'revenue'
  | 'uncategorized'

interface PlaidTransaction {
  id: string
  date: string
  description: string
  amount: number
  direction: 'debit' | 'credit'
  category: TxCategory
  business: string
  account: string
  institution: string
  status: TxStatus
}

const categoryLabels: Record<TxCategory, string> = {
  food_supplies: 'Food & Supplies',
  utilities: 'Utilities',
  rent: 'Rent',
  payroll: 'Payroll',
  equipment: 'Equipment',
  marketing: 'Marketing',
  insurance: 'Insurance',
  subscriptions: 'Subscriptions',
  office: 'Office Supplies',
  travel: 'Travel',
  revenue: 'Revenue',
  uncategorized: 'Uncategorized',
}

const categoryColors: Record<TxCategory, string> = {
  food_supplies: 'bg-orange-500/15 text-orange-400',
  utilities: 'bg-yellow-500/15 text-yellow-400',
  rent: 'bg-purple-500/15 text-purple-400',
  payroll: 'bg-green-500/15 text-green-400',
  equipment: 'bg-slate-500/15 text-slate-400',
  marketing: 'bg-pink-500/15 text-pink-400',
  insurance: 'bg-emerald-500/15 text-emerald-400',
  subscriptions: 'bg-blue-500/15 text-blue-400',
  office: 'bg-cyan-500/15 text-cyan-400',
  travel: 'bg-indigo-500/15 text-indigo-400',
  revenue: 'bg-green-500/15 text-green-400',
  uncategorized: 'bg-dark-700 text-dark-400',
}

const statusConfig: Record<TxStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  categorized: { label: 'Categorized', icon: CheckCircle2, color: 'text-green-400' },
  uncategorized: { label: 'Uncategorized', icon: CircleDashed, color: 'text-yellow-400' },
  excluded: { label: 'Excluded', icon: CircleDashed, color: 'text-dark-500' },
}

const mockTransactions: PlaidTransaction[] = [
  { id: 'tx-001', date: '2026-03-08', description: 'Sysco Foods Charlotte', amount: 2847.50, direction: 'debit', category: 'food_supplies', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-002', date: '2026-03-08', description: 'Square Payment - POS Revenue', amount: 4215.80, direction: 'credit', category: 'revenue', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-003', date: '2026-03-07', description: 'Duke Energy - Service Charge', amount: 847.50, direction: 'debit', category: 'utilities', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-004', date: '2026-03-07', description: 'Spectrum Business Internet', amount: 189.99, direction: 'debit', category: 'utilities', business: 'South Armz Global Inc', account: 'Operating Account ****5567', institution: 'Wells Fargo', status: 'categorized' },
  { id: 'tx-005', date: '2026-03-07', description: 'GUSTO Payroll Processing', amount: 12480.00, direction: 'debit', category: 'payroll', business: 'South Armz Global Inc', account: 'Payroll Account ****2210', institution: 'Wells Fargo', status: 'categorized' },
  { id: 'tx-006', date: '2026-03-06', description: 'Amazon Business - Kitchen supplies', amount: 342.18, direction: 'debit', category: 'food_supplies', business: 'Tarheel Kitchen', account: 'Business Credit Card ****9104', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-007', date: '2026-03-06', description: 'Meta Ads - Campaign 0306', amount: 450.00, direction: 'debit', category: 'marketing', business: 'South Armz Global Inc', account: 'Operating Account ****5567', institution: 'Wells Fargo', status: 'categorized' },
  { id: 'tx-008', date: '2026-03-06', description: 'Staples Office Supply', amount: 234.67, direction: 'debit', category: 'office', business: 'South Armz Global Inc', account: 'Business Plus Checking ****8834', institution: 'Chase', status: 'uncategorized' },
  { id: 'tx-009', date: '2026-03-05', description: 'Toast POS Revenue Deposit', amount: 3890.42, direction: 'credit', category: 'revenue', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-010', date: '2026-03-05', description: 'State Farm Insurance Premium', amount: 1200.00, direction: 'debit', category: 'insurance', business: 'South Armz Global Inc', account: 'Operating Account ****5567', institution: 'Wells Fargo', status: 'categorized' },
  { id: 'tx-011', date: '2026-03-04', description: 'US Foods Delivery', amount: 1648.90, direction: 'debit', category: 'food_supplies', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-012', date: '2026-03-04', description: 'Canva Pro Subscription', amount: 12.99, direction: 'debit', category: 'subscriptions', business: 'South Armz Global Inc', account: 'Business Credit Card ****9104', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-013', date: '2026-03-03', description: 'Unknown Charge - TRF REF 4491', amount: 89.00, direction: 'debit', category: 'uncategorized', business: '', account: 'Business Plus Checking ****8834', institution: 'Chase', status: 'uncategorized' },
  { id: 'tx-014', date: '2026-03-03', description: 'Crown Properties - Rent March', amount: 4500.00, direction: 'debit', category: 'rent', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-015', date: '2026-03-03', description: 'Toast POS Revenue Deposit', amount: 2918.65, direction: 'credit', category: 'revenue', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-016', date: '2026-03-02', description: 'Google Workspace - Monthly', amount: 72.00, direction: 'debit', category: 'subscriptions', business: 'South Armz Global Inc', account: 'Operating Account ****5567', institution: 'Wells Fargo', status: 'categorized' },
  { id: 'tx-017', date: '2026-03-02', description: 'Uber Eats - Marketplace Fee', amount: 186.40, direction: 'debit', category: 'marketing', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'uncategorized' },
  { id: 'tx-018', date: '2026-03-01', description: 'QuickBooks Online', amount: 80.00, direction: 'debit', category: 'subscriptions', business: 'South Armz Global Inc', account: 'Operating Account ****5567', institution: 'Wells Fargo', status: 'categorized' },
  { id: 'tx-019', date: '2026-03-01', description: 'Toast POS Revenue Deposit', amount: 5124.30, direction: 'credit', category: 'revenue', business: 'Tarheel Kitchen', account: 'Business Checking ****4821', institution: 'Bank of America', status: 'categorized' },
  { id: 'tx-020', date: '2026-03-01', description: 'Verizon Wireless Business', amount: 245.00, direction: 'debit', category: 'utilities', business: 'South Armz Global Inc', account: 'Operating Account ****5567', institution: 'Wells Fargo', status: 'categorized' },
]

// ── Page Component ─────────────────────────────────────────

export default function PlaidTransactionsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [businessFilter, setBusinessFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState('this_month')
  const [selectedTxs, setSelectedTxs] = useState<string[]>([])

  const businesses = useMemo(() => {
    return [...new Set(mockTransactions.map((t) => t.business).filter(Boolean))].sort()
  }, [])

  const categories = useMemo(() => {
    return [...new Set(mockTransactions.map((t) => t.category))].sort()
  }, [])

  const filtered = useMemo(() => {
    return mockTransactions.filter((tx) => {
      const matchSearch =
        !search ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.account.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter
      const matchBusiness = businessFilter === 'all' || tx.business === businessFilter
      return matchSearch && matchCategory && matchStatus && matchBusiness
    })
  }, [search, categoryFilter, statusFilter, businessFilter])

  const totalDebits = filtered.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0)
  const totalCredits = filtered.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0)
  const uncategorizedCount = filtered.filter((t) => t.status === 'uncategorized').length

  const toggleSelect = (id: string) => {
    setSelectedTxs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selectedTxs.length === filtered.length) {
      setSelectedTxs([])
    } else {
      setSelectedTxs(filtered.map((t) => t.id))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bank Transactions"
        description="Imported transactions from linked bank accounts"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/bills/plaid"
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Accounts
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Sync Now
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inflow"
          value={formatCurrency(totalCredits)}
          icon={ArrowDownRight}
          iconColor="text-green-400"
        />
        <StatCard
          title="Total Outflow"
          value={formatCurrency(totalDebits)}
          icon={ArrowUpRight}
          iconColor="text-red-400"
        />
        <StatCard
          title="Transactions"
          value={filtered.length.toString()}
          icon={Landmark}
          iconColor="text-blue-400"
          subtitle={`of ${mockTransactions.length} total`}
        />
        <StatCard
          title="Uncategorized"
          value={uncategorizedCount.toString()}
          icon={CircleDashed}
          iconColor="text-yellow-400"
          subtitle="needs review"
        />
      </div>

      {/* ── Filters ── */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600/50 focus:border-brand-600/50 transition-colors"
            />
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_90">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>

          {/* Business Filter */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="all">All Businesses</option>
              {businesses.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="categorized">Categorized</option>
              <option value="uncategorized">Uncategorized</option>
              <option value="excluded">Excluded</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Batch Actions ── */}
      {selectedTxs.length > 0 && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-sm text-dark-300">
            <span className="font-medium text-dark-100">{selectedTxs.length}</span> transaction{selectedTxs.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors">
              Categorize Selected
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-colors">
              Assign Business
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-colors">
              Exclude
            </button>
          </div>
        </div>
      )}

      {/* ── Transactions Table ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-dark-800/50">
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedTxs.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-dark-600 bg-dark-800 text-brand-600 focus:ring-brand-600/50"
                  />
                </th>
                <th>Date</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th>Category</th>
                <th>Business</th>
                <th className="hidden lg:table-cell">Account</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const catColor = categoryColors[tx.category]
                const stConfig = statusConfig[tx.status]
                const StIcon = stConfig.icon
                return (
                  <tr key={tx.id} className={cn(selectedTxs.includes(tx.id) && 'bg-brand-600/5')}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTxs.includes(tx.id)}
                        onChange={() => toggleSelect(tx.id)}
                        className="rounded border-dark-600 bg-dark-800 text-brand-600 focus:ring-brand-600/50"
                      />
                    </td>
                    <td className="text-dark-300 whitespace-nowrap text-xs">{formatDate(tx.date)}</td>
                    <td>
                      <div className="max-w-[240px]">
                        <p className="text-sm text-dark-100 truncate">{tx.description}</p>
                      </div>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {tx.direction === 'credit' ? (
                          <ArrowDownRight className="w-3 h-3 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-red-400" />
                        )}
                        <span className={cn(
                          'font-mono text-sm font-medium',
                          tx.direction === 'credit' ? 'text-green-400' : 'text-dark-100'
                        )}>
                          {tx.direction === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap', catColor)}>
                        {categoryLabels[tx.category]}
                      </span>
                    </td>
                    <td className="text-dark-300 text-xs whitespace-nowrap">
                      {tx.business || <span className="text-dark-600">Unassigned</span>}
                    </td>
                    <td className="hidden lg:table-cell text-dark-400 text-xs whitespace-nowrap">
                      {tx.account}
                    </td>
                    <td>
                      <span className={cn('flex items-center gap-1 text-xs', stConfig.color)}>
                        <StIcon className="w-3 h-3" />
                        {stConfig.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Landmark className="w-8 h-8 text-dark-600 mx-auto mb-2" />
            <p className="text-sm text-dark-400">No transactions match your filters.</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
          <p className="text-xs text-dark-500">
            Showing {filtered.length} of {mockTransactions.length} transactions
          </p>
          <div className="flex items-center gap-4 text-xs text-dark-500">
            <span>
              Inflow: <span className="text-green-400 font-mono">{formatCurrency(totalCredits)}</span>
            </span>
            <span>
              Outflow: <span className="text-red-400 font-mono">{formatCurrency(totalDebits)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
