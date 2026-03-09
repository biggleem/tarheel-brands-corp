'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters'
import {
  Plus,
  Landmark,
  RefreshCw,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  Clock,
  Tag,
  Building2,
  ExternalLink,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  DollarSign,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'

// ── Mock connected accounts ──────────────────────────────────
interface ConnectedAccount {
  id: string
  bankName: string
  accountType: string
  officialName: string
  mask: string
  currentBalance: number
  availableBalance: number
  lastSynced: string
  status: 'active' | 'error'
  icon: typeof Landmark
}

const connectedAccounts: ConnectedAccount[] = [
  {
    id: 'pa-001',
    bankName: 'Chase',
    accountType: 'Checking',
    officialName: 'Chase Total Business Checking',
    mask: '4829',
    currentBalance: 45230.50,
    availableBalance: 44180.50,
    lastSynced: '2026-03-08T14:30:00',
    status: 'active',
    icon: Landmark,
  },
  {
    id: 'pa-002',
    bankName: 'Chase',
    accountType: 'Savings',
    officialName: 'Chase Business Performance Savings',
    mask: '7712',
    currentBalance: 28400.00,
    availableBalance: 28400.00,
    lastSynced: '2026-03-08T14:30:00',
    status: 'active',
    icon: PiggyBank,
  },
  {
    id: 'pa-003',
    bankName: 'Capital One',
    accountType: 'Credit Card',
    officialName: 'Spark Business Cash',
    mask: '3341',
    currentBalance: -6840.00,
    availableBalance: 18160.00,
    lastSynced: '2026-03-08T12:15:00',
    status: 'active',
    icon: CreditCard,
  },
]

// ── Mock transactions ────────────────────────────────────────
interface PlaidTransaction {
  id: string
  date: string
  merchant: string
  amount: number
  category: string[]
  account: string
  isCategorized: boolean
  assignedBusiness: string
  pending: boolean
}

const mockTransactions: PlaidTransaction[] = [
  {
    id: 'pt-001',
    date: '2026-03-08',
    merchant: 'Sysco Charlotte Distribution',
    amount: -1862.40,
    category: ['Food & Drink', 'Wholesale'],
    account: 'Chase ****4829',
    isCategorized: true,
    assignedBusiness: 'Tarheel Kitchen',
    pending: false,
  },
  {
    id: 'pt-002',
    date: '2026-03-07',
    merchant: 'Duke Energy Carolinas',
    amount: -847.50,
    category: ['Utilities', 'Electric'],
    account: 'Chase ****4829',
    isCategorized: true,
    assignedBusiness: 'Tarheel Kitchen',
    pending: false,
  },
  {
    id: 'pt-003',
    date: '2026-03-07',
    merchant: 'Square Inc - Deposit',
    amount: 3245.80,
    category: ['Transfer', 'Deposit'],
    account: 'Chase ****4829',
    isCategorized: false,
    assignedBusiness: '',
    pending: false,
  },
  {
    id: 'pt-004',
    date: '2026-03-06',
    merchant: 'Staples Office Supply',
    amount: -234.67,
    category: ['Shops', 'Office Supplies'],
    account: 'Spark ****3341',
    isCategorized: false,
    assignedBusiness: '',
    pending: false,
  },
  {
    id: 'pt-005',
    date: '2026-03-06',
    merchant: 'Spectrum Business Internet',
    amount: -189.99,
    category: ['Service', 'Internet'],
    account: 'Chase ****4829',
    isCategorized: true,
    assignedBusiness: 'Tarheel Kitchen',
    pending: false,
  },
  {
    id: 'pt-006',
    date: '2026-03-05',
    merchant: 'US Foods Charlotte',
    amount: -943.20,
    category: ['Food & Drink', 'Wholesale'],
    account: 'Chase ****4829',
    isCategorized: false,
    assignedBusiness: '',
    pending: true,
  },
  {
    id: 'pt-007',
    date: '2026-03-05',
    merchant: 'Meta Business Suite',
    amount: -350.00,
    category: ['Service', 'Advertising'],
    account: 'Spark ****3341',
    isCategorized: true,
    assignedBusiness: 'Tarheel Brands Corp',
    pending: false,
  },
  {
    id: 'pt-008',
    date: '2026-03-04',
    merchant: 'Amazon Business',
    amount: -127.84,
    category: ['Shops', 'General'],
    account: 'Spark ****3341',
    isCategorized: false,
    assignedBusiness: '',
    pending: false,
  },
]

const businesses = [
  'Tarheel Brands Corp',
  'Tarheel Kitchen',
  'Tarheel Fitness',
  'Tarheel Media',
]

export default function PlaidPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [showBalances, setShowBalances] = useState(true)

  const assignBusiness = (txnId: string, business: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId ? { ...t, assignedBusiness: business } : t
      )
    )
  }

  const categorizeTxn = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId ? { ...t, isCategorized: true } : t
      )
    )
  }

  const totalCash = connectedAccounts
    .filter((a) => a.accountType !== 'Credit Card')
    .reduce((s, a) => s + a.currentBalance, 0)
  const totalCredit = Math.abs(
    connectedAccounts
      .filter((a) => a.accountType === 'Credit Card')
      .reduce((s, a) => s + a.currentBalance, 0)
  )
  const uncategorizedCount = transactions.filter((t) => !t.isCategorized).length

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Connected Bank Accounts"
        description="Manage Plaid-connected bank accounts and categorize transactions"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/bills"
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bills
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Connect New Account
            </button>
          </div>
        }
      />

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cash Balance"
          value={formatCurrency(totalCash)}
          icon={DollarSign}
          iconColor="text-green-400"
          change={3.8}
        />
        <StatCard
          title="Credit Balance"
          value={formatCurrency(totalCredit)}
          icon={CreditCard}
          iconColor="text-red-400"
        />
        <StatCard
          title="Connected Accounts"
          value={connectedAccounts.length.toString()}
          icon={Landmark}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Uncategorized"
          value={uncategorizedCount.toString()}
          icon={Tag}
          iconColor="text-yellow-400"
          subtitle="transactions need review"
        />
      </div>

      {/* ── Connected Accounts Grid ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-dark-100">Linked Accounts</h2>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors"
        >
          {showBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showBalances ? 'Hide Balances' : 'Show Balances'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {connectedAccounts.map((account) => {
          const Icon = account.icon
          const isCredit = account.currentBalance < 0
          return (
            <div key={account.id} className="glass-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2.5 rounded-xl',
                    account.accountType === 'Credit Card'
                      ? 'bg-orange-500/15 text-orange-400'
                      : account.accountType === 'Savings'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-blue-500/15 text-blue-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-dark-100">{account.bankName}</h3>
                    <p className="text-xs text-dark-400">{account.accountType} ****{account.mask}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">Connected</span>
                </div>
              </div>

              {/* Official name */}
              <p className="text-xs text-dark-500">{account.officialName}</p>

              {/* Balances */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-400">Current Balance</span>
                  <span className={cn(
                    'text-lg font-display font-bold',
                    isCredit ? 'text-red-400' : 'text-dark-50'
                  )}>
                    {showBalances
                      ? <>{isCredit && '-'}{formatCurrency(Math.abs(account.currentBalance))}</>
                      : '****'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-400">
                    {account.accountType === 'Credit Card' ? 'Available Credit' : 'Available Balance'}
                  </span>
                  <span className="text-sm font-mono text-dark-300">
                    {showBalances ? formatCurrency(account.availableBalance) : '****'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-dark-800/50">
                <span className="text-[10px] text-dark-500">
                  Synced: {formatDateTime(account.lastSynced)}
                </span>
                <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  <RefreshCw className="w-3 h-3" />
                  Sync Now
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Aggregate Summary ────────────────────────────────── */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-dark-500" />
            <span className="text-xs text-dark-400">Total Cash:</span>
            <span className="text-sm font-mono font-semibold text-dark-100">
              {formatCurrency(totalCash)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-dark-500" />
            <span className="text-xs text-dark-400">Credit Owed:</span>
            <span className="text-sm font-mono font-semibold text-red-400">
              {formatCurrency(totalCredit)}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-dark-500">
              {uncategorizedCount} uncategorized transactions
            </span>
          </div>
        </div>
      </div>

      {/* ── Transactions ─────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-dark-800/50">
          <h2 className="text-sm font-semibold text-dark-100">Recent Transactions</h2>
          <span className="text-xs text-dark-500">{transactions.length} transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-dark-800/50">
                <th>Date</th>
                <th>Merchant</th>
                <th className="text-right">Amount</th>
                <th>Account</th>
                <th>Categories</th>
                <th>Business</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="text-dark-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {formatDate(txn.date)}
                      {txn.pending && (
                        <span className="text-[10px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded-full font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="font-medium text-dark-100 whitespace-nowrap">{txn.merchant}</td>
                  <td className={cn(
                    'text-right font-mono whitespace-nowrap font-medium',
                    txn.amount < 0 ? 'text-red-400' : 'text-green-400'
                  )}>
                    <span className="inline-flex items-center gap-1">
                      {txn.amount < 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3" />
                      )}
                      {formatCurrency(Math.abs(txn.amount))}
                    </span>
                  </td>
                  <td className="text-xs text-dark-400 whitespace-nowrap">{txn.account}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {txn.category.map((cat, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-dark-800 text-dark-300"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <select
                      value={txn.assignedBusiness}
                      onChange={(e) => assignBusiness(txn.id, e.target.value)}
                      className={cn(
                        'text-xs px-2 py-1 bg-dark-900 border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600',
                        txn.assignedBusiness ? 'border-dark-700 text-dark-200' : 'border-yellow-600/30 text-yellow-400'
                      )}
                    >
                      <option value="">Assign business...</option>
                      {businesses.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    {txn.isCategorized ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    ) : (
                      <button
                        onClick={() => categorizeTxn(txn.id)}
                        className="text-[11px] font-medium px-2.5 py-1 bg-brand-600/15 text-brand-400 hover:bg-brand-600/25 rounded-lg transition-colors"
                      >
                        Categorize
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
