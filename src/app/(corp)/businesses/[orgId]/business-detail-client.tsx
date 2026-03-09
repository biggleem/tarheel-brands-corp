'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { getBusinessBySlug } from '@/lib/supabase/queries'
import type { Organization, Business, StaffAssignment, StaffProfile } from '@/lib/types'
import {
  ArrowLeft,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Edit,
  DollarSign,
  Users,
  FileText,
  Receipt,
  Settings,
  CheckCircle2,
  AlertCircle,
  Building2,
  Loader2,
} from 'lucide-react'

// ── Category Config ────────────────────────────────────────

const categoryConfig: Record<string, { label: string; color: string }> = {
  restaurant:    { label: 'Food & Beverage',       color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  technology:    { label: 'Technology',             color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  entertainment: { label: 'Media & Entertainment',  color: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
  service:       { label: 'Services',               color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  retail:        { label: 'Retail',                  color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  real_estate:   { label: 'Real Estate',             color: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  other:         { label: 'Other',                   color: 'bg-dark-500/15 text-dark-300 border-dark-500/20' },
}

const domainStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active:    { label: 'Active',    color: 'text-green-400',  icon: CheckCircle2 },
  parked:    { label: 'Parked',    color: 'text-yellow-400', icon: AlertCircle },
  expired:   { label: 'Expired',   color: 'text-red-400',    icon: AlertCircle },
  pending:   { label: 'Pending',   color: 'text-dark-400',   icon: Clock },
  dns_error: { label: 'DNS Error', color: 'text-red-400',    icon: AlertCircle },
}

// ── Tabs ────────────────────────────────────────────────────

type Tab = 'overview' | 'employees' | 'documents' | 'finances' | 'settings'

const tabs: Array<{ key: Tab; label: string; icon: typeof DollarSign }> = [
  { key: 'overview', label: 'Overview', icon: Globe },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'finances', label: 'Finances', icon: DollarSign },
  { key: 'settings', label: 'Settings', icon: Settings },
]

function parseAddress(address: Record<string, unknown> | null | undefined) {
  if (!address || typeof address !== 'object') return null
  return {
    street: (address.street as string) || (address.line1 as string) || '',
    city: (address.city as string) || '',
    state: (address.state as string) || '',
    zip: (address.zip as string) || (address.postal_code as string) || '',
  }
}

// ── Page Component ─────────────────────────────────────────

export default function BusinessDetailClient() {
  const params = useParams()
  const slug = params.orgId as string
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [org, setOrg] = useState<Organization | null>(null)
  const [biz, setBiz] = useState<Business | null>(null)
  const [staff, setStaff] = useState<(StaffAssignment & { staff: StaffProfile })[]>([])
  const [documents, setDocuments] = useState<Array<{ id: string; title: string; created_at: string; document_type?: { name: string } | null }>>([])
  const [billCount, setBillCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getBusinessBySlug(slug)
      if (!cancelled) {
        setOrg(data.organization)
        setBiz(data.business)
        setStaff(data.staff as (StaffAssignment & { staff: StaffProfile })[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDocuments((data.documents || []) as any[])
        setBillCount(data.bills?.length ?? 0)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-dark-400">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/businesses" className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Businesses
        </Link>
        <div className="glass-card p-12 text-center">
          <Building2 className="w-10 h-10 text-dark-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-dark-300 mb-1">Business Not Found</h3>
          <p className="text-xs text-dark-500">The business &quot;{slug}&quot; could not be found. You may need to log in first.</p>
        </div>
      </div>
    )
  }

  const category = biz?.category || 'other'
  const catInfo = categoryConfig[category] ?? categoryConfig.other
  const domain = biz?.domain || null
  const isActive = org.is_active
  const addr = parseAddress(org.address as Record<string, unknown>)
  const hours = biz?.hours_of_operation as Record<string, string> | null
  const meta = (biz?.metadata || {}) as Record<string, unknown>
  const domainStatus = (meta.domain_status as string) || (domain ? 'active' : null)
  const domainInfo = domainStatus ? domainStatusConfig[domainStatus] || domainStatusConfig.active : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Back & Header ── */}
      <div>
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Businesses
        </Link>

        <PageHeader
          title={org.name}
          description={`Part of the South Armz Global portfolio${biz?.domain ? ` — ${biz.domain}` : ''}`}
          actions={
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
              Edit Business
            </button>
          }
        />

        {/* Status & Category Row */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className={cn('inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border', catInfo.color)}>
            {catInfo.label}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-dark-300">
            <span className={cn('w-2 h-2 rounded-full', isActive ? 'bg-green-400' : 'bg-dark-500')} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {domain && (
            <a
              href={org.website || `https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Globe className="w-3 h-3" />
              {domain}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-dark-800">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-400'
                  : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-600'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Employees"
              value={String(staff.length)}
              icon={Users}
              iconColor="text-blue-400"
            />
            <StatCard
              title="Pending Bills"
              value={String(billCount)}
              icon={Receipt}
              iconColor="text-gold-400"
            />
            <StatCard
              title="Documents"
              value={String(documents.length)}
              icon={FileText}
              iconColor="text-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Details */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-dark-200 mb-4">Business Details</h3>
              <div className="space-y-3">
                {addr && (addr.street || addr.city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-dark-500 mt-0.5 shrink-0" />
                    <div>
                      {addr.street && <p className="text-sm text-dark-200">{addr.street}</p>}
                      <p className="text-xs text-dark-400">
                        {[addr.city, addr.state].filter(Boolean).join(', ')} {addr.zip}
                      </p>
                    </div>
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-dark-500 shrink-0" />
                    <span className="text-sm text-dark-200">{org.phone}</span>
                  </div>
                )}
                {org.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-dark-500 shrink-0" />
                    <a href={`mailto:${org.email}`} className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                      {org.email}
                    </a>
                  </div>
                )}
                {org.ein && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-dark-500 shrink-0" />
                    <span className="text-sm text-dark-300">EIN: {org.ein}</span>
                  </div>
                )}

                {/* POS & Tax Rate */}
                <div className="flex items-center gap-3 pt-2 border-t border-dark-800/50">
                  {biz?.pos_system && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-dark-800 text-dark-300 border border-dark-700/50">
                      POS: {biz.pos_system}
                    </span>
                  )}
                  {biz?.tax_rate != null && biz.tax_rate > 0 && (
                    <span className="text-xs text-dark-500">
                      Tax Rate: {(biz.tax_rate * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Hours & Domain */}
            <div className="space-y-6">
              {/* Domain Status */}
              {domain && domainInfo && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-dark-200 mb-4">Domain Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-300">{domain}</span>
                      <span className={cn('flex items-center gap-1 text-xs font-medium', domainInfo.color)}>
                        <domainInfo.icon className="w-3.5 h-3.5" />
                        {domainInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Operating Hours */}
              {hours && Object.keys(hours).length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-dark-200 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-dark-400" />
                    Operating Hours
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(hours).map(([day, time]) => (
                      <div key={day} className="flex items-center justify-between text-xs">
                        <span className="text-dark-400 font-medium">{day}</span>
                        <span className="text-dark-200">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Website */}
              {org.website && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-dark-200 mb-3">Website</h3>
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {org.website}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-200">Team Members ({staff.length})</h3>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-600/30 rounded-lg hover:bg-brand-600/10 transition-colors">
              <Users className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-sm text-dark-400">No employees assigned to this business yet.</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((sa) => (
                  <tr key={sa.id}>
                    <td className="font-medium text-dark-100">
                      {sa.staff?.first_name} {sa.staff?.last_name}
                    </td>
                    <td className="capitalize text-dark-300">{sa.role}</td>
                    <td className="capitalize text-dark-400">{sa.staff?.employment_type || '—'}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className={cn('w-1.5 h-1.5 rounded-full', sa.staff?.is_active ? 'bg-green-400' : 'bg-dark-500')} />
                        <span>{sa.staff?.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-200">Documents ({documents.length})</h3>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-600/30 rounded-lg hover:bg-brand-600/10 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-sm text-dark-400">No documents uploaded for this business.</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="font-medium text-dark-100">{doc.title}</td>
                    <td>
                      <span className="capitalize text-dark-300">{doc.document_type?.name || '—'}</span>
                    </td>
                    <td className="text-dark-400">
                      {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="glass-card p-5">
          <div className="text-center py-12">
            <DollarSign className="w-10 h-10 text-dark-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-dark-300 mb-1">Financial Overview</h3>
            <p className="text-xs text-dark-500">
              Connect accounting data to view P&L, journal entries, and financial reports for {org.name}.
            </p>
            <Link
              href={`/accounting?org=${slug}`}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium text-brand-400 border border-brand-600/30 rounded-lg hover:bg-brand-600/10 transition-colors"
            >
              Go to Accounting
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card p-5">
          <div className="text-center py-12">
            <Settings className="w-10 h-10 text-dark-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-dark-300 mb-1">Business Settings</h3>
            <p className="text-xs text-dark-500">
              Manage integrations, permissions, and configuration for {org.name}.
            </p>
            <button className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium text-brand-400 border border-brand-600/30 rounded-lg hover:bg-brand-600/10 transition-colors">
              <Edit className="w-3.5 h-3.5" />
              Open Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
