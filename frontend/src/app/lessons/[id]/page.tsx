'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ButtonCta } from '@/components/ui/button-shiny'

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
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Статические данные уроков
  const staticLessons = [
    {
      id: 1,
      title: "УПАКОВКА БЛОГА",
      description: "как оформить профиль так, чтобы подписывались и оставались.",
      youtubeUrl: "https://www.youtube.com/embed/XXXX?rel=0",
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
        setLesson({
          id: staticLesson.id,
          title: staticLesson.title,
          description: staticLesson.description,
          video_url: staticLesson.youtubeUrl,
          topic_id: staticLesson.topic_id,
          topic_title: staticLesson.topic_title,
          is_completed: false
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки урока:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCompletion = async () => {
    if (!lesson) return
    
    try {
      await fetch(`http://localhost:3001/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !lesson.is_completed }),
      })
      
      setLesson({ ...lesson, is_completed: !lesson.is_completed })
    } catch (error) {
      console.error('Ошибка обновления статуса урока:', error)
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
          <ButtonCta label="Вернуться на главную" />
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      {/* Навигация */}
      <div className="mb-6">
        <Link href={`/topics/${lesson.topic_id}`}>
          <ButtonCta label="← Назад" className="mb-4" />
        </Link>
      </div>

      {/* Заголовок урока */}
      <div className="mb-6">
        <div className="p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
          <h1 className="text-3xl font-bold text-white mb-4">{lesson.title}</h1>
          <p className="text-lg text-white/70 mb-6">{lesson.description}</p>
          
          {/* Статус завершения */}
          <div className="flex items-center justify-between">
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
            
            <ButtonCta
              onClick={toggleCompletion}
              label={lesson.is_completed ? 'Снять отметку' : 'Отметить как пройденный'}
            />
          </div>
        </div>
      </div>

      {/* Видео */}
      <div className="mb-6">
        <div className="p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
          <div className="aspect-video bg-gray-900/50 rounded-lg relative overflow-hidden">
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-white/70">Загрузка видео...</p>
                </div>
              </div>
            )}
            
            <iframe
              src={lesson.video_url}
              title={lesson.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoLoaded(true)}
            ></iframe>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mb-6">
        <div className="p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
          <h3 className="text-lg font-semibold text-white mb-3">💡 Совет</h3>
          <p className="text-white/70">
            Для лучшего усвоения материала рекомендуем:
          </p>
          <ul className="list-disc list-inside text-white/70 mt-2 space-y-1">
            <li>Просмотреть видео полностью</li>
            <li>Делать заметки по ходу просмотра</li>
            <li>Практиковать полученные знания</li>
            <li>Отметить урок как пройденный после изучения</li>
          </ul>
        </div>
      </div>

      {/* Навигация между уроками */}
      <div className="flex justify-center">
        <Link href={`/topics/${lesson.topic_id}`}>
          <ButtonCta label="Вернуться к списку уроков" icon="←" />
        </Link>
      </div>
    </div>
  )
}