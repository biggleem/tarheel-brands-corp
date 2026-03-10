'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
type CampaignType = 'email' | 'sms' | 'push' | 'social' | 'in_store' | 'rewards_bonus' | 'discount'
type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
import {
  Plus,
  Mail,
  MessageSquare,
  Share2,
  Megaphone,
  Gift,
  Tag,
  Bell,
  Store,
  Send,
  Eye,
  MousePointerClick,
  Calendar,
  DollarSign,
  Building2,
} from 'lucide-react'

// ── Config ─────────────────────────────────────────────────

const typeConfig: Record<CampaignType, { label: string; icon: typeof Mail; color: string; bg: string }> = {
  email: { label: 'Email', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  sms: { label: 'SMS', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  push: { label: 'Push', icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  social: { label: 'Social', icon: Share2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  in_store: { label: 'In-Store', icon: Store, color: 'text-gold-400', bg: 'bg-gold-400/10' },
  rewards_bonus: { label: 'Rewards Bonus', icon: Gift, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  discount: { label: 'Discount', icon: Tag, color: 'text-red-400', bg: 'bg-red-500/10' },
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-dark-300', bg: 'bg-dark-600/20' },
  scheduled: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/10' },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  completed: { label: 'Completed', color: 'text-dark-400', bg: 'bg-dark-700/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10' },
}

type FilterTab = 'all' | CampaignStatus

// ── Data ───────────────────────────────────────────────────

interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate: string
  budget: number
  sent: number
  opened: number
  clicked: number
  business: string
}

const campaigns: Campaign[] = []

// ── Page Component ─────────────────────────────────────────

export default function CampaignsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'scheduled', label: 'Scheduled' },
  ]

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter)

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
          <p className="text-2xl font-bold text-dark-100">{campaigns.length}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <Send className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Sent</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">0</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Opened</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">0%</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-dark-400 mb-1">
            <MousePointerClick className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Clicked</span>
          </div>
          <p className="text-2xl font-bold text-dark-100">0%</p>
        </div>
      </div>

      {/* ── Campaign Cards Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => {
            const typeInfo = typeConfig[campaign.type]
            const statusInfo = statusConfig[campaign.status]
            const TypeIcon = typeInfo.icon
            const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0.0'
            const clickRate = campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : '0.0'

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
                    <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{campaign.business}</span>
                  </div>
                  {campaign.budget > 0 && (
                    <div className="flex items-center gap-2 text-xs text-dark-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Budget: {formatCurrency(campaign.budget)}</span>
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
                    <p className="text-sm font-semibold text-dark-100">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-0.5">
                      <Eye className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-wider">Opened</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-100">{openRate}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-dark-400 mb-0.5">
                      <MousePointerClick className="w-3 h-3" />
                      <span className="text-[10px] uppercase tracking-wider">Clicked</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-100">{clickRate}%</p>
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
