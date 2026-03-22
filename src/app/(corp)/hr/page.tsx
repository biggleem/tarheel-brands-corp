'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatDate } from '@/lib/utils/formatters'
import { getStaffDirectory } from '@/lib/supabase/queries'
import { SortableHeader } from '@/components/shared/sortable-header'
import { useSortableData } from '@/lib/hooks/use-sortable-data'
import type { StaffProfile, StaffAssignment, Organization, EmploymentType } from '@/lib/types'
import {
  Users,
  UserCheck,
  UserMinus,
  Briefcase,
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Eye,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────

type StaffRow = StaffProfile & {
  assignments: (StaffAssignment & {
    organization: Pick<Organization, 'id' | 'name' | 'slug'>
  })[]
}

type StatusFilter = 'all' | 'active' | 'inactive'

// ── Helpers ──────────────────────────────────────────────────

const statusColor: Record<'active' | 'inactive', string> = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  inactive: 'bg-dark-600/40 text-dark-400 border border-dark-600/40',
}

const typeLabel: Record<EmploymentType, string> = {
  full_time: 'Full-Time',
  part_time: 'Part-Time',
  contractor: 'Contractor',
  intern: 'Intern',
  seasonal: 'Seasonal',
}

const typeBadge: Record<EmploymentType, string> = {
  full_time: 'bg-brand-600/10 text-brand-400 border border-brand-600/20',
  part_time: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  contractor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  intern: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  seasonal: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
}

function getBusinessNames(staff: StaffRow): string[] {
  return staff.assignments.filter((a) => a.is_active).map((a) => a.organization?.name).filter(Boolean) as string[]
}

function getPrimaryAssignment(staff: StaffRow) {
  return staff.assignments.find((a) => a.is_primary && a.is_active) ?? staff.assignments.find((a) => a.is_active) ?? staff.assignments[0] ?? null
}

// ── Loading Skeleton ─────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-dark-700/50">
              <th>Employee</th><th>Title</th><th className="hidden lg:table-cell">Business(es)</th><th>Type</th><th>Status</th><th className="hidden md:table-cell">Hire Date</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-dark-700 animate-pulse" /><div className="space-y-1.5"><div className="h-3.5 w-28 bg-dark-700 rounded animate-pulse" /><div className="h-3 w-16 bg-dark-800 rounded animate-pulse" /></div></div></td>
                <td><div className="h-3.5 w-24 bg-dark-700 rounded animate-pulse" /></td>
                <td className="hidden lg:table-cell"><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
                <td><div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" /></td>
                <td><div className="h-5 w-14 bg-dark-700 rounded-full animate-pulse" /></td>
                <td className="hidden md:table-cell"><div className="h-3.5 w-20 bg-dark-700 rounded animate-pulse" /></td>
                <td><div className="h-4 w-20 bg-dark-700 rounded animate-pulse ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Page Component ───────────────────────────────────────────

export default function HRStaffDirectoryPage() {
  const router = useRouter()
  const [staffData, setStaffData] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBusiness, setFilterBusiness] = useState('all')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')
  const [filterType, setFilterType] = useState<EmploymentType | 'all'>('all')

  useEffect(() => {
    let cancelled = false
    async function fetchStaff() {
      try {
        const data = await getStaffDirectory()
        if (!cancelled) setStaffData(data as StaffRow[])
      } catch (err) {
        console.error('Failed to fetch staff:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStaff()
    return () => { cancelled = true }
  }, [])

  const allBusinesses = useMemo(() => {
    const names = new Set<string>()
    for (const staff of staffData) {
      for (const a of staff.assignments) {
        if (a.organization?.name) names.add(a.organization.name)
      }
    }
    return Array.from(names).sort()
  }, [staffData])

  const stats = useMemo(() => {
    const total = staffData.length
    const active = staffData.filter((s) => s.is_active).length
    const inactive = total - active
    const contractors = staffData.filter((s) => s.employment_type === 'contractor').length
    return { total, active, inactive, contractors }
  }, [staffData])

  const filtered = useMemo(() => {
    return staffData.filter((s) => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
      const assignment = getPrimaryAssignment(s)
      const title = assignment?.title ?? ''
      const matchesSearch = search === '' || fullName.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || title.toLowerCase().includes(search.toLowerCase())
      const businesses = getBusinessNames(s)
      const matchesBusiness = filterBusiness === 'all' || businesses.includes(filterBusiness)
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && s.is_active) || (filterStatus === 'inactive' && !s.is_active)
      const matchesType = filterType === 'all' || s.employment_type === filterType
      return matchesSearch && matchesBusiness && matchesStatus && matchesType
    })
  }, [staffData, search, filterBusiness, filterStatus, filterType])

  const { sortedData: sortedStaff, sortConfig, requestSort } = useSortableData(
    filtered as unknown as Record<string, unknown>[],
    { key: 'first_name', direction: 'asc' }
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="HR / Staff Directory"
        description="Manage your team across all Tarheel Brands businesses"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Employees" value={loading ? '-' : String(stats.total)} icon={Users} iconColor="text-brand-400" />
        <StatCard title="Active" value={loading ? '-' : String(stats.active)} icon={UserCheck} iconColor="text-green-400" subtitle={!loading && stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}% of workforce` : undefined} />
        <StatCard title="Inactive" value={loading ? '-' : String(stats.inactive)} icon={UserMinus} iconColor="text-yellow-400" />
        <StatCard title="Contractors" value={loading ? '-' : String(stats.contractors)} icon={Briefcase} iconColor="text-purple-400" />
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input type="text" placeholder="Search by name, email, or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-600 transition-colors" />
          </div>
          <div className="relative">
            <select value={filterBusiness} onChange={(e) => setFilterBusiness(e.target.value)} className="appearance-none w-full md:w-48 pl-4 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600 transition-colors">
              <option value="all">All Businesses</option>
              {allBusinesses.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)} className="appearance-none w-full md:w-40 pl-4 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600 transition-colors">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as EmploymentType | 'all')} className="appearance-none w-full md:w-44 pl-4 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-brand-600 transition-colors">
              <option value="all">All Types</option>
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="contractor">Contractor</option>
              <option value="intern">Intern</option>
              <option value="seasonal">Seasonal</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? <TableSkeleton /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <SortableHeader label="Employee" sortKey="first_name" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Title" sortKey="employment_type" currentSort={sortConfig} onSort={requestSort} />
                  <th className="hidden lg:table-cell">Business(es)</th>
                  <SortableHeader label="Type" sortKey="employment_type" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Status" sortKey="is_active" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Hire Date" sortKey="hire_date" currentSort={sortConfig} onSort={requestSort} className="hidden md:table-cell" />
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(sortedStaff as unknown as typeof filtered).map((staff) => {
                  const assignment = getPrimaryAssignment(staff)
                  const businesses = getBusinessNames(staff)
                  const statusKey = staff.is_active ? 'active' : 'inactive'
                  return (
                    <tr key={staff.id} onClick={() => router.push(`/hr/${staff.id}`)} className="cursor-pointer">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-brand-400">{staff.first_name[0]}{staff.last_name[0]}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-100 truncate">{staff.first_name} {staff.last_name}</p>
                            <p className="text-xs text-dark-500 truncate">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-dark-200">{assignment?.title ?? '-'}</span></td>
                      <td className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {businesses.length > 0 ? businesses.map((b) => (
                            <span key={b} className="inline-block px-2 py-0.5 text-xs rounded bg-dark-800 text-dark-300 border border-dark-700/50">{b}</span>
                          )) : <span className="text-dark-500 text-xs">Unassigned</span>}
                        </div>
                      </td>
                      <td><span className={cn('inline-block px-2.5 py-1 text-xs font-medium rounded-full', typeBadge[staff.employment_type])}>{typeLabel[staff.employment_type]}</span></td>
                      <td><span className={cn('inline-block px-2.5 py-1 text-xs font-medium rounded-full capitalize', statusColor[statusKey])}>{statusKey === 'active' ? 'Active' : 'Inactive'}</span></td>
                      <td className="hidden md:table-cell text-dark-300">{formatDate(staff.hire_date)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => router.push(`/hr/${staff.id}`)} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors" title="View profile"><Eye className="w-4 h-4" /></button>
                          <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors" title="More"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-8 h-8 text-dark-500 mb-3" />
              <p className="text-dark-300 font-medium">No employees found</p>
              <p className="text-dark-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
          <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
            <p className="text-xs text-dark-500">Showing {filtered.length} of {staffData.length} employees</p>
          </div>
        </div>
      )}
    </div>
  )
}
