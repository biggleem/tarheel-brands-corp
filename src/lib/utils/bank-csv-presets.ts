// ── Bank / Statement Format Presets ────────────────────────────────
// Each preset describes a known CSV/XLSX export format so we can
// auto-detect the source and pre-map columns to our bill fields.

export interface FormatPreset {
  id: string
  label: string
  /** Column headers that uniquely identify this format */
  headerSignature: string[]
  /** Map: source column name → system bill field */
  columnMap: Record<string, string>
  /** Whether this source is XLSX (true) or CSV (false) */
  isXlsx?: boolean
}

// System fields the user can map CSV columns to
export const systemBillFields = [
  'vendor_name',
  'amount',
  'tax_amount',
  'bill_date',
  'due_date',
  'category',
  'description',
  'notes',
  'status',
  'bill_type',
  '-- Skip --',
] as const

export type SystemBillField = (typeof systemBillFields)[number]

// ── Presets ─────────────────────────────────────────────────────────

export const rocketMoneyPreset: FormatPreset = {
  id: 'rocket_money',
  label: 'Rocket Money',
  headerSignature: ['Date', 'Original Date', 'Account Type', 'Institution Name', 'Custom Name'],
  columnMap: {
    'Name': 'vendor_name',
    'Custom Name': '-- Skip --',
    'Amount': 'amount',
    'Date': 'bill_date',
    'Original Date': '-- Skip --',
    'Category': 'category',
    'Description': 'description',
    'Account Name': 'notes',
    'Account Type': '-- Skip --',
    'Account Number': '-- Skip --',
    'Institution Name': '-- Skip --',
    'Note': '-- Skip --',
    'Ignored From': '-- Skip --',
    'Tax Deductible': '-- Skip --',
    'Transaction Tags': '-- Skip --',
  },
}

export const toastPreset: FormatPreset = {
  id: 'toast',
  label: 'Toast POS',
  headerSignature: [],
  isXlsx: true,
  columnMap: {
    'Date': 'bill_date',
    'Net Sales': 'amount',
    'Tax': 'tax_amount',
    'Description': 'description',
  },
}

export const chasePreset: FormatPreset = {
  id: 'chase',
  label: 'Chase',
  headerSignature: ['Details', 'Posting Date', 'Description', 'Amount', 'Type', 'Balance', 'Check or Slip #'],
  columnMap: {
    'Description': 'vendor_name',
    'Amount': 'amount',
    'Posting Date': 'bill_date',
    'Type': 'bill_type',
    'Details': '-- Skip --',
    'Balance': '-- Skip --',
    'Check or Slip #': '-- Skip --',
  },
}

export const boaPreset: FormatPreset = {
  id: 'boa',
  label: 'Bank of America',
  headerSignature: ['Date', 'Description', 'Amount', 'Running Bal.'],
  columnMap: {
    'Description': 'vendor_name',
    'Amount': 'amount',
    'Date': 'bill_date',
    'Running Bal.': '-- Skip --',
  },
}

export const wellsFargoPreset: FormatPreset = {
  id: 'wells_fargo',
  label: 'Wells Fargo',
  headerSignature: ['Date', 'Amount', 'Star', 'Description'],
  columnMap: {
    'Description': 'vendor_name',
    'Amount': 'amount',
    'Date': 'bill_date',
    'Star': '-- Skip --',
  },
}

export const customPreset: FormatPreset = {
  id: 'custom',
  label: 'Custom CSV',
  headerSignature: [],
  columnMap: {},
}

export const allPresets: FormatPreset[] = [
  rocketMoneyPreset,
  toastPreset,
  chasePreset,
  boaPreset,
  wellsFargoPreset,
  customPreset,
]

// ── Auto-Detection ──────────────────────────────────────────────────

/**
 * Given the headers from a parsed CSV, find the best matching preset.
 * Returns the preset with the most signature matches, or `customPreset`
 * if nothing scores above 50%.
 */
export function detectPreset(headers: string[]): FormatPreset {
  const normalised = headers.map((h) => h.trim())
  let bestPreset = customPreset
  let bestScore = 0

  for (const preset of allPresets) {
    if (preset.id === 'custom' || preset.id === 'toast') continue
    if (preset.headerSignature.length === 0) continue

    const matchCount = preset.headerSignature.filter((sig) =>
      normalised.some((h) => h.toLowerCase() === sig.toLowerCase())
    ).length

    const score = matchCount / preset.headerSignature.length
    if (score > bestScore) {
      bestScore = score
      bestPreset = preset
    }
  }

  // Require at least 50% header match
  return bestScore >= 0.5 ? bestPreset : customPreset
}

/**
 * Build initial column mappings from a preset and actual CSV headers.
 */
export function buildMappings(
  headers: string[],
  preset: FormatPreset
): { csvColumn: string; systemField: string }[] {
  return headers.map((col) => ({
    csvColumn: col,
    systemField: preset.columnMap[col] ?? '-- Skip --',
  }))
}
