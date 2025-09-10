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
  const [topic, setTopic] = useState<Topic | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTopicData()
    }
  }, [params.id])

  const fetchTopicData = async () => {
    try {
      const [topicResponse, lessonsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/topics/${params.id}`),
        fetch(`http://localhost:3001/api/topics/${params.id}/lessons`)
      ])
      
      const topicData = await topicResponse.json()
      const lessonsData = await lessonsResponse.json()
      
      setTopic(topicData)
      setLessons(lessonsData)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLessonCompletion = async (lessonId: number, isCompleted: boolean) => {
    try {
      await fetch(`http://localhost:3001/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !isCompleted }),
      })
      
      setLessons(lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_completed: !isCompleted }
          : lesson
      ))
    } catch (error) {
      console.error('Ошибка обновления статуса урока:', error)
    }
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
        <Link href="/">
          <ButtonCta label="Вернуться на главную" />
        </Link>
      </div>
    )
  }

  const progress = getProgressPercentage()

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <ButtonCta label="← Назад" className="mb-4" />
        </Link>
        
        <h1 className="text-3xl font-bold text-white mb-4">Практикум «СИСТЕМА ЛЁГКОГО КОНТЕНТА»</h1>
        <p className="text-lg text-white/70 mb-6">Короткая, понятная система для роста блога и стабильного контента.</p>
        
        <div className="p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] mb-8" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Прогресс изучения</h3>
            <span className="text-sm text-white/70">{completedLessons}/4 уроков</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(completedLessons / 4) * 100}%` }}
            ></div>
          </div>
          <div className="text-right text-sm text-white/70">
            {Math.round((completedLessons / 4) * 100)}% завершено
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {staticLessons.map((lesson, index) => {
          const isCompleted = lessons.find(l => l.id === lesson.id)?.is_completed || false
          return (
            <div key={lesson.id} className="p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="bg-cyan-500/20 text-cyan-300 text-sm font-medium px-2.5 py-0.5 rounded mr-3 whitespace-nowrap flex-shrink-0">
                      Урок {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{lesson.title}</h3>
                  </div>
                  <p className="text-white/70 mb-4">Кратко: {lesson.description}</p>
                </div>
                
                <div className="flex items-center ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleLessonCompletion(lesson.id, isCompleted)}
                      className="sr-only"
                    />
                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        isCompleted ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      isCompleted ? 'text-green-400' : 'text-white/50'
                    }`}>
                      {isCompleted ? 'Пройдено' : 'Не пройдено'}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link href={`/lessons/${lesson.id}`} className="flex-1">
                  <ButtonCta label="Открыть урок" className="w-full" />
                </Link>
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