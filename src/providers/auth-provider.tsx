'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { StaffProfile, StaffPermission, StaffAssignment } from '@/lib/types'

interface AuthContextType {
  user: User | null
  staff: StaffProfile | null
  permissions: StaffPermission[]
  assignments: StaffAssignment[]
  loading: boolean
  signOut: () => Promise<void>
  isAdmin: boolean
  hasPermission: (permission: string, orgId?: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  staff: null,
  permissions: [],
  assignments: [],
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  hasPermission: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staff, setStaff] = useState<StaffProfile | null>(null)
  const [permissions, setPermissions] = useState<StaffPermission[]>([])
  const [assignments, setAssignments] = useState<StaffAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch staff profile
        const { data: staffData } = await supabase
          .schema('corp' as any)
          .from('staff_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (staffData) {
          setStaff(staffData as unknown as StaffProfile)

          // Fetch permissions and assignments in parallel
          const [permRes, assignRes] = await Promise.all([
            supabase
              .schema('corp' as any)
              .from('staff_permissions')
              .select('*')
              .eq('staff_id', staffData.id),
            supabase
              .schema('corp' as any)
              .from('staff_assignments')
              .select('*, organization:org_id(id, name, slug, type)')
              .eq('staff_id', staffData.id),
          ])

          setPermissions((permRes.data || []) as unknown as StaffPermission[])
          setAssignments((assignRes.data || []) as unknown as StaffAssignment[])
        }
      }

      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setStaff(null)
          setPermissions([])
          setAssignments([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setStaff(null)
    setPermissions([])
    setAssignments([])
  }

  const isAdmin = permissions.some((p) => p.permission === 'admin' && !p.organization_id)

  const hasPermission = (permission: string, orgId?: string): boolean => {
    if (isAdmin) return true
    return permissions.some(
      (p) =>
        (p.permission === permission || p.permission === 'admin') &&
        (!orgId || !p.organization_id || p.organization_id === orgId)
    )
  }

  return (
    <AuthContext.Provider
      value={{ user, staff, permissions, assignments, loading, signOut, isAdmin, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
