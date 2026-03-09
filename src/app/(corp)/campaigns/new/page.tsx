'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
type CampaignType = 'email' | 'sms' | 'push' | 'in_store' | 'social' | 'rewards_bonus' | 'discount' | 'loyalty'
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Share2,
  Bell,
  Store,
  Gift,
  Tag,
  Users,
  UserCheck,
  DollarSign,
  Star,
  Filter,
  Calendar,
  Send,
  Save,
  Image as ImageIcon,
  Target,
} from 'lucide-react'

// ── Campaign Type Options ──────────────────────────────────

const campaignTypeOptions: { value: CampaignType; label: string; icon: typeof Mail; color: string }[] = [
  { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-400' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, color: 'text-green-400' },
  { value: 'push', label: 'Push Notification', icon: Bell, color: 'text-purple-400' },
  { value: 'social', label: 'Social Media', icon: Share2, color: 'text-pink-400' },
  { value: 'in_store', label: 'In-Store Promo', icon: Store, color: 'text-gold-400' },
  { value: 'rewards_bonus', label: 'Rewards Bonus', icon: Gift, color: 'text-orange-400' },
  { value: 'discount', label: 'Discount', icon: Tag, color: 'text-red-400' },
]

// ── Audience Options ───────────────────────────────────────

const audienceOptions = [
  { id: 'all', label: 'All Customers', description: 'Send to your entire customer list', icon: Users, count: 4280 },
  { id: 'recent', label: 'Recent Visitors', description: 'Customers who visited in the last 30 days', icon: UserCheck, count: 1247 },
  { id: 'high_spend', label: 'High Spenders', description: 'Customers who spent $100+ lifetime', icon: DollarSign, count: 864 },
  { id: 'rewards', label: 'Rewards Members', description: 'Active members of Tarheel Rewards', icon: Star, count: 1360 },
  { id: 'custom', label: 'Custom Filter', description: 'Build a custom audience segment', icon: Filter, count: null },
]

// ── Mock Businesses ────────────────────────────────────────

const businesses = [
  { value: 'all', label: 'All Businesses' },
  { value: 'brax-bbq', label: 'Brax BBQ' },
  { value: 'tarheel-burger', label: 'Tarheel Burger' },
  { value: 'sa-smoothie', label: 'SA Smoothie' },
  { value: 'the-kickback', label: 'The Kickback' },
  { value: 'cafe-1876', label: 'Cafe 1876' },
]

// ── Page Component ─────────────────────────────────────────

export default function NewCampaignPage() {
  const [name, setName] = useState('')
  const [type, setType] = useState<CampaignType>('email')
  const [business, setBusiness] = useState('all')
  const [audience, setAudience] = useState('all')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sendNow, setSendNow] = useState(false)
  const [budget, setBudget] = useState('')

  const selectedAudience = audienceOptions.find((a) => a.id === audience)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create Campaign"
        description="Set up a new marketing campaign"
        actions={
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
        }
      />

      <div className="max-w-3xl space-y-6">
        {/* ── Section 1: Basics ── */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Basics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Spring Menu Launch"
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg px-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none placeholder-dark-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Campaign Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {campaignTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm',
                      type === opt.value
                        ? 'bg-brand-600/10 border-brand-600/40 ring-1 ring-brand-600/20'
                        : 'bg-dark-800/50 border-dark-700/30 hover:border-dark-600/50'
                    )}
                  >
                    <opt.icon className={cn('w-4 h-4', opt.color)} />
                    <span className={type === opt.value ? 'text-brand-400 font-medium' : 'text-dark-300'}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Business</label>
              <select
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-200 text-sm rounded-lg px-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
              >
                {businesses.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 2: Audience ── */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Audience</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {audienceOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAudience(opt.id)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                  audience === opt.id
                    ? 'bg-brand-600/10 border-brand-600/40 ring-1 ring-brand-600/20'
                    : 'bg-dark-800/50 border-dark-700/30 hover:border-dark-600/50'
                )}
              >
                <div className={cn('p-2 rounded-lg bg-dark-900', audience === opt.id ? 'text-brand-400' : 'text-dark-400')}>
                  <opt.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={cn('text-sm font-medium', audience === opt.id ? 'text-brand-400' : 'text-dark-100')}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-dark-400 mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
          {selectedAudience?.count && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-dark-800/50 border border-dark-700/30">
              <Target className="w-4 h-4 text-brand-400" />
              <p className="text-sm text-dark-200">
                Estimated reach: <span className="font-semibold text-dark-100">{selectedAudience.count.toLocaleString()} customers</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Section 3: Content ── */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., You're Invited: Spring Menu Tasting Event"
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg px-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none placeholder-dark-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Message Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Write your campaign message..."
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg px-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none placeholder-dark-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">Image URL (optional)</label>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-dark-500 flex-shrink-0" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/campaign-image.jpg"
                  className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg px-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none placeholder-dark-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Schedule ── */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700/30">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-200">Send immediately</span>
              </div>
              <button
                onClick={() => setSendNow(!sendNow)}
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors',
                  sendNow ? 'bg-brand-600' : 'bg-dark-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    sendNow ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {!sendNow && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1.5">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700/50 text-dark-200 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-300 mb-1.5">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-700/50 text-dark-200 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 5: Budget ── */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-100 mb-4">Budget</h3>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">Budget Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-dark-800 border border-dark-700/50 text-dark-100 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none placeholder-dark-500"
              />
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700/50 transition-colors">
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Send className="w-4 h-4" />
            Launch Campaign
          </button>
        </div>
      </div>
    </div>
  )
}
