-- ============================================================================
-- Tarheel Brands Corporation Manager - Database Schema
-- Migration: 001_corp_schema.sql
-- Description: Creates the complete corp schema with all tables, RLS policies,
--              triggers, helper functions, and indexes.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SCHEMA CREATION
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS corp;

-- ============================================================================
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION corp.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES (in dependency order)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 Organizations (self-referencing hierarchy)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid REFERENCES corp.organizations(id) ON DELETE SET NULL,
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  org_type    text NOT NULL CHECK (org_type IN ('holding', 'operating', 'business')),
  ein         text,
  address     jsonb DEFAULT '{}'::jsonb,
  phone       text,
  email       text,
  website     text,
  is_active   boolean NOT NULL DEFAULT true,
  metadata    jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON corp.organizations
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.2 Businesses (extends organizations with business-specific fields)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.businesses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL UNIQUE REFERENCES corp.organizations(id) ON DELETE CASCADE,
  category            text NOT NULL CHECK (category IN (
                        'restaurant', 'retail', 'service', 'entertainment',
                        'real_estate', 'technology', 'other'
                      )),
  domain              text,
  toast_location_id   text,
  toast_restaurant_id text,
  hours_of_operation  jsonb DEFAULT '{}'::jsonb,
  pos_system          text CHECK (pos_system IN ('toast', 'square', 'clover', 'other', NULL)),
  tax_rate            numeric(5,4) DEFAULT 0.0000,
  is_active           boolean NOT NULL DEFAULT true,
  metadata            jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON corp.businesses
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.3 Staff Profiles (linked to auth.users)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.staff_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  email             text NOT NULL,
  phone             text,
  date_of_birth     date,
  hire_date         date NOT NULL DEFAULT CURRENT_DATE,
  termination_date  date,
  employment_type   text NOT NULL DEFAULT 'full_time' CHECK (employment_type IN (
                      'full_time', 'part_time', 'contractor', 'intern', 'seasonal'
                    )),
  pay_type          text NOT NULL DEFAULT 'hourly' CHECK (pay_type IN ('hourly', 'salary')),
  pay_rate          numeric(10,2),
  ssn_last_four     text CHECK (ssn_last_four ~ '^\d{4}$'),
  emergency_contact jsonb DEFAULT '{}'::jsonb,
  address           jsonb DEFAULT '{}'::jsonb,
  is_active         boolean NOT NULL DEFAULT true,
  avatar_url        text,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_staff_profiles_updated_at
  BEFORE UPDATE ON corp.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.4 Staff Assignments (many-to-many staff <-> orgs with role)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.staff_assignments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid NOT NULL REFERENCES corp.staff_profiles(id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  role              text NOT NULL DEFAULT 'employee' CHECK (role IN (
                      'owner', 'admin', 'manager', 'supervisor', 'employee', 'viewer'
                    )),
  title             text,
  department        text,
  is_primary        boolean NOT NULL DEFAULT false,
  start_date        date NOT NULL DEFAULT CURRENT_DATE,
  end_date          date,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, organization_id)
);

CREATE TRIGGER set_staff_assignments_updated_at
  BEFORE UPDATE ON corp.staff_assignments
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.5 Staff Permissions (granular permissions with scope)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.staff_permissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid NOT NULL REFERENCES corp.staff_profiles(id) ON DELETE CASCADE,
  organization_id   uuid REFERENCES corp.organizations(id) ON DELETE CASCADE,
  permission        text NOT NULL,
  scope             text NOT NULL DEFAULT 'organization' CHECK (scope IN (
                      'global', 'organization', 'business'
                    )),
  granted_by        uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  granted_at        timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, organization_id, permission)
);

CREATE TRIGGER set_staff_permissions_updated_at
  BEFORE UPDATE ON corp.staff_permissions
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.6 Time Entries (clock in/out with computed total_hours)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.time_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid NOT NULL REFERENCES corp.staff_profiles(id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  clock_in          timestamptz NOT NULL DEFAULT now(),
  clock_out         timestamptz,
  break_minutes     integer NOT NULL DEFAULT 0 CHECK (break_minutes >= 0),
  total_hours       numeric(6,2) GENERATED ALWAYS AS (
                      CASE
                        WHEN clock_out IS NOT NULL THEN
                          ROUND(
                            EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600.0
                            - (break_minutes / 60.0),
                            2
                          )
                        ELSE NULL
                      END
                    ) STORED,
  notes             text,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'completed', 'edited', 'void'
                    )),
  approved_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_time_entries_updated_at
  BEFORE UPDATE ON corp.time_entries
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.7 PTO Balances (per staff per year per type)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.pto_balances (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid NOT NULL REFERENCES corp.staff_profiles(id) ON DELETE CASCADE,
  year              integer NOT NULL CHECK (year >= 2020 AND year <= 2100),
  pto_type          text NOT NULL CHECK (pto_type IN (
                      'vacation', 'sick', 'personal', 'bereavement', 'jury_duty', 'other'
                    )),
  total_hours       numeric(6,2) NOT NULL DEFAULT 0,
  used_hours        numeric(6,2) NOT NULL DEFAULT 0 CHECK (used_hours >= 0),
  pending_hours     numeric(6,2) NOT NULL DEFAULT 0 CHECK (pending_hours >= 0),
  remaining_hours   numeric(6,2) GENERATED ALWAYS AS (total_hours - used_hours - pending_hours) STORED,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, year, pto_type)
);

CREATE TRIGGER set_pto_balances_updated_at
  BEFORE UPDATE ON corp.pto_balances
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.8 PTO Requests (approval workflow)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.pto_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid NOT NULL REFERENCES corp.staff_profiles(id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  pto_type          text NOT NULL CHECK (pto_type IN (
                      'vacation', 'sick', 'personal', 'bereavement', 'jury_duty', 'other'
                    )),
  start_date        date NOT NULL,
  end_date          date NOT NULL,
  total_hours       numeric(6,2) NOT NULL CHECK (total_hours > 0),
  notes             text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN (
                      'pending', 'approved', 'denied', 'cancelled'
                    )),
  reviewed_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  review_notes      text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TRIGGER set_pto_requests_updated_at
  BEFORE UPDATE ON corp.pto_requests
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.9 Document Types (W-4, I-9, contracts, etc.)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.document_types (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL UNIQUE,
  description       text,
  category          text NOT NULL DEFAULT 'other' CHECK (category IN (
                      'tax', 'employment', 'identity', 'contract', 'policy',
                      'certification', 'legal', 'financial', 'other'
                    )),
  requires_expiry   boolean NOT NULL DEFAULT false,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_document_types_updated_at
  BEFORE UPDATE ON corp.document_types
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.10 Documents (files in Supabase Storage)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid REFERENCES corp.staff_profiles(id) ON DELETE CASCADE,
  organization_id   uuid REFERENCES corp.organizations(id) ON DELETE CASCADE,
  document_type_id  uuid NOT NULL REFERENCES corp.document_types(id) ON DELETE RESTRICT,
  title             text NOT NULL,
  file_name         text NOT NULL,
  file_path         text NOT NULL,
  file_size         bigint,
  mime_type         text,
  storage_bucket    text NOT NULL DEFAULT 'corp-documents',
  status            text NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'archived', 'expired', 'pending_review'
                    )),
  expires_at        date,
  uploaded_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  notes             text,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON corp.documents
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.11 Chart of Accounts (double-entry with account types)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.chart_of_accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  account_number    text NOT NULL,
  name              text NOT NULL,
  account_type      text NOT NULL CHECK (account_type IN (
                      'asset', 'liability', 'equity', 'revenue', 'expense'
                    )),
  sub_type          text,
  parent_account_id uuid REFERENCES corp.chart_of_accounts(id) ON DELETE SET NULL,
  description       text,
  normal_balance    text NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  is_active         boolean NOT NULL DEFAULT true,
  is_header         boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, account_number)
);

CREATE TRIGGER set_chart_of_accounts_updated_at
  BEFORE UPDATE ON corp.chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.12 Journal Entries (headers with source tracking)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.journal_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  entry_number      serial,
  entry_date        date NOT NULL DEFAULT CURRENT_DATE,
  description       text,
  source            text NOT NULL DEFAULT 'manual' CHECK (source IN (
                      'manual', 'auto', 'import', 'recurring', 'system'
                    )),
  source_ref        text,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft', 'posted', 'void', 'reversed'
                    )),
  posted_by         uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  posted_at         timestamptz,
  reversed_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  reversed_at       timestamptz,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_journal_entries_updated_at
  BEFORE UPDATE ON corp.journal_entries
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.13 Journal Entry Lines (debit/credit lines)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.journal_entry_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id  uuid NOT NULL REFERENCES corp.journal_entries(id) ON DELETE CASCADE,
  account_id        uuid NOT NULL REFERENCES corp.chart_of_accounts(id) ON DELETE RESTRICT,
  line_number       integer NOT NULL DEFAULT 1,
  description       text,
  debit             numeric(14,2) NOT NULL DEFAULT 0.00 CHECK (debit >= 0),
  credit            numeric(14,2) NOT NULL DEFAULT 0.00 CHECK (credit >= 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (debit > 0 OR credit > 0),
  CHECK (NOT (debit > 0 AND credit > 0))
);

CREATE TRIGGER set_journal_entry_lines_updated_at
  BEFORE UPDATE ON corp.journal_entry_lines
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.14 Recurring Entries (auto-posting templates)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.recurring_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  frequency         text NOT NULL CHECK (frequency IN (
                      'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'
                    )),
  day_of_month      integer CHECK (day_of_month >= 1 AND day_of_month <= 31),
  day_of_week       integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  template_lines    jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_run_date     date,
  last_run_date     date,
  end_date          date,
  is_active         boolean NOT NULL DEFAULT true,
  auto_post         boolean NOT NULL DEFAULT false,
  created_by        uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_recurring_entries_updated_at
  BEFORE UPDATE ON corp.recurring_entries
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.15 Bills (all bill types across businesses)
--       NOTE: plaid_transaction_id FK added later via ALTER TABLE to avoid
--       circular reference issues (plaid_transactions references bills too).
-- ----------------------------------------------------------------------------

CREATE TABLE corp.bills (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  vendor_name           text NOT NULL,
  vendor_account_number text,
  bill_number           text,
  bill_type             text NOT NULL DEFAULT 'expense' CHECK (bill_type IN (
                          'expense', 'utility', 'rent', 'insurance', 'tax',
                          'payroll', 'supply', 'service', 'loan', 'other'
                        )),
  category              text,
  description           text,
  amount                numeric(14,2) NOT NULL CHECK (amount > 0),
  tax_amount            numeric(14,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount          numeric(14,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
  due_date              date NOT NULL,
  bill_date             date NOT NULL DEFAULT CURRENT_DATE,
  status                text NOT NULL DEFAULT 'pending' CHECK (status IN (
                          'pending', 'partial', 'paid', 'overdue', 'void', 'disputed'
                        )),
  paid_amount           numeric(14,2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
  balance_due           numeric(14,2) GENERATED ALWAYS AS (amount + tax_amount - paid_amount) STORED,
  plaid_transaction_id  uuid,  -- FK added later via ALTER TABLE
  journal_entry_id      uuid REFERENCES corp.journal_entries(id) ON DELETE SET NULL,
  recurring             boolean NOT NULL DEFAULT false,
  recurrence_rule       text,
  file_path             text,
  notes                 text,
  metadata              jsonb DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_bills_updated_at
  BEFORE UPDATE ON corp.bills
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.16 Bill Payments (payment history)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.bill_payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id           uuid NOT NULL REFERENCES corp.bills(id) ON DELETE CASCADE,
  amount            numeric(14,2) NOT NULL CHECK (amount > 0),
  payment_date      date NOT NULL DEFAULT CURRENT_DATE,
  payment_method    text NOT NULL DEFAULT 'check' CHECK (payment_method IN (
                      'check', 'ach', 'wire', 'credit_card', 'debit_card',
                      'cash', 'other'
                    )),
  reference_number  text,
  journal_entry_id  uuid REFERENCES corp.journal_entries(id) ON DELETE SET NULL,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_bill_payments_updated_at
  BEFORE UPDATE ON corp.bill_payments
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.17 Plaid Items (connected institutions)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.plaid_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  plaid_item_id     text NOT NULL UNIQUE,
  access_token      text NOT NULL,
  institution_id    text,
  institution_name  text,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'error', 'login_required', 'disconnected'
                    )),
  error_code        text,
  error_message     text,
  consent_expiry    timestamptz,
  last_synced_at    timestamptz,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_plaid_items_updated_at
  BEFORE UPDATE ON corp.plaid_items
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.18 Plaid Accounts (bank accounts)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.plaid_accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_item_id     uuid NOT NULL REFERENCES corp.plaid_items(id) ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  plaid_account_id  text NOT NULL UNIQUE,
  name              text NOT NULL,
  official_name     text,
  account_type      text NOT NULL,
  account_subtype   text,
  mask              text,
  current_balance   numeric(14,2),
  available_balance numeric(14,2),
  iso_currency_code text DEFAULT 'USD',
  linked_coa_id     uuid REFERENCES corp.chart_of_accounts(id) ON DELETE SET NULL,
  is_active         boolean NOT NULL DEFAULT true,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_plaid_accounts_updated_at
  BEFORE UPDATE ON corp.plaid_accounts
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.19 Plaid Transactions (imported transactions)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.plaid_transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_account_id      uuid NOT NULL REFERENCES corp.plaid_accounts(id) ON DELETE CASCADE,
  organization_id       uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  plaid_transaction_id  text NOT NULL UNIQUE,
  amount                numeric(14,2) NOT NULL,
  date                  date NOT NULL,
  name                  text,
  merchant_name         text,
  category              text[],
  pending               boolean NOT NULL DEFAULT false,
  payment_channel       text,
  transaction_type      text,
  iso_currency_code     text DEFAULT 'USD',
  matched_bill_id       uuid REFERENCES corp.bills(id) ON DELETE SET NULL,
  journal_entry_id      uuid REFERENCES corp.journal_entries(id) ON DELETE SET NULL,
  reconciled            boolean NOT NULL DEFAULT false,
  reconciled_at         timestamptz,
  metadata              jsonb DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_plaid_transactions_updated_at
  BEFORE UPDATE ON corp.plaid_transactions
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- Now add the deferred FK from bills -> plaid_transactions
ALTER TABLE corp.bills
  ADD CONSTRAINT fk_bills_plaid_transaction
  FOREIGN KEY (plaid_transaction_id)
  REFERENCES corp.plaid_transactions(id)
  ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3.20 Catalog Items (supply catalog)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.catalog_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  sku               text,
  description       text,
  category          text,
  unit_of_measure   text NOT NULL DEFAULT 'each',
  unit_cost         numeric(10,2),
  preferred_vendor  text,
  reorder_point     integer,
  reorder_qty       integer,
  is_active         boolean NOT NULL DEFAULT true,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, sku)
);

CREATE TRIGGER set_catalog_items_updated_at
  BEFORE UPDATE ON corp.catalog_items
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.21 Purchase Orders (PO tracking)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.purchase_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  po_number         text NOT NULL,
  vendor_name       text NOT NULL,
  vendor_contact    jsonb DEFAULT '{}'::jsonb,
  order_date        date NOT NULL DEFAULT CURRENT_DATE,
  expected_date     date,
  received_date     date,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft', 'submitted', 'approved', 'ordered',
                      'partial_received', 'received', 'cancelled', 'void'
                    )),
  subtotal          numeric(14,2) NOT NULL DEFAULT 0.00,
  tax_amount        numeric(14,2) NOT NULL DEFAULT 0.00,
  shipping_amount   numeric(14,2) NOT NULL DEFAULT 0.00,
  total_amount      numeric(14,2) GENERATED ALWAYS AS (subtotal + tax_amount + shipping_amount) STORED,
  bill_id           uuid REFERENCES corp.bills(id) ON DELETE SET NULL,
  notes             text,
  approved_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  created_by        uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, po_number)
);

CREATE TRIGGER set_purchase_orders_updated_at
  BEFORE UPDATE ON corp.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.22 Purchase Order Lines (PO line items)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.purchase_order_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES corp.purchase_orders(id) ON DELETE CASCADE,
  catalog_item_id   uuid REFERENCES corp.catalog_items(id) ON DELETE SET NULL,
  line_number       integer NOT NULL DEFAULT 1,
  description       text NOT NULL,
  quantity          numeric(10,2) NOT NULL CHECK (quantity > 0),
  unit_cost         numeric(10,2) NOT NULL CHECK (unit_cost >= 0),
  line_total        numeric(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  received_qty      numeric(10,2) NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_purchase_order_lines_updated_at
  BEFORE UPDATE ON corp.purchase_order_lines
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.23 Toast Imports (CSV import tracking)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.toast_imports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  file_name         text NOT NULL,
  file_path         text,
  import_type       text NOT NULL CHECK (import_type IN (
                      'sales', 'labor', 'menu', 'payments', 'items', 'customers', 'other'
                    )),
  date_range_start  date,
  date_range_end    date,
  row_count         integer NOT NULL DEFAULT 0,
  error_count       integer NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN (
                      'pending', 'processing', 'completed', 'failed', 'partial'
                    )),
  error_log         jsonb DEFAULT '[]'::jsonb,
  imported_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  completed_at      timestamptz,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_toast_imports_updated_at
  BEFORE UPDATE ON corp.toast_imports
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.24 Toast Sales (imported sales data)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.toast_sales (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  import_id           uuid REFERENCES corp.toast_imports(id) ON DELETE SET NULL,
  business_date       date NOT NULL,
  order_id            text,
  order_number        text,
  server_name         text,
  revenue_center      text,
  dining_option       text,
  item_name           text,
  item_quantity        integer DEFAULT 1,
  gross_amount        numeric(10,2) NOT NULL DEFAULT 0.00,
  discount_amount     numeric(10,2) NOT NULL DEFAULT 0.00,
  net_amount          numeric(10,2) NOT NULL DEFAULT 0.00,
  tax_amount          numeric(10,2) NOT NULL DEFAULT 0.00,
  tip_amount          numeric(10,2) NOT NULL DEFAULT 0.00,
  total_amount        numeric(10,2) NOT NULL DEFAULT 0.00,
  payment_type        text,
  void_reason         text,
  is_void             boolean NOT NULL DEFAULT false,
  raw_data            jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_toast_sales_updated_at
  BEFORE UPDATE ON corp.toast_sales
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.25 Rewards Programs (Tarheel Rewards config)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.rewards_programs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  points_per_dollar numeric(6,2) NOT NULL DEFAULT 1.00,
  redemption_rate   numeric(6,4) NOT NULL DEFAULT 0.01,
  min_redemption    integer NOT NULL DEFAULT 100,
  welcome_bonus     integer NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  rules             jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_rewards_programs_updated_at
  BEFORE UPDATE ON corp.rewards_programs
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.26 Rewards Members (loyalty members)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.rewards_members (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id        uuid NOT NULL REFERENCES corp.rewards_programs(id) ON DELETE CASCADE,
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  email             text NOT NULL,
  phone             text,
  points_balance    integer NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  lifetime_points   integer NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
  tier              text NOT NULL DEFAULT 'bronze' CHECK (tier IN (
                      'bronze', 'silver', 'gold', 'platinum'
                    )),
  enrolled_at       timestamptz NOT NULL DEFAULT now(),
  last_activity_at  timestamptz,
  is_active         boolean NOT NULL DEFAULT true,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, email)
);

CREATE TRIGGER set_rewards_members_updated_at
  BEFORE UPDATE ON corp.rewards_members
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.27 Rewards Transactions (points history)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.rewards_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         uuid NOT NULL REFERENCES corp.rewards_members(id) ON DELETE CASCADE,
  program_id        uuid NOT NULL REFERENCES corp.rewards_programs(id) ON DELETE CASCADE,
  transaction_type  text NOT NULL CHECK (transaction_type IN (
                      'earn', 'redeem', 'bonus', 'adjustment', 'expire'
                    )),
  points            integer NOT NULL,
  balance_after     integer NOT NULL DEFAULT 0,
  description       text,
  reference_id      text,
  reference_type    text,
  created_by        uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_rewards_transactions_updated_at
  BEFORE UPDATE ON corp.rewards_transactions
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.28 Toast Customers (customer data from Toast)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.toast_customers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  toast_customer_id text,
  first_name        text,
  last_name         text,
  email             text,
  phone             text,
  visit_count       integer NOT NULL DEFAULT 0,
  total_spent       numeric(10,2) NOT NULL DEFAULT 0.00,
  last_visit_date   date,
  rewards_member_id uuid REFERENCES corp.rewards_members(id) ON DELETE SET NULL,
  is_opted_in       boolean NOT NULL DEFAULT false,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, toast_customer_id)
);

CREATE TRIGGER set_toast_customers_updated_at
  BEFORE UPDATE ON corp.toast_customers
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.29 Campaigns (marketing campaigns)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.campaigns (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  campaign_type     text NOT NULL DEFAULT 'email' CHECK (campaign_type IN (
                      'email', 'sms', 'push', 'social', 'print', 'event', 'multi_channel'
                    )),
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
                    )),
  channel           text,
  subject_line      text,
  content           text,
  template_id       text,
  scheduled_at      timestamptz,
  sent_at           timestamptz,
  completed_at      timestamptz,
  target_audience   jsonb DEFAULT '{}'::jsonb,
  budget            numeric(10,2),
  spend             numeric(10,2) NOT NULL DEFAULT 0.00,
  metrics           jsonb DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "converted": 0}'::jsonb,
  created_by        uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON corp.campaigns
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.30 Campaign Recipients (targeting)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.campaign_recipients (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid NOT NULL REFERENCES corp.campaigns(id) ON DELETE CASCADE,
  toast_customer_id uuid REFERENCES corp.toast_customers(id) ON DELETE SET NULL,
  rewards_member_id uuid REFERENCES corp.rewards_members(id) ON DELETE SET NULL,
  email             text,
  phone             text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN (
                      'pending', 'sent', 'delivered', 'opened', 'clicked',
                      'bounced', 'unsubscribed', 'failed'
                    )),
  sent_at           timestamptz,
  opened_at         timestamptz,
  clicked_at        timestamptz,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_campaign_recipients_updated_at
  BEFORE UPDATE ON corp.campaign_recipients
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.31 Marketing Plans (strategy per business)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.marketing_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  description       text,
  fiscal_year       integer NOT NULL,
  quarter           integer CHECK (quarter >= 1 AND quarter <= 4),
  goals             jsonb DEFAULT '[]'::jsonb,
  budget            numeric(12,2) NOT NULL DEFAULT 0.00,
  allocated_budget  numeric(12,2) NOT NULL DEFAULT 0.00,
  spent_budget      numeric(12,2) NOT NULL DEFAULT 0.00,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN (
                      'draft', 'active', 'completed', 'archived'
                    )),
  created_by        uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  approved_by       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  approved_at       timestamptz,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_marketing_plans_updated_at
  BEFORE UPDATE ON corp.marketing_plans
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.32 Marketing Calendar (events)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.marketing_calendar (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES corp.organizations(id) ON DELETE CASCADE,
  marketing_plan_id uuid REFERENCES corp.marketing_plans(id) ON DELETE SET NULL,
  campaign_id       uuid REFERENCES corp.campaigns(id) ON DELETE SET NULL,
  title             text NOT NULL,
  description       text,
  event_type        text NOT NULL DEFAULT 'campaign' CHECK (event_type IN (
                      'campaign', 'promotion', 'holiday', 'event', 'content',
                      'social_post', 'deadline', 'meeting', 'other'
                    )),
  start_date        date NOT NULL,
  end_date          date,
  all_day           boolean NOT NULL DEFAULT true,
  start_time        time,
  end_time          time,
  status            text NOT NULL DEFAULT 'planned' CHECK (status IN (
                      'planned', 'in_progress', 'completed', 'cancelled'
                    )),
  assigned_to       uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  color             text,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_marketing_calendar_updated_at
  BEFORE UPDATE ON corp.marketing_calendar
  FOR EACH ROW EXECUTE FUNCTION corp.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3.33 Audit Logs (all system actions)
-- ----------------------------------------------------------------------------

CREATE TABLE corp.audit_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id          uuid REFERENCES corp.staff_profiles(id) ON DELETE SET NULL,
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id   uuid REFERENCES corp.organizations(id) ON DELETE SET NULL,
  action            text NOT NULL,
  table_name        text,
  record_id         uuid,
  old_values        jsonb,
  new_values        jsonb,
  ip_address        inet,
  user_agent        text,
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Audit logs are append-only: no updated_at trigger needed.

-- ============================================================================
-- 4. RLS HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Get the current staff_id for the authenticated user
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION corp.current_staff_id()
RETURNS uuid AS $$
  SELECT id
  FROM corp.staff_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 4.2 Check if the current user has a specific permission for an org
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION corp.has_permission(p_permission text, p_org_id uuid DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
  v_staff_id uuid;
BEGIN
  v_staff_id := corp.current_staff_id();
  IF v_staff_id IS NULL THEN
    RETURN false;
  END IF;

  -- Owners and admins at the holding level have all permissions
  IF EXISTS (
    SELECT 1 FROM corp.staff_assignments sa
    JOIN corp.organizations o ON o.id = sa.organization_id
    WHERE sa.staff_id = v_staff_id
      AND sa.is_active = true
      AND sa.role IN ('owner', 'admin')
      AND o.org_type = 'holding'
  ) THEN
    RETURN true;
  END IF;

  -- Check explicit permission
  RETURN EXISTS (
    SELECT 1 FROM corp.staff_permissions sp
    WHERE sp.staff_id = v_staff_id
      AND sp.is_active = true
      AND sp.permission = p_permission
      AND (sp.expires_at IS NULL OR sp.expires_at > now())
      AND (
        sp.scope = 'global'
        OR (p_org_id IS NOT NULL AND sp.organization_id = p_org_id)
      )
  )
  -- Or check role-based access
  OR EXISTS (
    SELECT 1 FROM corp.staff_assignments sa
    WHERE sa.staff_id = v_staff_id
      AND sa.is_active = true
      AND (p_org_id IS NULL OR sa.organization_id = p_org_id)
      AND sa.role IN ('owner', 'admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 4.3 Get all organization IDs accessible to the current user
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION corp.accessible_org_ids()
RETURNS SETOF uuid AS $$
DECLARE
  v_staff_id uuid;
  v_is_holding_admin boolean;
BEGIN
  v_staff_id := corp.current_staff_id();
  IF v_staff_id IS NULL THEN
    RETURN;
  END IF;

  -- Check if user is a holding-level owner/admin
  SELECT EXISTS (
    SELECT 1 FROM corp.staff_assignments sa
    JOIN corp.organizations o ON o.id = sa.organization_id
    WHERE sa.staff_id = v_staff_id
      AND sa.is_active = true
      AND sa.role IN ('owner', 'admin')
      AND o.org_type = 'holding'
  ) INTO v_is_holding_admin;

  IF v_is_holding_admin THEN
    -- Return all organizations
    RETURN QUERY SELECT id FROM corp.organizations;
  ELSE
    -- Return only assigned organizations and their children
    RETURN QUERY
      WITH RECURSIVE org_tree AS (
        SELECT o.id
        FROM corp.organizations o
        JOIN corp.staff_assignments sa ON sa.organization_id = o.id
        WHERE sa.staff_id = v_staff_id AND sa.is_active = true
        UNION
        SELECT o.id
        FROM corp.organizations o
        JOIN org_tree ot ON o.parent_id = ot.id
      )
      SELECT id FROM org_tree;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 5. ENABLE RLS ON ALL TABLES + POLICIES
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE corp.organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.staff_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.staff_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.staff_permissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.time_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.pto_balances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.pto_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.document_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.chart_of_accounts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.journal_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.recurring_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.bills               ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.bill_payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.plaid_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.plaid_accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.plaid_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.catalog_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.purchase_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.toast_imports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.toast_sales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.rewards_programs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.rewards_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.rewards_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.toast_customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.marketing_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.marketing_calendar  ENABLE ROW LEVEL SECURITY;
ALTER TABLE corp.audit_logs          ENABLE ROW LEVEL SECURITY;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- POLICIES: Organization-scoped tables (use accessible_org_ids)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Organizations
CREATE POLICY "org_select" ON corp.organizations
  FOR SELECT USING (id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "org_insert" ON corp.organizations
  FOR INSERT WITH CHECK (corp.has_permission('org.manage'));
CREATE POLICY "org_update" ON corp.organizations
  FOR UPDATE USING (corp.has_permission('org.manage', id));
CREATE POLICY "org_delete" ON corp.organizations
  FOR DELETE USING (corp.has_permission('org.manage', id));

-- Businesses
CREATE POLICY "biz_select" ON corp.businesses
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "biz_insert" ON corp.businesses
  FOR INSERT WITH CHECK (corp.has_permission('org.manage', organization_id));
CREATE POLICY "biz_update" ON corp.businesses
  FOR UPDATE USING (corp.has_permission('org.manage', organization_id));
CREATE POLICY "biz_delete" ON corp.businesses
  FOR DELETE USING (corp.has_permission('org.manage', organization_id));

-- Staff Profiles: users can see their own; managers see their org's staff
CREATE POLICY "staff_select_own" ON corp.staff_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "staff_select_managed" ON corp.staff_profiles
  FOR SELECT USING (
    id IN (
      SELECT sa.staff_id FROM corp.staff_assignments sa
      WHERE sa.organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "staff_insert" ON corp.staff_profiles
  FOR INSERT WITH CHECK (corp.has_permission('staff.manage'));
CREATE POLICY "staff_update_own" ON corp.staff_profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "staff_update_managed" ON corp.staff_profiles
  FOR UPDATE USING (corp.has_permission('staff.manage'));

-- Staff Assignments
CREATE POLICY "sa_select" ON corp.staff_assignments
  FOR SELECT USING (
    organization_id IN (SELECT corp.accessible_org_ids())
    OR staff_id = corp.current_staff_id()
  );
CREATE POLICY "sa_insert" ON corp.staff_assignments
  FOR INSERT WITH CHECK (corp.has_permission('staff.manage', organization_id));
CREATE POLICY "sa_update" ON corp.staff_assignments
  FOR UPDATE USING (corp.has_permission('staff.manage', organization_id));
CREATE POLICY "sa_delete" ON corp.staff_assignments
  FOR DELETE USING (corp.has_permission('staff.manage', organization_id));

-- Staff Permissions
CREATE POLICY "sp_select" ON corp.staff_permissions
  FOR SELECT USING (
    organization_id IN (SELECT corp.accessible_org_ids())
    OR staff_id = corp.current_staff_id()
  );
CREATE POLICY "sp_insert" ON corp.staff_permissions
  FOR INSERT WITH CHECK (corp.has_permission('permissions.manage', organization_id));
CREATE POLICY "sp_update" ON corp.staff_permissions
  FOR UPDATE USING (corp.has_permission('permissions.manage', organization_id));
CREATE POLICY "sp_delete" ON corp.staff_permissions
  FOR DELETE USING (corp.has_permission('permissions.manage', organization_id));

-- Time Entries
CREATE POLICY "te_select" ON corp.time_entries
  FOR SELECT USING (
    staff_id = corp.current_staff_id()
    OR organization_id IN (SELECT corp.accessible_org_ids())
  );
CREATE POLICY "te_insert" ON corp.time_entries
  FOR INSERT WITH CHECK (
    staff_id = corp.current_staff_id()
    OR corp.has_permission('time.manage', organization_id)
  );
CREATE POLICY "te_update" ON corp.time_entries
  FOR UPDATE USING (
    (staff_id = corp.current_staff_id() AND status = 'active')
    OR corp.has_permission('time.manage', organization_id)
  );
CREATE POLICY "te_delete" ON corp.time_entries
  FOR DELETE USING (corp.has_permission('time.manage', organization_id));

-- PTO Balances
CREATE POLICY "ptob_select" ON corp.pto_balances
  FOR SELECT USING (
    staff_id = corp.current_staff_id()
    OR corp.has_permission('pto.manage')
  );
CREATE POLICY "ptob_manage" ON corp.pto_balances
  FOR ALL USING (corp.has_permission('pto.manage'));

-- PTO Requests
CREATE POLICY "ptor_select" ON corp.pto_requests
  FOR SELECT USING (
    staff_id = corp.current_staff_id()
    OR organization_id IN (SELECT corp.accessible_org_ids())
  );
CREATE POLICY "ptor_insert" ON corp.pto_requests
  FOR INSERT WITH CHECK (staff_id = corp.current_staff_id());
CREATE POLICY "ptor_update_own" ON corp.pto_requests
  FOR UPDATE USING (
    staff_id = corp.current_staff_id() AND status = 'pending'
  );
CREATE POLICY "ptor_update_manager" ON corp.pto_requests
  FOR UPDATE USING (corp.has_permission('pto.approve', organization_id));

-- Document Types (read by all authenticated, managed by admins)
CREATE POLICY "dt_select" ON corp.document_types
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "dt_manage" ON corp.document_types
  FOR ALL USING (corp.has_permission('documents.manage'));

-- Documents
CREATE POLICY "doc_select" ON corp.documents
  FOR SELECT USING (
    (staff_id = corp.current_staff_id())
    OR (organization_id IN (SELECT corp.accessible_org_ids()))
  );
CREATE POLICY "doc_insert" ON corp.documents
  FOR INSERT WITH CHECK (
    staff_id = corp.current_staff_id()
    OR corp.has_permission('documents.manage', organization_id)
  );
CREATE POLICY "doc_update" ON corp.documents
  FOR UPDATE USING (corp.has_permission('documents.manage', organization_id));
CREATE POLICY "doc_delete" ON corp.documents
  FOR DELETE USING (corp.has_permission('documents.manage', organization_id));

-- Chart of Accounts
CREATE POLICY "coa_select" ON corp.chart_of_accounts
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "coa_manage" ON corp.chart_of_accounts
  FOR ALL USING (corp.has_permission('accounting.manage', organization_id));

-- Journal Entries
CREATE POLICY "je_select" ON corp.journal_entries
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "je_insert" ON corp.journal_entries
  FOR INSERT WITH CHECK (corp.has_permission('accounting.post', organization_id));
CREATE POLICY "je_update" ON corp.journal_entries
  FOR UPDATE USING (corp.has_permission('accounting.post', organization_id));

-- Journal Entry Lines
CREATE POLICY "jel_select" ON corp.journal_entry_lines
  FOR SELECT USING (
    journal_entry_id IN (
      SELECT id FROM corp.journal_entries
      WHERE organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "jel_manage" ON corp.journal_entry_lines
  FOR ALL USING (
    journal_entry_id IN (
      SELECT id FROM corp.journal_entries je
      WHERE corp.has_permission('accounting.post', je.organization_id)
    )
  );

-- Recurring Entries
CREATE POLICY "re_select" ON corp.recurring_entries
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "re_manage" ON corp.recurring_entries
  FOR ALL USING (corp.has_permission('accounting.manage', organization_id));

-- Bills
CREATE POLICY "bill_select" ON corp.bills
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "bill_insert" ON corp.bills
  FOR INSERT WITH CHECK (corp.has_permission('bills.manage', organization_id));
CREATE POLICY "bill_update" ON corp.bills
  FOR UPDATE USING (corp.has_permission('bills.manage', organization_id));
CREATE POLICY "bill_delete" ON corp.bills
  FOR DELETE USING (corp.has_permission('bills.manage', organization_id));

-- Bill Payments
CREATE POLICY "bp_select" ON corp.bill_payments
  FOR SELECT USING (
    bill_id IN (
      SELECT id FROM corp.bills
      WHERE organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "bp_manage" ON corp.bill_payments
  FOR ALL USING (
    bill_id IN (
      SELECT id FROM corp.bills b
      WHERE corp.has_permission('bills.pay', b.organization_id)
    )
  );

-- Plaid Items
CREATE POLICY "pi_select" ON corp.plaid_items
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "pi_manage" ON corp.plaid_items
  FOR ALL USING (corp.has_permission('banking.manage', organization_id));

-- Plaid Accounts
CREATE POLICY "pa_select" ON corp.plaid_accounts
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "pa_manage" ON corp.plaid_accounts
  FOR ALL USING (corp.has_permission('banking.manage', organization_id));

-- Plaid Transactions
CREATE POLICY "pt_select" ON corp.plaid_transactions
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "pt_manage" ON corp.plaid_transactions
  FOR ALL USING (corp.has_permission('banking.manage', organization_id));

-- Catalog Items
CREATE POLICY "ci_select" ON corp.catalog_items
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "ci_manage" ON corp.catalog_items
  FOR ALL USING (corp.has_permission('inventory.manage', organization_id));

-- Purchase Orders
CREATE POLICY "po_select" ON corp.purchase_orders
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "po_insert" ON corp.purchase_orders
  FOR INSERT WITH CHECK (corp.has_permission('purchasing.create', organization_id));
CREATE POLICY "po_update" ON corp.purchase_orders
  FOR UPDATE USING (corp.has_permission('purchasing.manage', organization_id));

-- Purchase Order Lines
CREATE POLICY "pol_select" ON corp.purchase_order_lines
  FOR SELECT USING (
    purchase_order_id IN (
      SELECT id FROM corp.purchase_orders
      WHERE organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "pol_manage" ON corp.purchase_order_lines
  FOR ALL USING (
    purchase_order_id IN (
      SELECT id FROM corp.purchase_orders po
      WHERE corp.has_permission('purchasing.manage', po.organization_id)
    )
  );

-- Toast Imports
CREATE POLICY "ti_select" ON corp.toast_imports
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "ti_manage" ON corp.toast_imports
  FOR ALL USING (corp.has_permission('toast.import', organization_id));

-- Toast Sales
CREATE POLICY "ts_select" ON corp.toast_sales
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "ts_manage" ON corp.toast_sales
  FOR ALL USING (corp.has_permission('toast.import', organization_id));

-- Rewards Programs
CREATE POLICY "rp_select" ON corp.rewards_programs
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "rp_manage" ON corp.rewards_programs
  FOR ALL USING (corp.has_permission('rewards.manage', organization_id));

-- Rewards Members
CREATE POLICY "rm_select" ON corp.rewards_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR program_id IN (
      SELECT id FROM corp.rewards_programs
      WHERE organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "rm_manage" ON corp.rewards_members
  FOR ALL USING (
    program_id IN (
      SELECT id FROM corp.rewards_programs rp
      WHERE corp.has_permission('rewards.manage', rp.organization_id)
    )
  );

-- Rewards Transactions
CREATE POLICY "rt_select" ON corp.rewards_transactions
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM corp.rewards_members WHERE user_id = auth.uid()
    )
    OR program_id IN (
      SELECT id FROM corp.rewards_programs
      WHERE organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "rt_manage" ON corp.rewards_transactions
  FOR ALL USING (
    program_id IN (
      SELECT id FROM corp.rewards_programs rp
      WHERE corp.has_permission('rewards.manage', rp.organization_id)
    )
  );

-- Toast Customers
CREATE POLICY "tc_select" ON corp.toast_customers
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "tc_manage" ON corp.toast_customers
  FOR ALL USING (corp.has_permission('customers.manage', organization_id));

-- Campaigns
CREATE POLICY "camp_select" ON corp.campaigns
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "camp_manage" ON corp.campaigns
  FOR ALL USING (corp.has_permission('marketing.manage', organization_id));

-- Campaign Recipients
CREATE POLICY "cr_select" ON corp.campaign_recipients
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM corp.campaigns
      WHERE organization_id IN (SELECT corp.accessible_org_ids())
    )
  );
CREATE POLICY "cr_manage" ON corp.campaign_recipients
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM corp.campaigns c
      WHERE corp.has_permission('marketing.manage', c.organization_id)
    )
  );

-- Marketing Plans
CREATE POLICY "mp_select" ON corp.marketing_plans
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "mp_manage" ON corp.marketing_plans
  FOR ALL USING (corp.has_permission('marketing.manage', organization_id));

-- Marketing Calendar
CREATE POLICY "mc_select" ON corp.marketing_calendar
  FOR SELECT USING (organization_id IN (SELECT corp.accessible_org_ids()));
CREATE POLICY "mc_manage" ON corp.marketing_calendar
  FOR ALL USING (corp.has_permission('marketing.manage', organization_id));

-- Audit Logs (read-only for authorized users, insert by system)
CREATE POLICY "al_select" ON corp.audit_logs
  FOR SELECT USING (
    organization_id IN (SELECT corp.accessible_org_ids())
    OR corp.has_permission('audit.view')
  );
CREATE POLICY "al_insert" ON corp.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- 6. INDEXES
-- ============================================================================

-- Organizations
CREATE INDEX idx_organizations_parent_id ON corp.organizations(parent_id);
CREATE INDEX idx_organizations_org_type ON corp.organizations(org_type);
CREATE INDEX idx_organizations_slug ON corp.organizations(slug);
CREATE INDEX idx_organizations_is_active ON corp.organizations(is_active);

-- Businesses
CREATE INDEX idx_businesses_organization_id ON corp.businesses(organization_id);
CREATE INDEX idx_businesses_category ON corp.businesses(category);
CREATE INDEX idx_businesses_toast_location_id ON corp.businesses(toast_location_id);

-- Staff Profiles
CREATE INDEX idx_staff_profiles_user_id ON corp.staff_profiles(user_id);
CREATE INDEX idx_staff_profiles_email ON corp.staff_profiles(email);
CREATE INDEX idx_staff_profiles_is_active ON corp.staff_profiles(is_active);

-- Staff Assignments
CREATE INDEX idx_staff_assignments_staff_id ON corp.staff_assignments(staff_id);
CREATE INDEX idx_staff_assignments_org_id ON corp.staff_assignments(organization_id);
CREATE INDEX idx_staff_assignments_role ON corp.staff_assignments(role);
CREATE INDEX idx_staff_assignments_active ON corp.staff_assignments(is_active);

-- Staff Permissions
CREATE INDEX idx_staff_permissions_staff_id ON corp.staff_permissions(staff_id);
CREATE INDEX idx_staff_permissions_org_id ON corp.staff_permissions(organization_id);
CREATE INDEX idx_staff_permissions_permission ON corp.staff_permissions(permission);

-- Time Entries
CREATE INDEX idx_time_entries_staff_id ON corp.time_entries(staff_id);
CREATE INDEX idx_time_entries_org_id ON corp.time_entries(organization_id);
CREATE INDEX idx_time_entries_clock_in ON corp.time_entries(clock_in);
CREATE INDEX idx_time_entries_status ON corp.time_entries(status);

-- PTO Balances
CREATE INDEX idx_pto_balances_staff_year ON corp.pto_balances(staff_id, year);

-- PTO Requests
CREATE INDEX idx_pto_requests_staff_id ON corp.pto_requests(staff_id);
CREATE INDEX idx_pto_requests_org_id ON corp.pto_requests(organization_id);
CREATE INDEX idx_pto_requests_status ON corp.pto_requests(status);
CREATE INDEX idx_pto_requests_dates ON corp.pto_requests(start_date, end_date);

-- Documents
CREATE INDEX idx_documents_staff_id ON corp.documents(staff_id);
CREATE INDEX idx_documents_org_id ON corp.documents(organization_id);
CREATE INDEX idx_documents_type_id ON corp.documents(document_type_id);
CREATE INDEX idx_documents_status ON corp.documents(status);

-- Chart of Accounts
CREATE INDEX idx_coa_org_id ON corp.chart_of_accounts(organization_id);
CREATE INDEX idx_coa_account_type ON corp.chart_of_accounts(account_type);
CREATE INDEX idx_coa_parent_id ON corp.chart_of_accounts(parent_account_id);

-- Journal Entries
CREATE INDEX idx_je_org_id ON corp.journal_entries(organization_id);
CREATE INDEX idx_je_entry_date ON corp.journal_entries(entry_date);
CREATE INDEX idx_je_status ON corp.journal_entries(status);
CREATE INDEX idx_je_source ON corp.journal_entries(source);

-- Journal Entry Lines
CREATE INDEX idx_jel_journal_entry_id ON corp.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_jel_account_id ON corp.journal_entry_lines(account_id);

-- Recurring Entries
CREATE INDEX idx_re_org_id ON corp.recurring_entries(organization_id);
CREATE INDEX idx_re_next_run ON corp.recurring_entries(next_run_date);
CREATE INDEX idx_re_active ON corp.recurring_entries(is_active);

-- Bills
CREATE INDEX idx_bills_org_id ON corp.bills(organization_id);
CREATE INDEX idx_bills_status ON corp.bills(status);
CREATE INDEX idx_bills_due_date ON corp.bills(due_date);
CREATE INDEX idx_bills_vendor ON corp.bills(vendor_name);
CREATE INDEX idx_bills_bill_type ON corp.bills(bill_type);

-- Bill Payments
CREATE INDEX idx_bp_bill_id ON corp.bill_payments(bill_id);
CREATE INDEX idx_bp_payment_date ON corp.bill_payments(payment_date);

-- Plaid Items
CREATE INDEX idx_plaid_items_org_id ON corp.plaid_items(organization_id);
CREATE INDEX idx_plaid_items_status ON corp.plaid_items(status);

-- Plaid Accounts
CREATE INDEX idx_plaid_accounts_item_id ON corp.plaid_accounts(plaid_item_id);
CREATE INDEX idx_plaid_accounts_org_id ON corp.plaid_accounts(organization_id);

-- Plaid Transactions
CREATE INDEX idx_plaid_tx_account_id ON corp.plaid_transactions(plaid_account_id);
CREATE INDEX idx_plaid_tx_org_id ON corp.plaid_transactions(organization_id);
CREATE INDEX idx_plaid_tx_date ON corp.plaid_transactions(date);
CREATE INDEX idx_plaid_tx_reconciled ON corp.plaid_transactions(reconciled);
CREATE INDEX idx_plaid_tx_matched_bill ON corp.plaid_transactions(matched_bill_id);

-- Catalog Items
CREATE INDEX idx_catalog_items_org_id ON corp.catalog_items(organization_id);
CREATE INDEX idx_catalog_items_category ON corp.catalog_items(category);

-- Purchase Orders
CREATE INDEX idx_po_org_id ON corp.purchase_orders(organization_id);
CREATE INDEX idx_po_status ON corp.purchase_orders(status);
CREATE INDEX idx_po_order_date ON corp.purchase_orders(order_date);
CREATE INDEX idx_po_vendor ON corp.purchase_orders(vendor_name);

-- Purchase Order Lines
CREATE INDEX idx_pol_po_id ON corp.purchase_order_lines(purchase_order_id);
CREATE INDEX idx_pol_catalog_item ON corp.purchase_order_lines(catalog_item_id);

-- Toast Imports
CREATE INDEX idx_toast_imports_org_id ON corp.toast_imports(organization_id);
CREATE INDEX idx_toast_imports_status ON corp.toast_imports(status);
CREATE INDEX idx_toast_imports_type ON corp.toast_imports(import_type);

-- Toast Sales
CREATE INDEX idx_toast_sales_org_id ON corp.toast_sales(organization_id);
CREATE INDEX idx_toast_sales_import_id ON corp.toast_sales(import_id);
CREATE INDEX idx_toast_sales_business_date ON corp.toast_sales(business_date);
CREATE INDEX idx_toast_sales_order_id ON corp.toast_sales(order_id);

-- Rewards Programs
CREATE INDEX idx_rewards_programs_org_id ON corp.rewards_programs(organization_id);

-- Rewards Members
CREATE INDEX idx_rewards_members_program_id ON corp.rewards_members(program_id);
CREATE INDEX idx_rewards_members_user_id ON corp.rewards_members(user_id);
CREATE INDEX idx_rewards_members_email ON corp.rewards_members(email);
CREATE INDEX idx_rewards_members_tier ON corp.rewards_members(tier);

-- Rewards Transactions
CREATE INDEX idx_rewards_tx_member_id ON corp.rewards_transactions(member_id);
CREATE INDEX idx_rewards_tx_program_id ON corp.rewards_transactions(program_id);
CREATE INDEX idx_rewards_tx_type ON corp.rewards_transactions(transaction_type);

-- Toast Customers
CREATE INDEX idx_toast_customers_org_id ON corp.toast_customers(organization_id);
CREATE INDEX idx_toast_customers_email ON corp.toast_customers(email);
CREATE INDEX idx_toast_customers_rewards ON corp.toast_customers(rewards_member_id);

-- Campaigns
CREATE INDEX idx_campaigns_org_id ON corp.campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON corp.campaigns(status);
CREATE INDEX idx_campaigns_type ON corp.campaigns(campaign_type);
CREATE INDEX idx_campaigns_scheduled ON corp.campaigns(scheduled_at);

-- Campaign Recipients
CREATE INDEX idx_cr_campaign_id ON corp.campaign_recipients(campaign_id);
CREATE INDEX idx_cr_status ON corp.campaign_recipients(status);

-- Marketing Plans
CREATE INDEX idx_mp_org_id ON corp.marketing_plans(organization_id);
CREATE INDEX idx_mp_fiscal_year ON corp.marketing_plans(fiscal_year);
CREATE INDEX idx_mp_status ON corp.marketing_plans(status);

-- Marketing Calendar
CREATE INDEX idx_mc_org_id ON corp.marketing_calendar(organization_id);
CREATE INDEX idx_mc_plan_id ON corp.marketing_calendar(marketing_plan_id);
CREATE INDEX idx_mc_campaign_id ON corp.marketing_calendar(campaign_id);
CREATE INDEX idx_mc_dates ON corp.marketing_calendar(start_date, end_date);
CREATE INDEX idx_mc_event_type ON corp.marketing_calendar(event_type);

-- Audit Logs
CREATE INDEX idx_audit_staff_id ON corp.audit_logs(staff_id);
CREATE INDEX idx_audit_org_id ON corp.audit_logs(organization_id);
CREATE INDEX idx_audit_action ON corp.audit_logs(action);
CREATE INDEX idx_audit_table ON corp.audit_logs(table_name);
CREATE INDEX idx_audit_record_id ON corp.audit_logs(record_id);
CREATE INDEX idx_audit_created_at ON corp.audit_logs(created_at);

-- ============================================================================
-- 7. SEED DEFAULT DOCUMENT TYPES
-- ============================================================================

INSERT INTO corp.document_types (name, description, category, requires_expiry) VALUES
  ('W-4',              'Employee Withholding Certificate',             'tax',           false),
  ('W-9',              'Request for Taxpayer ID and Certification',    'tax',           false),
  ('I-9',              'Employment Eligibility Verification',          'identity',      true),
  ('Direct Deposit',   'Direct Deposit Authorization Form',           'employment',    false),
  ('Offer Letter',     'Employment Offer Letter',                     'employment',    false),
  ('Employment Contract', 'Employment Agreement/Contract',            'contract',      true),
  ('NDA',              'Non-Disclosure Agreement',                    'contract',      true),
  ('Non-Compete',      'Non-Compete Agreement',                      'contract',      true),
  ('Employee Handbook','Employee Handbook Acknowledgement',           'policy',        false),
  ('Drivers License',  'State Drivers License Copy',                  'identity',      true),
  ('Food Handler',     'Food Handler Certification',                  'certification', true),
  ('ServSafe',         'ServSafe Certification',                      'certification', true),
  ('ABC Permit',       'ABC Commission Permit',                       'certification', true),
  ('Business License', 'Business Operating License',                  'legal',         true),
  ('Insurance Policy', 'Insurance Policy Document',                   'financial',     true),
  ('Tax Return',       'Annual Tax Return',                           'tax',           false),
  ('Lease Agreement',  'Property Lease Agreement',                    'contract',      true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
