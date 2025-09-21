'use client'

import { ButtonCta } from '@/components/ui/button-shiny'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Topic {
  id: number;
  title: string;
  description: string | null;
  isLocked: boolean;
  lesson_count: number;
  completed_lessons: number;
  progress: number;
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await apiClient.getTopics();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [isAuthenticated]);

  return (
    <div className="px-4 py-8">
      {/* Заголовок */}
      <div className="text-center mb-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            ОБУЧАЮЩАЯ ПЛАТФОРМА
          </h1>
          <h2 className="text-6xl font-bold font-[family-name:var(--font-orbitron)] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] animate-pulse">
            IsmaSpace
          </h2>
        </div>
      </div>

      {/* Topics Section */}
      <div id="topics-section" className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            Загрузка тем...
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center text-gray-300">
            <p className="text-xl mb-4">Темы пока не добавлены</p>
            <p className="text-sm">Администратор может добавить темы через админ-панель</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
              // Проверяем, является ли это темой "система легкого контента"
              const isSystemTopic = topic.title.toLowerCase().includes('система') && 
                                   (topic.title.toLowerCase().includes('легкого') || topic.title.toLowerCase().includes('лёгкого')) && 
                                   topic.title.toLowerCase().includes('контента');
              
              return (
                <div key={topic.id} className={`glass-card p-6 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_16px_rgba(0,180,255,0.25),0_0_35px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300 ${isSystemTopic ? 'md:col-span-2 lg:col-span-3 max-w-2xl mx-auto' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex-1">
                      {topic.title}
                    </h3>
                    {topic.isLocked && (
                      <span className="text-2xl ml-2">🔒</span>
                    )}
                  </div>
                  
                  {topic.description && (
                    <p className="text-gray-300 mb-4 leading-relaxed text-sm">
                      {topic.description}
                    </p>
                  )}
                  
                  <div className="mb-4">
                    <span className="text-xs text-cyan-400">
                      Уроков: {topic.lesson_count || 0}
                    </span>
                  </div>
                  
                  {topic.isLocked ? (
                    <div className="bg-gray-600/50 text-gray-300 text-center py-3 px-4 rounded-lg">
                      Тема заблокирована
                    </div>
                  ) : (
                    <Link href={`/topics/${topic.id}`} className="block focus:outline-none">
                      <ButtonCta 
                        label="Изучить тему"
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}