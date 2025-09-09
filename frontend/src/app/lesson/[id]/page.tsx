"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BeamsBackground } from "@/components/ui/beams-background";
import { RainbowButton } from "@/components/ui/rainbow-button";

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

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [stats, setStats] = useState<ProgressStats>({ total: 0, completed: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const fetchData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        fetch('/api/lessons'),
        fetch('/api/progress?userId=1')
      ]);
      
      const lessonsData = await lessonsRes.json();
      const progressData = await progressRes.json();
      
      setAllLessons(lessonsData);
      setProgress(progressData.progress);
      setStats(progressData.stats);
      
      const currentLesson = lessonsData.find((l: Lesson) => l.id === lessonId);
      setLesson(currentLesson || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProgress = async () => {
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

  const isCompleted = () => {
    return progress.some(p => p.lesson_id === lessonId && p.completed_at !== null);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getPreviousLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <BeamsBackground intensity="subtle" className="absolute inset-0" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="relative min-h-screen">
        <BeamsBackground intensity="subtle" className="absolute inset-0" />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 relative z-10">
          <div className="text-white text-xl">Урок не найден</div>
          <Link href="/sections/practicum">
            <RainbowButton>Вернуться к урокам</RainbowButton>
          </Link>
        </div>
      </div>
    );
  }

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();

  return (
    <div className="relative min-h-screen">
      <BeamsBackground intensity="subtle" className="fixed inset-0" />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 sm:gap-8 items-center justify-start px-2 sm:px-4 py-6 sm:py-8 min-h-screen z-10 pt-16 sm:pt-20"
      >
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-4 sm:mb-8 px-2 sm:px-0">
          <div className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
              <span className="text-sm sm:text-base text-white font-medium">Прогресс раздела "Практикум"</span>
              <span className="text-sm text-gray-300">{stats.completed}/{stats.total} уроков</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <div className="text-right text-gray-300 text-sm mt-1">{stats.percentage}%</div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3 sm:mb-4 text-center px-2">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-300 text-center mb-4 sm:mb-8 max-w-2xl px-2">
          Урок {lesson.order_index} из серии "Практикум"
        </p>
        
        {isCompleted() && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 text-center relative overflow-hidden mx-2 sm:mx-0"
          >
            <motion.div
              initial={{ rotate: 0, scale: 0 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg"
            >
              <motion.svg 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-green-600 font-bold text-base sm:text-lg mb-2"
            >
              Урок завершен!
            </motion.div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-gray-300 text-xs sm:text-sm"
            >
              Отличная работа! Вы успешно завершили этот урок.
            </motion.div>
          </motion.div>
        )}
        
        {/* YouTube Player */}
        <div className="w-full max-w-4xl px-2 sm:px-0">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-gray-700 shadow-xl">
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(lesson.youtube_url)}
                title={lesson.title}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center mt-4 sm:mt-8 px-2 sm:px-0">
          {previousLesson && (
            <Link href={`/lesson/${previousLesson.id}`}>
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white font-medium rounded-lg border border-gray-600 transition-colors text-sm sm:text-base w-full sm:w-auto">
                ← Предыдущий
              </button>
            </Link>
          )}
          
          <button
            onClick={toggleProgress}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-medium rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto ${
              isCompleted() 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isCompleted() ? 'Отметить как не пройдено' : 'Отметить как пройдено'}
          </button>
          
          {nextLesson && (
            <Link href={`/lesson/${nextLesson.id}`}>
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/80 hover:bg-gray-700/80 text-white font-medium rounded-lg border border-gray-600 transition-colors text-sm sm:text-base w-full sm:w-auto">
                Следующий →
              </button>
            </Link>
          )}
        </div>
        
        <div className="mt-3 sm:mt-4 px-2 sm:px-0">
          <Link href="/sections/practicum">
            <RainbowButton>
              ← Вернуться к списку уроков
            </RainbowButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}