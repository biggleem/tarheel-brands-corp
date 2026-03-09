'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Calculator,
  CreditCard,
  ShoppingCart,
  BarChart3,
  Gift,
  Megaphone,
  CalendarRange,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

const navigation = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Businesses', href: '/businesses', icon: Building2 },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'HR / Staff', href: '/hr', icon: Users },
      { label: 'Documents', href: '/documents', icon: FileText },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Accounting', href: '/accounting', icon: Calculator },
      { label: 'Bills & Banking', href: '/bills', icon: CreditCard },
      { label: 'Catalog & Orders', href: '/catalog', icon: ShoppingCart },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Toast POS', href: '/pos', icon: BarChart3 },
      { label: 'Rewards', href: '/rewards', icon: Gift },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
      { label: 'Marketing Plans', href: '/marketing', icon: CalendarRange },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Audit Log', href: '/settings/audit-log', icon: Shield },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { staff, assignments, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-dark-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-dark-50 text-sm leading-tight">
              Tarheel Brands
            </h1>
            <p className="text-[10px] text-dark-500 uppercase tracking-wider">Corp Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((group) => (
          <div key={group.label} className="mb-3">
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-dark-500 hover:text-dark-300 transition-colors"
            >
              {group.label}
              {collapsed[group.label] ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {!collapsed[group.label] && (
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        active
                          ? 'bg-brand-600/10 text-brand-400 border-l-2 border-brand-500'
                          : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/50'
                      )}
                    >
                      <item.icon className={cn('w-4 h-4', active ? 'text-brand-400' : 'text-dark-500')} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-dark-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold">
            {staff ? `${staff.first_name[0]}${staff.last_name[0]}` : 'SA'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">
              {staff ? `${staff.first_name} ${staff.last_name}` : 'CEO'}
            </p>
            <p className="text-[10px] text-dark-500 truncate">
              {assignments?.[0]?.title || 'Administrator'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 text-dark-500 hover:text-dark-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-dark-800 border border-dark-700 rounded-lg lg:hidden"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-dark-800 z-50 transform transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-dark-900 border-r border-dark-800">
        {sidebarContent}
      </aside>
    </>
  )
}
