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
  const [playbackRate, setPlaybackRate] = useState(1)
  // Удалено внутреннее состояние showControls, теперь используется пропс
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

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
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    
    // Для YouTube iframe отправляем сообщение
    if (iframeRef.current && videoUrl.includes('youtube.com')) {
      const iframe = iframeRef.current
      const message = {
        event: 'command',
        func: 'setPlaybackRate',
        args: [rate]
      }
      iframe.contentWindow?.postMessage(JSON.stringify(message), '*')
    }
  }

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
          
          {/* Селектор скорости воспроизведения */}
          <div className="relative group">
            <button
              className="text-white/80 hover:text-white p-2 rounded transition-all duration-300 hover:scale-110 hover:bg-black/20 flex items-center justify-center"
              title="Скорость воспроизведения"
              onClick={() => {
                const currentIndex = playbackRates.indexOf(playbackRate)
                const nextIndex = (currentIndex + 1) % playbackRates.length
                changePlaybackRate(playbackRates[nextIndex])
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,8V16L18.5,12M4,12A8,8 0 0,1 12,4C12.74,4 13.45,4.12 14.12,4.34L15.54,2.92C14.43,2.33 13.24,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12H20A8,8 0 0,1 12,20A8,8 0 0,1 4,12Z"/>
              </svg>
              <span className="ml-1 text-xs font-semibold">{playbackRate}x</span>
            </button>
            
            {/* Выпадающий список скоростей */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-black/95 backdrop-blur-md rounded-md shadow-xl p-1 min-w-[70px]">
                {playbackRates.map(rate => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors duration-200 ${
                      rate === playbackRate 
                        ? 'bg-cyan-500/30 text-cyan-300' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Индикатор скорости в левом нижнем углу */}
        {playbackRate !== 1 && (
          <div className="absolute bottom-4 left-4 text-white/90 px-3 py-1 rounded text-sm bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,8V16L18.5,12M4,12A8,8 0 0,1 12,4C12.74,4 13.45,4.12 14.12,4.34L15.54,2.92C14.43,2.33 13.24,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12H20A8,8 0 0,1 12,20A8,8 0 0,1 4,12Z"/>
              </svg>
              <span className="font-medium">{playbackRate}x</span>
            </div>
          </div>
        )}
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