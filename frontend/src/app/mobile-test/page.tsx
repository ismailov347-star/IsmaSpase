'use client'

import { useState } from 'react'
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation'
import { ButtonCta } from '@/components/ui/button-shiny'

export default function MobileTestPage() {
  const { navigate, isMobileDevice, isTelegramWebApp } = useTelegramNavigation()
  const [logs, setLogs] = useState<string[]>([])
  const [isTestRunning, setIsTestRunning] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setLogs(prev => [...prev, logMessage])
  }

  const clearLogs = () => {
    setLogs([])
    console.clear()
  }

  const testNavigation = async () => {
    if (isTestRunning) return
    
    setIsTestRunning(true)
    clearLogs()
    
    addLog('🧪 Начинаем тест навигации')
    addLog(`📱 Мобильное устройство: ${isMobileDevice}`)
    addLog(`📱 Telegram WebApp: ${isTelegramWebApp}`)
    addLog(`🌐 User Agent: ${navigator.userAgent}`)
    addLog(`📍 Текущий URL: ${window.location.href}`)
    
    try {
      addLog('🚀 Тестируем переход на /topics/1')
      navigate('/topics/1')
      addLog('✅ navigate() вызван успешно')
      
      // Проверяем результат через задержку
      setTimeout(() => {
        addLog(`📍 URL после навигации: ${window.location.href}`)
        if (window.location.pathname === '/topics/1') {
          addLog('✅ Навигация успешна!')
        } else {
          addLog('❌ Навигация не сработала')
        }
        setIsTestRunning(false)
      }, isMobileDevice() ? 2000 : 1000)
      
    } catch (error) {
      addLog(`❌ Ошибка: ${error}`)
      setIsTestRunning(false)
    }
  }

  const testButtonNavigation = () => {
    if (isTestRunning) return
    
    setIsTestRunning(true)
    clearLogs()
    
    addLog('🧪 Тестируем кнопку ButtonCta')
    addLog(`📱 Мобильное устройство: ${isMobileDevice}`)
    addLog(`📱 Telegram WebApp: ${isTelegramWebApp}`)
    
    // Кнопка сама вызовет navigate через onNavigate
    setTimeout(() => {
      setIsTestRunning(false)
    }, 3000)
  }

  return (
    <div className="p-4 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            📱 Тест мобильной навигации
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">📱 Устройство</h3>
              <p className={`text-sm ${isMobileDevice() ? 'text-green-400' : 'text-yellow-400'}`}>
                {isMobileDevice() ? 'Мобильное' : 'Десктоп'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">📱 Telegram</h3>
              <p className={`text-sm ${isTelegramWebApp ? 'text-green-400' : 'text-gray-400'}`}>
                {isTelegramWebApp ? 'WebApp' : 'Браузер'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">🌐 URL</h3>
              <p className="text-sm text-gray-300 break-all">
                {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Кнопки тестирования */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={testNavigation}
              disabled={isTestRunning}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isTestRunning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isTestRunning ? '⏳ Тестируем...' : '🧪 Тест navigate()'}
            </button>
            
            <button 
              onClick={() => navigate('/')}
              disabled={isTestRunning}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isTestRunning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              🏠 На главную
            </button>
            
            <button 
              onClick={clearLogs}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
            >
              🗑️ Очистить логи
            </button>
          </div>
          
          {/* Тест кнопки ButtonCta */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-4">🔘 Тест кнопки ButtonCta</h3>
            <ButtonCta 
              label="Изучать тему" 
              onNavigate={() => {
                testButtonNavigation()
                navigate('/topics/1')
              }}
            />
          </div>
        </div>

        {/* Логи */}
        <div className="bg-black rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">📋 Логи тестирования</h3>
            <span className="text-sm text-gray-400">
              {logs.length} записей
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">Логи появятся здесь после запуска тестов</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-gray-300">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Инструкции */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="font-semibold mb-2">📖 Инструкции</h3>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• Используйте кнопку "🧪 Тест navigate()" для прямого тестирования функции навигации</li>
            <li>• Кнопка "Изучать тему" тестирует компонент ButtonCta с обработкой мобильных устройств</li>
            <li>• Все действия логируются в консоль браузера и в окно логов ниже</li>
            <li>• На мобильных устройствах используются увеличенные задержки для стабильности</li>
          </ul>
        </div>
      </div>
    </div>
  )
}