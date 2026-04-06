'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatters'
import { getCrowdfundCampaigns } from '@/lib/supabase/queries'
import type { CrowdfundCampaign } from '@/lib/supabase/queries'
import {
  Search,
  Users,
  Building2,
  Calendar,
  User,
  Coins,
  Rocket,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Campaign Card (same pattern as landing page)                       */
/* ------------------------------------------------------------------ */

function CampaignCard({ campaign }: { campaign: CrowdfundCampaign }) {
  const pct =
    campaign.goal_amount > 0
      ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
      : 0
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000))
    : null

  const categoryIcon =
    campaign.category === 'event' ? (
      <Calendar className="w-3 h-3" />
    ) : campaign.category === 'personal' ? (
      <User className="w-3 h-3" />
    ) : (
      <Building2 className="w-3 h-3" />
    )

  return (
    <Link href={`/crowdfund/campaign/${campaign.slug}`} className="group">
      <div className="glass-card overflow-hidden hover:border-brand-600/30 transition-all">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-br from-brand-600/20 via-dark-800 to-dark-900 flex items-center justify-center relative">
          <Rocket className="w-10 h-10 text-brand-600/40" />
          {campaign.equity_token_symbol && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gold-500/15 border border-gold-500/30 rounded-full">
              <Coins className="w-3 h-3 text-gold-400" />
              <span className="text-[10px] font-bold text-gold-400">
                ${campaign.equity_token_symbol}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize border',
                campaign.status === 'active'
                  ? 'bg-green-500/15 text-green-400 border-green-500/20'
                  : campaign.status === 'funded'
                    ? 'bg-gold-500/15 text-gold-400 border-gold-500/20'
                    : 'bg-dark-700 text-dark-300 border-dark-600'
              )}
            >
              {campaign.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-dark-400 capitalize">
              {categoryIcon} {campaign.category}
            </span>
          </div>
          <h3 className="text-base font-semibold text-dark-100 group-hover:text-brand-400 transition-colors mb-1">
            {campaign.title}
          </h3>
          <p className="text-xs text-dark-400 line-clamp-2 mb-4">
            {campaign.short_description}
          </p>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono font-semibold text-brand-400">
                {formatCurrency(campaign.raised_amount)}
              </span>
              <span className="text-dark-500">of {formatCurrency(campaign.goal_amount)}</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-1.5">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  campaign.status === 'funded' ? 'bg-gold-400' : 'bg-brand-600'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-dark-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {campaign.backer_count} backers
            </span>
            {daysLeft !== null && (
              <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  Skeleton card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-40 bg-dark-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-dark-700 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-dark-700 rounded animate-pulse" />
        <div className="h-3 w-full bg-dark-800 rounded animate-pulse" />
        <div className="h-1.5 w-full bg-dark-800 rounded-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-dark-800 rounded animate-pulse" />
          <div className="h-3 w-16 bg-dark-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Chip / Pill button                                                 */
/* ------------------------------------------------------------------ */

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap',
        active
          ? 'bg-brand-600/15 text-brand-400 border-brand-600/30'
          : 'bg-dark-800/60 text-dark-400 border-dark-700/50 hover:text-dark-200 hover:border-dark-600'
      )}
    >
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Sort options                                                       */
/* ------------------------------------------------------------------ */

type SortKey = 'trending' | 'newest' | 'ending'

const sortOptions: { key: SortKey; label: string; icon: React.ElementType }[] = [
  { key: 'trending', label: 'Trending', icon: TrendingUp },
  { key: 'newest', label: 'Newest', icon: Sparkles },
  { key: 'ending', label: 'Ending Soon', icon: Clock },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<CrowdfundCampaign[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [category, setCategory] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('trending')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getCrowdfundCampaigns()
      setCampaigns(data)
      setLoading(false)
    }
    load()
  }, [])

  /* client-side filter + sort */
  const filtered = useMemo(() => {
    let list = [...campaigns]

    // category
    if (category !== 'all') {
      list = list.filter((c) => c.category === category)
    }

    // status
    if (status !== 'all') {
      list = list.filter((c) => c.status === status)
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.short_description.toLowerCase().includes(q)
      )
    }

    // sort
    if (sort === 'trending') {
      list.sort((a, b) => b.raised_amount - a.raised_amount)
    } else if (sort === 'newest') {
      list.sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
    } else if (sort === 'ending') {
      list.sort((a, b) => {
        const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity
        const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity
        return aEnd - bEnd
      })
    }

    return list
  }, [campaigns, category, status, search, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Explore Campaigns
        </h1>
        <p className="text-sm text-dark-400 mt-2">
          Discover projects and businesses to back across the South Armz Global portfolio.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-800/60 border border-dark-700/50 rounded-xl text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/30 transition-colors"
          />
        </div>

        {/* Filter rows */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category chips */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-dark-500 mr-1" />
            {['all', 'business', 'event', 'personal'].map((cat) => (
              <Chip
                key={cat}
                label={cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>

          {/* Status chips */}
          <div className="flex items-center gap-1.5">
            {['all', 'active', 'funded'].map((s) => (
              <Chip
                key={s}
                label={s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                active={status === s}
                onClick={() => setStatus(s)}
              />
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-dark-500 mr-1" />
            {sortOptions.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                active={sort === opt.key}
                onClick={() => setSort(opt.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Search className="w-10 h-10 text-dark-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-dark-300 mb-1">No campaigns found</h3>
          <p className="text-sm text-dark-500">
            Try adjusting your filters or search term.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-dark-500 mb-4">
            {filtered.length} campaign{filtered.length !== 1 && 's'} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
