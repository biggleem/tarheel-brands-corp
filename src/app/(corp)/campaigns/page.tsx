'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate, formatCompactNumber } from '@/lib/utils/formatters'
import { getCampaigns } from '@/lib/supabase/queries'
import {
  Plus,
  Mail,
  MessageSquare,
  Share2,
  Megaphone,
  Bell,
  FileText,
  Layers,
  Send,
  Eye,
  MousePointerClick,
  Calendar,
  DollarSign,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────

type CampaignType = 'email' | 'sms' | 'push' | 'social' | 'event' | 'print' | 'multi_channel'
type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'

interface Campaign {
  id: string
  name: string
  campaign_type: CampaignType
  channel: string
  status: CampaignStatus
  budget: number
  spend: number
  metrics: { sent: number; opened: number; clicked: number }
  scheduled_at: string | null
  sent_at: string | null
  completed_at: string | null
  created_at: string
}

// ── Config ─────────────────────────────────────────────────

const typeConfig: Record<CampaignType, { label: string; icon: typeof Mail; color: string; bg: string }> = {
  email:         { label: 'Email',         icon: Mail,           color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  sms:           { label: 'SMS',           icon: MessageSquare,  color: 'text-green-400',  bg: 'bg-green-500/10' },
  push:          { label: 'Push',          icon: Bell,           color: 'text-purple-400', bg: 'bg-purple-500/10' },
  social:        { label: 'Social',        icon: Share2,         color: 'text-pink-400',   bg: 'bg-pink-500/10' },
  event:         { label: 'Event',         icon: Megaphone,      color: 'text-orange-400', bg: 'bg-orange-500/10' },
  print:         { label: 'Print',         icon: FileText,       color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  multi_channel: { label: 'Multi-Channel', icon: Layers,         color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: 'text-dark-300',   bg: 'bg-dark-600/20' },
  scheduled: { label: 'Scheduled', color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  active:    { label: 'Active',    color: 'text-green-400',  bg: 'bg-green-500/10' },
  paused:    { label: 'Paused',    color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  completed: { label: 'Completed', color: 'text-dark-400',   bg: 'bg-dark-700/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400',    bg: 'bg-red-500/10' },
}

type FilterTab = 'all' | CampaignStatus

// ── Loading Skeleton ──────────────────────────────────────

function CampaignSkeleton() {
  return (
    <div className="glass-card p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-dark-700/50 rounded w-3/4" />
          <div className="flex items-center gap-2">
            <div className="h-5 bg-dark-700/50 rounded w-16" />
            <div className="h-5 bg-dark-700/50 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-dark-700/30 rounded w-1/2" />
        <div className="h-3 bg-dark-700/30 rounded w-1/3" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-700/30">
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-3 bg-dark-700/30 rounded w-12 mx-auto" />
            <div className="h-5 bg-dark-700/50 rounded w-10 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page Component ─────────────────────────────────────────

export default function CampaignsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCampaigns().then((data) => {
      setCampaigns(data as Campaign[])
      setLoading(false)
    })
  }, [])

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'scheduled', label: 'Scheduled' },
  ]

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter)

  // Aggregate metrics across all campaigns
  const totalSent = campaigns.reduce((sum, c) => sum + (c.metrics?.sent ?? 0), 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.metrics?.opened ?? 0), 0)
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.metrics?.clicked ?? 0), 0)
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0'
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Campaigns"
        description="Marketing campaigns across all channels and businesses"
        actions={
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        }
      />

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-dark-900/60 border border-dark-700/50 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              filter === tab.value
                ? 'bg-brand-600 text-white'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <Megaphone className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">
            {loading ? <span className="inline-block h-7 w-8 bg-dark-700/50 rounded animate-pulse" /> : campaigns.length}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <Send className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Sent</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">
            {loading ? <span className="inline-block h-7 w-8 bg-dark-700/50 rounded animate-pulse" /> : formatCompactNumber(totalSent)}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Opened</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">
            {loading ? <span className="inline-block h-7 w-8 bg-dark-700/50 rounded animate-pulse" /> : `${openRate}%`}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <MousePointerClick className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Clicked</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">
            {loading ? <span className="inline-block h-7 w-8 bg-dark-700/50 rounded animate-pulse" /> : `${clickRate}%`}
          </p>
        </div>
      </div>

      {/* ── Campaign Cards Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CampaignSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => {
            const typeInfo = typeConfig[campaign.campaign_type] ?? typeConfig.email
            const statusInfo = statusConfig[campaign.status] ?? statusConfig.draft
            const TypeIcon = typeInfo.icon
            const sent = campaign.metrics?.sent ?? 0
            const opened = campaign.metrics?.opened ?? 0
            const clicked = campaign.metrics?.clicked ?? 0
            const cardOpenRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0'
            const cardClickRate = sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0'

            // Pick the best date to show
            const displayDate = campaign.sent_at ?? campaign.scheduled_at ?? campaign.created_at

            return (
              <div key={campaign.id} className="glass-card p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-dark-100 truncate">{campaign.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                          typeInfo.bg,
                          typeInfo.color
                        )}
                      >
                        <TypeIcon className="w-3 h-3" />
                        {typeInfo.label}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                          statusInfo.bg,
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(displayDate)}</span>
                  </div>
                  {campaign.channel && (
                    <div className="flex items-center gap-2 text-xs text-dark-400">
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="capitalize">{campaign.channel}</span>
                    </div>
                  )}
                  {campaign.budget > 0 && (
                    <div className="flex items-center gap-2 text-xs text-dark-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>
                        Budget: {formatCurrency(campaign.budget)}
                        {campaign.spend > 0 && ` / Spent: ${formatCurrency(campaign.spend)}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-700/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-0.5">
                      <Send className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-wider">Sent</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-100">{sent.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-0.5">
                      <Eye className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-wider">Opened</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-100">{cardOpenRate}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-0.5">
                      <MousePointerClick className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-wider">Clicked</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-100">{cardClickRate}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800/60 border border-dark-700/40 mb-5">
            <Megaphone className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-lg font-semibold text-dark-200 mb-2">No campaigns yet</h3>
          <p className="text-sm text-dark-400 max-w-sm mx-auto mb-6">
            Create your first marketing campaign to get started. Reach customers through email, SMS, social media, and more.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Megaphone className="w-10 h-10 text-dark-500 mx-auto mb-3" />
          <p className="text-sm text-dark-400">No campaigns found for this filter.</p>
        </div>
      )}
    </div>
  )
}
