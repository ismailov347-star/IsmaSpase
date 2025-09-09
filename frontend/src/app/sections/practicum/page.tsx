"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BeamsBackground } from "@/components/ui/beams-background";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Switch } from "@/components/ui/switch";

interface Lesson {
  id: number;
  title: string;
  order_index: number;
  youtube_url: string;
  is_published: boolean;
}

interface Progress {
  lesson_id: number;
  completed_at: string | null;
}

interface ProgressStats {
  total: number;
  completed: number;
  percentage: number;
}

export default function PracticumPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [stats, setStats] = useState<ProgressStats>({ total: 0, completed: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        fetch('/api/lessons'),
        fetch('/api/progress?userId=1')
      ]);
      
      const lessonsData = await lessonsRes.json();
      const progressData = await progressRes.json();
      
      setLessons(lessonsData);
      setProgress(progressData.progress);
      setStats(progressData.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgress = async (lessonId: number) => {
    try {
      const response = await fetch('/api/progress/toggle', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1, lessonId }),
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error toggling progress:', error);
    }
  };

  const isCompleted = (lessonId: number) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed_at !== null);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <BeamsBackground intensity="medium" className="absolute inset-0" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BeamsBackground intensity="medium" className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 sm:gap-8 items-center justify-center px-2 sm:px-4 min-h-screen py-8 sm:py-12 z-10 pt-16 sm:pt-20"
      >
        <div className="text-2xl sm:text-3xl md:text-6xl font-bold text-white text-center mb-2 sm:mb-4 px-2">
          Практикум
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-4 sm:mb-8 px-2 sm:px-0">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-600/50 hover:shadow-3xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-1 sm:gap-0">
              <span className="text-sm sm:text-base text-white font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Прогресс раздела "Практикум"</span>
              <span className="text-sm text-gray-300 font-medium">{stats.completed}/{stats.total} уроков</span>
            </div>
            <div className="w-full bg-gray-700/60 rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 h-4 rounded-full transition-all duration-500 shadow-lg shadow-green-500/30 relative overflow-hidden"
                style={{ width: `${stats.percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="text-right text-gray-300 text-sm mt-2 font-medium">{stats.percentage}%</div>
          </div>
        </div>
        
        <div className="w-full max-w-2xl space-y-3 sm:space-y-4 px-2 sm:px-0">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-600/50 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-sm sm:text-base text-white font-medium">Урок {lesson.order_index}</span>
                    {isCompleted(lesson.id) && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-lg shadow-green-500/30 animate-pulse">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Пройдено
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 pr-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {lesson.title}
                  </h3>
                  <div className="flex flex-col items-start gap-3">
                    <Link href={`/lesson/${lesson.id}`}>
                      <RainbowButton>
                        Открыть урок
                      </RainbowButton>
                    </Link>
                    <div className="flex items-center gap-2 -ml-12">
                      <Switch
                        isSelected={isCompleted(lesson.id)}
                        onChange={() => toggleProgress(lesson.id)}
                        className={`group transition-all duration-500 hover:scale-110 active:scale-95 ${
                          isCompleted(lesson.id) ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        <div 
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                            isCompleted(lesson.id)
                              ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 border-emerald-300/50'
                              : 'bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 border-slate-500/50 hover:border-slate-400/70'
                          }`}
                        >
                          <div
                            className={`pointer-events-none block size-5 rounded-full ring-0 transition-all duration-500 backdrop-blur-sm ${
                              isCompleted(lesson.id)
                                ? 'translate-x-5 bg-gradient-to-br from-white via-emerald-50 to-white ring-1 ring-emerald-200/30'
                                : 'translate-x-0 bg-gradient-to-br from-white via-slate-50 to-white ring-1 ring-slate-200/30'
                            } hover:scale-110 relative`}
                          >
                            {isCompleted(lesson.id) && (
                              <svg className="w-3 h-3 text-emerald-600 absolute inset-0 m-auto animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </Switch>
                      <div className={`text-xs font-medium transition-colors duration-300 ${
                        isCompleted(lesson.id) ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {isCompleted(lesson.id) ? 'Пройдено' : 'Не пройдено'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8">
          <Link href="/sections">
            <RainbowButton>
              ← Вернуться к разделам
            </RainbowButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}