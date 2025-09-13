'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void
        platform: string
      }
    }
  }
}

export const useTelegramNavigation = () => {
  const router = useRouter()

  const isTelegramWebApp = useCallback(() => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp
  }, [])

  const openExternalLink = useCallback((url: string) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // В Telegram WebApp используем встроенный метод с отключением instant view
      window.Telegram.WebApp.openLink(url, { try_instant_view: false })
    } else {
      // В обычном браузере открываем в новой вкладке
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const navigate = useCallback((href: string) => {
    console.log('Navigating to:', href, 'isTelegram:', isTelegramWebApp())
    
    // Проверяем, является ли это внутренним путем (без протокола/домена)
    if (/^\/(?!\/)/.test(href)) {
      // Внутренние пути - используем router.push
      router.push(href)
      return
    }
    
    // Внешние ссылки - используем openExternalLink
    openExternalLink(href)
  }, [router, isTelegramWebApp, openExternalLink])

  return {
    navigate,
    openExternalLink,
    isTelegramWebApp: isTelegramWebApp()
  }
}