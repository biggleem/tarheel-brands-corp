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

const catalogItems: MockCatalogItem[] = [
  { id: '1', name: 'Brisket (Choice Grade)', sku: 'MT-BRI-001', category: 'Meat', unitCost: 8.49, currentStock: 45, reorderLevel: 20, supplier: 'Sysco Foods' },
  { id: '2', name: 'Burger Patties 6oz', sku: 'MT-PAT-002', category: 'Meat', unitCost: 3.25, currentStock: 180, reorderLevel: 100, supplier: 'US Foods' },
  { id: '3', name: 'BBQ Sauce (Gallon)', sku: 'SC-BBQ-001', category: 'Sauces', unitCost: 12.99, currentStock: 8, reorderLevel: 10, supplier: 'Sysco Foods' },
  { id: '4', name: 'Disposable Gloves (Box)', sku: 'CL-GLV-001', category: 'Cleaning', unitCost: 14.50, currentStock: 24, reorderLevel: 12, supplier: 'Restaurant Depot' },
  { id: '5', name: 'Frozen Fruit Mix (5lb)', sku: 'FR-MIX-001', category: 'Produce', unitCost: 18.75, currentStock: 32, reorderLevel: 15, supplier: 'Sysco Foods' },
  { id: '6', name: 'Burger Buns (24ct)', sku: 'BK-BUN-001', category: 'Bakery', unitCost: 6.99, currentStock: 5, reorderLevel: 20, supplier: 'US Foods' },
  { id: '7', name: 'Degreaser Spray (Case)', sku: 'CL-DGR-001', category: 'Cleaning', unitCost: 42.00, currentStock: 6, reorderLevel: 4, supplier: 'Restaurant Depot' },
  { id: '8', name: 'Paper Towel Rolls (12pk)', sku: 'CL-PTW-001', category: 'Cleaning', unitCost: 28.99, currentStock: 3, reorderLevel: 8, supplier: 'Restaurant Depot' },
  { id: '9', name: 'Chicken Wings (10lb)', sku: 'MT-WNG-001', category: 'Meat', unitCost: 22.50, currentStock: 60, reorderLevel: 25, supplier: 'US Foods' },
  { id: '10', name: 'Thermometer (Digital)', sku: 'EQ-THM-001', category: 'Equipment', unitCost: 34.99, currentStock: 4, reorderLevel: 2, supplier: 'WebstaurantStore' },
]

interface MockPO {
  id: string
  poNumber: string
  supplier: string
  date: string
  status: POStatus
  total: number
  itemCount: number
}

const purchaseOrders: MockPO[] = [
  { id: '1', poNumber: 'PO-2026-042', supplier: 'Sysco Foods', date: '2026-03-06', status: 'confirmed', total: 2847.50, itemCount: 12 },
  { id: '2', poNumber: 'PO-2026-041', supplier: 'US Foods', date: '2026-03-04', status: 'shipped', total: 1620.00, itemCount: 8 },
  { id: '3', poNumber: 'PO-2026-040', supplier: 'Restaurant Depot', date: '2026-03-01', status: 'received', total: 892.30, itemCount: 15 },
  { id: '4', poNumber: 'PO-2026-039', supplier: 'WebstaurantStore', date: '2026-02-28', status: 'received', total: 456.97, itemCount: 3 },
  { id: '5', poNumber: 'PO-2026-043', supplier: 'Sysco Foods', date: '2026-03-08', status: 'draft', total: 3210.00, itemCount: 18 },
]

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
        </div>
      )}

      {/* ── Purchase Orders Tab ── */}
      {activeTab === 'orders' && (
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
    </div>
  )
}
