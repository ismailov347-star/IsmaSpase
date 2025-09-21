'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ButtonCta } from '../../../components/ui/button-shiny'
import VideoPlayer from '../../../components/VideoPlayer'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Lesson {
  id: number
  title: string
  description?: string
  videoUrl: string
  topicId: number
  isLocked: boolean
}

interface Topic {
  id: number
  title: string
  description?: string
  isLocked: boolean
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showVideoControls, setShowVideoControls] = useState(false)

  useEffect(() => {
    if (lessonId) {
      fetchLessonData()
    }
  }, [lessonId])

  const { isAuthenticated } = useAuth()

  const fetchLessonData = async () => {
    try {
      const lessonData = await apiClient.getLesson(lessonId)
      
      // Преобразуем данные из snake_case в camelCase
      const mappedLesson: Lesson = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        videoUrl: lessonData.video_url,
        topicId: lessonData.topic_id,
        isLocked: lessonData.is_locked || false
      }
      
      setLesson(mappedLesson)
      
      // Загружаем информацию о теме
      const topicResponse = await fetch(`/api/topics/${mappedLesson.topicId}`)
      if (topicResponse.ok) {
        const topicData = await topicResponse.json()
        const mappedTopic: Topic = {
          id: topicData.id,
          title: topicData.title,
          description: topicData.description,
          isLocked: topicData.is_locked || false
        }
        setTopic(mappedTopic)
      }
    } catch (error) {
      console.error('Ошибка загрузки урока:', error)
      setError('Не удалось загрузить урок')
    } finally {
      setLoading(false)
    }
  }



  const getYouTubeEmbedUrl = (url: string) => {
    // Извлекаем ID видео из различных форматов YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    
    if (match && match[2].length === 11) {
      // Определяем мобильное устройство
      const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Параметры для решения проблем с мобильными устройствами
      const mobileParams = isMobile 
        ? '&playsinline=1&widget_referrer=' + encodeURIComponent(window.location.origin)
        : ''
      
      return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}${mobileParams}`
    }
    
    return url // Возвращаем оригинальный URL если не удалось распарсить
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
        <ButtonCta 
          label="Вернуться на главную"
          onNavigate={() => router.push('/')}
        />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Урок не найден</h2>
        <ButtonCta 
          label="Вернуться на главную"
          onNavigate={() => router.push('/')}
        />
      </div>
    )
  }

  if (lesson.isLocked) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Урок заблокирован</h2>
        <p className="text-white/70 mb-6">Этот урок пока недоступен</p>
        <ButtonCta 
          label="Вернуться к теме"
          onNavigate={() => router.push(`/topics/${lesson.topicId}`)}
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      {/* Навигация */}
      <div className="mb-6">
        <ButtonCta 
          label="← Назад к теме"
          onNavigate={() => router.push(`/topics/${lesson.topicId}`)} 
          className="mb-4"
        />
      </div>

      {/* Заголовок урока */}
      <div className="mb-6">
        <div className="glass-card p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
          </div>
          {lesson.description && (
            <p className="text-lg text-white/70 mb-6">{lesson.description}</p>
          )}
        </div>
      </div>

      {/* Видео */}
      {lesson.videoUrl && (
        <div className="mb-6">
          <div className="glass-card p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300">
            {!videoLoaded && (
              <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-white/70">Загрузка видео...</p>
                </div>
              </div>
          )}
          
            <VideoPlayer
              videoUrl={getYouTubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              onLoad={() => setVideoLoaded(true)}
              showControls={true}
            />
            
            {/* Кнопка для открытия видео в YouTube - вынесена за пределы видео */}
            <div className="mt-4 flex justify-center">
              <ButtonCta
                label="Открыть в YouTube"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs"
                onNavigate={() => {
                  // Извлекаем ID видео из оригинального URL
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                  const match = lesson.videoUrl.match(regExp)
                  if (match && match[2].length === 11) {
                    window.open(`https://www.youtube.com/watch?v=${match[2]}`, '_blank')
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      <div className="mb-6">
        <div className="glass-card p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Совет</h3>
          <p className="text-white/70">
            {(() => {
              const title = lesson.title.toLowerCase()
              if (title.includes('упаковка блога')) {
                return 'Смотри урок с мыслями: что я могу применить прямо сегодня в своём профиле?'
              } else if (title.includes('система идей')) {
                return 'Запиши минимум 5 идей для постов во время просмотра.'
              } else if (title.includes('текстовые рилс')) {
                return 'Отметь 2–3 крючка из урока и протестируй их в ближайших публикациях.'
              } else if (title.includes('карусели')) {
                return 'Выбери одну тему из своих старых постов и продумай, как её превратить в карусель.'
              } else {
                return 'Для лучшего усвоения материала рекомендуем просмотреть видео полностью и делать заметки.'
              }
            })()
            }
          </p>
        </div>
      </div>

      {/* Навигация между уроками */}
      <div className="flex justify-center">
        <ButtonCta 
          label="Вернуться к списку уроков" 
          icon="←"
          onNavigate={() => router.push(`/topics/${lesson.topicId}`)}
        />
      </div>
    </div>
  )
}