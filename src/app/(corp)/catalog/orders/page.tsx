'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import {
  Plus,
  Search,
  ArrowLeft,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  Edit3,
  MoreVertical,
  ChevronDown,
  Building2,
  FileText,
  Filter,
} from 'lucide-react'

// ── Types & Config ─────────────────────────────────────────

type POStatus = 'draft' | 'submitted' | 'received' | 'cancelled'

interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: string
  business: string
  itemsCount: number
  totalAmount: number
  status: POStatus
  createdDate: string
  expectedDate: string
  notes: string
}

const statusConfig: Record<POStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'text-dark-300', bg: 'bg-dark-700/30' },
  submitted: { label: 'Submitted', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  received: { label: 'Received', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/15' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15' },
}

// ── Mock Data ──────────────────────────────────────────────

const mockOrders: PurchaseOrder[] = []

// ── Page Component ─────────────────────────────────────────

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [businessFilter, setBusinessFilter] = useState<string>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')

  const businesses = useMemo(() => {
    return [...new Set(mockOrders.map((o) => o.business))].sort()
  }, [])

  const vendors = useMemo(() => {
    return [...new Set(mockOrders.map((o) => o.vendor))].sort()
  }, [])

  const filtered = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchSearch =
        !search ||
        order.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.vendor.toLowerCase().includes(search.toLowerCase()) ||
        order.notes.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || order.status === statusFilter
      const matchBusiness = businessFilter === 'all' || order.business === businessFilter
      const matchVendor = vendorFilter === 'all' || order.vendor === vendorFilter
      return matchSearch && matchStatus && matchBusiness && matchVendor
    })
  }, [search, statusFilter, businessFilter, vendorFilter])

  const totalValue = mockOrders.reduce((s, o) => s + o.totalAmount, 0)
  const draftCount = mockOrders.filter((o) => o.status === 'draft').length
  const submittedCount = mockOrders.filter((o) => o.status === 'submitted').length
  const receivedCount = mockOrders.filter((o) => o.status === 'received').length

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Purchase Orders"
        description="Track and manage supply orders across all businesses"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/catalog"
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-200 text-sm font-medium rounded-lg border border-dark-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Create Order
            </button>
          </div>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total PO Value"
          value={formatCurrency(totalValue)}
          icon={ShoppingCart}
          iconColor="text-brand-400"
        />
        <StatCard
          title="Drafts"
          value={draftCount.toString()}
          icon={FileText}
          iconColor="text-dark-300"
          subtitle="awaiting submission"
        />
        <StatCard
          title="Submitted"
          value={submittedCount.toString()}
          icon={Truck}
          iconColor="text-blue-400"
          subtitle="in transit"
        />
        <StatCard
          title="Received"
          value={receivedCount.toString()}
          icon={CheckCircle2}
          iconColor="text-green-400"
          subtitle="this month"
        />
      </div>

      {/* ── Filters ── */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search PO number, vendor, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-100 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600/50 focus:border-brand-600/50 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>

          {/* Business Filter */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="all">All Businesses</option>
              {businesses.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>

          {/* Vendor Filter */}
          <div className="relative">
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="appearance-none px-4 py-2 text-sm bg-dark-800 border border-dark-700/50 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-600/50 cursor-pointer transition-colors"
            >
              <option value="all">All Vendors</option>
              {vendors.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── PO Table ── */}
      {mockOrders.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-dark-800/60 flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-dark-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-300">No purchase orders yet</p>
              <p className="text-xs text-dark-500 mt-1">Create your first purchase order to start tracking supply orders.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-dark-800/50">
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Business</th>
                  <th className="text-center">Items</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="hidden lg:table-cell">Expected</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const stConfig = statusConfig[order.status]
                  const StIcon = stConfig.icon
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-sm text-dark-100 whitespace-nowrap">{order.poNumber}</td>
                      <td className="text-dark-200 whitespace-nowrap">{order.vendor}</td>
                      <td className="text-dark-300 text-xs whitespace-nowrap">{order.business}</td>
                      <td className="text-center text-dark-300">
                        <span className="inline-flex items-center gap-1">
                          <Package className="w-3 h-3 text-dark-500" />
                          {order.itemsCount}
                        </span>
                      </td>
                      <td className="text-right font-mono text-dark-100 whitespace-nowrap">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td>
                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full', stConfig.bg, stConfig.color)}>
                          <StIcon className="w-3 h-3" />
                          {stConfig.label}
                        </span>
                      </td>
                      <td className="text-dark-300 whitespace-nowrap text-xs">{formatDate(order.createdDate)}</td>
                      <td className="hidden lg:table-cell text-dark-400 whitespace-nowrap text-xs">
                        {order.expectedDate ? formatDate(order.expectedDate) : '--'}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 hover:bg-dark-800 rounded-lg transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5 text-dark-400" />
                          </button>
                          <button className="p-1.5 hover:bg-dark-800 rounded-lg transition-colors" title="Edit">
                            <Edit3 className="w-3.5 h-3.5 text-dark-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <ShoppingCart className="w-8 h-8 text-dark-600 mx-auto mb-2" />
              <p className="text-sm text-dark-400">No purchase orders match your filters.</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-dark-800/50 flex items-center justify-between">
            <p className="text-xs text-dark-500">
              Showing {filtered.length} of {mockOrders.length} purchase orders
            </p>
            <span className="text-xs text-dark-500">
              Total shown: <span className="text-dark-200 font-mono">{formatCurrency(filtered.reduce((s, o) => s + o.totalAmount, 0))}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
