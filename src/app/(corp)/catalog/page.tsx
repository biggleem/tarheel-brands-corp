'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
type POStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
import {
  Plus,
  Search,
  Package,
  ShoppingCart,
  AlertTriangle,
  Image as ImageIcon,
  Truck,
  FileText,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  PackageCheck,
} from 'lucide-react'

// ── Config ─────────────────────────────────────────────────

const poStatusConfig: Record<POStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'text-dark-300', bg: 'bg-dark-600/20', icon: FileText },
  submitted: { label: 'Submitted', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Send },
  confirmed: { label: 'Confirmed', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  shipped: { label: 'Shipped', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Truck },
  received: { label: 'Received', color: 'text-gold-400', bg: 'bg-gold-400/10', icon: PackageCheck },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
}

// ── Mock Data ──────────────────────────────────────────────

interface MockCatalogItem {
  id: string
  name: string
  sku: string
  category: string
  unitCost: number
  currentStock: number
  reorderLevel: number
  supplier: string
}

const catalogItems: MockCatalogItem[] = []

interface MockPO {
  id: string
  poNumber: string
  supplier: string
  date: string
  status: POStatus
  total: number
  itemCount: number
}

const purchaseOrders: MockPO[] = []

// ── Page Component ─────────────────────────────────────────

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = searchQuery
    ? catalogItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : catalogItems

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Catalog & Orders"
        description="Supply inventory and purchase order management"
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        }
      />

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-dark-900/60 border border-dark-700/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('catalog')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === 'catalog'
              ? 'bg-brand-600 text-white'
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
          )}
        >
          <Package className="w-4 h-4" />
          Catalog
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === 'orders'
              ? 'bg-brand-600 text-white'
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          Purchase Orders
        </button>
      </div>

      {/* ── Catalog Tab ── */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name, SKU, category, or supplier..."
              className="w-full bg-dark-900/60 border border-dark-700/50 text-dark-100 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none placeholder-dark-500"
            />
          </div>

          {/* Catalog Grid */}
          {catalogItems.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-dark-800/60 flex items-center justify-center">
                  <Package className="w-7 h-7 text-dark-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-300">No items in catalog</p>
                  <p className="text-xs text-dark-500 mt-1">Add your first inventory item to get started.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const belowReorder = item.currentStock < item.reorderLevel
                  return (
                    <div key={item.id} className="glass-card p-4 flex flex-col gap-3">
                      {/* Image Placeholder */}
                      <div className="w-full h-28 bg-dark-800/60 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-dark-600" />
                      </div>

                      {/* Info */}
                      <div>
                        <h4 className="text-sm font-medium text-dark-100 truncate">{item.name}</h4>
                        <p className="text-[10px] font-mono text-dark-500 mt-0.5">{item.sku}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400">Category</span>
                          <span className="text-dark-200">{item.category}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400">Unit Cost</span>
                          <span className="text-dark-200 font-mono">{formatCurrency(item.unitCost)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400">Stock</span>
                          <span className={cn('font-mono font-medium', belowReorder ? 'text-red-400' : 'text-dark-200')}>
                            {item.currentStock}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400">Reorder Level</span>
                          <span className="text-dark-300 font-mono">{item.reorderLevel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400">Supplier</span>
                          <span className="text-dark-200 truncate ml-2">{item.supplier}</span>
                        </div>
                      </div>

                      {/* Low Stock Warning */}
                      {belowReorder && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span className="text-[10px] font-medium text-red-400">Below reorder level</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <Package className="w-10 h-10 text-dark-500 mx-auto mb-3" />
                  <p className="text-sm text-dark-400">No items match your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Purchase Orders Tab ── */}
      {activeTab === 'orders' && (
        <>
          {purchaseOrders.length === 0 ? (
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
            <div className="glass-card p-5">
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      <th>PO #</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-right">Total</th>
                      <th className="text-center">Items</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => {
                      const statusInfo = poStatusConfig[po.status]
                      const StatusIcon = statusInfo.icon
                      return (
                        <tr key={po.id}>
                          <td className="font-mono text-xs text-dark-100 font-medium">{po.poNumber}</td>
                          <td className="text-dark-200">{po.supplier}</td>
                          <td className="whitespace-nowrap">{formatDate(po.date)}</td>
                          <td>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                statusInfo.bg,
                                statusInfo.color
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="text-right font-mono font-medium text-dark-100">{formatCurrency(po.total)}</td>
                          <td className="text-center text-dark-300">{po.itemCount}</td>
                          <td className="text-center">
                            <button className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors text-dark-400 hover:text-dark-200">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
