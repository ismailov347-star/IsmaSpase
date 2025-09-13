'use client'

import { useEffect } from 'react'
import { readTG, getTG } from '@/lib/tg'

export default function TelegramWebApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ждем загрузки Telegram WebApp скрипта
      const initTelegramWebApp = () => {
        const tg = getTG()
        if (tg) {
          
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
            const { colorScheme, themeParams } = readTG()
            if (themeParams) {
              const root = document.documentElement
              if (colorScheme === 'dark') {
                root.style.setProperty('--tg-theme', 'dark')
                root.style.setProperty('--tg-bg-color', themeParams.bg_color || '#000000')
                root.style.setProperty('--tg-text-color', themeParams.text_color || '#ffffff')
              } else {
                root.style.setProperty('--tg-theme', 'light')
                root.style.setProperty('--tg-bg-color', themeParams.bg_color || '#ffffff')
                root.style.setProperty('--tg-text-color', themeParams.text_color || '#000000')
              }
              console.log('✓ Тема настроена:', colorScheme)
            }
            
            // Настройка viewport для мобильных устройств через CSS переменные
            const { platform, viewportHeight } = readTG()
            if (platform === 'ios' || platform === 'android') {
              document.documentElement.style.setProperty('--tg-mobile', '1')
              
              // Дополнительные настройки для iOS
              if (platform === 'ios') {
                // Предотвращаем bounce эффект
                document.body.style.overscrollBehavior = 'none'
                document.documentElement.style.overscrollBehavior = 'none'
                
                // Фиксируем высоту для iOS
                const setIOSHeight = () => {
                  const { viewportHeight } = readTG()
                  const vh = (tg as any)?.viewportStableHeight || viewportHeight || window.innerHeight
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
            
            const { platform: logPlatform, colorScheme: logColorScheme, isExpanded, viewportHeight: logViewportHeight, user } = readTG()
            console.log('✅ Telegram WebApp успешно инициализирован:', {
              platform: logPlatform,
              version: (tg as any)?.version,
              colorScheme: logColorScheme,
              isExpanded,
              viewportHeight: logViewportHeight,
              viewportStableHeight: (tg as any)?.viewportStableHeight,
              user
            })
          } catch (error) {
            console.error('❌ Ошибка инициализации Telegram WebApp:', error)
          }
        } else {
          console.log('ℹ Telegram WebApp недоступен - работаем в обычном браузере')
        }
      }
      
      // Проверяем, загружен ли уже скрипт
      if (getTG()) {
        initTelegramWebApp()
      } else {
        // Ждем загрузки скрипта
        const checkTelegram = setInterval(() => {
          if (getTG()) {
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