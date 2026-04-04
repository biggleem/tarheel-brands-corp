'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { RewardsTier } from '@/lib/types'
type RewardsTransactionType = 'earn' | 'redeem' | 'adjust' | 'expire'
import {
  Award,
  Users,
  TrendingUp,
  Gift,
  UserPlus,
  Crown,
  Star,
  Gem,
  Medal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// ── Tier Config ────────────────────────────────────────────

const tierConfig: Record<RewardsTier, { label: string; color: string; bg: string; border: string; icon: typeof Star }> = {
  bronze: { label: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', icon: Medal },
  silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-400/10', border: 'border-gray-400/30', icon: Star },
  gold: { label: 'Gold', color: 'text-gold-400', bg: 'bg-gold-400/10', border: 'border-gold-400/30', icon: Crown },
  platinum: { label: 'Platinum', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', icon: Gem },
}

// ── Data (empty until Supabase tables are populated) ─────

const tierBreakdown: { tier: RewardsTier; count: number }[] = []

const members: {
  id: string; firstName: string; lastName: string; email: string;
  tier: RewardsTier; pointsBalance: number; lifetimePoints: number;
  lastVisit: string; joinedAt: string;
}[] = []

const recentTransactions: {
  id: string; memberName: string; type: RewardsTransactionType;
  points: number; description: string; date: string;
}[] = []

// ── Page Component ─────────────────────────────────────────

export default function RewardsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulates data fetch — swap with real Supabase query later
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-dark-400">Loading rewards data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="SA Rewards"
        description="Loyalty program management across all businesses"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value="0"
          icon={Users}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Active Members"
          value="0"
          icon={Award}
          iconColor="text-green-400"
        />
        <StatCard
          title="Points Issued (MTD)"
          value="0"
          icon={TrendingUp}
          iconColor="text-brand-400"
        />
        <StatCard
          title="Points Redeemed (MTD)"
          value="0"
          icon={Gift}
          iconColor="text-gold-400"
        />
      </div>

      {/* ── Tier Breakdown ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Tier Breakdown</h3>
        {tierBreakdown.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tierBreakdown.map(({ tier, count }) => {
              const config = tierConfig[tier]
              const TierIcon = config.icon
              const total = tierBreakdown.reduce((acc, t) => acc + t.count, 0)
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
              return (
                <div
                  key={tier}
                  className={cn('flex items-center gap-3 p-4 rounded-xl border', config.bg, config.border)}
                >
                  <div className={cn('p-2 rounded-lg bg-dark-900', config.color)}>
                    <TierIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={cn('text-lg font-display font-bold', config.color)}>{count.toLocaleString()}</p>
                    <p className="text-xs text-dark-400">
                      {config.label} &bull; {pct}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 rounded-xl bg-dark-800/60 mb-3">
              <Crown className="w-6 h-6 text-dark-500" />
            </div>
            <p className="text-sm font-medium text-dark-300">No tier data yet</p>
            <p className="text-xs text-dark-500 mt-1">Members will appear across tiers as they enroll</p>
          </div>
        )}
      </div>

      {/* ── Members Table ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Members</h3>
        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th className="text-right">Points Balance</th>
                  <th className="text-right">Lifetime Points</th>
                  <th>Last Visit</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const config = tierConfig[member.tier]
                  const TierIcon = config.icon
                  return (
                    <tr key={member.id}>
                      <td className="text-dark-100 font-medium whitespace-nowrap">
                        {member.firstName} {member.lastName}
                      </td>
                      <td className="text-dark-300 text-xs">{member.email}</td>
                      <td>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            config.bg,
                            config.color
                          )}
                        >
                          <TierIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="text-right font-mono text-dark-100">
                        {member.pointsBalance.toLocaleString()}
                      </td>
                      <td className="text-right font-mono text-dark-300">
                        {member.lifetimePoints.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap">{formatDate(member.lastVisit)}</td>
                      <td className="whitespace-nowrap text-dark-400">{formatDate(member.joinedAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-xl bg-dark-800/60 mb-3">
              <Users className="w-6 h-6 text-dark-500" />
            </div>
            <p className="text-sm font-medium text-dark-300">No rewards members yet</p>
            <p className="text-xs text-dark-500 mt-1">Members will appear here once they enroll in the loyalty program</p>
          </div>
        )}
      </div>

      {/* ── Recent Rewards Transactions ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Recent Rewards Activity</h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-1">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800/40 transition-colors"
              >
                <div
                  className={cn(
                    'p-1.5 rounded-lg',
                    tx.type === 'earn' ? 'bg-green-500/10' : 'bg-gold-400/10'
                  )}
                >
                  {tx.type === 'earn' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-gold-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-100">{tx.memberName}</span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                        tx.type === 'earn'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gold-400/10 text-gold-400'
                      )}
                    >
                      {tx.type}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 truncate">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-mono font-semibold',
                      tx.type === 'earn' ? 'text-green-400' : 'text-gold-400'
                    )}
                  >
                    {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()} pts
                  </p>
                  <p className="text-xs text-dark-500">{formatDate(tx.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-xl bg-dark-800/60 mb-3">
              <Award className="w-6 h-6 text-dark-500" />
            </div>
            <p className="text-sm font-medium text-dark-300">No recent transactions</p>
            <p className="text-xs text-dark-500 mt-1">Points earned and redeemed will show up here</p>
          </div>
        )}
      </div>
    </div>
  )
}
