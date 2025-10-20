import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Stopwatch from '@/components/Stopwatch'
import SetupMenu from '@/components/SetupMenu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Persia Fotball turnering',
  description: 'Administrer fotball turneringer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-3 items-center h-14">
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Persia Fotball turnering
                  </h1>
                </div>
                <div className="flex justify-center">
                  <Stopwatch />
                </div>
                <nav className="flex items-center justify-end space-x-2 sm:space-x-3">
                  <a href="/" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white rounded-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    Hjem
                  </a>
                  <a href="/players" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white rounded-md hover:bg-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    Spillere
                  </a>
                  <a href="/tournaments" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white rounded-md hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50">
                    Turneringer
                  </a>
                  <a href="/standings" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white rounded-md hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    Tabeller
                  </a>
                  <SetupMenu />
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
