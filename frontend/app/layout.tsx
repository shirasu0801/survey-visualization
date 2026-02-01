import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Survey Visualization',
  description: 'アンケート作成・集計・可視化アプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className={inter.className}>
        <I18nProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
