'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { JournalSource, JournalStatus } from '@/lib/types'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Copy,
  MoreVertical,
  ChevronDown,
  FileText,
} from 'lucide-react'

// ── Mock data ────────────────────────────────────────────────
interface JournalEntryRow {
  id: string
  date: string
  reference: string
  description: string
  source: JournalSource
  business: string
  debitTotal: number
  creditTotal: number
  status: JournalStatus
  lineCount: number
}

const mockEntries: JournalEntryRow[] = [
  {
    id: 'je-001',
    date: '2026-03-07',
    reference: 'JE-2026-0307-001',
    description: 'Daily sales deposit - Metal Brixx Cafe downtown',
    source: 'toast',
    business: 'Metal Brixx Cafe',
    debitTotal: 3245.80,
    creditTotal: 3245.80,
    status: 'posted',
    lineCount: 4,
  },
  {
    id: 'je-002',
    date: '2026-03-06',
    reference: 'JE-2026-0306-001',
    description: 'Duke Energy - March electric bill payment',
    source: 'plaid',
    business: 'Metal Brixx Cafe',
    debitTotal: 847.50,
    creditTotal: 847.50,
    status: 'posted',
    lineCount: 2,
  },
  {
    id: 'je-003',
    date: '2026-03-05',
    reference: 'JE-2026-0305-001',
    description: 'Biweekly payroll - all locations',
    source: 'manual',
    business: 'All - Consolidated',
    debitTotal: 12480.00,
    creditTotal: 12480.00,
    status: 'posted',
    lineCount: 8,
  },
  {
    id: 'je-004',
    date: '2026-03-04',
    reference: 'JE-2026-0304-001',
    description: 'Monthly rent payment - downtown location',
    source: 'recurring',
    business: 'Koshu Sake Bar',
    debitTotal: 4500.00,
    creditTotal: 4500.00,
    status: 'posted',
    lineCount: 2,
  },
  {
    id: 'je-005',
    date: '2026-03-03',
    reference: 'JE-2026-0303-001',
    description: 'Office supplies purchase - Staples',
    source: 'plaid',
    business: 'South Armz Global Inc',
    debitTotal: 234.67,
    creditTotal: 234.67,
    status: 'draft',
    lineCount: 2,
  },
  {
    id: 'je-006',
    date: '2026-03-02',
    reference: 'JE-2026-0302-001',
    description: 'Catering deposit received - Johnson wedding',
    source: 'manual',
    business: 'Carolina Cannabar',
    debitTotal: 2500.00,
    creditTotal: 2500.00,
    status: 'posted',
    lineCount: 2,
  },
  {
    id: 'je-007',
    date: '2026-03-01',
    reference: 'JE-2026-0301-001',
    description: 'Monthly depreciation entry',
    source: 'recurring',
    business: 'All - Consolidated',
    debitTotal: 2375.00,
    creditTotal: 2375.00,
    status: 'posted',
    lineCount: 4,
  },
  {
    id: 'je-008',
    date: '2026-02-28',
    reference: 'JE-2026-0228-001',
    description: 'Sysco food delivery - weekly order',
    source: 'plaid',
    business: 'Metal Brixx Cafe',
    debitTotal: 1862.40,
    creditTotal: 1862.40,
    status: 'draft',
    lineCount: 3,
  },
]

const sourceLabels: Record<JournalSource, { label: string; classes: string }> = {
  manual: { label: 'Manual', classes: 'bg-dark-700 text-dark-200' },
  plaid: { label: 'Plaid', classes: 'bg-blue-500/15 text-blue-400' },
  toast: { label: 'Toast', classes: 'bg-orange-500/15 text-orange-400' },
  recurring: { label: 'Recurring', classes: 'bg-purple-500/15 text-purple-400' },
  system: { label: 'System', classes: 'bg-dark-600 text-dark-300' },
}

const statusLabels: Record<JournalStatus, { label: string; classes: string }> = {
  posted: { label: 'Posted', classes: 'bg-green-500/15 text-green-400' },
  draft: { label: 'Draft', classes: 'bg-yellow-500/15 text-yellow-400' },
  void: { label: 'Void', classes: 'bg-red-500/15 text-red-400' },
}

export default function JournalEntriesPage() {
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<JournalSource | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<JournalStatus | 'all'>('all')
  const [businessFilter, setBusinessFilter] = useState('all')

  const businesses = Array.from(new Set(mockEntries.map((e) => e.business)))

  const filtered = mockEntries.filter((entry) => {
    if (search && !entry.description.toLowerCase().includes(search.toLowerCase()) && !entry.reference.toLowerCase().includes(search.toLowerCase())) return false
    if (sourceFilter !== 'all' && entry.source !== sourceFilter) return false
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false
    if (businessFilter !== 'all' && entry.business !== businessFilter) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Journal Entries"
        description="View and manage general ledger journal entries"
        actions={
          <Link
            href="/accounting/journal-entries/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </Link>
        }
      />

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as JournalSource | 'all')}
            className="bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual</option>
            <option value="plaid">Plaid</option>
            <option value="toast">Toast</option>
            <option value="recurring">Recurring</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JournalStatus | 'all')}
            className="bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Statuses</option>
            <option value="posted">Posted</option>
            <option value="draft">Draft</option>
            <option value="void">Void</option>
          </select>

          {/* Business filter */}
          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-lg text-sm text-dark-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Businesses</option>
            {businesses.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Entries Table ────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-dark-800/50">
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Business</th>
                <th>Source</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="cursor-pointer">
                  <td className="text-dark-300 whitespace-nowrap">{formatDate(entry.date)}</td>
                  <td className="font-mono text-xs text-dark-400 whitespace-nowrap">{entry.reference}</td>
                  <td className="max-w-[220px] truncate">{entry.description}</td>
                  <td className="text-dark-300 text-xs whitespace-nowrap">{entry.business}</td>
                  <td>
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', sourceLabels[entry.source].classes)}>
                      {sourceLabels[entry.source].label}
                    </span>
                  </td>
                  <td className="text-right font-mono text-dark-200 whitespace-nowrap">
                    {formatCurrency(entry.debitTotal)}
                  </td>
                  <td className="text-right font-mono text-dark-200 whitespace-nowrap">
                    {formatCurrency(entry.creditTotal)}
                  </td>
                  <td>
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', statusLabels[entry.status].classes)}>
                      {statusLabels[entry.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 hover:bg-dark-800 rounded-lg transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5 text-dark-400" />
                      </button>
                      <button className="p-1.5 hover:bg-dark-800 rounded-lg transition-colors" title="Duplicate">
                        <Copy className="w-3.5 h-3.5 text-dark-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="w-8 h-8 text-dark-600 mx-auto mb-2" />
            <p className="text-sm text-dark-500">No journal entries match your filters.</p>
          </div>
        )}
      </div>

      {/* ── Summary ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-dark-500 px-1">
        <span>Showing {filtered.length} of {mockEntries.length} entries</span>
        <span>
          Total Debits: <span className="text-dark-200 font-mono">{formatCurrency(filtered.reduce((s, e) => s + e.debitTotal, 0))}</span>
          {' | '}
          Total Credits: <span className="text-dark-200 font-mono">{formatCurrency(filtered.reduce((s, e) => s + e.creditTotal, 0))}</span>
        </span>
      </div>
    </div>
  )
}
