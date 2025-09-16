'use client'

import { useState, useRef, useEffect } from 'react'
import { ButtonCta } from '@/components/ui/button-shiny'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onLoad?: () => void
  showControls?: boolean
}

export default function VideoPlayer({ videoUrl, title, onLoad, showControls = false }: VideoPlayerProps) {
  // CSS стили для кастомного ползунка
  const sliderStyles = `
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    .slider::-webkit-slider-thumb:hover {
      background: #2563eb;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    .slider::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    .slider::-moz-range-thumb:hover {
      background: #2563eb;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    /* Стили для темного ползунка */
    .slider-dark::-webkit-slider-thumb {
      appearance: none;
      height: 24px;
      width: 24px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2);
      transition: all 0.3s ease;
    }
    .slider-dark::-webkit-slider-thumb:hover {
      background: #2563eb;
      transform: scale(1.15);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3);
    }
    .slider-dark::-webkit-slider-thumb:active {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6), 0 0 0 3px rgba(59, 130, 246, 0.4);
    }
    .slider-dark::-moz-range-thumb {
      height: 24px;
      width: 24px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }
    .slider-dark::-moz-range-thumb:hover {
      background: #2563eb;
      transform: scale(1.15);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }
    .slider-dark::-moz-range-thumb:active {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6);
    }
    .slider-dark::-webkit-slider-track {
      height: 12px;
      border-radius: 6px;
      background: #374151;
    }
    .slider-dark::-moz-range-track {
      height: 12px;
      border-radius: 6px;
      background: #374151;
      border: none;
    }
  `

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Удалено внутреннее состояние showControls, теперь используется пропс
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Обработка полноэкранного режима
  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Ошибка при переключении полноэкранного режима:', error)
    }
  }

  // Слушаем изменения полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Обработка изменения скорости воспроизведения
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    
    // Отправляем команду в YouTube iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [speed]
        }),
        '*'
      )
    }
  }

  // Применение скорости и закрытие модального окна
  const applySpeedAndClose = (speed: number) => {
    handleSpeedChange(speed)
    setShowSettings(false)
  }



  // Закрытие настроек при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && !(event.target as Element).closest('.settings-menu')) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])



  // Определяем мобильное устройство
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Получаем URL с параметрами для YouTube
  const getVideoUrl = () => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Добавляем параметры для YouTube API
      const separator = videoUrl.includes('?') ? '&' : '?'
      const isMobile = isMobileDevice()
      
      // Параметры для решения проблем с мобильными устройствами
      const mobileParams = isMobile 
        ? '&playsinline=1&widget_referrer=' + encodeURIComponent(window.location.origin)
        : ''
      
      return `${videoUrl}${separator}enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1${mobileParams}`
    }
    return videoUrl
  }

  return (
    <div 
      ref={containerRef}
      className={`relative group ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' 
          : 'aspect-video bg-gray-900/50 rounded-lg overflow-hidden'
      }`}
    >
      {/* CSS стили для ползунка */}
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <iframe
        ref={iframeRef}
        src={getVideoUrl()}
        title={title}
        className={`w-full h-full ${isFullscreen ? '' : 'rounded-lg'}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={onLoad}
      />
      


      {/* Кастомные контролы */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
        showControls || isFullscreen ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Контролы в правом нижнем углу */}
        <div className="absolute bottom-4 right-4 flex flex-row-reverse gap-3 pointer-events-auto">
          {/* Кнопка полноэкранного режима */}
          <button
            onClick={toggleFullscreen}
            className="text-white/80 hover:text-white p-2 rounded transition-all duration-300 hover:scale-110 hover:bg-black/20"
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            )}
          </button>

          {/* Кнопка настроек */}
          <div className="relative settings-menu">
            <button
               onClick={() => setShowSettings(!showSettings)}
               className="text-white/80 hover:text-white p-2 rounded transition-all duration-300 hover:scale-110 hover:bg-black/20"
               title="Настройки"
             >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
            </button>

          </div>
        </div>
      </div>
      
      {/* Модальное окно настроек с темным фоном */}
       {showSettings && (
         <div 
           className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
           onClick={(e) => {
             if (e.target === e.currentTarget) {
               setShowSettings(false)
             }
           }}
         >
          <div className="w-full max-w-md bg-gray-900 rounded-t-3xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-bottom-4">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Настройки скорости</h3>
                  <p className="text-sm text-gray-400">Регулировка воспроизведения</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>
            
            {/* Содержимое */}
            <div className="p-6">
              {/* Отображение текущей скорости */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">{playbackSpeed.toFixed(2)}x</div>
                <div className="text-sm text-gray-400">
                  {playbackSpeed === 1 ? 'Нормальная скорость' : playbackSpeed < 1 ? 'Замедленное воспроизведение' : 'Ускоренное воспроизведение'}
                </div>
              </div>
              
              {/* Ползунок скорости */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="range"
                    min="0.25"
                    max="2.0"
                    step="0.05"
                    value={playbackSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-dark"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((playbackSpeed - 0.25) / (2.0 - 0.25)) * 100}%, #374151 ${((playbackSpeed - 0.25) / (2.0 - 0.25)) * 100}%, #374151 100%)`
                    }}
                  />
                  {/* Маркеры на ползунке */}
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs text-gray-500">0.25x</span>
                    <span className="text-xs text-gray-400">1.0x</span>
                    <span className="text-xs text-gray-500">2.0x</span>
                  </div>
                </div>
              </div>
              
              {/* Быстрые кнопки */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => applySpeedAndClose(speed)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      Math.abs(playbackSpeed - speed) < 0.01
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white active:scale-95'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
              
              {/* Кнопка сброса */}
              <button
                onClick={() => applySpeedAndClose(1.0)}
                className="w-full px-4 py-3 bg-gray-800 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.5L7,5.5L12,0.5V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"/>
                </svg>
                Сбросить к нормальной скорости
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Инструкция для полноэкранного режима */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
          Нажмите ESC для выхода из полноэкранного режима
        </div>
      )}
    </div>
  )
}