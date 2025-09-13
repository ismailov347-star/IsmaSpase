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

  const isMobileDevice = useCallback(() => {
    if (typeof window === 'undefined') return false
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)
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
    const isMobile = isMobileDevice()
    const isTelegram = isTelegramWebApp()
    const timestamp = new Date().toISOString()
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'unknown'
    
    console.log('🧭 Navigation attempt:', {
      href,
      isTelegram,
      isMobile,
      userAgent,
      currentUrl,
      timestamp,
      routerAvailable: !!router
    })
    
    if (!href) {
      console.error('❌ Navigate: href is empty')
      return
    }
    
    try {
      // Проверяем, является ли это внутренним путем (без протокола/домена)
      if (/^\/(?!\/)/.test(href)) {
        console.log('✅ Internal path detected')
        
        // Проверяем доступность router
        if (!router) {
          console.error('❌ Router not available, using fallback')
          if (typeof window !== 'undefined') {
            window.location.href = href
          }
          return
        }
        
        console.log('🚀 Using router.push')
        
        // Для мобильных устройств добавляем дополнительную проверку
        if (isMobile) {
          console.log('📱 Mobile device detected, adding extra handling')
          
          // Предотвращаем двойные клики (уменьшенный интервал)
          if (typeof window !== 'undefined') {
            if ((window as any).lastNavigation === href && Date.now() - (window as any).lastNavigationTime < 300) {
              console.log('⚠️ Duplicate navigation prevented (300ms cooldown)')
              return
            }
            (window as any).lastNavigation = href;
            (window as any).lastNavigationTime = Date.now()
          }
        }
        
        router.push(href)
        console.log('✅ Router.push completed successfully')
        return
      }
      
      console.log('🔗 External link detected, using openExternalLink')
      // Внешние ссылки - используем openExternalLink
      openExternalLink(href)
      console.log('✅ External link navigation initiated')
    } catch (error) {
      console.error('❌ Navigation error:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error
      })
      
      // Fallback для критических ошибок
      if (typeof window !== 'undefined') {
        console.log('🔄 Fallback: using window.location.href')
        try {
          window.location.href = href
          console.log('✅ Fallback navigation successful')
        } catch (fallbackError) {
          console.error('❌ Even fallback failed:', fallbackError)
        }
      }
    }
  }, [router, isTelegramWebApp, isMobileDevice, openExternalLink])

  return {
    navigate,
    openExternalLink,
    isTelegramWebApp: isTelegramWebApp(),
    isMobileDevice
  }
}