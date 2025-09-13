'use client'
import { HomeButton } from '@/components/HomeButton'
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation'

export function Navigation() {
  const { navigate } = useTelegramNavigation()
  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-cyan-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-xl font-bold text-white font-[family-name:var(--font-orbitron)]">
              IsmaSpace
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <HomeButton />
            <button
              onClick={() => navigate('/ios-debug')}
              className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
              title="iOS Debug"
            >
              🔍 Debug
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}