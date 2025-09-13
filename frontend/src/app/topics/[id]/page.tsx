'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ButtonCta } from '@/components/ui/button-shiny'
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation'

interface Lesson {
  id: number
  title: string
  description: string
  video_url: string
  is_completed: boolean
}

interface Topic {
  id: number
  title: string
  description: string
}

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const { navigate } = useTelegramNavigation()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTopicData()
    }
  }, [params.id])

  const fetchTopicData = async () => {
    const topicId = params?.id ? decodeURIComponent(params.id as string) : null
    
    if (!topicId) {
      setLoading(false)
      return
    }
    
    // Статические данные для темы 1
    const staticTopicData = {
      id: 1,
      title: 'Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»',
      description: 'Простая система, которая помогает вести блог без лишней суеты: писать живые посты, удерживать интерес людей и постепенно набирать подписчиков.'
    }
    
    // Если это тема 1, используем статические данные (без try-catch для статических данных)
    const numericId = parseInt(topicId)
    if (numericId === 1) {
      setTopic(staticTopicData)
      // Устанавливаем статические уроки для темы 1
      setLessons([
        {
          id: 1,
          title: 'УПАКОВКА БЛОГА',
          description: 'как оформить профиль так, чтобы подписывались и оставались.',
          video_url: 'https://www.youtube.com/embed/XXXX?rel=0',
          is_completed: false
        },
        {
          id: 2,
          title: 'СИСТЕМА ИДЕЙ «КОНТЕНТ БЕЗ СТУПОРА»',
          description: 'как генерировать идеи каждый день и не выгорать.',
          video_url: 'https://www.youtube.com/embed/YYYY?rel=0',
          is_completed: false
        },
        {
          id: 3,
          title: 'ТЕКСТОВЫЕ РИЛС: ФОРМУЛА ЗАХВАТА ВНИМАНИЯ',
          description: 'структура заголовка и подача, чтобы ролики брали охваты.',
          video_url: 'https://www.youtube.com/embed/ZZZZ?rel=0',
          is_completed: false
        },
        {
          id: 4,
          title: 'ПУБЛИКАЦИИ-КАРУСЕЛИ «ЛИСТАЙ, НЕ ОТПУСКАЙ»',
          description: 'сценарии, ритм и оформление каруселей, которые дочитывают.',
          video_url: 'https://www.youtube.com/embed/WWWW?rel=0',
          is_completed: false
        }
      ])
      setLoading(false)
      return
    }
    
    // Для других тем пытаемся загрузить с API
    try {
      // На мобильных устройствах используем продакшн URL вместо localhost
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const apiUrl = isMobile ? 'https://isma-spase.vercel.app/api' : (process.env.NEXT_PUBLIC_API_URL || 'https://isma-spase.vercel.app/api')
      const topicResponse = await fetch(`${apiUrl}/topics/${topicId}`)
      if (!topicResponse.ok) {
        console.error('Тема не найдена')
        setTopic(null)
        setLoading(false)
        return
      }
      
      const topicData = await topicResponse.json()
      setTopic(topicData)
      
      // Получаем уроки темы
      const lessonsResponse = await fetch(`${apiUrl}/topics/${topicId}/lessons`)
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json()
        setLessons(lessonsData)
      } else {
        setLessons([])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      setTopic(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleLessonCompletion = async (lessonId: number, isCompleted: boolean) => {
    // Обновляем статус урока локально без API
    setLessons(lessons.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, is_completed: !isCompleted }
        : lesson
    ))
  }

  // Статические данные для уроков
  const staticLessons = [
    {
      id: 1,
      title: "УПАКОВКА БЛОГА",
      description: "как оформить профиль так, чтобы подписывались и оставались.",
      is_completed: false
    },
    {
      id: 2,
      title: "СИСТЕМА ИДЕЙ «КОНТЕНТ БЕЗ СТУПОРА»",
      description: "как генерировать идеи каждый день и не выгорать.",
      is_completed: false
    },
    {
      id: 3,
      title: "ТЕКСТОВЫЕ РИЛС: ФОРМУЛА ЗАХВАТА ВНИМАНИЯ",
      description: "структура заголовка и подача, чтобы ролики брали охваты.",
      is_completed: false
    },
    {
      id: 4,
      title: "КАРУСЕЛИ «ЛИСТАЙ, НЕ ОТПУСКАЙ»",
      description: "сценарии, ритм и оформление каруселей, которые дочитывают.",
      is_completed: false
    }
  ]

  const getProgressPercentage = () => {
    const completedCount = lessons.filter(lesson => lesson.is_completed).length
    return lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
  }

  const completedLessons = staticLessons.filter(staticLesson => 
    lessons.find(l => l.id === staticLesson.id)?.is_completed
  ).length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Тема не найдена</h2>
        <ButtonCta 
          label="Вернуться на главную" 
          onNavigate={() => navigate('/')}
        />
      </div>
    )
  }

  const progress = getProgressPercentage()

  return (
    <div className="px-2 py-4 sm:px-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <ButtonCta 
          label="← Назад" 
          className="mb-3 sm:mb-4" 
          onNavigate={() => navigate('/')}
        />
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">{topic.title}</h1>
        <p className="text-sm sm:text-base lg:text-lg text-white/70 mb-4 sm:mb-6 leading-relaxed">{topic.description}</p>
        
        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] mb-6 sm:mb-8" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-white">Прогресс изучения</h3>
            <span className="text-xs sm:text-sm text-white/70">{completedLessons}/4 уроков</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(completedLessons / 4) * 100}%` }}
            ></div>
          </div>
          <div className="text-right text-xs sm:text-sm text-white/70">
            {Math.round((completedLessons / 4) * 100)}% завершено
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {staticLessons.map((lesson, index) => {
          const isCompleted = lessons.find(l => l.id === lesson.id)?.is_completed || false
          return (
            <div key={lesson.id} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1 mb-3 sm:mb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                    <span className="bg-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded mb-2 sm:mb-0 sm:mr-3 whitespace-nowrap flex-shrink-0 self-start">
                      Урок {index + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">{lesson.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-white/70 mb-3 sm:mb-4 leading-relaxed">Кратко: {lesson.description}</p>
                </div>
                
                <div className="flex items-center sm:ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleLessonCompletion(lesson.id, isCompleted)}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors duration-200 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform duration-200 ${
                        isCompleted ? 'transform translate-x-5 sm:translate-x-6' : ''
                      }`}></div>
                    </div>
                    <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                      isCompleted ? 'text-green-400' : 'text-white/50'
                    }`}>
                      {isCompleted ? 'Пройдено' : 'Не пройдено'}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-4">
                <ButtonCta 
                  label="Открыть урок" 
                  className="w-full text-sm sm:text-base" 
                  onNavigate={() => navigate(`/lessons/${lesson.id}`)}
                />
              </div>
            </div>
          )
        })}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Уроки пока не добавлены
          </h3>
          <p className="text-gray-600">
            Скоро здесь появятся интересные уроки по этой теме!
          </p>
        </div>
      )}
    </div>
  )
}