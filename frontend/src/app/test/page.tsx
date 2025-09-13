'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [telegramData, setTelegramData] = useState<any>(null)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const checkTelegram = () => {
      const newErrors: string[] = []
      
      // Проверяем наличие Telegram WebApp
      if (typeof window === 'undefined') {
        newErrors.push('Window объект недоступен')
        setErrors(newErrors)
        return
      }
      
      if (!window.Telegram) {
        newErrors.push('Telegram объект не найден')
      } else if (!window.Telegram.WebApp) {
        newErrors.push('Telegram.WebApp не найден')
      } else {
        // Собираем данные о Telegram WebApp
        const tg = window.Telegram.WebApp
        setTelegramData({
          isAvailable: true,
          colorScheme: tg.colorScheme,
          isExpanded: tg.isExpanded,
          viewportHeight: tg.viewportHeight,
          initData: tg.initData,
          user: tg.initDataUnsafe?.user,
          platform: tg.platform || 'unknown'
        })
      }
      
      setErrors(newErrors)
    }
    
    // Проверяем сразу и через небольшую задержку
    checkTelegram()
    setTimeout(checkTelegram, 1000)
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Диагностика Telegram WebApp</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Статус:</h2>
          {errors.length > 0 ? (
            <div className="text-red-400">
              <p>❌ Обнаружены проблемы:</p>
              <ul className="list-disc list-inside mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-green-400">✅ Telegram WebApp доступен</p>
          )}
        </div>
        
        {telegramData && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Данные Telegram:</h2>
            <pre className="text-sm text-gray-300 overflow-auto">
              {JSON.stringify(telegramData, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">URL информация:</h2>
          <p>Текущий URL: {typeof window !== 'undefined' ? window.location.href : 'недоступен'}</p>
          <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'недоступен'}</p>
        </div>
      </div>
    </div>
  )
}