'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { getTaxDocuments } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Upload,
  ArrowLeft,
  Calendar,
  Download,
  FolderOpen,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

type TaxDoc = {
  id: string
  tax_year: number
  doc_type: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string | null
  status: string
  created_at: string
}

const TAX_YEARS = [2025, 2024, 2023, 2022]

const statusConfig = {
  filed: { label: 'Filed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  pending: { label: 'In Progress', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  not_started: { label: 'Not Started', color: 'bg-dark-600/40 text-dark-400 border-dark-600/40' },
}

const docTypeLabels: Record<string, string> = {
  return: 'Tax Return',
  w2: 'W-2',
  '1099': '1099',
  schedule: 'Schedule',
  receipt: 'Receipt',
  other: 'Other',
}

function detectDocType(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.includes('1040') || lower.includes('return')) return 'return'
  if (lower.includes('w2') || lower.includes('w-2')) return 'w2'
  if (lower.includes('1099')) return '1099'
  if (lower.includes('schedule')) return 'schedule'
  if (lower.includes('receipt')) return 'receipt'
  return 'other'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function yearStatus(docs: TaxDoc[]): 'filed' | 'pending' | 'not_started' {
  if (docs.length === 0) return 'not_started'
  if (docs.some((d) => d.doc_type === 'return')) return 'filed'
  return 'pending'
}

export default function TaxPage() {
  const [expandedYear, setExpandedYear] = useState<number | null>(2025)
  const [documents, setDocuments] = useState<TaxDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadYear, setUploadYear] = useState<number>(2025)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function fetchDocuments() {
    setLoading(true)
    try {
      const docs = await getTaxDocuments()
      setDocuments(docs)
    } catch {
      console.error('Failed to fetch tax documents')
    } finally {
      setLoading(false)
    }
  }

  function triggerUpload(year: number) {
    setUploadYear(year)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected
    e.target.value = ''

    setUploading(true)
    try {
      const supabase = createClient()

      // Upload to storage
      const { data, error: uploadError } = await supabase.storage
        .from('tax-documents')
        .upload(`${uploadYear}/${file.name}`, file)

      if (uploadError || !data) {
        throw new Error(uploadError?.message ?? 'Upload failed')
      }

      // Save metadata via RPC
      const { error: rpcError } = await supabase.rpc('insert_corp_tax_document', {
        p_tax_year: uploadYear,
        p_doc_type: detectDocType(file.name),
        p_file_name: file.name,
        p_file_path: data.path,
        p_file_size: file.size,
        p_mime_type: file.type,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      setToast({ type: 'success', message: `Uploaded ${file.name}` })
      // Expand the year we just uploaded to
      setExpandedYear(uploadYear)
      await fetchDocuments()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setToast({ type: 'error', message: msg })
    } finally {
      setUploading(false)
    }
  }

  // Group documents by year
  const docsByYear: Record<number, TaxDoc[]> = {}
  for (const year of TAX_YEARS) {
    docsByYear[year] = documents.filter((d) => d.tax_year === year)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.csv,.jpg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border animate-fade-in',
            toast.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Tax Documents"
        description="Upload and organize personal tax filings by year"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/personal" className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            {/* Year selector for header upload */}
            <select
              value={uploadYear}
              onChange={(e) => setUploadYear(Number(e.target.value))}
              className="px-3 py-2 bg-dark-800 text-dark-200 text-sm rounded-lg border border-dark-700 focus:outline-none focus:border-brand-500"
            >
              {TAX_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => triggerUpload(uploadYear)}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </div>
        }
      />

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      )}

      {/* Tax Year Accordion */}
      {!loading && (
        <div className="space-y-3">
          {TAX_YEARS.map((year) => {
            const yearDocs = docsByYear[year]
            const isExpanded = expandedYear === year
            const status = yearStatus(yearDocs)
            const cfg = statusConfig[status]
            return (
              <div key={year} className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedYear(isExpanded ? null : year)}
                  className="w-full flex items-center justify-between p-5 hover:bg-dark-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-dark-800">
                      <Calendar className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-dark-100">Tax Year {year}</h3>
                      <p className="text-xs text-dark-400">{yearDocs.length} document{yearDocs.length !== 1 ? 's' : ''} uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', cfg.color)}>
                      {cfg.label}
                    </span>
                    <ChevronRight className={cn('w-5 h-5 text-dark-500 transition-transform', isExpanded && 'rotate-90')} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-dark-800/50">
                    {yearDocs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FolderOpen className="w-10 h-10 text-dark-600 mb-3" />
                        <p className="text-dark-300 font-medium">No documents yet</p>
                        <p className="text-dark-500 text-sm mt-1 mb-4">Upload tax returns, W-2s, 1099s, and other documents for {year}</p>
                        <button
                          onClick={() => triggerUpload(year)}
                          disabled={uploading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload for {year}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-4">
                        {yearDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 hover:bg-dark-800/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-dark-400" />
                              <div>
                                <p className="text-sm font-medium text-dark-200">{doc.file_name}</p>
                                <p className="text-xs text-dark-500">
                                  {docTypeLabels[doc.doc_type] ?? doc.doc_type} &middot; {formatFileSize(doc.file_size)} &middot; {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {/* Upload more button inside expanded year */}
                        <button
                          onClick={() => triggerUpload(year)}
                          disabled={uploading}
                          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-dark-700 hover:border-brand-500/50 text-dark-400 hover:text-dark-200 text-sm rounded-lg transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload more for {year}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info Card */}
      <div className="glass-card p-5">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-brand-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-dark-200 mb-1">Organize Your Tax Documents</h4>
            <p className="text-xs text-dark-400 leading-relaxed">
              Upload your tax returns (1040), W-2s, 1099s, schedules, and receipts organized by year.
              Supported formats: PDF, XLSX, CSV, JPG, PNG. Documents are stored securely and can be
              downloaded anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
