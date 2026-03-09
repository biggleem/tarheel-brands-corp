'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency } from '@/lib/utils/formatters'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

// ── Mock COA for selectors ──────────────────────────────────
const coaAccounts = [
  { id: 'a-1000', number: '1000', name: 'Cash - Operating', type: 'asset' },
  { id: 'a-1010', number: '1010', name: 'Cash - Payroll', type: 'asset' },
  { id: 'a-1100', number: '1100', name: 'Accounts Receivable', type: 'asset' },
  { id: 'a-1200', number: '1200', name: 'Inventory - Food & Beverage', type: 'asset' },
  { id: 'a-1210', number: '1210', name: 'Inventory - Supplies', type: 'asset' },
  { id: 'a-1300', number: '1300', name: 'Prepaid Insurance', type: 'asset' },
  { id: 'a-1500', number: '1500', name: 'Equipment', type: 'asset' },
  { id: 'l-2000', number: '2000', name: 'Accounts Payable', type: 'liability' },
  { id: 'l-2050', number: '2050', name: 'Credit Card Payable', type: 'liability' },
  { id: 'l-2100', number: '2100', name: 'Accrued Wages', type: 'liability' },
  { id: 'l-2200', number: '2200', name: 'Sales Tax Payable', type: 'liability' },
  { id: 'e-3000', number: '3000', name: "Owner's Equity", type: 'equity' },
  { id: 'e-3100', number: '3100', name: 'Retained Earnings', type: 'equity' },
  { id: 'r-4000', number: '4000', name: 'Food Sales', type: 'revenue' },
  { id: 'r-4100', number: '4100', name: 'Beverage Sales', type: 'revenue' },
  { id: 'r-4200', number: '4200', name: 'Catering Revenue', type: 'revenue' },
  { id: 'c-5000', number: '5000', name: 'Food Cost', type: 'cogs' },
  { id: 'c-5100', number: '5100', name: 'Beverage Cost', type: 'cogs' },
  { id: 'x-6000', number: '6000', name: 'Rent Expense', type: 'expense' },
  { id: 'x-6100', number: '6100', name: 'Utilities', type: 'expense' },
  { id: 'x-6200', number: '6200', name: 'Payroll Expense', type: 'expense' },
  { id: 'x-6300', number: '6300', name: 'Marketing & Advertising', type: 'expense' },
  { id: 'x-6400', number: '6400', name: 'Insurance Expense', type: 'expense' },
  { id: 'x-6500', number: '6500', name: 'Repairs & Maintenance', type: 'expense' },
  { id: 'x-6600', number: '6600', name: 'Office Supplies', type: 'expense' },
  { id: 'x-6700', number: '6700', name: 'Professional Fees', type: 'expense' },
]

const businesses = [
  'Tarheel Brands Corp',
  'Tarheel Kitchen',
  'Tarheel Fitness',
  'Tarheel Media',
]

interface LineItem {
  id: string
  accountId: string
  description: string
  debit: string
  credit: string
}

function createEmptyLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    accountId: '',
    description: '',
    debit: '',
    credit: '',
  }
}

export default function NewJournalEntryPage() {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [business, setBusiness] = useState('')
  const [reference, setReference] = useState('')
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<LineItem[]>([createEmptyLine(), createEmptyLine()])

  const updateLine = (id: string, field: keyof LineItem, value: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        // If debit is entered, clear credit and vice versa
        if (field === 'debit' && value) updated.credit = ''
        if (field === 'credit' && value) updated.debit = ''
        return updated
      })
    )
  }

  const removeLine = (id: string) => {
    if (lines.length <= 2) return
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const addLine = () => {
    setLines((prev) => [...prev, createEmptyLine()])
  }

  const totalDebits = useMemo(
    () => lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0),
    [lines]
  )
  const totalCredits = useMemo(
    () => lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0),
    [lines]
  )
  const difference = Math.abs(totalDebits - totalCredits)
  const isBalanced = totalDebits > 0 && totalCredits > 0 && difference < 0.01

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="New Journal Entry"
        description="Create a new general ledger journal entry"
        actions={
          <Link
            href="/accounting/journal-entries"
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      {/* ── Header Fields ────────────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1.5">Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>

          {/* Business */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1.5">Business</label>
            <select
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600"
            >
              <option value="">Select business...</option>
              {businesses.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1.5">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="JE-2026-0308-001"
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Entry description..."
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>
        </div>
      </div>

      {/* ── Line Items ───────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-800/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-dark-100">Line Items</h2>
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-dark-200 text-xs font-medium rounded-lg transition-colors border border-dark-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Line
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800/50">
                <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 w-[300px]">
                  Account
                </th>
                <th className="text-left text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3">
                  Description
                </th>
                <th className="text-right text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 w-[150px]">
                  Debit
                </th>
                <th className="text-right text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 w-[150px]">
                  Credit
                </th>
                <th className="text-center text-xs font-medium text-dark-400 uppercase tracking-wider px-4 py-3 w-[50px]">

                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={line.id} className="border-b border-dark-800/30">
                  {/* Account selector */}
                  <td className="px-4 py-2">
                    <select
                      value={line.accountId}
                      onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    >
                      <option value="">Select account...</option>
                      {coaAccounts.map((acct) => (
                        <option key={acct.id} value={acct.id}>
                          {acct.number} - {acct.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Line description */}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                      placeholder="Line description..."
                      className="w-full px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                  </td>

                  {/* Debit */}
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit}
                      onChange={(e) => updateLine(line.id, 'debit', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 text-right font-mono placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                  </td>

                  {/* Credit */}
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit}
                      onChange={(e) => updateLine(line.id, 'credit', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 text-right font-mono placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                  </td>

                  {/* Remove */}
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length <= 2}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        lines.length <= 2
                          ? 'text-dark-700 cursor-not-allowed'
                          : 'text-dark-500 hover:text-red-400 hover:bg-dark-800'
                      )}
                      title="Remove line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Totals ─────────────────────────────────────────── */}
        <div className="px-4 py-4 border-t border-dark-800/50 bg-dark-900/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Balance indicator */}
            <div className="flex items-center gap-2">
              {totalDebits === 0 && totalCredits === 0 ? (
                <span className="text-xs text-dark-500">Enter debit and credit amounts</span>
              ) : isBalanced ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Entry is balanced</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    Out of balance by {formatCurrency(difference)}
                  </span>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-dark-500 mb-0.5">Total Debits</p>
                <p className="text-sm font-mono font-medium text-dark-100">
                  {formatCurrency(totalDebits)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-500 mb-0.5">Total Credits</p>
                <p className="text-sm font-mono font-medium text-dark-100">
                  {formatCurrency(totalCredits)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-500 mb-0.5">Difference</p>
                <p className={cn(
                  'text-sm font-mono font-medium',
                  difference < 0.01 && totalDebits > 0 ? 'text-green-400' : difference > 0 ? 'text-red-400' : 'text-dark-400'
                )}>
                  {formatCurrency(difference)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/accounting/journal-entries"
          className="px-4 py-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          Cancel
        </Link>
        <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
          <Save className="w-4 h-4" />
          Save as Draft
        </button>
        <button
          disabled={!isBalanced}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isBalanced
              ? 'bg-brand-600 hover:bg-brand-700 text-white'
              : 'bg-dark-800 text-dark-600 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
          Post Entry
        </button>
      </div>
    </div>
  )
}
