import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-dark-800/50 mb-4">
        <Icon className="w-8 h-8 text-dark-500" />
      </div>
      <h3 className="text-lg font-medium text-dark-200 mb-1">{title}</h3>
      <p className="text-sm text-dark-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
