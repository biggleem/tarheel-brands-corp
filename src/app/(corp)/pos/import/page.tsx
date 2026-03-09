'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
type ToastImportType = 'sales' | 'customers' | 'items' | 'payments'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowRight,
  X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────

interface ColumnMapping {
  csvColumn: string
  systemField: string
}

interface MockRow {
  [key: string]: string
}

// ── Import Type Cards ──────────────────────────────────────

const importTypes: { value: ToastImportType; label: string; description: string; icon: typeof ShoppingCart; color: string }[] = [
  { value: 'sales', label: 'Sales', description: 'Order transactions, line items, totals', icon: ShoppingCart, color: 'text-green-400' },
  { value: 'customers', label: 'Customers', description: 'Customer contacts and visit history', icon: Users, color: 'text-blue-400' },
  { value: 'items', label: 'Items', description: 'Menu items, categories, pricing', icon: Package, color: 'text-purple-400' },
  { value: 'payments', label: 'Payments', description: 'Payment methods, tips, refunds', icon: CreditCard, color: 'text-gold-400' },
]

// ── Mock System Fields ─────────────────────────────────────

const systemFieldOptions: Record<ToastImportType, string[]> = {
  sales: ['Order ID', 'Order Date', 'Order Type', 'Item Name', 'Category', 'Quantity', 'Gross Amount', 'Discount', 'Net Amount', 'Tax', 'Tip', 'Payment Type', 'Server', 'Customer Email', 'Customer Phone', '-- Skip --'],
  customers: ['Email', 'Phone', 'First Name', 'Last Name', 'First Visit', 'Last Visit', 'Total Visits', 'Total Spent', 'Marketing Opt-in', '-- Skip --'],
  items: ['Item Name', 'Category', 'Description', 'Price', 'Cost', 'PLU Code', 'Tax Rate', 'Is Active', '-- Skip --'],
  payments: ['Order ID', 'Payment Type', 'Amount', 'Tip', 'Refund Amount', 'Transaction Date', 'Card Last 4', '-- Skip --'],
}

// ── Mock CSV Data ──────────────────────────────────────────

const mockCSVColumns = ['Order #', 'Date', 'Type', 'Item', 'Qty', 'Amount', 'Tax', 'Tip', 'Payment', 'Server Name']

const mockCSVRows: MockRow[] = [
  { 'Order #': 'TOS-8842', Date: '2026-03-08', Type: 'Dine In', Item: 'Brisket Plate', Qty: '1', Amount: '18.99', Tax: '1.52', Tip: '3.80', Payment: 'Visa', 'Server Name': 'Marcus J.' },
  { 'Order #': 'TOS-8842', Date: '2026-03-08', Type: 'Dine In', Item: 'Mac & Cheese', Qty: '1', Amount: '6.99', Tax: '0.56', Tip: '0.00', Payment: 'Visa', 'Server Name': 'Marcus J.' },
  { 'Order #': 'TOS-8841', Date: '2026-03-08', Type: 'Takeout', Item: 'Double Burger', Qty: '2', Amount: '24.99', Tax: '2.00', Tip: '0.00', Payment: 'Cash', 'Server Name': 'DeShawn W.' },
  { 'Order #': 'TOS-8840', Date: '2026-03-08', Type: 'Dine In', Item: 'Rib Combo', Qty: '1', Amount: '26.99', Tax: '2.16', Tip: '5.40', Payment: 'Amex', 'Server Name': 'Aaliyah R.' },
  { 'Order #': 'TOS-8839', Date: '2026-03-07', Type: 'Online', Item: 'Smoothie Bowl', Qty: '3', Amount: '28.50', Tax: '2.28', Tip: '4.00', Payment: 'Visa', 'Server Name': 'Tyler M.' },
]

const defaultMappings: ColumnMapping[] = [
  { csvColumn: 'Order #', systemField: 'Order ID' },
  { csvColumn: 'Date', systemField: 'Order Date' },
  { csvColumn: 'Type', systemField: 'Order Type' },
  { csvColumn: 'Item', systemField: 'Item Name' },
  { csvColumn: 'Qty', systemField: 'Quantity' },
  { csvColumn: 'Amount', systemField: 'Net Amount' },
  { csvColumn: 'Tax', systemField: 'Tax' },
  { csvColumn: 'Tip', systemField: 'Tip' },
  { csvColumn: 'Payment', systemField: 'Payment Type' },
  { csvColumn: 'Server Name', systemField: 'Server' },
]

// ── Page Component ─────────────────────────────────────────

export default function POSImportPage() {
  const [step, setStep] = useState(1)
  const [importType, setImportType] = useState<ToastImportType>('sales')
  const [fileName, setFileName] = useState<string | null>(null)
  const [mappings, setMappings] = useState<ColumnMapping[]>(defaultMappings)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)

  const steps = [
    { number: 1, label: 'Upload' },
    { number: 2, label: 'Map Columns' },
    { number: 3, label: 'Review & Import' },
  ]

  function handleFileSelect() {
    setFileName('toast_sales_export_mar2026.csv')
  }

  function handleMappingChange(csvColumn: string, systemField: string) {
    setMappings((prev) =>
      prev.map((m) => (m.csvColumn === csvColumn ? { ...m, systemField } : m))
    )
  }

  function handleImport() {
    setIsImporting(true)
    setImportProgress(0)
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 400)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Import Toast Data"
        description="Upload CSV exports from your Toast POS system"
        actions={
          <Link
            href="/pos"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to POS
          </Link>
        }
      />

      {/* ── Step Wizard ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    step > s.number
                      ? 'bg-green-500/20 text-green-400'
                      : step === s.number
                        ? 'bg-brand-600 text-white'
                        : 'bg-dark-800 text-dark-500'
                  )}
                >
                  {step > s.number ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium hidden sm:inline',
                    step >= s.number ? 'text-dark-100' : 'text-dark-500'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={cn('h-px', step > s.number ? 'bg-green-500/40' : 'bg-dark-700')} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Import Type Selector */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-3">Select Import Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {importTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setImportType(type.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left',
                      importType === type.value
                        ? 'bg-brand-600/10 border-brand-600/40 ring-1 ring-brand-600/20'
                        : 'bg-dark-800/50 border-dark-700/30 hover:border-dark-600/50'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg bg-dark-900', type.color)}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', importType === type.value ? 'text-brand-400' : 'text-dark-100')}>
                        {type.label}
                      </p>
                      <p className="text-xs text-dark-400 mt-0.5">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-3">Upload CSV File</h3>
              {!fileName ? (
                <button
                  onClick={handleFileSelect}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFileSelect() }}
                  className={cn(
                    'w-full flex flex-col items-center justify-center gap-3 p-12 rounded-xl border-2 border-dashed transition-all cursor-pointer',
                    isDragOver
                      ? 'border-brand-600 bg-brand-600/5'
                      : 'border-dark-700/50 hover:border-dark-600 hover:bg-dark-800/30'
                  )}
                >
                  <div className="p-3 rounded-full bg-dark-800">
                    <Upload className="w-8 h-8 text-dark-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-dark-200">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-xs text-dark-500 mt-1">
                      or click to browse &bull; Accepts .csv files
                    </p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">{fileName}</p>
                    <p className="text-xs text-dark-500">1,247 rows detected &bull; 10 columns</p>
                  </div>
                  <button
                    onClick={() => setFileName(null)}
                    className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-dark-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => { if (fileName) setStep(2) }}
                disabled={!fileName}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  fileName
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'bg-dark-800 text-dark-500 cursor-not-allowed'
                )}
              >
                Next: Map Columns
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Map Columns ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                We auto-detected column mappings. Please verify and adjust as needed.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th>CSV Column</th>
                    <th>Sample Data</th>
                    <th>Map To</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping) => (
                    <tr key={mapping.csvColumn}>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-dark-800 text-xs font-mono text-dark-200">
                          <FileSpreadsheet className="w-3 h-3 text-dark-400" />
                          {mapping.csvColumn}
                        </span>
                      </td>
                      <td className="text-xs text-dark-400 font-mono">
                        {mockCSVRows[0]?.[mapping.csvColumn] || '—'}
                      </td>
                      <td>
                        <select
                          value={mapping.systemField}
                          onChange={(e) => handleMappingChange(mapping.csvColumn, e.target.value)}
                          className="w-full bg-dark-800 border border-dark-700/50 text-dark-200 text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
                        >
                          {systemFieldOptions[importType].map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Next: Review
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Import ── */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">File</p>
                <p className="text-sm font-medium text-dark-100 truncate">{fileName}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">Import Type</p>
                <p className="text-sm font-medium text-dark-100 capitalize">{importType}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">Total Rows</p>
                <p className="text-sm font-medium text-dark-100">1,247</p>
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-3">Preview (First 5 Rows)</h3>
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      {mockCSVColumns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockCSVRows.map((row, i) => (
                      <tr key={i}>
                        {mockCSVColumns.map((col) => (
                          <td key={col} className="text-xs font-mono whitespace-nowrap">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress Bar */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-300">
                    {importProgress >= 100 ? 'Import complete!' : 'Importing...'}
                  </span>
                  <span className="text-dark-400 font-mono">{Math.min(importProgress, 100)}%</span>
                </div>
                <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      importProgress >= 100 ? 'bg-green-500' : 'bg-brand-600'
                    )}
                    style={{ width: `${Math.min(importProgress, 100)}%` }}
                  />
                </div>
                {importProgress >= 100 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mt-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-green-300">
                      Successfully imported 1,247 records.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isImporting
                    ? 'bg-dark-800 text-dark-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import 1,247 Records
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
