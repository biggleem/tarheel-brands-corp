'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency } from '@/lib/utils/formatters'
import type { AccountType, NormalBalance } from '@/lib/types'
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  CircleDot,
  CircleOff,
} from 'lucide-react'

// ── Mock Chart of Accounts ──────────────────────────────────
interface AccountRow {
  id: string
  accountNumber: string
  name: string
  type: AccountType
  normalBalance: NormalBalance
  isActive: boolean
  isHeader: boolean
  balance?: number
  children?: AccountRow[]
}

const chartOfAccounts: AccountRow[] = [
  {
    id: 'a-hdr',
    accountNumber: '1000',
    name: 'Assets',
    type: 'asset',
    normalBalance: 'debit',
    isActive: true,
    isHeader: true,
    children: [
      { id: 'a-1000', accountNumber: '1000', name: 'Cash - Operating', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 45230.50 },
      { id: 'a-1010', accountNumber: '1010', name: 'Cash - Payroll', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 18400.00 },
      { id: 'a-1020', accountNumber: '1020', name: 'Petty Cash', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 500.00 },
      { id: 'a-1100', accountNumber: '1100', name: 'Accounts Receivable', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 12680.00 },
      { id: 'a-1200', accountNumber: '1200', name: 'Inventory - Food & Beverage', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 8940.00 },
      { id: 'a-1210', accountNumber: '1210', name: 'Inventory - Supplies', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 3200.00 },
      { id: 'a-1300', accountNumber: '1300', name: 'Prepaid Insurance', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 6400.00 },
      { id: 'a-1400', accountNumber: '1400', name: 'Prepaid Rent', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 4500.00 },
      { id: 'a-1500', accountNumber: '1500', name: 'Equipment', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 145000.00 },
      { id: 'a-1510', accountNumber: '1510', name: 'Accumulated Depreciation - Equipment', type: 'asset', normalBalance: 'credit', isActive: true, isHeader: false, balance: -28500.00 },
      { id: 'a-1600', accountNumber: '1600', name: 'Leasehold Improvements', type: 'asset', normalBalance: 'debit', isActive: true, isHeader: false, balance: 68300.00 },
    ],
  },
  {
    id: 'l-hdr',
    accountNumber: '2000',
    name: 'Liabilities',
    type: 'liability',
    normalBalance: 'credit',
    isActive: true,
    isHeader: true,
    children: [
      { id: 'l-2000', accountNumber: '2000', name: 'Accounts Payable', type: 'liability', normalBalance: 'credit', isActive: true, isHeader: false, balance: 14320.00 },
      { id: 'l-2050', accountNumber: '2050', name: 'Credit Card Payable', type: 'liability', normalBalance: 'credit', isActive: true, isHeader: false, balance: 6840.00 },
      { id: 'l-2100', accountNumber: '2100', name: 'Accrued Wages', type: 'liability', normalBalance: 'credit', isActive: true, isHeader: false, balance: 8200.00 },
      { id: 'l-2200', accountNumber: '2200', name: 'Sales Tax Payable', type: 'liability', normalBalance: 'credit', isActive: true, isHeader: false, balance: 3160.00 },
      { id: 'l-2300', accountNumber: '2300', name: 'Equipment Loan', type: 'liability', normalBalance: 'credit', isActive: true, isHeader: false, balance: 45000.00 },
      { id: 'l-2400', accountNumber: '2400', name: 'Unearned Revenue', type: 'liability', normalBalance: 'credit', isActive: true, isHeader: false, balance: 2400.00 },
    ],
  },
  {
    id: 'e-hdr',
    accountNumber: '3000',
    name: 'Equity',
    type: 'equity',
    normalBalance: 'credit',
    isActive: true,
    isHeader: true,
    children: [
      { id: 'e-3000', accountNumber: '3000', name: "Owner's Equity", type: 'equity', normalBalance: 'credit', isActive: true, isHeader: false, balance: 150000.00 },
      { id: 'e-3100', accountNumber: '3100', name: 'Retained Earnings', type: 'equity', normalBalance: 'credit', isActive: true, isHeader: false, balance: 36730.50 },
      { id: 'e-3200', accountNumber: '3200', name: "Owner's Draws", type: 'equity', normalBalance: 'debit', isActive: true, isHeader: false, balance: -5000.00 },
    ],
  },
  {
    id: 'r-hdr',
    accountNumber: '4000',
    name: 'Revenue',
    type: 'revenue',
    normalBalance: 'credit',
    isActive: true,
    isHeader: true,
    children: [
      { id: 'r-4000', accountNumber: '4000', name: 'Food Sales', type: 'revenue', normalBalance: 'credit', isActive: true, isHeader: false, balance: 28400.00 },
      { id: 'r-4100', accountNumber: '4100', name: 'Beverage Sales', type: 'revenue', normalBalance: 'credit', isActive: true, isHeader: false, balance: 8600.00 },
      { id: 'r-4200', accountNumber: '4200', name: 'Catering Revenue', type: 'revenue', normalBalance: 'credit', isActive: true, isHeader: false, balance: 3200.00 },
      { id: 'r-4300', accountNumber: '4300', name: 'Merchandise Sales', type: 'revenue', normalBalance: 'credit', isActive: true, isHeader: false, balance: 1000.00 },
    ],
  },
  {
    id: 'c-hdr',
    accountNumber: '5000',
    name: 'Cost of Goods Sold',
    type: 'expense',
    normalBalance: 'debit',
    isActive: true,
    isHeader: true,
    children: [
      { id: 'c-5000', accountNumber: '5000', name: 'Food Cost', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 9240.00 },
      { id: 'c-5100', accountNumber: '5100', name: 'Beverage Cost', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 2150.00 },
      { id: 'c-5200', accountNumber: '5200', name: 'Packaging & Disposables', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 1340.00 },
    ],
  },
  {
    id: 'x-hdr',
    accountNumber: '6000',
    name: 'Operating Expenses',
    type: 'expense',
    normalBalance: 'debit',
    isActive: true,
    isHeader: true,
    children: [
      { id: 'x-6000', accountNumber: '6000', name: 'Rent Expense', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 4500.00 },
      { id: 'x-6100', accountNumber: '6100', name: 'Utilities', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 1480.00 },
      { id: 'x-6200', accountNumber: '6200', name: 'Payroll Expense', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 12480.00 },
      { id: 'x-6210', accountNumber: '6210', name: 'Payroll Taxes', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 1870.00 },
      { id: 'x-6300', accountNumber: '6300', name: 'Marketing & Advertising', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 2100.00 },
      { id: 'x-6400', accountNumber: '6400', name: 'Insurance Expense', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 1200.00 },
      { id: 'x-6500', accountNumber: '6500', name: 'Repairs & Maintenance', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 640.00 },
      { id: 'x-6600', accountNumber: '6600', name: 'Office Supplies', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 380.00 },
      { id: 'x-6700', accountNumber: '6700', name: 'Professional Fees', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 1500.00 },
      { id: 'x-6800', accountNumber: '6800', name: 'Depreciation Expense', type: 'expense', normalBalance: 'debit', isActive: true, isHeader: false, balance: 2375.00 },
      { id: 'x-6900', accountNumber: '6900', name: 'Miscellaneous Expense', type: 'expense', normalBalance: 'debit', isActive: false, isHeader: false, balance: 0 },
    ],
  },
]

const typeLabels: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense',
}

const typeColors: Record<string, string> = {
  asset: 'bg-blue-500/15 text-blue-400',
  liability: 'bg-red-500/15 text-red-400',
  equity: 'bg-purple-500/15 text-purple-400',
  revenue: 'bg-green-500/15 text-green-400',
  expense: 'bg-yellow-500/15 text-yellow-400',
}

export default function ChartOfAccountsPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(chartOfAccounts.map((g) => g.id))
  )
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<AccountType | 'all'>('all')

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredAccounts = chartOfAccounts
    .filter((group) => filterType === 'all' || group.type === filterType)
    .map((group) => ({
      ...group,
      children: group.children?.filter(
        (acct) =>
          acct.name.toLowerCase().includes(search.toLowerCase()) ||
          acct.accountNumber.includes(search)
      ),
    }))
    .filter((group) => (group.children?.length ?? 0) > 0 || search === '')

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Chart of Accounts"
        description="Manage your general ledger account structure"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        }
      />

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dark-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AccountType | 'all')}
            className="bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Types</option>
            <option value="asset">Assets</option>
            <option value="liability">Liabilities</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
      </div>

      {/* ── Account Tree ─────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-dark-800/50 text-xs font-medium text-dark-400 uppercase tracking-wider">
          <div className="col-span-1">Acct #</div>
          <div className="col-span-4">Account Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Normal Balance</div>
          <div className="col-span-2 text-right">Balance</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {/* Groups */}
        {filteredAccounts.map((group) => (
          <div key={group.id}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full grid grid-cols-12 gap-2 items-center px-4 py-3 bg-dark-800/40 border-b border-dark-800/50 hover:bg-dark-800/60 transition-colors"
            >
              <div className="col-span-1 text-sm font-mono text-dark-300">
                {group.accountNumber}
              </div>
              <div className="col-span-4 flex items-center gap-2 text-sm font-semibold text-dark-100">
                {expandedGroups.has(group.id) ? (
                  <ChevronDown className="w-4 h-4 text-dark-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-dark-400" />
                )}
                {group.name}
                <span className="text-xs text-dark-500 font-normal">
                  ({group.children?.length ?? 0})
                </span>
              </div>
              <div className="col-span-2">
                <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', typeColors[group.type])}>
                  {typeLabels[group.type]}
                </span>
              </div>
              <div className="col-span-2" />
              <div className="col-span-2" />
              <div className="col-span-1" />
            </button>

            {/* Child accounts */}
            {expandedGroups.has(group.id) &&
              group.children?.map((acct) => (
                <div
                  key={acct.id}
                  className="grid grid-cols-12 gap-2 items-center px-4 py-2.5 border-b border-dark-800/30 hover:bg-dark-800/20 transition-colors"
                >
                  <div className="col-span-1 text-sm font-mono text-dark-400 pl-4">
                    {acct.accountNumber}
                  </div>
                  <div className="col-span-4 text-sm text-dark-200 pl-6">
                    {acct.name}
                  </div>
                  <div className="col-span-2">
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', typeColors[acct.type])}>
                      {typeLabels[acct.type]}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-dark-400 capitalize">
                    {acct.normalBalance}
                  </div>
                  <div className={cn(
                    'col-span-2 text-right text-sm font-mono',
                    acct.balance !== undefined && acct.balance < 0 ? 'text-red-400' : 'text-dark-200'
                  )}>
                    {acct.balance !== undefined ? formatCurrency(Math.abs(acct.balance)) : '--'}
                    {acct.balance !== undefined && acct.balance < 0 && (
                      <span className="text-red-400 ml-0.5">CR</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {acct.isActive ? (
                      <CircleDot className="w-4 h-4 text-green-400" />
                    ) : (
                      <CircleOff className="w-4 h-4 text-dark-600" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}

        {filteredAccounts.length === 0 && (
          <div className="py-12 text-center text-sm text-dark-500">
            No accounts match your search criteria.
          </div>
        )}
      </div>
    </div>
  )
}
