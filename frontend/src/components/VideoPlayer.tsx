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



  // Получаем URL с параметрами для YouTube
  const getVideoUrl = () => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Добавляем параметры для YouTube API
      const separator = videoUrl.includes('?') ? '&' : '?'
      return `${videoUrl}${separator}enablejsapi=1&origin=${window.location.origin}`
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