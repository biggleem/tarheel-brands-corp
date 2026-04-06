'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatters'
import { getCrowdfundCampaignBySlug, createCrowdfundPledge } from '@/lib/supabase/queries'
import type { CrowdfundCampaign } from '@/lib/supabase/queries'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  AlertTriangle,
  Rocket,
  User,
  Mail,
  DollarSign,
  Sparkles,
  Loader2,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

const steps = ['Select Tier', 'Your Info', 'Confirm']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === current
        const isComplete = stepNum < current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors',
                  isComplete
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : isActive
                      ? 'bg-brand-600/15 border-brand-600/50 text-brand-400'
                      : 'bg-dark-800 border-dark-700 text-dark-500'
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:inline',
                  isActive ? 'text-brand-400' : isComplete ? 'text-dark-300' : 'text-dark-500'
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-px',
                  isComplete ? 'bg-brand-600' : 'bg-dark-700'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function PledgeSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-4 w-32 bg-dark-700 rounded mb-8" />
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-7 h-7 rounded-full bg-dark-700" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-dark-800 rounded-xl" />
        <div className="h-24 bg-dark-800 rounded-xl" />
        <div className="h-24 bg-dark-800 rounded-xl" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PledgeClient() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string

  const [campaign, setCampaign] = useState<CrowdfundCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // wizard state
  const [step, setStep] = useState(1)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    pledge_id: string
    tokens: number
    campaign: string
  } | null>(null)

  useEffect(() => {
    if (!slug) return
    async function load() {
      setLoading(true)
      const data = await getCrowdfundCampaignBySlug(slug)
      if (!data) {
        setNotFound(true)
      } else {
        setCampaign(data)
        // pre-select tier from URL param
        const tierParam = searchParams?.get('tier')
        if (tierParam) {
          const match = data.tiers?.find(
            (t) => t.name.toLowerCase() === tierParam.toLowerCase()
          )
          if (match) setSelectedTier(match.name)
        }
      }
      setLoading(false)
    }
    load()
  }, [slug, searchParams])

  if (loading) return <PledgeSkeleton />

  if (notFound || !campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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

  /* ---- derived ---- */
  const tier = selectedTier
    ? campaign.tiers?.find((t) => t.name === selectedTier) ?? null
    : null
  const pledgeAmount = tier
    ? tier.amount
    : parseFloat(customAmount) || 0
  const tokensEarned =
    campaign.equity_token_symbol && campaign.equity_per_dollar > 0
      ? pledgeAmount * campaign.equity_per_dollar
      : 0

  const canGoNext =
    step === 1
      ? pledgeAmount > 0
      : step === 2
        ? name.trim().length > 0 && email.trim().length > 0 && email.includes('@')
        : true

  /* ---- submit ---- */
  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await createCrowdfundPledge({
        campaign_slug: campaign!.slug,
        name: name.trim(),
        email: email.trim(),
        amount: pledgeAmount,
        tier_name: selectedTier ?? undefined,
      })
      setResult(res)
      setStep(4) // success step
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- success view ---- */
  if (step === 4 && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card p-8 sm:p-12 text-center bg-gradient-to-br from-brand-600/5 via-dark-900 to-gold-500/5 border-brand-600/20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Thank you for backing {campaign.title}!
          </h2>
          <p className="text-sm text-dark-400 mb-6">
            Your pledge of {formatCurrency(pledgeAmount)} has been recorded.
          </p>

          {tokensEarned > 0 && campaign.equity_token_symbol && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500/10 border border-gold-500/20 rounded-xl mb-6">
              <Coins className="w-5 h-5 text-gold-400" />
              <span className="text-sm font-semibold text-gold-400">
                You earned {tokensEarned.toLocaleString()} ${campaign.equity_token_symbol} tokens
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
            <Link
              href={`/crowdfund/campaign/${campaign.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-xl transition-colors border border-dark-700"
            >
              View Campaign
            </Link>
            <Link
              href="/crowdfund/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Explore More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ---- wizard ---- */
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href={`/crowdfund/campaign/${campaign.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-dark-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {campaign.title}
      </Link>

      <h1 className="text-2xl font-display font-bold text-white mb-2">
        Pledge to {campaign.title}
      </h1>
      <p className="text-sm text-dark-400 mb-6">
        Complete the steps below to back this project.
      </p>

      <StepIndicator current={step} />

      {/* ============= STEP 1 : Select Tier ============= */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Tier cards */}
          {campaign.tiers &&
            campaign.tiers.map((t, i) => {
              const soldOut = t.limit > 0 && t.claimed >= t.limit
              const isSelected = selectedTier === t.name
              return (
                <button
                  key={i}
                  disabled={soldOut}
                  onClick={() => {
                    setSelectedTier(t.name)
                    setCustomAmount('')
                  }}
                  className={cn(
                    'w-full text-left glass-card p-5 transition-all',
                    soldOut
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'border-brand-600/50 bg-brand-600/5'
                        : 'hover:border-dark-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-semibold text-dark-100">{t.name}</h3>
                    <span className="text-sm font-mono font-bold text-brand-400">
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mb-2">{t.description}</p>
                  <div className="flex items-center justify-between">
                    {t.limit > 0 && (
                      <span className="text-[10px] text-dark-500">
                        {t.claimed}/{t.limit} claimed
                      </span>
                    )}
                    {soldOut && (
                      <span className="text-[10px] font-semibold text-dark-500">Sold Out</span>
                    )}
                  </div>
                </button>
              )
            })}

          {/* Custom amount */}
          <button
            onClick={() => {
              setSelectedTier(null)
            }}
            className={cn(
              'w-full text-left glass-card p-5 transition-all',
              !selectedTier
                ? 'border-brand-600/50 bg-brand-600/5'
                : 'hover:border-dark-600'
            )}
          >
            <h3 className="text-sm font-semibold text-dark-100 mb-2">Custom Amount</h3>
            <div className="relative max-w-xs">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={customAmount}
                onFocus={() => setSelectedTier(null)}
                onChange={(e) => {
                  setSelectedTier(null)
                  setCustomAmount(e.target.value)
                }}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-dark-800/60 border border-dark-700/50 rounded-xl text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/30 transition-colors"
              />
            </div>
          </button>

          {/* Token preview */}
          {tokensEarned > 0 && campaign.equity_token_symbol && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gold-500/10 border border-gold-500/20 rounded-xl text-xs">
              <Coins className="w-4 h-4 text-gold-400" />
              <span className="text-gold-400">
                You will earn <strong>{tokensEarned.toLocaleString()}</strong> $
                {campaign.equity_token_symbol} tokens
              </span>
            </div>
          )}
        </div>
      )}

      {/* ============= STEP 2 : Your Info ============= */}
      {step === 2 && (
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-800/60 border border-dark-700/50 rounded-xl text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/30 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-dark-800/60 border border-dark-700/50 rounded-xl text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/30 transition-colors"
              />
            </div>
            <p className="text-[10px] text-dark-500 mt-1.5">
              No account needed. We will send your pledge confirmation here.
            </p>
          </div>
        </div>
      )}

      {/* ============= STEP 3 : Confirm ============= */}
      {step === 3 && (
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider">
            Review Your Pledge
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-dark-800/60">
              <span className="text-dark-400">Campaign</span>
              <span className="text-dark-100 font-medium">{campaign.title}</span>
            </div>
            {tier && (
              <div className="flex items-center justify-between py-2 border-b border-dark-800/60">
                <span className="text-dark-400">Tier</span>
                <span className="text-dark-100 font-medium">{tier.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-dark-800/60">
              <span className="text-dark-400">Pledge Amount</span>
              <span className="text-brand-400 font-mono font-bold">
                {formatCurrency(pledgeAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dark-800/60">
              <span className="text-dark-400">Name</span>
              <span className="text-dark-100">{name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-dark-800/60">
              <span className="text-dark-400">Email</span>
              <span className="text-dark-100">{email}</span>
            </div>
            {tokensEarned > 0 && campaign.equity_token_symbol && (
              <div className="flex items-center justify-between py-2">
                <span className="text-dark-400">Equity Tokens</span>
                <span className="text-gold-400 font-mono font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  {tokensEarned.toLocaleString()} ${campaign.equity_token_symbol}
                </span>
              </div>
            )}
          </div>

          {submitError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* ---- Navigation buttons ---- */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-dark-300 hover:text-dark-100 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            disabled={!canGoNext}
            onClick={() => setStep(step + 1)}
            className={cn(
              'inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors',
              canGoNext
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : 'bg-dark-700 text-dark-500 cursor-not-allowed'
            )}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className={cn(
              'inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors',
              submitting
                ? 'bg-dark-700 text-dark-400 cursor-wait'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Submit Pledge
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
