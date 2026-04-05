'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { SortableHeader } from '@/components/shared/sortable-header'
import { useSortableData } from '@/lib/hooks/use-sortable-data'
import { getRewardsMembers } from '@/lib/supabase/queries'
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
  Search,
} from 'lucide-react'

// ── Tier Config ────────────────────────────────────────────

const tierConfig: Record<RewardsTier, { label: string; color: string; bg: string; border: string; icon: typeof Star }> = {
  bronze: { label: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', icon: Medal },
  silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-400/10', border: 'border-gray-400/30', icon: Star },
  gold: { label: 'Gold', color: 'text-gold-400', bg: 'bg-gold-400/10', border: 'border-gold-400/30', icon: Crown },
  platinum: { label: 'Platinum', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', icon: Gem },
}

// Tier ordering for sort
const tierOrder: Record<string, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3 }

// ── Normalized member shape for the table ──────────────────

interface MemberRow {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  tier: RewardsTier
  tierRank: number
  pointsBalance: number
  lifetimePoints: number
  lastVisit: string
  joinedAt: string
  isActive: boolean
}

// ── Page Component ─────────────────────────────────────────

export default function RewardsPage() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const raw = await getRewardsMembers()
        const rows: MemberRow[] = raw.map((m) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          firstName: m.first_name,
          lastName: m.last_name,
          email: m.email,
          tier: m.tier as RewardsTier,
          tierRank: tierOrder[m.tier] ?? 0,
          pointsBalance: m.points_balance,
          lifetimePoints: m.lifetime_points,
          lastVisit: m.last_activity_at,
          joinedAt: m.enrolled_at,
          isActive: m.is_active,
        }))
        setMembers(rows)
      } catch (err) {
        console.error('Failed to load rewards members:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived stats ──
  const totalMembers = members.length
  const activeMembers = members.filter((m) => m.isActive).length
  const totalPoints = members.reduce((sum, m) => sum + m.lifetimePoints, 0)
  const totalBalance = members.reduce((sum, m) => sum + m.pointsBalance, 0)

  // ── Tier breakdown ──
  const tierBreakdown = useMemo(() => {
    const counts: Partial<Record<RewardsTier, number>> = {}
    members.forEach((m) => {
      counts[m.tier] = (counts[m.tier] ?? 0) + 1
    })
    return (['gold', 'silver', 'bronze', 'platinum'] as RewardsTier[])
      .filter((t) => (counts[t] ?? 0) > 0)
      .map((t) => ({ tier: t, count: counts[t]! }))
  }, [members])

  // ── Search filter ──
  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    )
  }, [members, search])

  // ── Sorting ──
  const { sortedData, sortConfig, requestSort } = useSortableData(
    filtered as unknown as Record<string, unknown>[],
    { key: 'name', direction: 'asc' }
  )

  // ── Recent transactions placeholder (no RPC yet) ──
  const recentTransactions: {
    id: string; memberName: string; type: RewardsTransactionType;
    points: number; description: string; date: string;
  }[] = []

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-64 bg-dark-800/60 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="h-4 w-24 bg-dark-800/60 rounded animate-pulse" />
              <div className="h-8 w-16 bg-dark-800/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="glass-card p-5 space-y-4">
          <div className="h-4 w-32 bg-dark-800/60 rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-dark-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="glass-card p-5 space-y-3">
          <div className="h-4 w-24 bg-dark-800/60 rounded animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-dark-800/40 rounded animate-pulse" />
          ))}
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
          value={totalMembers.toLocaleString()}
          icon={Users}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Active Members"
          value={activeMembers.toLocaleString()}
          icon={Award}
          iconColor="text-green-400"
        />
        <StatCard
          title="Lifetime Points"
          value={totalPoints.toLocaleString()}
          icon={TrendingUp}
          iconColor="text-brand-400"
        />
        <StatCard
          title="Points Balance"
          value={totalBalance.toLocaleString()}
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
              const pct = totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(1) : '0.0'
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-sm font-medium text-dark-200">
            Members{filtered.length !== members.length ? ` (${filtered.length} of ${members.length})` : ` (${members.length})`}
          </h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors"
            />
          </div>
        </div>
        {sortedData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={requestSort} />
                  <th>Email</th>
                  <SortableHeader label="Tier" sortKey="tierRank" currentSort={sortConfig} onSort={requestSort} />
                  <SortableHeader label="Points Balance" sortKey="pointsBalance" currentSort={sortConfig} onSort={requestSort} className="text-right" />
                  <th className="text-right">Lifetime Points</th>
                  <SortableHeader label="Last Visit" sortKey="lastVisit" currentSort={sortConfig} onSort={requestSort} />
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(sortedData as unknown as MemberRow[]).map((member) => {
                  const config = tierConfig[member.tier]
                  const TierIcon = config.icon
                  return (
                    <tr key={member.id} className={cn(!member.isActive && 'opacity-50')}>
                      <td className="text-dark-100 font-medium whitespace-nowrap">
                        {member.firstName} {member.lastName}
                        {!member.isActive && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400">
                            Inactive
                          </span>
                        )}
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
        ) : search.trim() ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 rounded-xl bg-dark-800/60 mb-3">
              <Search className="w-6 h-6 text-dark-500" />
            </div>
            <p className="text-sm font-medium text-dark-300">No members match &ldquo;{search}&rdquo;</p>
            <p className="text-xs text-dark-500 mt-1">Try a different name or email address</p>
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
