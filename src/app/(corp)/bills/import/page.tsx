'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency } from '@/lib/utils/formatters'
import { getBusinesses, importBills } from '@/lib/supabase/queries'
import {
  allPresets,
  detectPreset,
  buildMappings,
  systemBillFields,
  type FormatPreset,
} from '@/lib/utils/bank-csv-presets'
import type { Business, Organization } from '@/lib/types'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  Rocket,
  UtensilsCrossed,
  Building2,
  Landmark,
  Banknote,
  FileText,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────
interface ColumnMapping {
  csvColumn: string
  systemField: string
}

interface ParsedRow {
  [key: string]: string
}

type BusinessWithOrg = Business & { organization: Organization }

// ── Source Icons ────────────────────────────────────────────
const sourceIcons: Record<string, typeof Rocket> = {
  rocket_money: Rocket,
  toast: UtensilsCrossed,
  chase: Landmark,
  boa: Building2,
  wells_fargo: Banknote,
  custom: FileText,
}

const sourceColors: Record<string, string> = {
  rocket_money: 'text-green-400',
  toast: 'text-orange-400',
  chase: 'text-blue-400',
  boa: 'text-red-400',
  wells_fargo: 'text-yellow-400',
  custom: 'text-dark-400',
}

const sourceDescriptions: Record<string, string> = {
  rocket_money: 'Rocket Money transaction export CSV',
  toast: 'Toast POS sales summary (XLSX/CSV)',
  chase: 'Chase bank statement CSV',
  boa: 'Bank of America statement CSV',
  wells_fargo: 'Wells Fargo statement CSV',
  custom: 'Any CSV file — map columns manually',
}

// ── Page Component ─────────────────────────────────────────
export default function BillsImportPage() {
  const [step, setStep] = useState(1)
  const [selectedSource, setSelectedSource] = useState<string>('rocket_money')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string>('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [detectedPreset, setDetectedPreset] = useState<FormatPreset | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Step 3 state
  const [businesses, setBusinesses] = useState<BusinessWithOrg[]>([])
  const [selectedBizId, setSelectedBizId] = useState<string>('')
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { number: 1, label: 'Upload' },
    { number: 2, label: 'Map Columns' },
    { number: 3, label: 'Review & Import' },
  ]

  // ── Load businesses for org selector ───────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await getBusinesses()
      if (!cancelled) setBusinesses(data as BusinessWithOrg[])
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Format file size ───────────────────────────────────
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ── Parse file ─────────────────────────────────────────
  const parseFile = useCallback((file: File) => {
    setParseError(null)
    setFileName(file.name)
    setFileSize(formatFileSize(file.size))

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'xlsx' || ext === 'xls') {
      // Parse XLSX with SheetJS
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          // Use first sheet or "All data" sheet
          let sheetName = workbook.SheetNames[0]
          if (workbook.SheetNames.includes('All data')) {
            sheetName = 'All data'
          }

          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: '' })

          if (jsonData.length === 0) {
            setParseError('No data found in the spreadsheet.')
            return
          }

          const cols = Object.keys(jsonData[0])
          setHeaders(cols)
          setRows(jsonData)

          // Auto-select Toast preset for XLSX
          const preset = allPresets.find((p) => p.id === 'toast')!
          setDetectedPreset(preset)
          setSelectedSource('toast')
          setMappings(buildMappings(cols, preset))
        } catch {
          setParseError('Failed to parse XLSX file. Please check the format.')
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      // Parse CSV with PapaParse
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0 && result.data.length === 0) {
            setParseError(`CSV parse error: ${result.errors[0].message}`)
            return
          }

          const parsed = result.data as ParsedRow[]
          if (parsed.length === 0) {
            setParseError('No data rows found in the CSV.')
            return
          }

          const cols = Object.keys(parsed[0])
          setHeaders(cols)
          setRows(parsed)

          // Auto-detect preset
          const preset = detectPreset(cols)
          setDetectedPreset(preset)
          if (preset.id !== 'custom') {
            setSelectedSource(preset.id)
          }
          setMappings(buildMappings(cols, preset))
        },
        error: (err) => {
          setParseError(`Failed to parse CSV: ${err.message}`)
        },
      })
    }
  }, [])

  // ── Handle file input ──────────────────────────────────
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  function clearFile() {
    setFileName(null)
    setHeaders([])
    setRows([])
    setMappings([])
    setDetectedPreset(null)
    setParseError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Handle mapping change ──────────────────────────────
  function handleMappingChange(csvColumn: string, systemField: string) {
    setMappings((prev) =>
      prev.map((m) => (m.csvColumn === csvColumn ? { ...m, systemField } : m))
    )
  }

  // ── Apply preset manually ──────────────────────────────
  function applyPreset(presetId: string) {
    setSelectedSource(presetId)
    const preset = allPresets.find((p) => p.id === presetId)
    if (preset && headers.length > 0) {
      setDetectedPreset(preset)
      setMappings(buildMappings(headers, preset))
    }
  }

  // ── Preview rows (first 5) ─────────────────────────────
  const previewRows = useMemo(() => rows.slice(0, 5), [rows])

  // ── Import handler ─────────────────────────────────────
  async function handleImport() {
    if (!selectedBizId) {
      setImportError('Please select a target business.')
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportError(null)
    setImportResult(null)

    try {
      // Transform rows based on mappings
      const billRecords = rows.map((row) => {
        const bill: Record<string, string | number> = {
          organization_id: selectedBizId,
          status: 'pending',
        }

        for (const mapping of mappings) {
          if (mapping.systemField === '-- Skip --') continue
          const value = row[mapping.csvColumn] ?? ''

          if (mapping.systemField === 'amount' || mapping.systemField === 'tax_amount') {
            // Parse currency — strip $, commas, handle negative with parens
            let num = value.replace(/[$,]/g, '').trim()
            if (num.startsWith('(') && num.endsWith(')')) {
              num = '-' + num.slice(1, -1)
            }
            bill[mapping.systemField] = parseFloat(num) || 0
          } else {
            bill[mapping.systemField] = value
          }
        }

        // Compute total_amount
        const amt = Number(bill.amount) || 0
        const tax = Number(bill.tax_amount) || 0
        bill.total_amount = amt + tax

        // Default vendor_name if missing
        if (!bill.vendor_name) bill.vendor_name = 'Unknown'

        // Metadata: store original source info
        bill.metadata = JSON.stringify({
          import_source: selectedSource,
          import_file: fileName,
          imported_at: new Date().toISOString(),
        })

        return bill
      })

      // Progress simulation (actual import is a single RPC call)
      setImportProgress(20)

      // Batch in chunks of 100
      const chunkSize = 100
      let totalImported = 0

      for (let i = 0; i < billRecords.length; i += chunkSize) {
        const chunk = billRecords.slice(i, i + chunkSize)
        const result = await importBills(chunk)
        totalImported += result.imported
        setImportProgress(Math.min(20 + Math.round(((i + chunkSize) / billRecords.length) * 80), 100))
      }

      setImportProgress(100)
      setImportResult({ imported: totalImported })
    } catch (err) {
      console.error('Import error:', err)
      setImportError(err instanceof Error ? err.message : 'Failed to import records.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Import Transactions"
        description="Upload bank statements or transaction exports from Rocket Money, Toast, or your bank"
        actions={
          <Link
            href="/bills"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bills
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
            {/* Source Selector */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-3">Select Source</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPresets.map((preset) => {
                  const Icon = sourceIcons[preset.id] || FileText
                  const color = sourceColors[preset.id] || 'text-dark-400'
                  const desc = sourceDescriptions[preset.id] || ''
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left',
                        selectedSource === preset.id
                          ? 'bg-brand-600/10 border-brand-600/40 ring-1 ring-brand-600/20'
                          : 'bg-dark-800/50 border-dark-700/30 hover:border-dark-600/50'
                      )}
                    >
                      <div className={cn('p-2 rounded-lg bg-dark-900', color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={cn('text-sm font-medium', selectedSource === preset.id ? 'text-brand-400' : 'text-dark-100')}>
                          {preset.label}
                        </p>
                        <p className="text-xs text-dark-400 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-3">Upload File</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />

              {!fileName ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
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
                      Drag and drop your file here
                    </p>
                    <p className="text-xs text-dark-500 mt-1">
                      or click to browse &bull; Accepts .csv, .xlsx, .xls
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
                    <p className="text-xs text-dark-500">
                      {rows.length.toLocaleString()} rows detected &bull; {headers.length} columns &bull; {fileSize}
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-dark-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Auto-detection notice */}
              {detectedPreset && detectedPreset.id !== 'custom' && detectedPreset.id !== selectedSource && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-3">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-300">
                    Auto-detected as <strong>{detectedPreset.label}</strong> format. Column mappings have been pre-filled.
                  </p>
                </div>
              )}

              {parseError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mt-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300">{parseError}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => { if (fileName && rows.length > 0) setStep(2) }}
                disabled={!fileName || rows.length === 0}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  fileName && rows.length > 0
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
                {detectedPreset && detectedPreset.id !== 'custom'
                  ? `Columns auto-mapped using ${detectedPreset.label} preset. Verify and adjust as needed.`
                  : 'Map each CSV column to a system field, or skip columns you don\'t need.'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th>File Column</th>
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
                      <td className="text-xs text-dark-400 font-mono max-w-[200px] truncate">
                        {previewRows[0]?.[mapping.csvColumn] || '—'}
                      </td>
                      <td>
                        <select
                          value={mapping.systemField}
                          onChange={(e) => handleMappingChange(mapping.csvColumn, e.target.value)}
                          className={cn(
                            'w-full bg-dark-800 border border-dark-700/50 text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none',
                            mapping.systemField === '-- Skip --' ? 'text-dark-500' : 'text-dark-200'
                          )}
                        >
                          {systemBillFields.map((field) => (
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">File</p>
                <p className="text-sm font-medium text-dark-100 truncate">{fileName}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">Source</p>
                <p className="text-sm font-medium text-dark-100 capitalize">
                  {allPresets.find((p) => p.id === selectedSource)?.label || selectedSource}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">Total Rows</p>
                <p className="text-sm font-medium text-dark-100">{rows.length.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <p className="text-xs text-dark-400 mb-1">Mapped Fields</p>
                <p className="text-sm font-medium text-dark-100">
                  {mappings.filter((m) => m.systemField !== '-- Skip --').length} of {mappings.length}
                </p>
              </div>
            </div>

            {/* Business Selector */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-2">Assign to Business</h3>
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full sm:w-96 bg-dark-800 border border-dark-700/50 text-dark-200 text-sm rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
              >
                <option value="">Select a business...</option>
                {businesses.map((biz) => (
                  <option key={biz.organization_id} value={biz.organization_id}>
                    {biz.organization?.name || biz.organization_id}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Table */}
            <div>
              <h3 className="text-sm font-medium text-dark-200 mb-3">Preview (First 5 Rows)</h3>
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      {mappings
                        .filter((m) => m.systemField !== '-- Skip --')
                        .map((m) => (
                          <th key={m.csvColumn}>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-dark-500">{m.csvColumn}</span>
                              <span>{m.systemField}</span>
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {mappings
                          .filter((m) => m.systemField !== '-- Skip --')
                          .map((m) => (
                            <td key={m.csvColumn} className="text-xs font-mono whitespace-nowrap">
                              {m.systemField === 'amount' || m.systemField === 'tax_amount'
                                ? formatCurrency(parseFloat(String(row[m.csvColumn] || '0').replace(/[$,]/g, '')) || 0)
                                : (row[m.csvColumn] || '—')}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Progress Bar */}
            {(isImporting || importResult) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-300">
                    {importResult ? 'Import complete!' : 'Importing...'}
                  </span>
                  <span className="text-dark-400 font-mono">{Math.min(importProgress, 100)}%</span>
                </div>
                <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      importResult ? 'bg-green-500' : 'bg-brand-600'
                    )}
                    style={{ width: `${Math.min(importProgress, 100)}%` }}
                  />
                </div>
                {importResult && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mt-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-green-300">
                      Successfully imported {importResult.imported.toLocaleString()} records to bills.
                    </p>
                  </div>
                )}
              </div>
            )}

            {importError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">{importError}</p>
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
                disabled={isImporting || !!importResult || !selectedBizId}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isImporting || !!importResult || !selectedBizId
                    ? 'bg-dark-800 text-dark-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                )}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : importResult ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Done
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {rows.length.toLocaleString()} Records
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
