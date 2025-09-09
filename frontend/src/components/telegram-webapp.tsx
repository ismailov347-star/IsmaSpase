'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
        colorScheme: 'light' | 'dark'
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        initData: string
        initDataUnsafe: any
      }
    }
  }
}

export function TelegramWebApp() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Инициализация WebApp
      tg.ready()
      tg.expand()
      
      // Применение темы Telegram с задержкой для избежания гидратации
      setTimeout(() => {
        const root = document.documentElement
        if (tg.themeParams) {
          if (tg.themeParams.bg_color) {
            root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color)
          }
          if (tg.themeParams.text_color) {
            root.style.setProperty('--tg-text-color', tg.themeParams.text_color)
          }
          if (tg.themeParams.button_color) {
            root.style.setProperty('--tg-button-color', tg.themeParams.button_color)
          }
          if (tg.themeParams.button_text_color) {
            root.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color)
          }
        }
        
        // Настройка цветовой схемы
        if (tg.colorScheme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }, 100)
      
      // Обработка кнопки "Назад"
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back()
        } else {
          tg.close()
        }
      })
      
      // Показать кнопку "Назад" если не на главной странице
      if (window.location.pathname !== '/') {
        tg.BackButton.show()
      }
      
      // Обработка изменения маршрута
      const handleRouteChange = () => {
        if (window.location.pathname === '/') {
          tg.BackButton.hide()
        } else {
          tg.BackButton.show()
        }
      }
      
      // Обработка жестов и событий
      const handleTouchStart = (e: TouchEvent) => {
        // Предотвращение двойного тапа для зума
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      }
      
      const handleTouchMove = (e: TouchEvent) => {
        // Предотвращение скролла при свайпах
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      }
      
      const handleContextMenu = (e: Event) => {
        // Отключение контекстного меню
        e.preventDefault()
      }
      
      const handleSelectStart = (e: Event) => {
        // Отключение выделения текста
        e.preventDefault()
      }
      
      // Обработка событий клавиатуры
      const handleKeyDown = (e: KeyboardEvent) => {
        // Обработка кнопки "Назад" на Android
        if (e.key === 'Escape' || e.keyCode === 27) {
          if (window.location.pathname !== '/') {
            window.history.back()
          } else {
            tg.close()
          }
        }
      }
      
      // Добавление слушателей событий
      window.addEventListener('popstate', handleRouteChange)
      document.addEventListener('touchstart', handleTouchStart, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('selectstart', handleSelectStart)
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('selectstart', handleSelectStart)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

    // Отдельный useEffect для установки CSS переменных после гидратации
    useEffect(() => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        const handleViewportChanged = () => {
          const vh = tg.viewportHeight * 0.01
          document.documentElement.style.setProperty('--vh', `${vh}px`)
        }
        
        // Инициальная установка высоты
        handleViewportChanged()
        
        // Подписка на изменения viewport
        tg.onEvent('viewportChanged', handleViewportChanged)
        
        return () => {
          tg.offEvent('viewportChanged', handleViewportChanged)
        }
      }
    }, [])
  
  return null
}

// Хук для использования Telegram WebApp API
export function useTelegramWebApp() {
  const isInTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp
  
  const showMainButton = (text: string, onClick: () => void) => {
    if (isInTelegram) {
      const tg = window.Telegram.WebApp
      tg.MainButton.setText(text)
      tg.MainButton.onClick(onClick)
      tg.MainButton.show()
    }
  }
  
  const hideMainButton = () => {
    if (isInTelegram) {
      window.Telegram.WebApp.MainButton.hide()
    }
  }
  
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    if (isInTelegram) {
      const tg = window.Telegram.WebApp
      if (type === 'success' || type === 'error' || type === 'warning') {
        tg.HapticFeedback.notificationOccurred(type)
      } else {
        tg.HapticFeedback.impactOccurred(type)
      }
    }
  }
  
  const close = () => {
    if (isInTelegram) {
      window.Telegram.WebApp.close()
    }
  }
  
  const expand = () => {
    if (isInTelegram) {
      window.Telegram.WebApp.expand()
    }
  }
  
  const getUserData = () => {
    if (isInTelegram) {
      const tg = window.Telegram.WebApp
      return {
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight
      }
    }
    return null
  }
  
  const showAlert = (message: string) => {
    if (isInTelegram && window.Telegram.WebApp.showAlert) {
      window.Telegram.WebApp.showAlert(message)
    } else {
      alert(message)
    }
  }
  
  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (isInTelegram && window.Telegram.WebApp.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, callback)
    } else {
      const result = confirm(message)
      callback(result)
    }
  }
  
  const sendData = (data: string) => {
    if (isInTelegram && window.Telegram.WebApp.sendData) {
      window.Telegram.WebApp.sendData(data)
    }
  }
  
  const openLink = (url: string) => {
    if (isInTelegram && window.Telegram.WebApp.openLink) {
      window.Telegram.WebApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }
  
  const openTelegramLink = (url: string) => {
    if (isInTelegram && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url)
    } else {
      window.open(url, '_blank')
    }
  }
  
  return {
    isInTelegram,
    showMainButton,
    hideMainButton,
    hapticFeedback,
    close,
    expand,
    getUserData,
    showAlert,
    showConfirm,
    sendData,
    openLink,
    openTelegramLink,
    webApp: isInTelegram ? window.Telegram.WebApp : null
  }
}