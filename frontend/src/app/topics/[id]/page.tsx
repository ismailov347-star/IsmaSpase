'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ButtonCta } from '../../../components/ui/button-shiny'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Lesson {
  id: number
  topic_id: number
  title: string
  description?: string
  video_url: string | null
  is_locked: boolean
  is_completed: boolean
}

interface Topic {
  id: number
  title: string
  description: string | null
  lessons: Lesson[]
}

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.id as string
  
  const [topic, setTopic] = useState<Topic | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (topicId) {
      fetchTopicData()
    }
  }, [topicId])

  const { isAuthenticated } = useAuth()

  const fetchTopicData = async () => {
    try {
      // Получаем данные темы
      const topicData = await apiClient.getTopic(topicId)
      setTopic(topicData)
      
      // Получаем уроки с прогрессом
      const lessonsData = await apiClient.getTopicLessons(topicId)
      setLessons(lessonsData)
    } catch (error) {
      console.error('Ошибка загрузки темы:', error)
      setError('Не удалось загрузить тему')
    } finally {
      setLoading(false)
    }
  }

  const toggleLessonCompletion = async (lessonId: number, currentStatus: boolean) => {
    try {
      await apiClient.completeLesson(lessonId.toString(), !currentStatus)
      
      // Обновляем локальное состояние
      setLessons(prevLessons => 
        prevLessons.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, is_completed: !currentStatus }
            : lesson
        )
      )
    } catch (error) {
      console.error('Ошибка обновления прогресса:', error)
    }
  }
    


  const completedLessons = lessons.filter(lesson => lesson.is_completed).length
  const totalLessons = lessons.length

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

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Тема не найдена</h2>
        <ButtonCta 
          label="Вернуться на главную" 
          onNavigate={() => router.push('/')}
        />
      </div>
    )
  }



  return (
    <div className="px-2 py-4 sm:px-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <ButtonCta 
          label="← Назад" 
          className="mb-3 sm:mb-4" 
          onNavigate={() => router.push('/')}
        />
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">{topic.title}</h1>
        <p className="text-sm sm:text-base lg:text-lg text-white/70 mb-4 sm:mb-6 leading-relaxed">{topic.description}</p>
        
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Прогресс изучения</h3>
            <span className="text-xs sm:text-sm text-white/70">{completedLessons}/{totalLessons} уроков</span>
          </div>
          
          {/* Интерактивная шкала прогресса */}
          <div className="mb-4">
            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-2">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-right text-xs sm:text-sm text-white/70">
              {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}% завершено
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {lessons.map((lesson, index) => {
          return (
            <div key={lesson.id} className={`glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_14px_rgba(0,180,255,0.24),0_0_34px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300 ${lesson.is_locked ? 'opacity-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1 mb-3 sm:mb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                    <span className="bg-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded mb-2 sm:mb-0 sm:mr-3 whitespace-nowrap flex-shrink-0 self-start">
                      Урок {index + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">{lesson.title}</h3>
                    {lesson.is_locked && (
                      <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">🔒 Заблокирован</span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-sm sm:text-base text-white/70 mb-3 sm:mb-4 leading-relaxed">{lesson.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lesson.is_completed}
                      onChange={() => toggleLessonCompletion(lesson.id, lesson.is_completed)}
                      className="sr-only"
                    />
                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      lesson.is_completed ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        lesson.is_completed ? 'translate-x-6' : 'translate-x-0'
                      }`}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-white/70">
                      {lesson.is_completed ? 'Пройден' : 'Не пройден'}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-4">
                <ButtonCta 
                  label={lesson.is_locked ? "Заблокирован" : "Открыть урок"}
                  className={`w-full text-sm sm:text-base ${lesson.is_locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onNavigate={lesson.is_locked ? undefined : () => router.push(`/lessons/${lesson.id}`)}
                />
              </div>
            </div>
          )
        })}
      </div>

      {lessons.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-white mb-2">
            Уроки пока не добавлены
          </h3>
          <p className="text-white/70">
            Скоро здесь появятся интересные уроки по этой теме!
          </p>
        </div>
      )}
    </div>
  )
}