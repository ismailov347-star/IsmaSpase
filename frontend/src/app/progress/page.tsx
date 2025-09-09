"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Мой прогресс 📊
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Отслеживайте свои достижения и мотивируйтесь на новые успехи
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Общая статистика */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4 text-center">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Общий прогресс
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Завершено уроков:</span>
                <span className="font-bold text-green-600">12/25</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
              <div className="text-center text-sm text-gray-500">
                48% завершено
              </div>
            </div>
          </motion.div>

          {/* Изученные темы */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4 text-center">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Изученные темы
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Основы программирования</span>
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">JavaScript</span>
                <span className="text-yellow-600 font-bold">⏳</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">React</span>
                <span className="text-gray-400 font-bold">○</span>
              </div>
            </div>
          </motion.div>

          {/* Достижения */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white p-8 rounded-xl shadow-lg border hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4 text-center">🏆</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Достижения
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl mr-3">🥇</span>
                <div>
                  <div className="font-semibold text-gray-900">Первые шаги</div>
                  <div className="text-sm text-gray-600">Завершили первый урок</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl mr-3">📖</span>
                <div>
                  <div className="font-semibold text-gray-900">Книжный червь</div>
                  <div className="text-sm text-gray-600">Изучили 10 уроков</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg opacity-50">
                <span className="text-2xl mr-3">🎓</span>
                <div>
                  <div className="font-semibold text-gray-900">Выпускник</div>
                  <div className="text-sm text-gray-600">Завершили курс</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Недавняя активность */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 bg-white p-8 rounded-xl shadow-lg border max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Недавняя активность
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mr-4">✅</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Завершен урок &quot;Переменные в JavaScript&quot;</div>
                <div className="text-sm text-gray-600">2 часа назад</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mr-4">📚</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Начато изучение темы &quot;Функции&quot;</div>
                <div className="text-sm text-gray-600">1 день назад</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mr-4">🏆</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Получено достижение &quot;Книжный червь&quot;</div>
                <div className="text-sm text-gray-600">3 дня назад</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Кнопка возврата */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ← Вернуться на главную
          </Link>
        </motion.div>
      </div>
    </div>
  );
}