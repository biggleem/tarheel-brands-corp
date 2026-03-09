'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/utils/formatters'
import { getDocuments, getDocumentTypes } from '@/lib/supabase/queries'
import type { Document, DocumentType, StaffProfile } from '@/lib/types'
import {
  FileText,
  Upload,
  Search,
  ChevronDown,
  Eye,
  Download,
  MoreHorizontal,
  AlertTriangle,
  X,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────

type DocumentRow = Document & {
  document_type: DocumentType
  staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name'> | null
}

// ── Helpers ───────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  archived: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
  expired: 'bg-red-500/10 text-red-400 border border-red-500/20',
  pending_review: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
}

const docCategoryColor: Record<string, string> = {
  tax: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  identification: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  contract: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  certification: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  policy: 'bg-brand-600/10 text-brand-400 border border-brand-600/20',
  review: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  onboarding: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  benefits: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  compliance: 'bg-red-500/10 text-red-400 border border-red-500/20',
  other: 'bg-dark-600/40 text-dark-300 border border-dark-600/40',
}

function isExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diff = expiry.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  return days > 0 && days <= 30
}

function isExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getEmployeeName(staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name'> | null): string | null {
  if (!staff) return null
  return `${staff.first_name} ${staff.last_name}`
}

// ── Loading Skeleton ──────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-dark-700/50">
              <th>Document Name</th><th>Type</th><th className="hidden lg:table-cell">Employee</th><th className="hidden md:table-cell">Uploaded</th><th className="hidden lg:table-cell">Expiry</th><th>Status</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-dark-700 animate-pulse" /><div className="space-y-1.5"><div className="h-3.5 w-40 bg-dark-700 rounded animate-pulse" /><div className="h-3 w-16 bg-dark-800 rounded animate-pulse" /></div></div></td>
                <td><div className="h-5 w-20 bg-dark-700 rounded-full animate-pulse" /></td>
                <td className="hidden lg:table-cell"><div className="h-3.5 w-24 bg-dark-700 rounded animate-pulse" /></td>
                <td className="hidden md:table-cell"><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
                <td className="hidden lg:table-cell"><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
                <td><div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" /></td>
                <td><div className="h-4 w-20 bg-dark-700 rounded animate-pulse ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page Component ────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showExpiryAlert, setShowExpiryAlert] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [docs, types] = await Promise.all([
          getDocuments(),
          getDocumentTypes(),
        ])
        if (!cancelled) {
          setDocuments(docs as DocumentRow[])
          setDocumentTypes(types)
        }
      } catch (err) {
        console.error('Failed to fetch documents:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const expiringDocs = useMemo(() => {
    return documents.filter((d) => isExpiringSoon(d.expires_at))
  }, [documents])

  const allEmployees = useMemo(() => {
    const names = new Set<string>()
    for (const doc of documents) {
      const name = getEmployeeName(doc.staff)
      if (name) names.add(name)
    }
    return Array.from(names).sort()
  }, [documents])

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const employeeName = getEmployeeName(d.staff)
      const matchesSearch =
        search === '' ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.file_name.toLowerCase().includes(search.toLowerCase()) ||
        (employeeName ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === 'all' || d.document_type?.category === filterType || d.document_type?.name === filterType
      const matchesEmployee = filterEmployee === 'all' || employeeName === filterEmployee
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus
      return matchesSearch && matchesType && matchesEmployee && matchesStatus
    })
  }, [documents, search, filterType, filterEmployee, filterStatus])

  const uniqueCategories = useMemo(() => {
    return [...new Set(documentTypes.map((dt) => dt.category))].sort()
  }, [documentTypes])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Documents"
        description="Manage employee documents, certifications, and company policies"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        }
      />

      {/* Expiry alert */}
      {!loading && showExpiryAlert && expiringDocs.length > 0 && (
        <div className="glass-card p-4 mb-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-400">Documents Expiring Soon</p>
              <p className="text-xs text-dark-400 mt-1">
                {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} will expire within the next 30 days:
              </p>
              <ul className="mt-2 space-y-1">
                {expiringDocs.map((doc) => (
                  <li key={doc.id} className="text-xs text-dark-300">
                    <span className="font-medium text-dark-200">{doc.title}</span>
                    {' '}&mdash; expires {formatDate(doc.expires_at!)}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowExpiryAlert(false)}
              className="p-1 rounded hover:bg-dark-800 text-dark-500 hover:text-dark-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search by document name or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full md:w-44 pl-4 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600 transition-colors"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="appearance-none w-full md:w-48 pl-4 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600 transition-colors"
            >
              <option value="all">All Employees</option>
              {allEmployees.map((emp) => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none w-full md:w-40 pl-4 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_review">Pending Review</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th>Document Name</th>
                  <th>Type</th>
                  <th className="hidden lg:table-cell">Employee</th>
                  <th className="hidden md:table-cell">Uploaded</th>
                  <th className="hidden lg:table-cell">Expiry</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const expiring = isExpiringSoon(doc.expires_at)
                  const expired = isExpired(doc.expires_at)
                  const employeeName = getEmployeeName(doc.staff)
                  const category = doc.document_type?.category ?? 'other'
                  const effectiveStatus = expired ? 'expired' : doc.status
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-dark-800 shrink-0">
                            <FileText className="w-4 h-4 text-dark-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate max-w-[280px]">{doc.title}</p>
                            <p className="text-xs text-dark-500">{formatFileSize(doc.file_size)}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', docCategoryColor[category] ?? docCategoryColor.other)}>
                          {doc.document_type?.name ?? category}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell text-dark-300">
                        {employeeName ?? <span className="text-dark-600">Company-wide</span>}
                      </td>
                      <td className="hidden md:table-cell text-dark-400 whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="hidden lg:table-cell whitespace-nowrap">
                        {doc.expires_at ? (
                          <span className={cn(
                            'text-sm',
                            expired ? 'text-red-400 font-medium' : expiring ? 'text-yellow-400 font-medium' : 'text-dark-400'
                          )}>
                            {formatDate(doc.expires_at)}
                            {expiring && <AlertTriangle className="w-3 h-3 inline ml-1.5 -mt-0.5" />}
                          </span>
                        ) : (
                          <span className="text-dark-600">--</span>
                        )}
                      </td>
                      <td>
                        <span className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full capitalize',
                          statusColors[effectiveStatus] ?? statusColors.active
                        )}>
                          {effectiveStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors" title="More">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-8 h-8 text-dark-500 mb-3" />
              <p className="text-dark-300 font-medium">No documents found</p>
              <p className="text-dark-500 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
            <p className="text-xs text-dark-500">
              Showing {filtered.length} of {documents.length} documents
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
