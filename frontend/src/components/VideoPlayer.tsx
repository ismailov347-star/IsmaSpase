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
    setShowSettings(false)
    
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
      // Убрано управление showControls на уровне видео
    >
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

            {/* Меню настроек */}
             {showSettings && (
               <div className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                 {/* Скорость воспроизведения */}
                 <div className="p-2">
                   <div className="text-gray-700 text-xs font-medium mb-2 px-2">Скорость</div>
                   <div className="space-y-1">
                     {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                       <button
                         key={speed}
                         onClick={() => {
                           setPlaybackSpeed(speed)
                           setShowSettings(false)
                         }}
                         className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                           playbackSpeed === speed
                             ? 'bg-blue-500 text-white shadow-sm'
                             : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                         }`}
                       >
                         <span>{speed}x</span>
                         {playbackSpeed === speed && (
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         )}
                       </button>
                     ))}
                   </div>
                 </div>


              </div>
            )}
          </div>
          

        </div>
        

      </div>
      
      {/* Инструкция для полноэкранного режима */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
          Нажмите ESC для выхода из полноэкранного режима
        </div>
      )}
    </div>
  )
}