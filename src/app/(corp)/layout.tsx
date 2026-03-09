'use client'

import { AuthProvider } from '@/providers/auth-provider'
import { OrgProvider } from '@/providers/org-context'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function CorpLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OrgProvider>
        <div className="min-h-screen bg-dark-950">
          <Sidebar />
          <div className="lg:pl-64">
            <Topbar />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </OrgProvider>
    </AuthProvider>
  )
}
