'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Organization } from '@/lib/types'

interface OrgContextType {
  selectedOrg: Organization | null
  setSelectedOrg: (org: Organization | null) => void
  // "all" means viewing data across all businesses
  viewMode: 'all' | 'single'
}

const OrgContext = createContext<OrgContextType>({
  selectedOrg: null,
  setSelectedOrg: () => {},
  viewMode: 'all',
})

export function OrgProvider({ children }: { children: ReactNode }) {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  const viewMode = selectedOrg ? 'single' : 'all'

  return (
    <OrgContext.Provider value={{ selectedOrg, setSelectedOrg, viewMode }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrg = () => useContext(OrgContext)
