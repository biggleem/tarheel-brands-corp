'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Building2, Rocket } from 'lucide-react'

const navLinks = [
  { label: 'Explore', href: '/crowdfund/explore' },
  { label: 'How It Works', href: '#how-it-works' },
]

export default function CrowdfundLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/crowdfund" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-600 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-display font-bold text-white">South Armz Global</span>
              <span className="text-xs text-dark-400 block -mt-0.5">Crowdfunding</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-brand-400 bg-brand-600/10'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-brand-600 rounded-lg">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white">South Armz Global</span>
              </div>
              <p className="text-sm text-dark-400 max-w-sm">
                Crowdfunding platform for South Armz Global portfolio businesses, events, and community projects.
                Back the future of innovation in North Carolina.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-dark-200 mb-3">Platform</h4>
              <div className="space-y-2">
                <Link href="/crowdfund/explore" className="block text-sm text-dark-400 hover:text-dark-200 transition-colors">Explore Campaigns</Link>
                <Link href="/crowdfund" className="block text-sm text-dark-400 hover:text-dark-200 transition-colors">How It Works</Link>
                <Link href="/login" className="block text-sm text-dark-400 hover:text-dark-200 transition-colors">Start a Campaign</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-dark-200 mb-3">Company</h4>
              <div className="space-y-2">
                <Link href="/businesses" className="block text-sm text-dark-400 hover:text-dark-200 transition-colors">Our Businesses</Link>
                <span className="block text-sm text-dark-500">Pittsboro, NC</span>
                <span className="block text-sm text-dark-500">&copy; {new Date().getFullYear()} South Armz Global Inc.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
