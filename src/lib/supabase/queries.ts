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

// Helper to get a client targeting corp schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function corpClient() {
  return createClient().schema('corp' as any)
}

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
    const db = corpClient()

    const [bizRes, staffRes, pendingRes, overdueRes] = await Promise.all([
      db.from('businesses').select('*', { count: 'exact', head: true }).eq('is_active', true),
      db.from('staff_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      db.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    ])

    return {
      activeBusinesses: bizRes.count ?? 0,
      activeStaff: staffRes.count ?? 0,
      pendingBills: pendingRes.count ?? 0,
      overdueBills: overdueRes.count ?? 0,
    }
  } catch (err) {
    console.error('getDashboardStats error:', err)
    return { activeBusinesses: 0, activeStaff: 0, pendingBills: 0, overdueBills: 0 }
  }
}

export async function getRevenueExpenseData(months = 6) {
  try {
    const db = corpClient()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    const startStr = startDate.toISOString().split('T')[0]

    const { data, error } = await db
      .from('journal_entries')
      .select(`
        id,
        entry_date,
        description,
        status,
        journal_entry_lines (
          debit,
          credit,
          account:chart_of_accounts (
            account_type
          )
        )
      `)
      .eq('status', 'posted')
      .gte('entry_date', startStr)
      .order('entry_date')

    if (error) {
      console.error('getRevenueExpenseData error:', error)
      return []
    }

    // Aggregate by month
    const monthlyData: Record<string, { month: string; revenue: number; expenses: number }> = {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const entry of (data || []) as any[]) {
      const month = entry.entry_date.substring(0, 7) // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, expenses: 0 }
      }

      for (const line of entry.journal_entry_lines || []) {
        const accountType = line.account?.account_type
        if (accountType === 'revenue') {
          monthlyData[month].revenue += Number(line.credit) - Number(line.debit)
        } else if (accountType === 'expense') {
          monthlyData[month].expenses += Number(line.debit) - Number(line.credit)
        }
      }
    }

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  } catch (err) {
    console.error('getRevenueExpenseData error:', err)
    return []
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const db = corpClient()
    const { data, error } = await db
      .from('audit_logs')
      .select(`
        *,
        staff:staff_profiles (
          id, first_name, last_name, avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('getRecentActivity error:', error)
      return []
    }

    return (data || []) as (AuditLog & { staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null })[]
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
    const db = corpClient()
    const { data, error } = await db
      .from('organizations')
      .select(`
        *,
        business:businesses (*)
      `)
      .order('name')

    if (error) {
      console.error('getOrganizations error:', error)
      return []
    }

    return (data || []) as (Organization & { business: Business[] })[]
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
    const db = corpClient()
    const [orgRes, staffRes, docsRes] = await Promise.all([
      db
        .from('organizations')
        .select(`
          *,
          business:businesses (*)
        `)
        .eq('id', orgId)
        .single(),
      db
        .from('staff_assignments')
        .select(`
          *,
          staff:staff_profiles (
            id, first_name, last_name, email, phone, employment_type, pay_type, pay_rate, avatar_url, is_active
          )
        `)
        .eq('organization_id', orgId)
        .eq('is_active', true),
      db
        .from('documents')
        .select(`
          *,
          document_type:document_types (*),
          staff:staff_profiles (id, first_name, last_name)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    return {
      organization: orgRes.data as Organization & { business: Business[] } | null,
      staff: (staffRes.data || []) as (StaffAssignment & { staff: StaffProfile })[] ,
      documents: (docsRes.data || []) as Document[],
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
    const db = corpClient()
    const { data, error } = await db
      .from('organizations')
      .select('*')
      .order('name')

    if (error) {
      console.error('getOrganizationTree error:', error)
      return []
    }

    // Build tree client-side
    const orgs = (data || []) as Organization[]
    const map = new Map<string, Organization & { children: Organization[] }>()
    const roots: (Organization & { children: Organization[] })[] = []

    for (const org of orgs) {
      map.set(org.id, { ...org, children: [] })
    }

    for (const org of orgs) {
      const node = map.get(org.id)!
      if (org.parent_id && map.has(org.parent_id)) {
        map.get(org.parent_id)!.children.push(node)
      } else {
        roots.push(node)
      }
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
    const db = corpClient()
    let query = db
      .from('staff_profiles')
      .select(`
        *,
        assignments:staff_assignments (
          *,
          organization:organizations (id, name, slug)
        )
      `)

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type)
    }
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('last_name')

    if (error) {
      console.error('getStaffDirectory error:', error)
      return []
    }

    return (data || []) as (StaffProfile & {
      assignments: (StaffAssignment & { organization: Pick<Organization, 'id' | 'name' | 'slug'> })[]
    })[]
  } catch (err) {
    console.error('getStaffDirectory error:', err)
    return []
  }
}

export async function getStaffDetail(staffId: string) {
  try {
    const db = corpClient()
    const [profileRes, assignRes, permRes] = await Promise.all([
      db.from('staff_profiles').select('*').eq('id', staffId).single(),
      db
        .from('staff_assignments')
        .select(`
          *,
          organization:organizations (id, name, slug, org_type)
        `)
        .eq('staff_id', staffId),
      db
        .from('staff_permissions')
        .select('*')
        .eq('staff_id', staffId),
    ])

    return {
      profile: profileRes.data as StaffProfile | null,
      assignments: (assignRes.data || []) as (StaffAssignment & { organization: Organization })[],
      permissions: (permRes.data || []) as StaffPermission[],
    }
  } catch (err) {
    console.error('getStaffDetail error:', err)
    return { profile: null, assignments: [], permissions: [] }
  }
}

export async function getTimeEntries(filters?: TimeEntryFilters) {
  try {
    const db = corpClient()
    let query = db
      .from('time_entries')
      .select(`
        *,
        staff:staff_profiles (id, first_name, last_name),
        organization:organizations (id, name)
      `)

    if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id)
    if (filters?.organization_id) query = query.eq('organization_id', filters.organization_id)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.start_date) query = query.gte('clock_in', filters.start_date)
    if (filters?.end_date) query = query.lte('clock_in', filters.end_date)

    const { data, error } = await query.order('clock_in', { ascending: false }).limit(100)

    if (error) {
      console.error('getTimeEntries error:', error)
      return []
    }

    return (data || []) as TimeEntry[]
  } catch (err) {
    console.error('getTimeEntries error:', err)
    return []
  }
}

export async function getPTORequests(filters?: { staff_id?: string; status?: string }) {
  try {
    const db = corpClient()
    let query = db
      .from('pto_requests')
      .select(`
        *,
        staff:staff_profiles (id, first_name, last_name, email)
      `)

    if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id)
    if (filters?.status) query = query.eq('status', filters.status)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('getPTORequests error:', error)
      return []
    }

    return (data || []) as PTORequest[]
  } catch (err) {
    console.error('getPTORequests error:', err)
    return []
  }
}

export async function getPTOBalances(staffId: string) {
  try {
    const db = corpClient()
    const { data, error } = await db
      .from('pto_balances')
      .select('*')
      .eq('staff_id', staffId)
      .order('year', { ascending: false })

    if (error) {
      console.error('getPTOBalances error:', error)
      return []
    }

    return (data || []) as PTOBalance[]
  } catch (err) {
    console.error('getPTOBalances error:', err)
    return []
  }
}

// ============================================================
// Accounting Queries
// ============================================================

export async function getChartOfAccounts(orgId?: string) {
  try {
    const db = corpClient()
    let query = db
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)

    if (orgId) {
      query = query.eq('organization_id', orgId)
    }

    const { data, error } = await query.order('account_number')

    if (error) {
      console.error('getChartOfAccounts error:', error)
      return []
    }

    return (data || []) as ChartOfAccounts[]
  } catch (err) {
    console.error('getChartOfAccounts error:', err)
    return []
  }
}

export async function getJournalEntries(filters?: JournalEntryFilters) {
  try {
    const db = corpClient()
    let query = db
      .from('journal_entries')
      .select(`
        *,
        organization:organizations (id, name),
        lines:journal_entry_lines (
          *,
          account:chart_of_accounts (id, account_number, name, account_type)
        )
      `)

    if (filters?.organization_id) query = query.eq('organization_id', filters.organization_id)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.source) query = query.eq('source', filters.source)
    if (filters?.start_date) query = query.gte('entry_date', filters.start_date)
    if (filters?.end_date) query = query.lte('entry_date', filters.end_date)
    if (filters?.search) query = query.ilike('description', `%${filters.search}%`)

    const { data, error } = await query.order('entry_date', { ascending: false }).limit(50)

    if (error) {
      console.error('getJournalEntries error:', error)
      return []
    }

    return (data || []) as JournalEntry[]
  } catch (err) {
    console.error('getJournalEntries error:', err)
    return []
  }
}

export async function getAccountBalances() {
  try {
    const db = corpClient()
    const { data, error } = await db
      .from('journal_entry_lines')
      .select(`
        debit,
        credit,
        account:chart_of_accounts (
          id, account_number, name, account_type, normal_balance
        ),
        journal_entry:journal_entries!inner (
          status
        )
      `)

    if (error) {
      console.error('getAccountBalances error:', error)
      return []
    }

    // Aggregate by account
    const balances: Record<string, {
      account_id: string
      account_number: string
      name: string
      account_type: string
      total_debit: number
      total_credit: number
      balance: number
    }> = {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const line of (data || []) as any[]) {
      if (line.journal_entry?.status !== 'posted') continue
      const acct = line.account
      if (!acct) continue

      if (!balances[acct.id]) {
        balances[acct.id] = {
          account_id: acct.id,
          account_number: acct.account_number,
          name: acct.name,
          account_type: acct.account_type,
          total_debit: 0,
          total_credit: 0,
          balance: 0,
        }
      }

      balances[acct.id].total_debit += Number(line.debit)
      balances[acct.id].total_credit += Number(line.credit)

      // Balance = debit - credit for debit-normal; credit - debit for credit-normal
      if (acct.normal_balance === 'debit') {
        balances[acct.id].balance = balances[acct.id].total_debit - balances[acct.id].total_credit
      } else {
        balances[acct.id].balance = balances[acct.id].total_credit - balances[acct.id].total_debit
      }
    }

    return Object.values(balances).sort((a, b) => a.account_number.localeCompare(b.account_number))
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
    const db = corpClient()
    let query = db
      .from('bills')
      .select(`
        *,
        organization:organizations (id, name)
      `)

    if (filters?.organization_id) query = query.eq('organization_id', filters.organization_id)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.search) query = query.or(`vendor_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)

    const { data, error } = await query.order('due_date', { ascending: true })

    if (error) {
      console.error('getBills error:', error)
      return []
    }

    return (data || []) as (Bill & { organization: Pick<Organization, 'id' | 'name'> })[]
  } catch (err) {
    console.error('getBills error:', err)
    return []
  }
}

export async function getBillDetail(billId: string) {
  try {
    const db = corpClient()
    const { data, error } = await db
      .from('bills')
      .select(`
        *,
        organization:organizations (id, name),
        payments:bill_payments (*)
      `)
      .eq('id', billId)
      .single()

    if (error) {
      console.error('getBillDetail error:', error)
      return null
    }

    return data as Bill & { organization: Organization; payments: BillPayment[] }
  } catch (err) {
    console.error('getBillDetail error:', err)
    return null
  }
}

// ============================================================
// Document Queries
// ============================================================

export async function getDocuments(filters?: DocumentFilters) {
  try {
    const db = corpClient()
    let query = db
      .from('documents')
      .select(`
        *,
        document_type:document_types (*),
        staff:staff_profiles (id, first_name, last_name)
      `)

    if (filters?.organization_id) query = query.eq('organization_id', filters.organization_id)
    if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id)
    if (filters?.document_type_id) query = query.eq('document_type_id', filters.document_type_id)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,file_name.ilike.%${filters.search}%`)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('getDocuments error:', error)
      return []
    }

    return (data || []) as (Document & {
      document_type: DocumentType
      staff: Pick<StaffProfile, 'id' | 'first_name' | 'last_name'> | null
    })[]
  } catch (err) {
    console.error('getDocuments error:', err)
    return []
  }
}

export async function getDocumentTypes() {
  try {
    const db = corpClient()
    const { data, error } = await db
      .from('document_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('getDocumentTypes error:', error)
      return []
    }

    return (data || []) as DocumentType[]
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
    const db = corpClient()
    const { data, error } = await db
      .from('staff_profiles')
      .select(`
        *,
        permissions:staff_permissions (*),
        assignments:staff_assignments (
          *,
          organization:organizations (id, name, slug)
        )
      `)
      .eq('is_active', true)
      .order('last_name')

    if (error) {
      console.error('getStaffWithPermissions error:', error)
      return []
    }

    return (data || []) as (StaffProfile & {
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

export async function getCurrentStaffProfile() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const db = corpClient()
    const { data, error } = await db
      .from('staff_profiles')
      .select(`
        *,
        assignments:staff_assignments (
          *,
          organization:organizations (id, name, slug, org_type)
        ),
        permissions:staff_permissions (*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('getCurrentStaffProfile error:', error)
      return null
    }

    return data as StaffProfile & {
      assignments: (StaffAssignment & { organization: Organization })[]
      permissions: StaffPermission[]
    }
  } catch (err) {
    console.error('getCurrentStaffProfile error:', err)
    return null
  }
}
