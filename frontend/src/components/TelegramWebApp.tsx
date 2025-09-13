'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
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
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        colorScheme: 'light' | 'dark'
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
          }
        }
        platform: string
        version: string
        disableVerticalSwipes: () => void
        close: () => void
      }
    }
  }
}

export default function TelegramWebApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ждем загрузки Telegram WebApp скрипта
      const initTelegramWebApp = () => {
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          
          try {
            console.log('Начинаем инициализацию Telegram WebApp...')
            
            // Инициализация WebApp
            tg.ready()
            console.log('✓ tg.ready() выполнен')
            
            // Расширение до полного размера
            tg.expand()
            console.log('✓ tg.expand() выполнен')
            
            // Отключаем вертикальные свайпы (только если метод существует)
            if (typeof tg.disableVerticalSwipes === 'function') {
              tg.disableVerticalSwipes()
              console.log('✓ tg.disableVerticalSwipes() выполнен')
            } else {
              console.log('⚠ tg.disableVerticalSwipes() недоступен')
            }
            
            // Настройка темы через CSS переменные вместо классов
            if (tg.themeParams) {
              const root = document.documentElement
              if (tg.colorScheme === 'dark') {
                root.style.setProperty('--tg-theme', 'dark')
                root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#000000')
                root.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#ffffff')
              } else {
                root.style.setProperty('--tg-theme', 'light')
                root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#ffffff')
                root.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#000000')
              }
              console.log('✓ Тема настроена:', tg.colorScheme)
            }
            
            // Настройка viewport для мобильных устройств через CSS переменные
            if (tg.platform === 'ios' || tg.platform === 'android') {
              document.documentElement.style.setProperty('--tg-mobile', '1')
              
              // Дополнительные настройки для iOS
              if (tg.platform === 'ios') {
                // Предотвращаем bounce эффект
                document.body.style.overscrollBehavior = 'none'
                document.documentElement.style.overscrollBehavior = 'none'
                
                // Фиксируем высоту для iOS
                const setIOSHeight = () => {
                  const vh = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight
                  document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`)
                }
                setIOSHeight()
                
                // Обновляем при изменении ориентации
                window.addEventListener('orientationchange', () => {
                  setTimeout(setIOSHeight, 100)
                })
                
                console.log('✓ iOS специфичные настройки применены')
              }
            }
            
            console.log('✅ Telegram WebApp успешно инициализирован:', {
              platform: tg.platform,
              version: tg.version,
              colorScheme: tg.colorScheme,
              isExpanded: tg.isExpanded,
              viewportHeight: tg.viewportHeight,
              viewportStableHeight: tg.viewportStableHeight,
              user: tg.initDataUnsafe?.user
            })
          } catch (error) {
            console.error('❌ Ошибка инициализации Telegram WebApp:', error)
          }
        } else {
          console.log('ℹ Telegram WebApp недоступен - работаем в обычном браузере')
        }
      }
      
      // Проверяем, загружен ли уже скрипт
      if (window.Telegram?.WebApp) {
        initTelegramWebApp()
      } else {
        // Ждем загрузки скрипта
        const checkTelegram = setInterval(() => {
          if (window.Telegram?.WebApp) {
            clearInterval(checkTelegram)
            initTelegramWebApp()
          }
        }, 100)
        
        // Очищаем интервал через 5 секунд, если скрипт не загрузился
        setTimeout(() => {
          clearInterval(checkTelegram)
          console.log('Timeout: Telegram WebApp скрипт не загрузился')
        }, 5000)
      }
    }
  }, [])

  return <>{children}</>
}