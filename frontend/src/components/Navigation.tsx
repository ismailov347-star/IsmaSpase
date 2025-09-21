'use client'
import { HomeButton } from '@/components/HomeButton'
import UserProfile from '@/components/UserProfile'
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation'

export function Navigation() {
  const { navigate } = useTelegramNavigation()
  
  const handleAdminClick = () => {
    navigate('/admin')
  }
  
  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-cyan-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div 
              className="text-xl font-bold text-white font-[family-name:var(--font-orbitron)] cursor-pointer hover:text-cyan-400 transition-colors"
              onClick={handleAdminClick}
            >
              IsmaSpace
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserProfile />
            <HomeButton />
          </div>
        </div>
      </div>
    </nav>
  )
}