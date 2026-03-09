import { cn } from '@/lib/utils/cn'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  iconColor?: string
  subtitle?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-brand-400', subtitle }: StatCardProps) {
  return (
    <div className="glass-card p-5 stat-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-display font-bold text-dark-50 mt-1">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-medium', change >= 0 ? 'text-green-400' : 'text-red-400')}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
              <span className="text-dark-500 ml-1">vs last month</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-dark-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-2.5 rounded-xl bg-dark-800', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
