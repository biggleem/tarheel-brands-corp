'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getCrowdfundCampaignBySlug } from '@/lib/supabase/queries'
import type { CrowdfundCampaign } from '@/lib/supabase/queries'
import {
  ArrowLeft,
  Users,
  Clock,
  Building2,
  Calendar,
  User,
  Coins,
  Rocket,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Heart,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-4 w-32 bg-dark-700 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-2/3 bg-dark-700 rounded" />
          <div className="h-4 w-40 bg-dark-800 rounded" />
          <div className="h-32 bg-dark-800 rounded-xl" />
          <div className="h-24 bg-dark-800 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-dark-800 rounded-xl" />
          <div className="h-32 bg-dark-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CampaignDetailClient() {
  const params = useParams()
  const slug = params?.slug as string

  const [campaign, setCampaign] = useState<CrowdfundCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    async function load() {
      setLoading(true)
      const data = await getCrowdfundCampaignBySlug(slug)
      if (!data) {
        setNotFound(true)
      } else {
        setCampaign(data)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <DetailSkeleton />

  if (notFound || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-dark-200 mb-2">
          Campaign Not Found
        </h2>
        <p className="text-sm text-dark-400 mb-6">
          The campaign you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/crowdfund/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Campaigns
        </Link>
      </div>
    )
  }

  const pct =
    campaign.goal_amount > 0
      ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)
      : 0
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000))
    : null

  const categoryIcon =
    campaign.category === 'event' ? (
      <Calendar className="w-3.5 h-3.5" />
    ) : campaign.category === 'personal' ? (
      <User className="w-3.5 h-3.5" />
    ) : (
      <Building2 className="w-3.5 h-3.5" />
    )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/crowdfund/explore"
        className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-dark-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---- Left column (2/3) ---- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title area */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize border',
                  campaign.status === 'active'
                    ? 'bg-green-500/15 text-green-400 border-green-500/20'
                    : campaign.status === 'funded'
                      ? 'bg-gold-500/15 text-gold-400 border-gold-500/20'
                      : 'bg-dark-700 text-dark-300 border-dark-600'
                )}
              >
                {campaign.status}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-dark-400 capitalize">
                {categoryIcon} {campaign.category}
              </span>
              {campaign.equity_token_symbol && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30 rounded-full">
                  <Coins className="w-3 h-3" /> ${campaign.equity_token_symbol}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {campaign.title}
            </h1>
            {campaign.organization_name && (
              <p className="text-sm text-dark-400 mt-1">
                by <span className="text-dark-300 font-medium">{campaign.organization_name}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-dark-200 mb-3 uppercase tracking-wider">
              About this Project
            </h2>
            <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-line">
              {campaign.description}
            </p>
          </div>

          {/* Updates */}
          {campaign.updates && campaign.updates.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-brand-400" /> Updates
              </h2>
              <div className="space-y-4">
                {campaign.updates.map((update, i) => (
                  <div
                    key={i}
                    className={cn(
                      'pb-4',
                      i < campaign.updates.length - 1 && 'border-b border-dark-800/60'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-dark-500">{formatDate(update.date)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-dark-100 mb-1">{update.title}</h3>
                    <p className="text-xs text-dark-400 leading-relaxed">{update.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---- Right column (1/3) ---- */}
        <div className="space-y-5">
          {/* CTA */}
          <Link
            href={`/crowdfund/campaign/${campaign.slug}/pledge`}
            className="block w-full text-center px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Heart className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Back This Project
          </Link>

          {/* Funding progress */}
          <div className="glass-card p-5">
            <div className="mb-4">
              <p className="text-2xl font-display font-bold text-brand-400">
                {formatCurrency(campaign.raised_amount)}
              </p>
              <p className="text-xs text-dark-500 mt-0.5">
                raised of {formatCurrency(campaign.goal_amount)} goal
              </p>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-2 mb-4">
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  campaign.status === 'funded' ? 'bg-gold-400' : 'bg-brand-600'
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-display font-bold text-white">
                  {Math.round(pct)}%
                </p>
                <p className="text-[10px] text-dark-500">Funded</p>
              </div>
              <div>
                <p className="text-lg font-display font-bold text-white">
                  {campaign.backer_count}
                </p>
                <p className="text-[10px] text-dark-500">Backers</p>
              </div>
              <div>
                <p className="text-lg font-display font-bold text-white">
                  {daysLeft !== null ? (daysLeft > 0 ? daysLeft : 0) : '--'}
                </p>
                <p className="text-[10px] text-dark-500">Days Left</p>
              </div>
            </div>
          </div>

          {/* Equity Token info */}
          {campaign.equity_token_symbol && (
            <div className="glass-card p-5 bg-gradient-to-br from-gold-500/5 via-dark-900 to-dark-900 border-gold-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gold-500/15 rounded-lg">
                  <Coins className="w-4 h-4 text-gold-400" />
                </div>
                <h3 className="text-sm font-semibold text-gold-400">Equity Token</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Token Symbol</span>
                  <span className="font-mono font-bold text-gold-400">
                    ${campaign.equity_token_symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Rate</span>
                  <span className="text-dark-200">
                    {campaign.equity_per_dollar} token{campaign.equity_per_dollar !== 1 ? 's' : ''} / $1
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-dark-500 mt-3 flex items-start gap-1">
                <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Tokens issued via 1NC Blockchain after campaign funds.
              </p>
            </div>
          )}

          {/* Pledge tiers */}
          {campaign.tiers && campaign.tiers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider">
                Pledge Tiers
              </h3>
              {campaign.tiers.map((tier, i) => {
                const soldOut = tier.limit > 0 && tier.claimed >= tier.limit
                return (
                  <div
                    key={i}
                    className={cn(
                      'glass-card p-4 transition-all',
                      soldOut
                        ? 'opacity-50'
                        : 'hover:border-brand-600/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-semibold text-dark-100">{tier.name}</h4>
                      <span className="text-sm font-mono font-bold text-brand-400">
                        {formatCurrency(tier.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 mb-3">{tier.description}</p>
                    <div className="flex items-center justify-between">
                      {tier.limit > 0 && (
                        <span className="text-[10px] text-dark-500">
                          {tier.claimed}/{tier.limit} claimed
                        </span>
                      )}
                      {soldOut ? (
                        <span className="text-[10px] font-semibold text-dark-500">Sold Out</span>
                      ) : (
                        <Link
                          href={`/crowdfund/campaign/${campaign.slug}/pledge?tier=${encodeURIComponent(tier.name)}`}
                          className="px-3 py-1 text-xs font-medium bg-brand-600/15 text-brand-400 border border-brand-600/30 rounded-lg hover:bg-brand-600/25 transition-colors"
                        >
                          Select
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Recent backers */}
          {campaign.recent_pledges && campaign.recent_pledges.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-dark-200 mb-3 uppercase tracking-wider">
                Recent Backers
              </h3>
              <div className="space-y-3">
                {campaign.recent_pledges.map((pledge, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-700 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-dark-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-dark-200">
                          {pledge.is_anonymous ? 'Anonymous' : pledge.backer_name}
                        </p>
                        <p className="text-[10px] text-dark-500">{formatDate(pledge.created_at)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-brand-400">
                      {formatCurrency(pledge.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
