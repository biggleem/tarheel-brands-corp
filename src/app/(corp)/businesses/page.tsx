'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { getBusinesses } from '@/lib/supabase/queries'
import type { BusinessCategory, Business, Organization } from '@/lib/types'
import {
  Plus,
  Search,
  Globe,
  ChevronRight,
  Filter,
  Building2,
} from 'lucide-react'

const categoryConfig: Record<BusinessCategory, { label: string; color: string }> = {
  restaurant:    { label: 'Food & Beverage',       color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  technology:    { label: 'Technology',             color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  entertainment: { label: 'Media & Entertainment',  color: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
  service:       { label: 'Services',               color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
  retail:        { label: 'Retail',                  color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  real_estate:   { label: 'Real Estate',             color: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  other:         { label: 'Other',                   color: 'bg-dark-500/15 text-dark-300 border-dark-500/20' },
}

function parseLocation(address: Record<string, unknown> | null | undefined): string {
  if (!address || typeof address !== 'object') return 'Pittsboro, NC'
  const city = (address.city as string) || ''
  const state = (address.state as string) || ''
  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state) return state
  return 'Pittsboro, NC'
}

type BusinessWithOrg = Business & { organization: Organization }

function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="h-4 w-32 bg-dark-700 rounded mb-2" />
          <div className="h-3 w-20 bg-dark-800 rounded" />
        </div>
      </div>
      <div className="h-5 w-24 bg-dark-700 rounded mt-2" />
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-800/50">
        <div className="h-3 w-28 bg-dark-800 rounded" />
        <div className="h-3 w-14 bg-dark-800 rounded" />
      </div>
    </div>
  )
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getBusinesses()
      if (!cancelled) {
        setBusinesses(data as BusinessWithOrg[])
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const orgName = b.organization?.name ?? ''
      const domain = b.domain ?? ''
      const matchesSearch = !search || orgName.toLowerCase().includes(search.toLowerCase()) || domain.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter
      const isActive = b.organization?.is_active ?? b.is_active
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && isActive) || (statusFilter === 'inactive' && !isActive)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [businesses, search, categoryFilter, statusFilter])

  const uniqueCategories = useMemo(() => {
    return [...new Set(businesses.map((b) => b.category))].sort() as BusinessCategory[]
  }, [businesses])

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Businesses"
        description={loading ? 'Loading organizations...' : `${businesses.length} organizations across the portfolio`}
        actions={
          <Link href="/businesses?action=new" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Business
          </Link>
        }
      />

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input type="text" placeholder="Search businesses or domains..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600/50 focus:border-brand-600/50 transition-colors" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none pl-9 pr-8 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors">
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{categoryConfig[cat]?.label ?? cat}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none px-4 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-dark-500">{loading ? 'Loading...' : `Showing ${filtered.length} of ${businesses.length} businesses`}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building2 className="w-10 h-10 text-dark-600 mx-auto mb-3" />
          <p className="text-sm text-dark-400">No businesses match your filters.</p>
          <button onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all') }} className="mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((biz) => {
            const catInfo = categoryConfig[biz.category] ?? categoryConfig.other
            const orgActive = biz.organization?.is_active ?? biz.is_active
            const statusDot = orgActive ? 'bg-green-400' : 'bg-dark-500'
            const statusLabel = orgActive ? 'Active' : 'Inactive'
            const orgName = biz.organization?.name ?? 'Unknown'
            const location = parseLocation(biz.organization?.address as Record<string, unknown>)
            const orgId = biz.organization?.id ?? biz.organization_id

            return (
              <Link key={biz.id} href={`/businesses/${orgId}`} className="glass-card p-5 hover:border-brand-600/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-dark-100 group-hover:text-white transition-colors truncate">{orgName}</h3>
                    <p className="text-xs text-dark-500 mt-0.5">{location}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-dark-400 transition-colors shrink-0 mt-0.5" />
                </div>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border', catInfo.color)}>{catInfo.label}</span>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-800/50">
                  {biz.domain ? (
                    <span className="flex items-center gap-1 text-xs text-dark-400"><Globe className="w-3 h-3" />{biz.domain}</span>
                  ) : (
                    <span className="text-xs text-dark-600">No domain</span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-dark-400">
                    <span className={cn('w-1.5 h-1.5 rounded-full', statusDot)} />{statusLabel}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
