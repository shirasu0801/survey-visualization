'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'

export default function Sidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const navItems = [
    { href: '/surveys/create', label: 'アンケート作成', icon: '📝' },
    { href: '/surveys', label: 'アンケート一覧', icon: '📊' },
  ]

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-6">Survey Visualization</h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/surveys' && pathname?.startsWith('/surveys/') && pathname !== '/surveys/create')
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
