'use client'
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation'

export function HomeButton() {
  const { navigate } = useTelegramNavigation()
  
  return (
    <button 
      type="button"
      onClick={() => navigate('/')}
      className="group p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
        <svg className="relative w-6 h-6 text-cyan-400 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      </div>
    </button>
  )
}