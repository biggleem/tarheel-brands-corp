'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate } from '@/lib/utils/formatters'
import { getStaffWithPermissions } from '@/lib/supabase/queries'
import type { StaffProfile, StaffPermission, StaffAssignment, StaffRole, Organization } from '@/lib/types'
import {
  Building2,
  Users,
  Plug,
  Bell,
  Database,
  Upload,
  Phone,
  Mail,
  MapPin,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Download,
  HardDrive,
  Clock,
  UserCog,
  Pencil,
  Trash2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────

type StaffWithPerms = StaffProfile & {
  permissions: StaffPermission[]
  assignments: (StaffAssignment & { organization: Pick<Organization, 'id' | 'name' | 'slug'> })[]
}

// ── Helpers ───────────────────────────────────────────────────

const roleLabels: Record<StaffRole, { label: string; color: string; bg: string }> = {
  owner: { label: 'Owner', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  manager: { label: 'Manager', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  supervisor: { label: 'Supervisor', color: 'text-green-400', bg: 'bg-green-500/10' },
  employee: { label: 'Employee', color: 'text-dark-300', bg: 'bg-dark-600/20' },
  viewer: { label: 'Viewer', color: 'text-dark-400', bg: 'bg-dark-700/20' },
}

function getPrimaryRole(staff: StaffWithPerms): StaffRole {
  const primary = staff.assignments.find((a) => a.is_primary && a.is_active)
  return primary?.role ?? staff.assignments.find((a) => a.is_active)?.role ?? 'employee'
}

function getInitials(staff: StaffProfile): string {
  return `${staff.first_name[0] ?? ''}${staff.last_name[0] ?? ''}`.toUpperCase()
}

// ── Notification Settings ─────────────────────────────────────

interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

// ── Loading Skeleton ──────────────────────────────────────────

function UserTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full">
        <thead>
          <tr className="border-b border-dark-700/50">
            <th>User</th><th>Role</th><th>Permissions</th><th>Last Login</th><th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" /><div className="space-y-1.5"><div className="h-3.5 w-24 bg-dark-700 rounded animate-pulse" /><div className="h-3 w-32 bg-dark-800 rounded animate-pulse" /></div></div></td>
              <td><div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" /></td>
              <td><div className="flex gap-1"><div className="h-4 w-12 bg-dark-700 rounded animate-pulse" /><div className="h-4 w-12 bg-dark-700 rounded animate-pulse" /></div></td>
              <td><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
              <td><div className="h-4 w-16 bg-dark-700 rounded animate-pulse mx-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page Component ────────────────────────────────────────────

export default function SettingsPage() {
  const [staffData, setStaffData] = useState<StaffWithPerms[]>([])
  const [loading, setLoading] = useState(true)

  // Organization form state (could be fetched from org data later)
  const [orgName, setOrgName] = useState('South Armz Global Inc')
  const [orgAddress, setOrgAddress] = useState('Pittsboro, NC')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')

  const [plaidConnected, setPlaidConnected] = useState(true)
  const [toastConnected, setToastConnected] = useState(true)

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'bill_due', label: 'Bill Due Reminders', description: 'Get notified 3 days before a bill is due', enabled: true },
    { id: 'pto_request', label: 'PTO Requests', description: 'Notify when an employee submits a PTO request', enabled: true },
    { id: 'doc_expiry', label: 'Document Expiry', description: 'Alert when employee documents are about to expire', enabled: true },
    { id: 'payroll', label: 'Payroll Processed', description: 'Confirmation when payroll is successfully processed', enabled: false },
    { id: 'low_stock', label: 'Low Stock Alerts', description: 'Alert when catalog items fall below reorder level', enabled: true },
    { id: 'campaign', label: 'Campaign Updates', description: 'Notify on campaign status changes', enabled: false },
    { id: 'new_member', label: 'New Rewards Members', description: 'Alert when a new member joins SA Rewards', enabled: false },
    { id: 'toast_import', label: 'Toast Import Complete', description: 'Notify when a Toast data import finishes', enabled: true },
  ])

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const data = await getStaffWithPermissions()
        if (!cancelled) setStaffData(data as StaffWithPerms[])
      } catch (err) {
        console.error('Failed to fetch staff with permissions:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  function toggleNotification(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage organization, users, integrations, and preferences"
      />

      {/* ── Section 1: Organization ── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-dark-100">Organization</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Company Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg px-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="tel"
                value={orgPhone}
                onChange={(e) => setOrgPhone(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="email"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-dark-800 rounded-xl border border-dark-700/50 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-dark-600" />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors">
                <Upload className="w-4 h-4" />
                Upload Logo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: User Management ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-semibold text-dark-100">User Management</h3>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-dark-200 text-xs font-medium rounded-lg border border-dark-700/50 transition-colors">
            <UserCog className="w-3.5 h-3.5" />
            Invite User
          </button>
        </div>

        {loading ? <UserTableSkeleton /> : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th>User</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Hire Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => {
                  const role = getPrimaryRole(staff)
                  const roleInfo = roleLabels[role] ?? roleLabels.employee
                  const perms = staff.permissions.filter((p) => p.is_active).map((p) => p.permission)
                  return (
                    <tr key={staff.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-400">
                            {getInitials(staff)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark-100">{staff.first_name} {staff.last_name}</p>
                            <p className="text-xs text-dark-400">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            roleInfo.bg,
                            roleInfo.color
                          )}
                        >
                          {roleInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {perms.slice(0, 3).map((perm) => (
                            <span
                              key={perm}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-dark-800 text-[10px] text-dark-300 font-mono"
                            >
                              {perm}
                            </span>
                          ))}
                          {perms.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-dark-800 text-[10px] text-dark-400">
                              +{perms.length - 3} more
                            </span>
                          )}
                          {perms.length === 0 && (
                            <span className="text-[10px] text-dark-500">No permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-dark-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(staff.hire_date)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-dark-200">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-dark-400 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 3: Integrations ── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Plug className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-dark-100">Integrations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plaid */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-100">Plaid</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {plaidConnected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-dark-500" />
                      <span className="text-xs text-dark-500">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setPlaidConnected(!plaidConnected)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                plaidConnected
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                  : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
              )}
            >
              {plaidConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Toast */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-100">Toast POS</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {toastConnected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-dark-500" />
                      <span className="text-xs text-dark-500">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setToastConnected(!toastConnected)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                toastConnected
                  ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                  : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
              )}
            >
              {toastConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 4: Notifications ── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-dark-100">Notifications</h3>
        </div>
        <div className="space-y-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-800/40 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-dark-100">{notif.label}</p>
                <p className="text-xs text-dark-400 mt-0.5">{notif.description}</p>
              </div>
              <button
                onClick={() => toggleNotification(notif.id)}
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                  notif.enabled ? 'bg-brand-600' : 'bg-dark-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    notif.enabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Data ── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Database className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-semibold text-dark-100">Data</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-dark-900 text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-100">Export All Data</p>
                <p className="text-xs text-dark-400 mt-0.5">Download a complete export of all organization data as CSV</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors">
              Export
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-dark-900 text-green-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark-100">Backup Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Supabase automatic backups active</span>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-500/10 text-xs font-medium text-green-400">
              Healthy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
