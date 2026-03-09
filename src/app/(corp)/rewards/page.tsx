'use client'

import { useState } from 'react'
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

// ── Mock Data ──────────────────────────────────────────────

const tierBreakdown = [
  { tier: 'bronze' as RewardsTier, count: 842 },
  { tier: 'silver' as RewardsTier, count: 356 },
  { tier: 'gold' as RewardsTier, count: 124 },
  { tier: 'platinum' as RewardsTier, count: 38 },
]

const members = [
  { id: '1', firstName: 'Angela', lastName: 'Davis', email: 'angela.d@email.com', tier: 'platinum' as RewardsTier, pointsBalance: 12450, lifetimePoints: 48200, lastVisit: '2026-03-07', joinedAt: '2024-06-15' },
  { id: '2', firstName: 'Marcus', lastName: 'Thompson', email: 'mthompson@email.com', tier: 'gold' as RewardsTier, pointsBalance: 4820, lifetimePoints: 22100, lastVisit: '2026-03-08', joinedAt: '2024-09-22' },
  { id: '3', firstName: 'Keisha', lastName: 'Williams', email: 'keisha.w@email.com', tier: 'gold' as RewardsTier, pointsBalance: 3640, lifetimePoints: 18500, lastVisit: '2026-03-05', joinedAt: '2024-11-10' },
  { id: '4', firstName: 'DeShawn', lastName: 'Carter', email: 'dcarter@email.com', tier: 'silver' as RewardsTier, pointsBalance: 1890, lifetimePoints: 8400, lastVisit: '2026-03-06', joinedAt: '2025-01-18' },
  { id: '5', firstName: 'Jasmine', lastName: 'Robinson', email: 'jrobinson@email.com', tier: 'silver' as RewardsTier, pointsBalance: 1240, lifetimePoints: 6200, lastVisit: '2026-03-04', joinedAt: '2025-03-02' },
  { id: '6', firstName: 'Tyler', lastName: 'Brooks', email: 'tbrooks@email.com', tier: 'bronze' as RewardsTier, pointsBalance: 680, lifetimePoints: 3100, lastVisit: '2026-03-03', joinedAt: '2025-05-14' },
  { id: '7', firstName: 'Aaliyah', lastName: 'Green', email: 'aaliyah.g@email.com', tier: 'bronze' as RewardsTier, pointsBalance: 420, lifetimePoints: 1800, lastVisit: '2026-02-28', joinedAt: '2025-07-20' },
  { id: '8', firstName: 'Jordan', lastName: 'Mitchell', email: 'jmitchell@email.com', tier: 'platinum' as RewardsTier, pointsBalance: 9870, lifetimePoints: 52400, lastVisit: '2026-03-08', joinedAt: '2024-04-01' },
  { id: '9', firstName: 'Kayla', lastName: 'Stewart', email: 'kstewart@email.com', tier: 'silver' as RewardsTier, pointsBalance: 2100, lifetimePoints: 9800, lastVisit: '2026-03-01', joinedAt: '2025-02-11' },
  { id: '10', firstName: 'Brandon', lastName: 'Harris', email: 'bharris@email.com', tier: 'bronze' as RewardsTier, pointsBalance: 150, lifetimePoints: 650, lastVisit: '2026-02-20', joinedAt: '2025-11-30' },
]

const recentTransactions = [
  { id: '1', memberName: 'Marcus Thompson', type: 'earn' as RewardsTransactionType, points: 180, description: 'Dine-in purchase at Brax BBQ', date: '2026-03-08' },
  { id: '2', memberName: 'Angela Davis', type: 'redeem' as RewardsTransactionType, points: -500, description: 'Free dessert reward', date: '2026-03-07' },
  { id: '3', memberName: 'Jordan Mitchell', type: 'earn' as RewardsTransactionType, points: 320, description: 'Catering order at The Kickback', date: '2026-03-07' },
  { id: '4', memberName: 'Keisha Williams', type: 'earn' as RewardsTransactionType, points: 95, description: 'Takeout from Tarheel Burger', date: '2026-03-06' },
  { id: '5', memberName: 'DeShawn Carter', type: 'redeem' as RewardsTransactionType, points: -250, description: 'Buy 1 Get 1 Free coupon', date: '2026-03-06' },
  { id: '6', memberName: 'Tyler Brooks', type: 'earn' as RewardsTransactionType, points: 64, description: 'SA Smoothie purchase', date: '2026-03-05' },
  { id: '7', memberName: 'Angela Davis', type: 'earn' as RewardsTransactionType, points: 425, description: 'VIP dining experience at Brax BBQ', date: '2026-03-05' },
  { id: '8', memberName: 'Jasmine Robinson', type: 'redeem' as RewardsTransactionType, points: -100, description: '$10 off next order', date: '2026-03-04' },
]

// ── Page Component ─────────────────────────────────────────

export default function RewardsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tarheel Rewards"
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
          value="1,360"
          change={6.2}
          icon={Users}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Active Members"
          value="1,148"
          change={4.8}
          icon={Award}
          iconColor="text-green-400"
        />
        <StatCard
          title="Points Issued (MTD)"
          value="48,600"
          change={12.3}
          icon={TrendingUp}
          iconColor="text-brand-400"
        />
        <StatCard
          title="Points Redeemed (MTD)"
          value="18,200"
          change={8.1}
          icon={Gift}
          iconColor="text-gold-400"
        />
      </div>

      {/* ── Tier Breakdown ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Tier Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tierBreakdown.map(({ tier, count }) => {
            const config = tierConfig[tier]
            const TierIcon = config.icon
            const total = tierBreakdown.reduce((acc, t) => acc + t.count, 0)
            const pct = ((count / total) * 100).toFixed(1)
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
      </div>

      {/* ── Members Table ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Members</h3>
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
      </div>

      {/* ── Recent Rewards Transactions ── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-dark-200 mb-4">Recent Rewards Activity</h3>
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
      </div>
    </div>
  )
}
