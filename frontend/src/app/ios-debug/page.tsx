'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DiagnosticInfo {
  timestamp: string
  telegramAvailable: boolean
  webAppAvailable: boolean
  scriptLoaded: boolean
  platform: string
  version: string
  colorScheme: string
  viewportHeight: number
  viewportStableHeight: number
  isExpanded: boolean
  userAgent: string
  url: string
  initData: string
  user: any
  themeParams: any
  errors: string[]
  networkStatus: string
}

export default function IOSDebugPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [userAgent, setUserAgent] = useState('N/A')
  const [currentUrl, setCurrentUrl] = useState('N/A')
  const [networkStatus, setNetworkStatus] = useState('N/A')
  const router = useRouter()
  const { navigate, isMobileDevice } = useTelegramNavigation()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  useEffect(() => {
    let handleOnline: (() => void) | null = null
    let handleOffline: (() => void) | null = null
    
    // Устанавливаем флаг клиентской стороны
    setIsClient(true)
    
    // Проверяем сетевое соединение (только на клиенте)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
      setUserAgent(navigator.userAgent)
      setCurrentUrl(window.location.href)
      setNetworkStatus(navigator.onLine ? 'online' : 'offline')
      handleOnline = () => {
        setIsOnline(true)
        setNetworkStatus('online')
        addLog('🌐 Соединение восстановлено')
      }
      handleOffline = () => {
        setIsOnline(false)
        setNetworkStatus('offline')
        addLog('📵 Соединение потеряно')
      }
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      addLog('🔍 Начинаем расширенную диагностику iOS...')
      addLog(`🌐 Статус сети: ${navigator.onLine ? 'онлайн' : 'офлайн'}`)
    }
    
    // Проверяем загрузку Telegram скрипта
    const checkTelegramScript = () => {
      const scripts = Array.from(document.scripts)
      const telegramScript = scripts.find(script => 
        script.src.includes('telegram-web-app.js')
      )
      
      if (telegramScript) {
        addLog('✅ Telegram скрипт найден в DOM')
        addLog(`📄 Скрипт URL: ${telegramScript.src}`)
        
        // Проверяем статус загрузки
        if (telegramScript.readyState) {
          addLog(`📊 Статус скрипта: ${telegramScript.readyState}`)
        }
      } else {
        addLog('❌ Telegram скрипт НЕ найден в DOM')
      }
      
      return !!telegramScript
    }
    
    const runDiagnostics = () => {
      const errors: string[] = []
      
      try {
        addLog('📱 Проверяем доступность Telegram...')
        
        const scriptLoaded = checkTelegramScript()
        const telegramAvailable = !!(window as any)?.Telegram
        const webAppAvailable = !!(window as any)?.Telegram?.WebApp
        
        if (!scriptLoaded) {
          errors.push('Telegram скрипт не загружен')
        }
        
        if (!telegramAvailable) {
          errors.push('Telegram объект недоступен')
          addLog('❌ Telegram объект недоступен')
        } else {
          addLog('✅ Telegram объект доступен')
        }
        
        if (!webAppAvailable) {
          errors.push('Telegram.WebApp недоступен')
          addLog('❌ Telegram.WebApp недоступен')
        } else {
          addLog('✅ Telegram.WebApp доступен')
        }
        
        const tg = (window as any)?.Telegram?.WebApp
        
        // Проверяем доступность методов
        if (tg) {
          const methods = ['ready', 'expand', 'close', 'disableVerticalSwipes']
          methods.forEach(method => {
            if (typeof tg[method] === 'function') {
              addLog(`✅ Метод ${method} доступен`)
            } else {
              addLog(`❌ Метод ${method} недоступен`)
              errors.push(`Метод ${method} недоступен`)
            }
          })
        }
        
        const info: DiagnosticInfo = {
          timestamp: new Date().toISOString(),
          telegramAvailable,
          webAppAvailable,
          scriptLoaded,
          platform: tg?.platform || 'unknown',
          version: tg?.version || 'unknown',
          colorScheme: tg?.colorScheme || 'unknown',
          viewportHeight: tg?.viewportHeight || 0,
          viewportStableHeight: tg?.viewportStableHeight || 0,
          isExpanded: tg?.isExpanded || false,
          userAgent: userAgent,
          url: currentUrl,
          initData: tg?.initData || '',
          user: tg?.initDataUnsafe?.user || null,
          themeParams: tg?.themeParams || null,
          networkStatus: networkStatus,
          errors
        }
        
        addLog(`📊 Платформа: ${info.platform}`)
        addLog(`📊 Версия: ${info.version}`)
        addLog(`📊 Цветовая схема: ${info.colorScheme}`)
        addLog(`📊 Высота viewport: ${info.viewportHeight}`)
        addLog(`📊 Стабильная высота: ${info.viewportStableHeight}`)
        addLog(`📊 Развернуто: ${info.isExpanded}`)
        
        // Проверяем специфичные для iOS параметры
        if (info.platform === 'ios' || (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent))) {
          addLog('📱 Обнаружено iOS устройство')
          if (typeof navigator !== 'undefined') {
            addLog(`📊 iOS версия из UA: ${navigator.userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'неизвестно'}`)
          }
          
          // Проверяем viewport meta
          const viewportMeta = document.querySelector('meta[name="viewport"]')
          if (viewportMeta) {
            addLog(`📊 Viewport meta: ${viewportMeta.getAttribute('content')}`)
          } else {
            addLog('❌ Viewport meta не найден')
            errors.push('Viewport meta не найден')
          }
        }
        
        if (tg && webAppAvailable) {
          try {
            addLog('🚀 Пытаемся инициализировать WebApp...')
            tg.ready()
            addLog('✅ tg.ready() выполнен')
            
            tg.expand()
            addLog('✅ tg.expand() выполнен')
            
            if (typeof tg.disableVerticalSwipes === 'function') {
              tg.disableVerticalSwipes()
              addLog('✅ tg.disableVerticalSwipes() выполнен')
            } else {
              addLog('⚠️ tg.disableVerticalSwipes() недоступен')
            }
            
            // Дополнительная информация после инициализации
            setTimeout(() => {
              addLog(`📊 После инициализации - высота: ${tg.viewportHeight}, развернуто: ${tg.isExpanded}`)
            }, 500)
            
          } catch (error) {
            const errorMsg = `Ошибка инициализации: ${error}`
            errors.push(errorMsg)
            addLog(`❌ ${errorMsg}`)
          }
        }
        
        setDiagnostics(info)
        addLog('✅ Диагностика завершена')
        
      } catch (error) {
        const errorMsg = `Критическая ошибка: ${error}`
        errors.push(errorMsg)
        addLog(`💥 ${errorMsg}`)
      }
    }
    
    // Проверяем сразу
    runDiagnostics()
    
    // И через интервалы для отслеживания изменений
    const intervals = [1000, 2000, 5000]
    intervals.forEach(delay => {
      setTimeout(() => {
        addLog(`🔄 Повторная проверка через ${delay/1000} секунд...`)
        runDiagnostics()
      }, delay)
    })
    
    return () => {
      if (typeof window !== 'undefined' && handleOnline && handleOffline) {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const handleNavigation = (path: string) => {
    const isMobile = isMobileDevice()
    
    addLog(`🧭 Навигация на: ${path}`)
    addLog(`📱 User Agent: ${navigator.userAgent}`)
    addLog(`🌐 Current URL: ${window.location.href}`)
    addLog(`📱 Is mobile device: ${isMobile}`)
    
    try {
      // Проверяем доступность router
      if (!router) {
        addLog('❌ Router недоступен')
        return
      }
      
      addLog('🚀 Вызываем router.push...')
      router.push(path)
      addLog('✅ router.push завершен')
      
      // Для мобильных устройств увеличиваем задержку
      const delay = isMobile ? 1000 : 500
      setTimeout(() => {
        addLog(`📍 URL после навигации: ${window.location.href}`)
        if (window.location.pathname === path) {
          addLog('✅ Навигация успешна - URL изменился')
        } else {
          addLog('⚠️ URL не изменился после навигации')
        }
      }, delay)
      
    } catch (error) {
      addLog(`❌ Ошибка навигации: ${error}`)
      addLog(`❌ Тип ошибки: ${typeof error}`)
      addLog(`❌ Stack trace: ${error instanceof Error ? error.stack : 'Нет stack trace'}`)
    }
  }

  const testNetworkConnection = async () => {
    addLog('🌐 Тестируем сетевое соединение...')
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache'
      })
      if (response.ok) {
        addLog('✅ Соединение с сервером работает')
      } else {
        addLog(`⚠️ Сервер ответил с кодом: ${response.status}`)
      }
    } catch (error) {
      addLog(`❌ Ошибка соединения: ${error}`)
    }
  }

  return (
    <div className="p-4 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            🔍 iOS Debug Dashboard
          </h1>
          <div className={`px-3 py-1 rounded-full text-sm ${
            isOnline ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {isOnline ? '🌐 Онлайн' : '📵 Офлайн'}
          </div>
        </div>
        
        {/* Кнопки тестирования */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button 
            onClick={() => handleNavigation('/')}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            🏠 Главная
          </button>
          <button 
            onClick={() => handleNavigation('/topics/1')}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            📚 Тема 1
          </button>
          <button 
            onClick={() => {
              const isMobile = isMobileDevice()
              
              addLog('🧪 Тестируем кнопку "Изучать тему"')
              addLog(`📱 Is mobile device: ${isMobile}`)
              
              // Имитируем клик по кнопке на главной странице
              handleNavigation('/')
              
              // Для мобильных устройств увеличиваем задержки
              const firstDelay = isMobile ? 200 : 100
              const secondDelay = isMobile ? 3000 : 2000
              
              setTimeout(() => {
                addLog(`⏱️ Через ${secondDelay/1000} секунды попробуем перейти к теме`)
                setTimeout(() => handleNavigation('/topics/1'), secondDelay)
              }, firstDelay)
            }}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
          >
            🧪 Тест "Изучать тему"
          </button>
          <button 
            onClick={() => handleNavigation('/test')}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
          >
            🧪 Тест
          </button>
          <button 
            onClick={testNetworkConnection}
            className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 transition-colors"
          >
            🌐 Тест сети
          </button>
        </div>
        
        {/* Диагностическая информация */}
        {diagnostics && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">📊 Диагностическая информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Скрипт загружен:</strong> {diagnostics.scriptLoaded ? '✅' : '❌'}
              </div>
              <div>
                <strong>Telegram доступен:</strong> {diagnostics.telegramAvailable ? '✅' : '❌'}
              </div>
              <div>
                <strong>WebApp доступен:</strong> {diagnostics.webAppAvailable ? '✅' : '❌'}
              </div>
              <div>
                <strong>Сеть:</strong> {diagnostics.networkStatus === 'online' ? '🌐' : '📵'} {diagnostics.networkStatus}
              </div>
              <div>
                <strong>Платформа:</strong> {diagnostics.platform}
              </div>
              <div>
                <strong>Версия:</strong> {diagnostics.version}
              </div>
              <div>
                <strong>Цветовая схема:</strong> {diagnostics.colorScheme}
              </div>
              <div>
                <strong>Высота viewport:</strong> {diagnostics.viewportHeight}px
              </div>
              <div>
                <strong>Стабильная высота:</strong> {diagnostics.viewportStableHeight}px
              </div>
              <div>
                <strong>Развернуто:</strong> {diagnostics.isExpanded ? '✅' : '❌'}
              </div>
            </div>
            
            {diagnostics.user && (
              <div className="mt-4">
                <strong>Пользователь:</strong>
                <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-x-auto">
                  {JSON.stringify(diagnostics.user, null, 2)}
                </pre>
              </div>
            )}
            
            {diagnostics.errors.length > 0 && (
              <div className="mt-4">
                <strong className="text-red-400">Ошибки ({diagnostics.errors.length}):</strong>
                <ul className="mt-2 text-red-300">
                  {diagnostics.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Логи */}
        <div className="p-4 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📝 Логи выполнения ({logs.length})</h2>
          <div className="max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1 text-gray-300">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        {/* Системная информация */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🖥️ Системная информация</h2>
          <div className="text-sm space-y-2">
            <div><strong>URL:</strong> <span className="break-all">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</span></div>
            <div><strong>User Agent:</strong> <span className="break-all">{typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</span></div>
            <div><strong>Размер экрана:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}</div>
            <div><strong>Размер окна:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
            <div><strong>Pixel Ratio:</strong> {typeof window !== 'undefined' ? window.devicePixelRatio : 'N/A'}</div>
            <div><strong>Язык:</strong> {typeof navigator !== 'undefined' ? navigator.language : 'N/A'}</div>
            <div><strong>Платформа:</strong> {typeof navigator !== 'undefined' ? navigator.platform : 'N/A'}</div>
            <div><strong>Cookies включены:</strong> {typeof navigator !== 'undefined' ? (navigator.cookieEnabled ? '✅' : '❌') : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}