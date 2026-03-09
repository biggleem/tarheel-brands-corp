'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
// Local types for mock data (not exported from @/lib/types)

type OrgStatus = 'active' | 'inactive' | 'pending' | 'dissolved'
type DomainStatus = 'active' | 'parked' | 'expired' | 'pending' | 'dns_error'
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
  Instagram,
  Facebook,
  Twitter,
  Link2,
} from 'lucide-react'

// ── Category Config ────────────────────────────────────────

const categoryConfig: Record<string, { label: string; color: string }> = {
  food_beverage:       { label: 'Food & Beverage',       color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  tech_blockchain:     { label: 'Tech & Blockchain',     color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  tours:               { label: 'Tours',                 color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  events:              { label: 'Events',                color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  health_fitness:      { label: 'Health & Fitness',      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  media_entertainment: { label: 'Media & Entertainment', color: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
  services:            { label: 'Services',              color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  agriculture:         { label: 'Agriculture',           color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  retail:              { label: 'Retail',                color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  xr_vr:               { label: 'XR / VR',              color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  rewards_marketing:   { label: 'Rewards & Marketing',   color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  real_estate:         { label: 'Real Estate',           color: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  pets:                { label: 'Pets',                  color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  education:           { label: 'Education',             color: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  other:               { label: 'Other',                 color: 'bg-dark-500/15 text-dark-300 border-dark-500/20' },
}

const statusConfig: Record<OrgStatus, { label: string; dot: string }> = {
  active:    { label: 'Active',    dot: 'bg-green-400' },
  inactive:  { label: 'Inactive',  dot: 'bg-dark-500' },
  pending:   { label: 'Pending',   dot: 'bg-yellow-400' },
  dissolved: { label: 'Dissolved', dot: 'bg-red-400' },
}

const domainStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active:    { label: 'Active',    color: 'text-green-400',  icon: CheckCircle2 },
  parked:    { label: 'Parked',    color: 'text-yellow-400', icon: AlertCircle },
  expired:   { label: 'Expired',   color: 'text-red-400',    icon: AlertCircle },
  pending:   { label: 'Pending',   color: 'text-dark-400',   icon: Clock },
  dns_error: { label: 'DNS Error', color: 'text-red-400',    icon: AlertCircle },
}

// ── Mock Business Detail Data ──────────────────────────────

interface MockBusinessDetail {
  orgId: string
  name: string
  category: string
  status: OrgStatus
  domain?: string
  domainStatus: DomainStatus
  domainRegistrar?: string
  domainExpiry?: string
  ein?: string
  address: string
  city: string
  state: string
  zip: string
  phone?: string
  email?: string
  website?: string
  description?: string
  isBrickMortar: boolean
  isEcommerce: boolean
  openingDate?: string
  operatingHours?: Record<string, string>
  socialLinks?: Record<string, string>
  stats: { revenue: string; employees: number; bills: number; revenueChange: number }
  employees: Array<{ name: string; role: string; status: string }>
  documents: Array<{ name: string; type: string; date: string }>
}

const mockBusinessMap: Record<string, MockBusinessDetail> = {
  'brax-bbq': {
    orgId: 'brax-bbq',
    name: 'Brax BBQ',
    category: 'food_beverage',
    status: 'active',
    domain: 'braxbbq.com',
    domainStatus: 'active',
    domainRegistrar: 'GoDaddy',
    domainExpiry: '2027-04-15',
    ein: '84-XXXXXXX',
    address: '1234 Central Ave',
    city: 'Charlotte',
    state: 'NC',
    zip: '28205',
    phone: '(704) 555-0101',
    email: 'info@braxbbq.com',
    website: 'https://braxbbq.com',
    description: 'Premium BBQ restaurant and catering serving the Charlotte metro area. Specializing in slow-smoked meats with Southern-style sides.',
    isBrickMortar: true,
    isEcommerce: false,
    openingDate: '2023-06-15',
    operatingHours: {
      'Mon-Thu': '11:00 AM - 9:00 PM',
      'Fri-Sat': '11:00 AM - 10:00 PM',
      'Sunday': '12:00 PM - 8:00 PM',
    },
    socialLinks: {
      instagram: 'https://instagram.com/braxbbq',
      facebook: 'https://facebook.com/braxbbq',
      twitter: 'https://twitter.com/braxbbq',
    },
    stats: { revenue: '$12.4K', employees: 14, bills: 8, revenueChange: 8.3 },
    employees: [
      { name: 'Marcus Johnson', role: 'Manager', status: 'active' },
      { name: 'Sarah Williams', role: 'Line Cook', status: 'active' },
      { name: 'DeShawn Brown', role: 'Server', status: 'active' },
      { name: 'Ashley Rivera', role: 'Cashier', status: 'active' },
    ],
    documents: [
      { name: 'Business License 2026', type: 'certification', date: '2026-01-15' },
      { name: 'Health Inspection Report', type: 'certification', date: '2026-02-20' },
      { name: 'Commercial Lease Agreement', type: 'contract', date: '2024-06-01' },
    ],
  },
  'tarheel-burger': {
    orgId: 'tarheel-burger',
    name: 'Tarheel Burger',
    category: 'food_beverage',
    status: 'active',
    domain: 'tarheelburger.com',
    domainStatus: 'active',
    domainRegistrar: 'Namecheap',
    domainExpiry: '2027-01-22',
    ein: '84-XXXXXXX',
    address: '5678 South Blvd',
    city: 'Charlotte',
    state: 'NC',
    zip: '28217',
    phone: '(704) 555-0202',
    email: 'info@tarheelburger.com',
    website: 'https://tarheelburger.com',
    description: 'Fast-casual burger joint with handcrafted burgers and fresh-cut fries. Carolina-inspired flavors with a modern twist.',
    isBrickMortar: true,
    isEcommerce: false,
    openingDate: '2024-03-01',
    operatingHours: {
      'Mon-Sat': '11:00 AM - 10:00 PM',
      'Sunday': '12:00 PM - 9:00 PM',
    },
    socialLinks: {
      instagram: 'https://instagram.com/tarheelburger',
      facebook: 'https://facebook.com/tarheelburger',
    },
    stats: { revenue: '$8.7K', employees: 10, bills: 6, revenueChange: 5.1 },
    employees: [
      { name: 'Tyrone Mitchell', role: 'Manager', status: 'active' },
      { name: 'Kayla Thomas', role: 'Line Cook', status: 'active' },
    ],
    documents: [
      { name: 'Business License 2026', type: 'certification', date: '2026-01-10' },
      { name: 'Food Handler Permits', type: 'certification', date: '2025-08-15' },
    ],
  },
  '1nc-blockchain': {
    orgId: '1nc-blockchain',
    name: '1NC Blockchain',
    category: 'tech_blockchain',
    status: 'active',
    domain: '1ncblockchain.com',
    domainStatus: 'active',
    domainRegistrar: 'Namecheap',
    domainExpiry: '2027-08-10',
    ein: '84-XXXXXXX',
    address: '900 Innovation Way',
    city: 'Charlotte',
    state: 'NC',
    zip: '28202',
    phone: '(704) 555-0303',
    email: 'info@1ncblockchain.com',
    website: 'https://1ncblockchain.com',
    description: 'Web3 technology company providing blockchain solutions, DeFi platforms, and cryptocurrency education.',
    isBrickMortar: false,
    isEcommerce: true,
    openingDate: '2022-01-01',
    socialLinks: {
      twitter: 'https://twitter.com/1ncblockchain',
      instagram: 'https://instagram.com/1ncblockchain',
    },
    stats: { revenue: '$5.2K', employees: 4, bills: 3, revenueChange: 22.5 },
    employees: [
      { name: 'Devin Carter', role: 'Lead Developer', status: 'active' },
      { name: 'Amara Osei', role: 'Designer', status: 'active' },
    ],
    documents: [
      { name: 'LLC Operating Agreement', type: 'contract', date: '2022-01-15' },
      { name: 'Website Privacy Policy', type: 'policy', date: '2025-06-01' },
    ],
  },
}

// Default fallback for any orgId not in the map
function getBusinessDetail(orgId: string): MockBusinessDetail {
  if (mockBusinessMap[orgId]) return mockBusinessMap[orgId]

  // Generate a fallback business from the orgId
  const formattedName = orgId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    orgId,
    name: formattedName,
    category: 'other',
    status: 'active',
    domain: `${orgId.replace(/-/g, '')}.com`,
    domainStatus: 'active',
    domainRegistrar: 'GoDaddy',
    domainExpiry: '2027-06-01',
    address: '100 Main St',
    city: 'Charlotte',
    state: 'NC',
    zip: '28202',
    phone: '(704) 555-0000',
    email: `info@${orgId.replace(/-/g, '')}.com`,
    description: `${formattedName} is part of the South Armz Global portfolio.`,
    isBrickMortar: false,
    isEcommerce: false,
    stats: { revenue: '$0', employees: 0, bills: 0, revenueChange: 0 },
    employees: [],
    documents: [],
  }
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

function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram className="w-4 h-4" />
    case 'facebook': return <Facebook className="w-4 h-4" />
    case 'twitter': return <Twitter className="w-4 h-4" />
    default: return <Link2 className="w-4 h-4" />
  }
}

// ── Page Component ─────────────────────────────────────────

export default function BusinessDetailClient() {
  const params = useParams()
  const orgId = params.orgId as string
  const biz = getBusinessDetail(orgId)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const catInfo = categoryConfig[biz.category]
  const statInfo = statusConfig[biz.status]
  const domainInfo = biz.domainStatus ? domainStatusConfig[biz.domainStatus] : null

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
          title={biz.name}
          description={biz.description}
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
            <span className={cn('w-2 h-2 rounded-full', statInfo.dot)} />
            {statInfo.label}
          </span>
          {biz.domain && (
            <a
              href={biz.website || `https://${biz.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Globe className="w-3 h-3" />
              {biz.domain}
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
              title="Revenue (MTD)"
              value={biz.stats.revenue}
              change={biz.stats.revenueChange}
              icon={DollarSign}
              iconColor="text-green-400"
            />
            <StatCard
              title="Employees"
              value={String(biz.stats.employees)}
              icon={Users}
              iconColor="text-blue-400"
            />
            <StatCard
              title="Active Bills"
              value={String(biz.stats.bills)}
              icon={Receipt}
              iconColor="text-gold-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Details */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-dark-200 mb-4">Business Details</h3>
              <div className="space-y-3">
                {biz.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-dark-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-dark-200">{biz.address}</p>
                      <p className="text-xs text-dark-400">{biz.city}, {biz.state} {biz.zip}</p>
                    </div>
                  </div>
                )}
                {biz.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-dark-500 shrink-0" />
                    <span className="text-sm text-dark-200">{biz.phone}</span>
                  </div>
                )}
                {biz.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-dark-500 shrink-0" />
                    <a href={`mailto:${biz.email}`} className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                      {biz.email}
                    </a>
                  </div>
                )}
                {biz.ein && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-dark-500 shrink-0" />
                    <span className="text-sm text-dark-300">EIN: {biz.ein}</span>
                  </div>
                )}

                {/* Type indicators */}
                <div className="flex items-center gap-3 pt-2 border-t border-dark-800/50">
                  {biz.isBrickMortar && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-dark-800 text-dark-300 border border-dark-700/50">
                      Brick & Mortar
                    </span>
                  )}
                  {biz.isEcommerce && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-dark-800 text-dark-300 border border-dark-700/50">
                      E-Commerce
                    </span>
                  )}
                  {biz.openingDate && (
                    <span className="text-xs text-dark-500">
                      Opened {new Date(biz.openingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Hours & Domain */}
            <div className="space-y-6">
              {/* Domain Status */}
              {biz.domain && domainInfo && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-dark-200 mb-4">Domain Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-300">{biz.domain}</span>
                      <span className={cn('flex items-center gap-1 text-xs font-medium', domainInfo.color)}>
                        <domainInfo.icon className="w-3.5 h-3.5" />
                        {domainInfo.label}
                      </span>
                    </div>
                    {biz.domainRegistrar && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dark-500">Registrar</span>
                        <span className="text-dark-300">{biz.domainRegistrar}</span>
                      </div>
                    )}
                    {biz.domainExpiry && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dark-500">Expires</span>
                        <span className="text-dark-300">
                          {new Date(biz.domainExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Operating Hours */}
              {biz.operatingHours && Object.keys(biz.operatingHours).length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-dark-200 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-dark-400" />
                    Operating Hours
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(biz.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between text-xs">
                        <span className="text-dark-400 font-medium">{day}</span>
                        <span className="text-dark-200">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {biz.socialLinks && Object.keys(biz.socialLinks).length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-medium text-dark-200 mb-4">Social Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(biz.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors text-xs"
                      >
                        {getSocialIcon(platform)}
                        <span className="capitalize">{platform}</span>
                        <ExternalLink className="w-3 h-3 text-dark-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-200">Team Members</h3>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-600/30 rounded-lg hover:bg-brand-600/10 transition-colors">
              <Users className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>
          {biz.employees.length === 0 ? (
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {biz.employees.map((emp, i) => (
                  <tr key={i}>
                    <td className="font-medium text-dark-100">{emp.name}</td>
                    <td>{emp.role}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className={cn('w-1.5 h-1.5 rounded-full', emp.status === 'active' ? 'bg-green-400' : 'bg-dark-500')} />
                        <span className="capitalize">{emp.status}</span>
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
            <h3 className="text-sm font-medium text-dark-200">Documents</h3>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-600/30 rounded-lg hover:bg-brand-600/10 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>
          {biz.documents.length === 0 ? (
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
                {biz.documents.map((doc, i) => (
                  <tr key={i}>
                    <td className="font-medium text-dark-100">{doc.name}</td>
                    <td>
                      <span className="capitalize text-dark-300">{doc.type}</span>
                    </td>
                    <td className="text-dark-400">
                      {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
              Connect accounting data to view P&L, journal entries, and financial reports for {biz.name}.
            </p>
            <Link
              href={`/accounting?org=${orgId}`}
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
              Manage integrations, permissions, and configuration for {biz.name}.
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
