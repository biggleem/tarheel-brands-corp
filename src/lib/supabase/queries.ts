import { createClient } from './client'
import type {
  Organization,
  Business,
  StaffProfile,
  StaffAssignment,
  StaffPermission,
  TimeEntry,
  PTORequest,
  PTOBalance,
  ChartOfAccounts,
  JournalEntry,
  Bill,
  BillPayment,
  Document,
  DocumentType,
  AuditLog,
} from '../types'

// ============================================================
// Filter interfaces
// ============================================================

export interface BusinessFilters {
  category?: string
  is_active?: boolean
  search?: string
}

export interface StaffFilters {
  is_active?: boolean
  employment_type?: string
  search?: string
}

export interface TimeEntryFilters {
  staff_id?: string
  organization_id?: string
  status?: string
  start_date?: string
  end_date?: string
}

export interface JournalEntryFilters {
  organization_id?: string
  status?: string
  source?: string
  start_date?: string
  end_date?: string
  search?: string
}

export interface BillFilters {
  organization_id?: string
  status?: string
  search?: string
}

export interface DocumentFilters {
  organization_id?: string
  staff_id?: string
  document_type_id?: string
  status?: string
  search?: string
}

// ============================================================
// Dashboard Queries
// ============================================================

export async function getDashboardStats() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_dashboard_stats')
    if (error) {
      console.error('getDashboardStats error:', error)
      return { activeBusinesses: 0, activeStaff: 0, pendingBills: 0, overdueBills: 0 }
    }
    const d = data as Record<string, number>
    return {
      activeBusinesses: d.total_businesses ?? 0,
      activeStaff: d.total_staff ?? 0,
      pendingBills: d.pending_bills ?? 0,
      overdueBills: d.overdue_bills ?? 0,
    }
  } catch (err) {
    console.error('getDashboardStats error:', err)
    return { activeBusinesses: 0, activeStaff: 0, pendingBills: 0, overdueBills: 0 }
  }
}

export async function getRevenueExpenseData(months = 6) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_revenue_expense', { p_months: months })
    if (error) {
      console.error('getRevenueExpenseData error:', error)
      return []
    }
    return (data ?? []) as { month: string; revenue: number; expenses: number }[]
  } catch (err) {
    console.error('getRevenueExpenseData error:', err)
    return []
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_recent_activity', { p_limit: limit })
    if (error) {
      console.error('getRecentActivity error:', error)
      return []
    }
    return (data ?? []) as (AuditLog & { staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null })[]
  } catch (err) {
    console.error('getRecentActivity error:', err)
    return []
  }
}

// ============================================================
// Organization / Business Queries
// ============================================================

export async function getOrganizations() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_organizations')
    if (error) { console.error('getOrganizations error:', error); return [] }
    return (data ?? []) as (Organization & { business: Business[] })[]
  } catch (err) {
    console.error('getOrganizations error:', err)
    return []
  }
}

export async function getBusinesses(filters?: BusinessFilters) {
  try {
    // Use public RPC to bypass corp schema exposure requirement
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_businesses')

    if (error) {
      console.error('getBusinesses RPC error:', error)
      return []
    }

    let results = (data || []) as (Business & { organization: Organization })[]

    // Apply client-side filters
    if (filters?.category) {
      results = results.filter((b) => b.category === filters.category)
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase()
      results = results.filter(
        (b) =>
          b.domain?.toLowerCase().includes(s) ||
          b.organization?.name?.toLowerCase().includes(s)
      )
    }

    return results
  } catch (err) {
    console.error('getBusinesses error:', err)
    return []
  }
}

export async function getBusinessDetail(orgId: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_business_detail', { p_org_id: orgId })
    if (error) { console.error('getBusinessDetail error:', error); return { organization: null, staff: [], documents: [] } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = data as any
    return {
      organization: r?.organization as Organization & { business: Business[] } | null,
      staff: (r?.staff || []) as (StaffAssignment & { staff: StaffProfile })[],
      documents: (r?.documents || []) as Document[],
    }
  } catch (err) {
    console.error('getBusinessDetail error:', err)
    return { organization: null, staff: [], documents: [] }
  }
}

export async function getBusinessBySlug(slug: string) {
  try {
    // Use public RPC to bypass corp schema exposure requirement
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_business_by_slug', { p_slug: slug })

    if (error) {
      console.error('getBusinessBySlug RPC error:', error)
      return { organization: null, business: null, staff: [], documents: [], bills: [] }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = data as any
    return {
      organization: result?.organization as Organization | null,
      business: result?.business as Business | null,
      staff: (result?.staff || []) as (StaffAssignment & { staff: StaffProfile })[],
      documents: (result?.documents || []) as Document[],
      bills: (result?.bills || []) as Bill[],
    }
  } catch (err) {
    console.error('getBusinessBySlug error:', err)
    return { organization: null, business: null, staff: [], documents: [], bills: [] }
  }
}

export async function getOrganizationTree() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_organization_tree')
    if (error) { console.error('getOrganizationTree error:', error); return [] }
    const orgs = (data ?? []) as Organization[]
    const map = new Map<string, Organization & { children: Organization[] }>()
    const roots: (Organization & { children: Organization[] })[] = []
    for (const org of orgs) { map.set(org.id, { ...org, children: [] }) }
    for (const org of orgs) {
      const node = map.get(org.id)!
      if (org.parent_id && map.has(org.parent_id)) { map.get(org.parent_id)!.children.push(node) }
      else { roots.push(node) }
    }
    return roots
  } catch (err) {
    console.error('getOrganizationTree error:', err)
    return []
  }
}

// ============================================================
// Staff / HR Queries
// ============================================================

export async function getStaffDirectory(filters?: StaffFilters) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_staff_directory')
    if (error) { console.error('getStaffDirectory error:', JSON.stringify(error)); return [] }
    let results = (data ?? []) as (StaffProfile & {
      assignments: (StaffAssignment & { organization: Pick<Organization, 'id' | 'name' | 'slug'> })[]
    })[]
    // Apply client-side filters
    if (filters?.is_active !== undefined) results = results.filter((s) => s.is_active === filters.is_active)
    if (filters?.employment_type) results = results.filter((s) => s.employment_type === filters.employment_type)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      results = results.filter((s) =>
        s.first_name.toLowerCase().includes(q) || s.last_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      )
    }
    return results
  } catch (err) {
    console.error('getStaffDirectory error:', err)
    return []
  }
}

export async function getStaffDetail(staffId: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_staff_detail', { p_staff_id: staffId })
    if (error) { console.error('getStaffDetail error:', error); return { profile: null, assignments: [], permissions: [] } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = data as any
    return {
      profile: r?.profile as StaffProfile | null,
      assignments: (r?.assignments || []) as (StaffAssignment & { organization: Organization })[],
      permissions: (r?.permissions || []) as StaffPermission[],
    }
  } catch (err) {
    console.error('getStaffDetail error:', err)
    return { profile: null, assignments: [], permissions: [] }
  }
}

export async function getTimeEntries(_filters?: TimeEntryFilters) {
  // Delegates to RPC — filters applied client-side if needed
  return getTimeEntriesRpc()
}

export async function getPTORequests(_filters?: { staff_id?: string; status?: string }) {
  return getPtoRequestsRpc()
}

export async function getPTOBalances(staffId: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_pto_balances', { p_staff_id: staffId })
    if (error) { console.error('getPTOBalances error:', error); return [] }
    return (data ?? []) as PTOBalance[]
  } catch (err) {
    console.error('getPTOBalances error:', err)
    return []
  }
}

// ============================================================
// Accounting Queries
// ============================================================

export async function getChartOfAccounts(_orgId?: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_chart_of_accounts')
    if (error) { console.error('getChartOfAccounts error:', error); return [] }
    return (data ?? []) as ChartOfAccounts[]
  } catch (err) {
    console.error('getChartOfAccounts error:', err)
    return []
  }
}

export async function getJournalEntries(_filters?: JournalEntryFilters) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_journal_entries', { p_months: 12 })
    if (error) { console.error('getJournalEntries error:', error); return [] }
    return (data ?? []) as JournalEntry[]
  } catch (err) {
    console.error('getJournalEntries error:', err)
    return []
  }
}

export async function getAccountBalances() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_account_balances')
    if (error) { console.error('getAccountBalances error:', error); return [] }
    // Map RPC field names to match expected AccountBalance type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((r: any) => ({
      account_id: r.id || r.account_id,
      account_number: r.account_code,
      name: r.account_name,
      account_type: r.account_type,
      total_debit: Number(r.total_debit),
      total_credit: Number(r.total_credit),
      balance: Number(r.balance),
    }))
  } catch (err) {
    console.error('getAccountBalances error:', err)
    return []
  }
}

// ============================================================
// Bills Queries
// ============================================================

export async function getBills(filters?: BillFilters) {
  try {
    const supabase = createClient()
    const params: Record<string, unknown> = {}
    if (filters?.status) params.p_status = filters.status
    if (filters?.organization_id) params.p_org_id = filters.organization_id
    if (filters?.search) params.p_search = filters.search

    const { data, error } = await supabase.rpc('get_corp_bills', params)

    if (error) {
      console.error('getBills error:', error)
      return []
    }

    return (data ?? []) as (Bill & { organization: Pick<Organization, 'id' | 'name'> })[]
  } catch (err) {
    console.error('getBills error:', err)
    return []
  }
}

export async function getBillDetail(billId: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_bill_detail', { p_bill_id: billId })
    if (error) { console.error('getBillDetail error:', error); return null }
    return data as Bill & { organization: Organization; payments: BillPayment[] }
  } catch (err) {
    console.error('getBillDetail error:', err)
    return null
  }
}

// ============================================================
// Document Queries
// ============================================================

export async function getDocuments(_filters?: DocumentFilters) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_documents')
    if (error) { console.error('getDocuments error:', error); return [] }
    return (data ?? []) as (Document & {
      document_type: DocumentType
      uploaded_by_staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name'> | null
      organization: Pick<Organization, 'id' | 'name'> | null
    })[]
  } catch (err) {
    console.error('getDocuments error:', err)
    return []
  }
}

export async function getDocumentTypes() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_document_types')
    if (error) { console.error('getDocumentTypes error:', error); return [] }
    return (data ?? []) as DocumentType[]
  } catch (err) {
    console.error('getDocumentTypes error:', err)
    return []
  }
}

// ============================================================
// Settings / Admin Queries
// ============================================================

export async function getStaffWithPermissions() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_corp_staff_with_permissions')
    if (error) { console.error('getStaffWithPermissions error:', error); return [] }
    return (data ?? []) as (StaffProfile & {
      permissions: StaffPermission[]
      assignments: (StaffAssignment & { organization: Pick<Organization, 'id' | 'name' | 'slug'> })[]
    })[]
  } catch (err) {
    console.error('getStaffWithPermissions error:', err)
    return []
  }
}

// ============================================================
// Current User Helpers
// ============================================================

// ============================================================
// Import Helpers
// ============================================================

export async function importBills(bills: Partial<Bill>[]) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('import_corp_bills', {
    p_bills: bills,
  })
  if (error) throw error
  return data as { imported: number }
}

// ============================================================
// Toast POS Queries (via RPC — corp schema not exposed via REST)
// ============================================================

export async function getToastDailySales(startDate?: string, endDate?: string) {
  const supabase = createClient()
  const params: Record<string, string> = {}
  if (startDate) params.p_start_date = startDate
  if (endDate) params.p_end_date = endDate
  const { data, error } = await supabase.rpc('get_corp_toast_daily_sales', params)
  if (error) { console.error('getToastDailySales error:', error); return [] }
  return (data ?? []) as Array<{
    business_date: string; net_sales: number; tax: number; tips: number
    total: number; total_orders: number; total_guests: number
  }>
}

export async function getToastMonthlySales(months = 12) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_toast_monthly_sales', { p_months: months })
  if (error) { console.error('getToastMonthlySales error:', error); return [] }
  return (data ?? []) as Array<{
    month: string; net_sales: number; tax: number; tips: number
    total: number; total_orders: number; total_guests: number; days_with_sales: number
  }>
}

export async function getToastSalesSummary() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_toast_sales_summary')
  if (error) { console.error('getToastSalesSummary error:', error); return null }
  return data as {
    total_net_sales: number; total_tax: number; total_tips: number
    total_revenue: number; total_orders: number; total_guests: number
    total_days: number; first_date: string; last_date: string; avg_daily_sales: number
  } | null
}

export async function getToastRecentSales(limit = 30) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_toast_recent_sales', { p_limit: limit })
  if (error) { console.error('getToastRecentSales error:', error); return [] }
  return (data ?? []) as Array<{
    business_date: string; net_sales: number; tax: number; tips: number
    total: number; total_orders: number; total_guests: number
  }>
}

export async function getToastYearlySales() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_toast_yearly_sales')
  if (error) { console.error('getToastYearlySales error:', error); return [] }
  return (data ?? []) as Array<{
    year: number; net_sales: number; total_orders: number
    total_guests: number; days_with_sales: number; avg_daily_sales: number
  }>
}

export async function getDashboardStatsRpc() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_dashboard_stats')
  if (error) { console.error('getDashboardStatsRpc error:', error); return null }
  return data as {
    total_businesses: number; total_staff: number; total_bills: number
    pending_bills: number; overdue_bills: number; pending_bills_amount: number
    total_documents: number; total_sales: number; total_orders: number
    recent_month_sales: number; previous_month_sales: number; pto_pending: number
  } | null
}

export async function getTimeEntriesRpc() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_time_entries')
  if (error) { console.error('getTimeEntriesRpc error:', error); return [] }
  return (data ?? []) as Array<{
    id: string; staff_id: string; organization_id: string
    clock_in: string; clock_out: string | null; break_minutes: number
    total_hours: number | null; notes: string | null; status: string
    approved_by: string | null; approved_at: string | null
    first_name: string; last_name: string; role: string | null
    department: string | null; title: string | null; organization_name: string
  }>
}

export async function getPtoRequestsRpc() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_corp_pto_requests')
  if (error) { console.error('getPtoRequestsRpc error:', error); return [] }
  return (data ?? []) as Array<{
    id: string; staff_id: string; organization_id: string
    pto_type: string; start_date: string; end_date: string
    total_hours: number; notes: string | null; status: string
    reviewed_by: string | null; reviewed_at: string | null; review_notes: string | null
    created_at: string; first_name: string; last_name: string
    role: string | null; department: string | null; title: string | null
    organization_name: string
  }>
}

export async function getCurrentStaffProfile() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase.rpc('get_corp_current_staff', { p_user_id: user.id })
    if (error) {
      console.error('getCurrentStaffProfile error:', error)
      return null
    }
    if (!data) return null

    return data as StaffProfile & {
      assignments: (StaffAssignment & { organization: Organization })[]
      permissions: StaffPermission[]
    }
  } catch (err) {
    console.error('getCurrentStaffProfile error:', err)
    return null
  }
}

// ============================================================
// Transaction Queries (Rocket Money data)
// ============================================================

export type TransactionRow = {
  id: string; organization_id: string; transaction_date: string
  original_date: string | null; account_type: string; account_name: string
  account_number: string; institution_name: string; vendor_name: string
  custom_name: string; amount: number; description: string; category: string
  note: string; is_personal: boolean; is_tax_deductible: boolean
  tags: string[]; source: string; organization_name: string | null
}

export type TransactionSummary = {
  total_transactions: number; total_amount: number
  total_income: number; total_expenses: number
  first_date: string; last_date: string
  categories: Array<{ category: string; count: number; total: number }>
  monthly: Array<{ month: string; income: number; expenses: number; count: number }>
  accounts: Array<{ account_name: string; institution_name: string; count: number; total: number }>
}

export async function getTransactions(opts?: {
  is_personal?: boolean; category?: string
  start_date?: string; end_date?: string; limit?: number
}) {
  const supabase = createClient()
  const params: Record<string, unknown> = {}
  if (opts?.is_personal !== undefined) params.p_is_personal = opts.is_personal
  if (opts?.category) params.p_category = opts.category
  if (opts?.start_date) params.p_start_date = opts.start_date
  if (opts?.end_date) params.p_end_date = opts.end_date
  if (opts?.limit) params.p_limit = opts.limit
  const { data, error } = await supabase.rpc('get_corp_transactions', params)
  if (error) { console.error('getTransactions error:', error); return [] }
  return (data ?? []) as TransactionRow[]
}

export async function getTransactionSummary(isPersonal?: boolean) {
  const supabase = createClient()
  const params: Record<string, unknown> = {}
  if (isPersonal !== undefined) params.p_is_personal = isPersonal
  const { data, error } = await supabase.rpc('get_corp_transaction_summary', params)
  if (error) { console.error('getTransactionSummary error:', error); return null }
  return data as TransactionSummary | null
}
