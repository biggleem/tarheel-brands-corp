'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import {
  FileText,
  Upload,
  ArrowLeft,
  Calendar,
  Download,
  FolderOpen,
  ChevronRight,
} from 'lucide-react'

type TaxYear = {
  year: number
  status: 'filed' | 'pending' | 'not_started'
  documents: TaxDocument[]
}

type TaxDocument = {
  id: string
  name: string
  type: 'return' | 'w2' | '1099' | 'schedule' | 'receipt' | 'other'
  uploadedAt: string | null
}

// Placeholder years — will be populated when user uploads docs
const taxYears: TaxYear[] = [
  {
    year: 2025,
    status: 'pending',
    documents: [],
  },
  {
    year: 2024,
    status: 'not_started',
    documents: [],
  },
  {
    year: 2023,
    status: 'not_started',
    documents: [],
  },
  {
    year: 2022,
    status: 'not_started',
    documents: [],
  },
]

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

export default function TaxPage() {
  const [expandedYear, setExpandedYear] = useState<number | null>(2025)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tax Documents"
        description="Upload and organize personal tax filings by year"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/personal" className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg transition-colors border border-dark-700">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Upload Documents
            </button>
          </div>
        }
      />

      {/* Tax Year Accordion */}
      <div className="space-y-3">
        {taxYears.map((ty) => {
          const isExpanded = expandedYear === ty.year
          const cfg = statusConfig[ty.status]
          return (
            <div key={ty.year} className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedYear(isExpanded ? null : ty.year)}
                className="w-full flex items-center justify-between p-5 hover:bg-dark-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-dark-800">
                    <Calendar className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-dark-100">Tax Year {ty.year}</h3>
                    <p className="text-xs text-dark-400">{ty.documents.length} documents uploaded</p>
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
                  {ty.documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FolderOpen className="w-10 h-10 text-dark-600 mb-3" />
                      <p className="text-dark-300 font-medium">No documents yet</p>
                      <p className="text-dark-500 text-sm mt-1 mb-4">Upload tax returns, W-2s, 1099s, and other documents for {ty.year}</p>
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload for {ty.year}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4">
                      {ty.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 hover:bg-dark-800/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-dark-400" />
                            <div>
                              <p className="text-sm font-medium text-dark-200">{doc.name}</p>
                              <p className="text-xs text-dark-500">{docTypeLabels[doc.type]} &middot; {doc.uploadedAt ? `Uploaded ${doc.uploadedAt}` : 'Not uploaded'}</p>
                            </div>
                          </div>
                          <button className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

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
