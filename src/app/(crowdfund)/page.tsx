'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatters'
import { getCrowdfundCampaigns, getCrowdfundStats } from '@/lib/supabase/queries'
import type { CrowdfundCampaign, CrowdfundStats } from '@/lib/supabase/queries'
import {
  Rocket,
  Search,
  ArrowRight,
  Users,
  DollarSign,
  Sparkles,
  Building2,
  Calendar,
  User,
  TrendingUp,
  Coins,
  Shield,
} from 'lucide-react'

function CampaignCard({ campaign }: { campaign: CrowdfundCampaign }) {
  const pct = campaign.goal_amount > 0 ? Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100) : 0
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000))
    : null

  const categoryIcon = campaign.category === 'event'
    ? <Calendar className="w-3 h-3" />
    : campaign.category === 'personal'
      ? <User className="w-3 h-3" />
      : <Building2 className="w-3 h-3" />

  return (
    <Link href={`/crowdfund/campaign/${campaign.slug}`} className="group">
      <div className="glass-card overflow-hidden hover:border-brand-600/30 transition-all">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-br from-brand-600/20 via-dark-800 to-dark-900 flex items-center justify-center relative">
          <Rocket className="w-10 h-10 text-brand-600/40" />
          {campaign.equity_token_symbol && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gold-500/15 border border-gold-500/30 rounded-full">
              <Coins className="w-3 h-3 text-gold-400" />
              <span className="text-[10px] font-bold text-gold-400">${campaign.equity_token_symbol}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize border',
              campaign.status === 'active' ? 'bg-green-500/15 text-green-400 border-green-500/20' :
              campaign.status === 'funded' ? 'bg-gold-500/15 text-gold-400 border-gold-500/20' :
              'bg-dark-700 text-dark-300 border-dark-600'
            )}>
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
          <p className="text-xs text-dark-400 line-clamp-2 mb-4">{campaign.short_description}</p>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono font-semibold text-brand-400">{formatCurrency(campaign.raised_amount)}</span>
              <span className="text-dark-500">of {formatCurrency(campaign.goal_amount)}</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-1.5">
              <div
                className={cn('h-1.5 rounded-full transition-all', campaign.status === 'funded' ? 'bg-gold-400' : 'bg-brand-600')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-dark-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.backer_count} backers</span>
            {daysLeft !== null && <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CrowdfundLandingPage() {
  const [campaigns, setCampaigns] = useState<CrowdfundCampaign[]>([])
  const [stats, setStats] = useState<CrowdfundStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [camps, st] = await Promise.all([
        getCrowdfundCampaigns(),
        getCrowdfundStats(),
      ])
      setCampaigns(camps)
      setStats(st)
      setLoading(false)
    }
    load()
  }, [])

  const featured = campaigns.filter((c) => c.status === 'active').slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-600/10 border border-brand-600/20 rounded-full text-xs text-brand-400 font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by 1NC Blockchain
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4 tracking-tight">
            Back the Future
          </h1>
          <p className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-8">
            Support real businesses, events, and projects in the South Armz Global ecosystem.
            Earn equity tokens. Own a piece of what you help build.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/crowdfund/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Explore Campaigns
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-dark-200 font-medium rounded-xl transition-colors text-sm border border-dark-700"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="border-y border-dark-800/50 bg-dark-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-brand-400">{formatCurrency(stats.total_raised)}</p>
                <p className="text-xs text-dark-500 mt-0.5">Total Raised</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">{stats.total_backers.toLocaleString()}</p>
                <p className="text-xs text-dark-500 mt-0.5">Backers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white">{stats.total_campaigns}</p>
                <p className="text-xs text-dark-500 mt-0.5">Campaigns</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-green-400">{stats.funded_campaigns}</p>
                <p className="text-xs text-dark-500 mt-0.5">Fully Funded</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Campaigns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Featured Campaigns</h2>
            <p className="text-sm text-dark-400 mt-1">Active projects looking for your support</p>
          </div>
          <Link href="/crowdfund/explore" className="hidden sm:flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="h-40 bg-dark-800 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-dark-700 rounded animate-pulse" />
                  <div className="h-3 w-full bg-dark-800 rounded animate-pulse" />
                  <div className="h-1.5 w-full bg-dark-800 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link href="/crowdfund/explore" className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
            View all campaigns <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-dark-900/50 border-y border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-display font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Browse', desc: 'Explore campaigns from real businesses, events, and projects across the South Armz Global portfolio.' },
              { icon: DollarSign, title: 'Pledge', desc: 'Choose a reward tier and pledge your support. No payment processing yet — just reserve your spot.' },
              { icon: Coins, title: 'Earn Equity', desc: 'Eligible campaigns offer equity tokens via 1NC Blockchain. Own a piece of what you help build.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-dark-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equity Tokens CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card p-8 sm:p-12 text-center bg-gradient-to-br from-brand-600/5 via-dark-900 to-gold-500/5 border-brand-600/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-xs text-gold-400 font-medium mb-4">
            <Coins className="w-3.5 h-3.5" />
            1NC Blockchain Integration
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
            Not Just Crowdfunding. Ownership.
          </h2>
          <p className="text-dark-400 max-w-xl mx-auto mb-6">
            Select campaigns offer equity tokens on the 1NC Blockchain. When you back a project,
            you earn tokens that represent real ownership. Trade, hold, or redeem — your investment, your choice.
          </p>
          <Link
            href="/crowdfund/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500/15 hover:bg-gold-500/25 text-gold-400 font-semibold rounded-xl transition-colors text-sm border border-gold-500/30"
          >
            <Coins className="w-4 h-4" />
            Browse Token Campaigns
          </Link>
        </div>
      </section>
    </div>
  )
}
