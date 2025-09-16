'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ButtonCta } from '@/components/ui/button-shiny'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'

interface Lesson {
  id: number
  title: string
  description: string
  video_url: string
  topic_id: number
  topic_title: string
  is_completed: boolean
}

export default function LessonPage() {
  const params = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Статические данные уроков
  const staticLessons = [
    {
      id: 1,
      title: "УПАКОВКА БЛОГА",
      description: "как оформить профиль так, чтобы подписывались и оставались.",
      youtubeUrl: "https://youtu.be/O4wPUbiUKZo?si=sNGL6i1exLdry-tY",
      topic_id: 1,
      topic_title: "Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»"
    },
    {
      id: 2,
      title: "СИСТЕМА ИДЕЙ «КОНТЕНТ БЕЗ СТУПОРА»",
      description: "как генерировать идеи каждый день и не выгорать.",
      youtubeUrl: "https://www.youtube.com/embed/YYYY?rel=0",
      topic_id: 1,
      topic_title: "Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»"
    },
    {
      id: 3,
      title: "ТЕКСТОВЫЕ РИЛС: ФОРМУЛА ЗАХВАТА ВНИМАНИЯ",
      description: "структура заголовка и подача, чтобы ролики брали охваты.",
      youtubeUrl: "https://www.youtube.com/embed/ZZZZ?rel=0",
      topic_id: 1,
      topic_title: "Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»"
    },
    {
      id: 4,
      title: "ПУБЛИКАЦИИ-КАРУСЕЛИ «ЛИСТАЙ, НЕ ОТПУСКАЙ»",
      description: "сценарии, ритм и оформление каруселей, которые дочитывают.",
      youtubeUrl: "https://www.youtube.com/embed/WWWW?rel=0",
      topic_id: 1,
      topic_title: "Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»"
    }
  ]

  useEffect(() => {
    if (params.id) {
      fetchLessonData()
    }
  }, [params.id])

  const fetchLessonData = async () => {
    try {
      // Используем статические данные вместо API
      const lessonId = parseInt(params.id as string)
      const staticLesson = staticLessons.find(l => l.id === lessonId)
      
      if (staticLesson) {
        // Загружаем состояние прогресса из localStorage
        const savedProgress = localStorage.getItem('lessonProgress')
        const progressData = savedProgress ? JSON.parse(savedProgress) : {}
        const isCompleted = progressData[lessonId] || false
        
        setLesson({
          id: staticLesson.id,
          title: staticLesson.title,
          description: staticLesson.description,
          video_url: staticLesson.youtubeUrl,
          topic_id: staticLesson.topic_id,
          topic_title: staticLesson.topic_title,
          is_completed: isCompleted
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки урока:', error)
    } finally {
      setLoading(false)
    }
  }



  const getYouTubeEmbedUrl = (url: string) => {
    // Извлекаем ID видео из различных форматов YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1`
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

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Урок не найден</h2>
        <Link href="/">
          <ButtonCta 
            label="Вернуться на главную"
          />
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      {/* Навигация */}
      <div className="mb-6">
        <Link href={`/topics/${lesson.topic_id}`} className="block focus:outline-none">
          <ButtonCta 
            label="← Назад" 
            className="mb-4"
          />
        </Link>
      </div>

      {/* Заголовок урока */}
      <div className="mb-6">
        <div className="glass-card p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300">
          <h1 className="text-3xl font-bold text-white mb-4">{lesson.title}</h1>
          <p className="text-lg text-white/70 mb-6">{lesson.description}</p>
          
          {/* Статус завершения */}
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              lesson.is_completed ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <span className={`font-medium ${
              lesson.is_completed ? 'text-green-400' : 'text-white/50'
            }`}>
              {lesson.is_completed ? 'Урок пройден' : 'Урок не пройден'}
            </span>
          </div>
        </div>
      </div>

      {/* Видео */}
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
            videoUrl={getYouTubeEmbedUrl(lesson.video_url)}
            title={lesson.title}
            onLoad={() => setVideoLoaded(true)}
          />
          
          {/* Кнопка для открытия видео в YouTube - вынесена за пределы видео */}
          <div className="mt-4 flex justify-center">
            <ButtonCta
              label="Открыть в YouTube"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs"
              onClick={() => {
                // Извлекаем ID видео из оригинального URL
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                const match = lesson.video_url.match(regExp)
                if (match && match[2].length === 11) {
                  window.open(`https://www.youtube.com/watch?v=${match[2]}`, '_blank')
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mb-6">
        <div className="glass-card p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Совет</h3>
          <p className="text-white/70">
            Для лучшего усвоения материала рекомендуем:
          </p>
          <ul className="list-disc list-inside text-white/70 mt-2 space-y-1">
            <li>Просмотреть видео полностью</li>
            <li>Делать заметки по ходу просмотра</li>
            <li>Практиковать полученные знания</li>
          </ul>
        </div>
      </div>

      {/* Навигация между уроками */}
      <div className="flex justify-center">
        <Link href={`/topics/${lesson.topic_id}`} className="block focus:outline-none">
          <ButtonCta 
            label="Вернуться к списку уроков" 
            icon="←"
          />
        </Link>
      </div>
    </div>
  )
}