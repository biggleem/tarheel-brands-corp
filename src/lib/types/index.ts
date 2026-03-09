// ============================================================
// Organization & Business Types
// ============================================================

export type OrgType = 'holding' | 'operating' | 'business'

export interface Organization {
  id: string
  parent_id: string | null
  name: string
  slug: string
  org_type: OrgType
  ein: string | null
  address: Record<string, unknown>
  phone: string | null
  email: string | null
  website: string | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  children?: Organization[]
  business?: Business
}

export type BusinessCategory =
  | 'restaurant'
  | 'retail'
  | 'service'
  | 'entertainment'
  | 'real_estate'
  | 'technology'
  | 'other'

export interface Business {
  id: string
  organization_id: string
  category: BusinessCategory
  domain: string | null
  toast_location_id: string | null
  toast_restaurant_id: string | null
  hours_of_operation: Record<string, unknown>
  pos_system: string | null
  tax_rate: number
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  organization?: Organization
}

// ============================================================
// Staff & HR Types
// ============================================================

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern' | 'seasonal'
export type PayType = 'hourly' | 'salary'
export type StaffRole = 'owner' | 'admin' | 'manager' | 'supervisor' | 'employee' | 'viewer'
export type PermissionScope = 'global' | 'organization' | 'business'

export interface StaffProfile {
  id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  hire_date: string
  termination_date: string | null
  employment_type: EmploymentType
  pay_type: PayType
  pay_rate: number | null
  ssn_last_four: string | null
  emergency_contact: Record<string, unknown>
  address: Record<string, unknown>
  is_active: boolean
  avatar_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  assignments?: StaffAssignment[]
}

export interface StaffAssignment {
  id: string
  staff_id: string
  organization_id: string
  role: StaffRole
  title: string | null
  department: string | null
  is_primary: boolean
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  organization?: Organization
  staff?: StaffProfile
}

export interface StaffPermission {
  id: string
  staff_id: string
  organization_id: string | null
  permission: string
  scope: PermissionScope
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TimeEntryStatus = 'active' | 'completed' | 'edited' | 'void'

export interface TimeEntry {
  id: string
  staff_id: string
  organization_id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  total_hours: number | null
  notes: string | null
  status: TimeEntryStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  // Joined
  staff?: StaffProfile
  organization?: Organization
}

export interface PTOBalance {
  id: string
  staff_id: string
  year: number
  pto_type: string
  total_hours: number
  used_hours: number
  pending_hours: number
  remaining_hours: number | null
  created_at: string
  updated_at: string
}

export interface PTORequest {
  id: string
  staff_id: string
  organization_id: string
  pto_type: string
  start_date: string
  end_date: string
  total_hours: number
  notes: string | null
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
  // Joined
  staff?: StaffProfile
}

// ============================================================
// Document Types
// ============================================================

export interface DocumentType {
  id: string
  name: string
  description: string | null
  category: string
  requires_expiry: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  staff_id: string | null
  organization_id: string | null
  document_type_id: string
  title: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  storage_bucket: string
  status: string
  expires_at: string | null
  uploaded_by: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  document_type?: DocumentType
  staff?: StaffProfile
}

// ============================================================
// Accounting Types
// ============================================================

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type NormalBalance = 'debit' | 'credit'
export type JournalSource = 'manual' | 'plaid' | 'toast' | 'recurring' | 'system'
export type JournalStatus = 'draft' | 'posted' | 'void'

export interface ChartOfAccounts {
  id: string
  organization_id: string
  account_number: string
  name: string
  account_type: AccountType
  sub_type: string | null
  parent_account_id: string | null
  description: string | null
  normal_balance: NormalBalance
  is_active: boolean
  is_header: boolean
  created_at: string
  updated_at: string
  // Joined
  children?: ChartOfAccounts[]
}

export interface JournalEntry {
  id: string
  organization_id: string
  entry_number: number
  entry_date: string
  description: string | null
  source: JournalSource
  source_ref: string | null
  status: JournalStatus
  posted_by: string | null
  posted_at: string | null
  reversed_by: string | null
  reversed_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  lines?: JournalEntryLine[]
  organization?: Organization
}

export interface JournalEntryLine {
  id: string
  journal_entry_id: string
  account_id: string
  line_number: number
  description: string | null
  debit: number
  credit: number
  created_at: string
  updated_at: string
  // Joined
  account?: ChartOfAccounts
}

export interface RecurringEntry {
  id: string
  organization_id: string
  name: string
  description: string | null
  frequency: string
  day_of_month: number | null
  day_of_week: number | null
  template_lines: unknown[]
  next_run_date: string | null
  last_run_date: string | null
  end_date: string | null
  is_active: boolean
  auto_post: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Bill & Plaid Types
// ============================================================

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial'

export interface Bill {
  id: string
  organization_id: string
  vendor_name: string
  vendor_account_number: string | null
  bill_number: string | null
  bill_type: string
  category: string | null
  description: string | null
  amount: number
  tax_amount: number
  total_amount: number | null
  due_date: string
  bill_date: string
  status: BillStatus
  paid_amount: number
  balance_due: number | null
  plaid_transaction_id: string | null
  journal_entry_id: string | null
  recurring: boolean
  recurrence_rule: string | null
  file_path: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  organization?: Organization
  payments?: BillPayment[]
}

export interface BillPayment {
  id: string
  bill_id: string
  amount: number
  payment_date: string
  payment_method: string
  reference_number: string | null
  journal_entry_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PlaidItem {
  id: string
  organization_id: string
  plaid_item_id: string
  access_token: string
  institution_id: string | null
  institution_name: string | null
  status: string
  error_code: string | null
  error_message: string | null
  consent_expiry: string | null
  last_synced_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  accounts?: PlaidAccount[]
}

export interface PlaidAccount {
  id: string
  plaid_item_id: string
  organization_id: string
  plaid_account_id: string
  name: string
  official_name: string | null
  account_type: string
  account_subtype: string | null
  mask: string | null
  current_balance: number | null
  available_balance: number | null
  iso_currency_code: string
  linked_coa_id: string | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PlaidTransaction {
  id: string
  plaid_account_id: string
  organization_id: string
  plaid_transaction_id: string
  amount: number
  date: string
  name: string | null
  merchant_name: string | null
  category: string[] | null
  pending: boolean
  payment_channel: string | null
  transaction_type: string | null
  iso_currency_code: string
  matched_bill_id: string | null
  journal_entry_id: string | null
  reconciled: boolean
  reconciled_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Toast POS Types
// ============================================================

export interface ToastImport {
  id: string
  organization_id: string
  file_name: string
  file_path: string | null
  import_type: string
  date_range_start: string | null
  date_range_end: string | null
  row_count: number
  error_count: number
  status: string
  error_log: unknown[]
  imported_by: string | null
  completed_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ToastSale {
  id: string
  organization_id: string
  import_id: string | null
  business_date: string
  order_id: string | null
  order_number: string | null
  server_name: string | null
  revenue_center: string | null
  dining_option: string | null
  item_name: string | null
  item_quantity: number
  gross_amount: number
  discount_amount: number
  net_amount: number
  tax_amount: number
  tip_amount: number
  total_amount: number
  payment_type: string | null
  void_reason: string | null
  is_void: boolean
  raw_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ToastCustomer {
  id: string
  organization_id: string
  toast_customer_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  visit_count: number
  total_spent: number
  last_visit_date: string | null
  rewards_member_id: string | null
  is_opted_in: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Rewards & Campaign Types
// ============================================================

export type RewardsTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface RewardsProgram {
  id: string
  organization_id: string
  name: string
  description: string | null
  points_per_dollar: number
  redemption_rate: number
  min_redemption: number
  welcome_bonus: number
  is_active: boolean
  rules: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RewardsMember {
  id: string
  program_id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  points_balance: number
  lifetime_points: number
  tier: string
  enrolled_at: string
  last_activity_at: string | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RewardsTransaction {
  id: string
  member_id: string
  program_id: string
  transaction_type: string
  points: number
  balance_after: number
  description: string | null
  reference_id: string | null
  reference_type: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  organization_id: string
  name: string
  description: string | null
  campaign_type: string
  status: string
  channel: string | null
  subject_line: string | null
  content: string | null
  template_id: string | null
  scheduled_at: string | null
  sent_at: string | null
  completed_at: string | null
  target_audience: Record<string, unknown>
  budget: number | null
  spend: number
  metrics: Record<string, unknown>
  created_by: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CampaignRecipient {
  id: string
  campaign_id: string
  toast_customer_id: string | null
  rewards_member_id: string | null
  email: string | null
  phone: string | null
  status: string
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Marketing Types
// ============================================================

export interface MarketingPlan {
  id: string
  organization_id: string
  name: string
  description: string | null
  fiscal_year: number
  quarter: number | null
  goals: unknown[]
  budget: number
  allocated_budget: number
  spent_budget: number
  status: string
  created_by: string | null
  approved_by: string | null
  approved_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MarketingCalendarEvent {
  id: string
  organization_id: string
  marketing_plan_id: string | null
  campaign_id: string | null
  title: string
  description: string | null
  event_type: string
  start_date: string
  end_date: string | null
  all_day: boolean
  start_time: string | null
  end_time: string | null
  status: string
  assigned_to: string | null
  color: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Catalog & Orders Types
// ============================================================

export interface CatalogItem {
  id: string
  organization_id: string
  name: string
  sku: string | null
  description: string | null
  category: string | null
  unit_of_measure: string
  unit_cost: number | null
  preferred_vendor: string | null
  reorder_point: number | null
  reorder_qty: number | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  organization_id: string
  po_number: string
  vendor_name: string
  vendor_contact: Record<string, unknown>
  order_date: string
  expected_date: string | null
  received_date: string | null
  status: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number | null
  bill_id: string | null
  notes: string | null
  approved_by: string | null
  approved_at: string | null
  created_by: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  lines?: PurchaseOrderLine[]
}

export interface PurchaseOrderLine {
  id: string
  purchase_order_id: string
  catalog_item_id: string | null
  line_number: number
  description: string
  quantity: number
  unit_cost: number
  line_total: number | null
  received_qty: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Audit & System
// ============================================================

export interface AuditLog {
  id: string
  staff_id: string | null
  user_id: string | null
  organization_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
  // Joined
  staff?: StaffProfile
}

// ============================================================
// P&L Report Types
// ============================================================

export interface PnLReportLine {
  account_number: string
  account_name: string
  account_type: AccountType
  amount: number
  children?: PnLReportLine[]
}

export interface PnLReport {
  organization_id: string
  org_name: string
  period_start: string
  period_end: string
  revenue: PnLReportLine[]
  cogs: PnLReportLine[]
  expenses: PnLReportLine[]
  total_revenue: number
  total_cogs: number
  gross_profit: number
  total_expenses: number
  net_income: number
}

// ============================================================
// Navigation & UI Types
// ============================================================

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
