'use client'

import { useState } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { useOrg } from '@/providers/org-context'

export function Topbar() {
  const { selectedOrg, setSelectedOrg } = useOrg()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-30 h-14 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800 flex items-center px-4 lg:px-6 gap-4">
      {/* Spacer for mobile menu button */}
      <div className="w-10 lg:hidden" />

      {/* Org Switcher */}
      <button
        onClick={() => setSelectedOrg(null)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm hover:bg-dark-800 transition-colors"
      >
        <span className="text-dark-400">Viewing:</span>
        <span className="font-medium text-dark-100">
          {selectedOrg ? selectedOrg.name : 'All Businesses'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-dark-500" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search businesses, employees, bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700/50 rounded-lg text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-brand-600/50 focus:border-brand-600/50 transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />
        </button>
      </div>
    </header>
  )
}
