'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { readTG } from '@/lib/tg'

export default function UserProfile() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [isTelegramApp, setIsTelegramApp] = useState(false)

  useEffect(() => {
    const { tg } = readTG()
    setIsTelegramApp(!!tg)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Загрузка...</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    if (!isTelegramApp) {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
          <span>Откройте в Telegram</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Аутентификация...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {user.firstName} {user.lastName || ''}
          </div>
          {user.username && (
            <div className="text-gray-500">@{user.username}</div>
          )}
        </div>
      </div>
      <button
        onClick={logout}
        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        title="Выйти"
      >
        ✕
      </button>
    </div>
  )
}