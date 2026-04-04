'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatDate, formatCurrency } from '@/lib/utils/formatters'
type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern' | 'seasonal'
type TimeEntryStatus = 'active' | 'completed' | 'edited' | 'void' | 'pending' | 'approved' | 'rejected'

type StaffStatus = 'active' | 'inactive' | 'onboarding' | 'terminated' | 'on_leave'
type PTORequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
type PTOType = 'vacation' | 'sick' | 'personal' | 'bereavement' | 'jury_duty'
import {
  ArrowLeft,
  Edit,
  Clock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Shield,
  FileText,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Mock data factory
// ---------------------------------------------------------------------------

interface EmployeeDetail {
  id: string
  user_id: string
  employee_number: string
  first_name: string
  last_name: string
  personal_email: string
  work_email: string
  phone: string
  date_of_birth: string
  hire_date: string
  employment_type: EmploymentType
  pay_rate: number
  pay_type: string
  pay_frequency: string
  job_title: string
  department: string
  status: StaffStatus
  avatar_url: string | null
  emergency_contact_name: string
  emergency_contact_phone: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  businesses: string[]
}

const employeeDB: Record<string, EmployeeDetail> = {
  'staff-001': {
    id: 'staff-001', user_id: 'u1', employee_number: 'TBC-001',
    first_name: 'Marcus', last_name: 'Johnson',
    personal_email: 'marcus.j@gmail.com', work_email: 'marcus@southarmzglobal.com',
    phone: '(919) 555-0142', date_of_birth: '1988-03-14',
    hire_date: '2021-06-01', employment_type: 'full_time',
    pay_rate: 72000, pay_type: 'salary', pay_frequency: 'biweekly',
    job_title: 'General Manager', department: 'Operations',
    status: 'active', avatar_url: null,
    emergency_contact_name: 'Lisa Johnson', emergency_contact_phone: '(919) 555-0199',
    metadata: {}, created_at: '2021-06-01', updated_at: '2024-12-01',
    businesses: ['Metal Brixx Cafe', 'Koshu Sake Bar'],
  },
  'staff-002': {
    id: 'staff-002', user_id: 'u2', employee_number: 'TBC-002',
    first_name: 'Aisha', last_name: 'Williams',
    personal_email: 'aisha.w@gmail.com', work_email: 'aisha@southarmzglobal.com',
    phone: '(919) 555-0218', date_of_birth: '1992-07-22',
    hire_date: '2022-01-15', employment_type: 'full_time',
    pay_rate: 58000, pay_type: 'salary', pay_frequency: 'biweekly',
    job_title: 'Marketing Director', department: 'Marketing',
    status: 'active', avatar_url: null,
    emergency_contact_name: 'James Williams', emergency_contact_phone: '(919) 555-0220',
    metadata: {}, created_at: '2022-01-15', updated_at: '2024-11-20',
    businesses: ['South Armz Global Inc'],
  },
}

// Fallback for any staffId
function getEmployee(staffId: string): EmployeeDetail {
  if (employeeDB[staffId]) return employeeDB[staffId]
  return {
    id: staffId, user_id: 'ux', employee_number: 'TBC-XXX',
    first_name: 'Devon', last_name: 'Carter',
    personal_email: 'devon.c@gmail.com', work_email: 'devon@southarmzglobal.com',
    phone: '(336) 555-0187', date_of_birth: '1995-11-03',
    hire_date: '2022-08-20', employment_type: 'full_time',
    pay_rate: 18.50, pay_type: 'hourly', pay_frequency: 'biweekly',
    job_title: 'Shift Lead', department: 'Operations',
    status: 'active', avatar_url: null,
    emergency_contact_name: 'Marie Carter', emergency_contact_phone: '(336) 555-0190',
    metadata: {}, created_at: '2022-08-20', updated_at: '2024-10-15',
    businesses: ['Metal Brixx Cafe'],
  }
}

// Time entries mock
interface TimeRow {
  id: string
  date: string
  clock_in: string
  clock_out: string | null
  hours: number | null
  status: TimeEntryStatus
}

const mockTimeEntries: TimeRow[] = [
  { id: 't1', date: '2026-03-08', clock_in: '08:02 AM', clock_out: null, hours: null, status: 'pending' },
  { id: 't2', date: '2026-03-07', clock_in: '07:58 AM', clock_out: '04:32 PM', hours: 8.07, status: 'approved' },
  { id: 't3', date: '2026-03-06', clock_in: '08:15 AM', clock_out: '05:01 PM', hours: 8.27, status: 'approved' },
  { id: 't4', date: '2026-03-05', clock_in: '07:45 AM', clock_out: '04:15 PM', hours: 8.0, status: 'approved' },
  { id: 't5', date: '2026-03-04', clock_in: '08:00 AM', clock_out: '04:30 PM', hours: 8.0, status: 'approved' },
  { id: 't6', date: '2026-03-03', clock_in: '09:10 AM', clock_out: '05:45 PM', hours: 8.08, status: 'rejected' },
]

// PTO balance mock
interface PTOBalanceRow {
  type: PTOType
  label: string
  used: number
  total: number
  color: string
}

const ptoBalances: PTOBalanceRow[] = [
  { type: 'vacation', label: 'Vacation', used: 40, total: 120, color: 'brand' },
  { type: 'sick', label: 'Sick', used: 16, total: 40, color: 'blue' },
  { type: 'personal', label: 'Personal', used: 8, total: 16, color: 'purple' },
]

// PTO requests mock
interface PTORow {
  id: string
  type: PTOType
  start_date: string
  end_date: string
  hours: number
  reason: string
  status: PTORequestStatus
}

const ptoRequests: PTORow[] = [
  { id: 'pto1', type: 'vacation', start_date: '2026-04-14', end_date: '2026-04-18', hours: 40, reason: 'Spring break family trip', status: 'pending' },
  { id: 'pto2', type: 'sick', start_date: '2026-02-10', end_date: '2026-02-11', hours: 16, reason: 'Flu recovery', status: 'approved' },
  { id: 'pto3', type: 'personal', start_date: '2026-01-20', end_date: '2026-01-20', hours: 8, reason: 'Personal appointment', status: 'approved' },
]

// Assignments mock
interface AssignmentRow {
  id: string
  business: string
  role: string
  start_date: string
  is_primary: boolean
}

const assignments: AssignmentRow[] = [
  { id: 'a1', business: 'Metal Brixx Cafe', role: 'Manager', start_date: '2021-06-01', is_primary: true },
  { id: 'a2', business: 'Koshu Sake Bar', role: 'Supervisor', start_date: '2023-01-15', is_primary: false },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusColor: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  on_leave: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  inactive: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
  terminated: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const timeStatusColor: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const ptoStatusColor: Record<PTORequestStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  cancelled: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
}

const ptoTypeColor: Record<string, string> = {
  vacation: 'bg-brand-600/10 text-brand-400 border border-brand-600/20',
  sick: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  bereavement: 'bg-dark-600/40 text-dark-300 border border-dark-600/40',
  unpaid: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

type Tab = 'profile' | 'time' | 'pto' | 'documents' | 'assignments'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StaffDetailClient() {
  const router = useRouter()
  const params = useParams()
  const staffId = params.staffId as string
  const employee = getEmployee(staffId)

  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'time', label: 'Time Tracking', icon: Clock },
    { key: 'pto', label: 'PTO', icon: Calendar },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'assignments', label: 'Assignments', icon: Briefcase },
  ]

  const isClockedIn = mockTimeEntries[0]?.clock_out === null

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <button
        onClick={() => router.push('/hr')}
        className="flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Staff Directory
      </button>

      {/* Header card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-brand-600/20 border-2 border-brand-600/40 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-brand-400">
              {employee.first_name[0]}{employee.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-dark-50">
                {employee.first_name} {employee.last_name}
              </h1>
              <span className={cn('px-3 py-1 text-xs font-medium rounded-full capitalize', statusColor[employee.status])}>
                {employee.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-dark-300 mt-0.5">{employee.job_title} &middot; {employee.department}</p>
            <p className="text-xs text-dark-500 mt-1">{employee.employee_number}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
              isClockedIn
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
            )}>
              {isClockedIn ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
              Edit Employee
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-400'
                  : 'border-transparent text-dark-400 hover:text-dark-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}

      {/* -------- PROFILE -------- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Personal Information</h3>
            <div className="space-y-4">
              <InfoRow icon={Mail} label="Work Email" value={employee.work_email || '--'} />
              <InfoRow icon={Mail} label="Personal Email" value={employee.personal_email || '--'} />
              <InfoRow icon={Phone} label="Phone" value={employee.phone || '--'} />
              <InfoRow icon={Calendar} label="Date of Birth" value={employee.date_of_birth ? formatDate(employee.date_of_birth) : '--'} />
            </div>
          </div>

          {/* Employment Info */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Employment Information</h3>
            <div className="space-y-4">
              <InfoRow icon={Calendar} label="Hire Date" value={formatDate(employee.hire_date)} />
              <InfoRow icon={DollarSign} label="Pay Rate" value={
                employee.pay_type === 'salary'
                  ? `${formatCurrency(employee.pay_rate ?? 0)}/yr`
                  : `${formatCurrency(employee.pay_rate ?? 0)}/hr`
              } />
              <InfoRow icon={Briefcase} label="Pay Type" value={employee.pay_type ? employee.pay_type.charAt(0).toUpperCase() + employee.pay_type.slice(1) : '--'} />
              <InfoRow icon={Clock} label="Pay Frequency" value={employee.pay_frequency.charAt(0).toUpperCase() + employee.pay_frequency.slice(1)} />
              <InfoRow icon={Shield} label="Employment Type" value={
                employee.employment_type.replace('_', '-').replace(/\b\w/g, (c) => c.toUpperCase())
              } />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <InfoRow icon={User} label="Name" value={employee.emergency_contact_name || '--'} />
              <InfoRow icon={Phone} label="Phone" value={employee.emergency_contact_phone || '--'} />
            </div>
          </div>
        </div>
      )}

      {/* -------- TIME TRACKING -------- */}
      {activeTab === 'time' && (
        <div>
          {/* Clock status */}
          <div className={cn(
            'glass-card p-5 mb-6 flex items-center gap-4',
            isClockedIn ? 'border-green-500/30' : ''
          )}>
            <div className={cn(
              'w-3 h-3 rounded-full',
              isClockedIn ? 'bg-green-400 animate-pulse' : 'bg-dark-600'
            )} />
            <div>
              <p className="text-sm font-medium text-dark-100">
                {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
              </p>
              <p className="text-xs text-dark-500">
                {isClockedIn ? `Since ${mockTimeEntries[0].clock_in} on ${formatDate(mockTimeEntries[0].date)}` : 'Last shift ended yesterday'}
              </p>
            </div>
          </div>

          {/* Recent time entries */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-800/50">
              <h3 className="text-sm font-semibold text-dark-200">Recent Time Entries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTimeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="text-dark-200">{formatDate(entry.date)}</td>
                      <td className="text-dark-300">{entry.clock_in}</td>
                      <td className="text-dark-300">{entry.clock_out ?? '--'}</td>
                      <td className="text-dark-200 font-medium">{entry.hours?.toFixed(2) ?? '--'}</td>
                      <td>
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', timeStatusColor[entry.status])}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------- PTO -------- */}
      {activeTab === 'pto' && (
        <div>
          {/* Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {ptoBalances.map((b) => {
              const remaining = b.total - b.used
              const pct = (b.used / b.total) * 100
              return (
                <div key={b.type} className="glass-card p-5">
                  <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{b.label}</p>
                  <p className="text-2xl font-display font-bold text-dark-50 mt-1">{remaining} hrs</p>
                  <p className="text-xs text-dark-500 mt-0.5">{b.used} used of {b.total} hrs</p>
                  <div className="mt-3 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        b.color === 'brand' ? 'bg-brand-600' : b.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* PTO requests */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-800/50">
              <h3 className="text-sm font-semibold text-dark-200">PTO Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ptoRequests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', ptoTypeColor[r.type])}>
                          {r.type}
                        </span>
                      </td>
                      <td className="text-dark-300">{formatDate(r.start_date)}</td>
                      <td className="text-dark-300">{formatDate(r.end_date)}</td>
                      <td className="text-dark-200 font-medium">{r.hours}</td>
                      <td className="text-dark-300 max-w-[200px] truncate">{r.reason}</td>
                      <td>
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', ptoStatusColor[r.status])}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------- DOCUMENTS -------- */}
      {activeTab === 'documents' && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-800/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-dark-200">Employee Documents</h3>
            <button className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Upload Document
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th>Document</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'W-4 Federal Withholding', type: 'Tax', uploaded: '2021-06-01', status: 'active' as const },
                  { name: 'I-9 Employment Eligibility', type: 'Identification', uploaded: '2021-06-01', status: 'active' as const },
                  { name: 'Employment Agreement', type: 'Contract', uploaded: '2021-06-01', status: 'active' as const },
                  { name: 'Direct Deposit Form', type: 'Tax', uploaded: '2021-06-15', status: 'active' as const },
                  { name: 'Food Handler Certification', type: 'Certification', uploaded: '2025-08-10', status: 'active' as const },
                ].map((doc, i) => (
                  <tr key={i}>
                    <td className="text-dark-200 font-medium">{doc.name}</td>
                    <td>
                      <span className="px-2 py-0.5 text-xs rounded bg-dark-800 text-dark-300 border border-dark-700/50">
                        {doc.type}
                      </span>
                    </td>
                    <td className="text-dark-400">{formatDate(doc.uploaded)}</td>
                    <td>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full capitalize bg-green-500/10 text-green-400 border border-green-500/20">
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------- ASSIGNMENTS -------- */}
      {activeTab === 'assignments' && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-800/50">
            <h3 className="text-sm font-semibold text-dark-200">Business Assignments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th>Business</th>
                  <th>Role</th>
                  <th>Start Date</th>
                  <th>Primary</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="text-dark-200 font-medium">{a.business}</td>
                    <td className="text-dark-300">{a.role}</td>
                    <td className="text-dark-400">{formatDate(a.start_date)}</td>
                    <td>
                      {a.is_primary ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-dark-600">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-dark-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-dark-500">{label}</p>
        <p className="text-sm text-dark-200 truncate">{value}</p>
      </div>
    </div>
  )
}
