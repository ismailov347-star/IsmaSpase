'use client'
import { useState, useEffect } from 'react'
import { HomeButton } from '@/components/HomeButton'

interface Topic {
  id: number
  title: string
  description: string
}

interface Tip {
  id: number
  title: string
  content: string
  lessonId: number
}

interface Material {
  id: number
  title: string
  description?: string
  url?: string
  type: string
  content?: string
  lessonId: number
}

interface LessonFile {
  id: number
  filename: string
  url: string
  type: string
  lessonId: number
}

interface Lesson {
  id: number
  title: string
  description: string
  videoUrl: string
  topicId: number
  topic?: Topic
  order?: number
  tips?: Tip[]
  materials?: Material[]
  files?: LessonFile[]
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'topics' | 'lessons'>('topics')
  const [topicForm, setTopicForm] = useState({ title: '', description: '' })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', content: '', videoUrl: '', topicId: 1, order: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [showLessonDetails, setShowLessonDetails] = useState<number | null>(null);
  const [managingTips, setManagingTips] = useState<number | null>(null);
  const [managingMaterials, setManagingMaterials] = useState<number | null>(null);
  const [managingFiles, setManagingFiles] = useState<number | null>(null);
  const [tipForm, setTipForm] = useState({ title: '', content: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', url: '', type: 'link', content: '' });
  const [fileForm, setFileForm] = useState({
    filename: '',
    url: '',
    type: 'document'
  })

  // Состояния для редактирования советов, материалов и файлов
  const [editingTip, setEditingTip] = useState<number | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<number | null>(null)
  const [editingFile, setEditingFile] = useState<number | null>(null)
  const [editTipForm, setEditTipForm] = useState({ title: '', content: '' })
  const [editMaterialForm, setEditMaterialForm] = useState({ title: '', description: '', url: '', type: 'link', content: '' })
  const [editFileForm, setEditFileForm] = useState({ filename: '', url: '', type: 'document' })

  // Состояния для редактирования
  const [editingTopic, setEditingTopic] = useState<number | null>(null)
  const [editingLesson, setEditingLesson] = useState<number | null>(null)
  const [editTopicForm, setEditTopicForm] = useState({
    title: '',
    description: ''
  })
  const [editLessonForm, setEditLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    topicId: 0,
    order: 0
  });

  // Загрузка данных
  const fetchTopics = async () => {
    try {
      console.log('Загружаем темы...')
      const response = await fetch('/api/topics')
      console.log('Ответ API тем:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Загружено тем:', data.length, data)
        setTopics(data)
      } else {
        console.error('Ошибка загрузки тем:', response.status)
      }
    } catch (error) {
      console.error('Ошибка загрузки тем:', error)
    }
  }

  const handleDeleteTopic = async (topicId: number) => {
    try {
      alert('Функция handleDeleteTopic вызвана! ID: ' + topicId)
      console.log('=== НАЧАЛО handleDeleteTopic ===')
      console.log('handleDeleteTopic вызвана с ID:', topicId)
      console.log('Тип topicId:', typeof topicId)
      console.log('Текущий URL:', window.location.href)
      
      if (!confirm('Вы уверены, что хотите удалить эту тему? Все связанные уроки также будут удалены.')) {
        console.log('Пользователь отменил удаление')
        return
      }
      
      console.log('Пользователь подтвердил удаление')

      setIsLoading(true)
      
      console.log('Удаление темы с ID:', topicId)
      const url = `/api/topics/delete?id=${topicId}`
      console.log('URL для DELETE запроса:', url)
      console.log('Отправляем DELETE запрос...')
      console.log('Вызываем fetch с параметрами:', { method: 'DELETE' })
      
      const response = await fetch(url, {
        method: 'DELETE',
      })
      
      console.log('DELETE запрос отправлен, получен ответ')
      console.log('Response object:', response)
      console.log('Ответ сервера:', response.status, response.statusText)
      console.log('Response URL:', response.url)
      
      if (response.ok) {
        setMessage('Тема успешно удалена!')
        fetchTopics()
        fetchLessons() // Обновляем уроки, так как могли удалиться связанные
      } else {
        const errorData = await response.text()
        console.error('Ошибка удаления:', errorData)
        setMessage(`Ошибка при удалении темы: ${response.status}`)
      }
    } catch (error) {
      console.error('Ошибка в handleDeleteTopic:', error)
      alert('Ошибка: ' + error.message)
      setMessage(`Ошибка при удалении темы: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('Урок успешно удален!')
        fetchLessons()
      } else {
        setMessage('Ошибка при удалении урока')
      }
    } catch (error) {
      setMessage('Ошибка при удалении урока')
    } finally {
      setIsLoading(false)
    }
  }

  // Функции для управления советами
  const handleTipSubmit = async (e: React.FormEvent, lessonId: number) => {
    e.preventDefault();
    if (!tipForm.title || !tipForm.content) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipForm),
      });
      
      if (response.ok) {
        setTipForm({ title: '', content: '' });
        fetchLessons();
      } else {
        alert('Ошибка при создании совета');
      }
    } catch (error) {
      console.error('Error creating tip:', error);
      alert('Ошибка при создании совета');
    } finally {
      setIsLoading(false);
    }
  };

  // Функции для управления материалами
  const handleMaterialSubmit = async (e: React.FormEvent, lessonId: number) => {
    e.preventDefault();
    if (!materialForm.title) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialForm),
      });
      
      if (response.ok) {
        setMaterialForm({ title: '', description: '', url: '', type: 'link', content: '' });
        fetchLessons();
      } else {
        alert('Ошибка при создании материала');
      }
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Ошибка при создании материала');
    } finally {
      setIsLoading(false);
    }
  };

  // Функции для управления файлами
  const handleFileSubmit = async (e: React.FormEvent, lessonId: number) => {
    e.preventDefault();
    if (!fileForm.filename || !fileForm.url) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileForm),
      });
      
      if (response.ok) {
        setFileForm({ filename: '', url: '', type: 'document' });
        fetchLessons();
      } else {
        alert('Ошибка при добавлении файла');
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Ошибка при добавлении файла');
    } finally {
      setIsLoading(false);
    }
  };

  // Функции для редактирования советов
  const startEditingTip = (tip: Tip) => {
    setEditingTip(tip.id)
    setEditTipForm({ title: tip.title, content: tip.content })
  }

  const handleEditTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTip) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tips/${editingTip}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTipForm),
      })
      
      if (response.ok) {
        setEditingTip(null)
        setEditTipForm({ title: '', content: '' })
        fetchLessons()
      } else {
        alert('Ошибка при обновлении совета')
      }
    } catch (error) {
      console.error('Error updating tip:', error)
      alert('Ошибка при обновлении совета')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTip = async (tipId: number) => {
    if (!confirm('Удалить этот совет?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tips/${tipId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchLessons()
      } else {
        alert('Ошибка при удалении совета')
      }
    } catch (error) {
      console.error('Error deleting tip:', error)
      alert('Ошибка при удалении совета')
    } finally {
      setIsLoading(false)
    }
  }

  // Функции для редактирования материалов
  const startEditingMaterial = (material: Material) => {
    setEditingMaterial(material.id)
    setEditMaterialForm({
      title: material.title,
      description: material.description || '',
      url: material.url || '',
      type: material.type,
      content: material.content || ''
    })
  }

  const handleEditMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMaterial) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/materials/${editingMaterial}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMaterialForm),
      })
      
      if (response.ok) {
        setEditingMaterial(null)
        setEditMaterialForm({ title: '', description: '', url: '', type: 'link', content: '' })
        fetchLessons()
      } else {
        alert('Ошибка при обновлении материала')
      }
    } catch (error) {
      console.error('Error updating material:', error)
      alert('Ошибка при обновлении материала')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('Удалить этот материал?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/materials/${materialId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchLessons()
      } else {
        alert('Ошибка при удалении материала')
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Ошибка при удалении материала')
    } finally {
      setIsLoading(false)
    }
  }

  // Функции для редактирования файлов
  const startEditingFile = (file: LessonFile) => {
    setEditingFile(file.id)
    setEditFileForm({
      filename: file.filename,
      url: file.url,
      type: file.type
    })
  }

  const handleEditFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFile) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/files/${editingFile}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFileForm),
      })
      
      if (response.ok) {
        setEditingFile(null)
        setEditFileForm({ filename: '', url: '', type: 'document' })
        fetchLessons()
      } else {
        alert('Ошибка при обновлении файла')
      }
    } catch (error) {
      console.error('Error updating file:', error)
      alert('Ошибка при обновлении файла')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Удалить этот файл?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchLessons()
      } else {
        alert('Ошибка при удалении файла')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Ошибка при удалении файла')
    } finally {
      setIsLoading(false)
    }
  }

  // Функции для редактирования тем
  const startEditingTopic = (topic: Topic) => {
    setEditingTopic(topic.id)
    setEditTopicForm({
      title: topic.title,
      description: topic.description || ''
    })
  }

  const handleEditTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTopic) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/topics/${editingTopic}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(editTopicForm),
       })
      
      if (response.ok) {
        setEditingTopic(null)
        setEditTopicForm({ title: '', description: '' })
        fetchTopics()
        setMessage('Тема успешно обновлена!')
      } else {
        const error = await response.json()
        setMessage(`Ошибка: ${error.error}`)
      }
    } catch (error) {
      console.error('Ошибка при обновлении темы:', error)
      setMessage('Ошибка при обновлении темы')
    } finally {
      setIsLoading(false)
    }
  }

  // Функции для редактирования уроков
  const startEditingLesson = (lesson: Lesson) => {
    setEditingLesson(lesson.id)
    setEditLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: '',
      videoUrl: lesson.videoUrl || '',
      topicId: lesson.topicId,
      order: 0
    })
  }

  const handleEditLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLesson) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/lessons/${editingLesson}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(editLessonForm),
       })
      
      if (response.ok) {
        setEditingLesson(null)
        setEditLessonForm({ title: '', description: '', content: '', videoUrl: '', topicId: 0, order: 0 })
        fetchLessons()
        setMessage('Урок успешно обновлен!')
      } else {
        const error = await response.json()
        setMessage(`Ошибка: ${error.error}`)
      }
    } catch (error) {
      console.error('Ошибка при обновлении урока:', error)
      setMessage('Ошибка при обновлении урока')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      console.log('Загружаем уроки...')
      const response = await fetch('/api/lessons?include=tips,materials,files,topic')
      console.log('Ответ API уроков:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Загружено уроков:', data.length, data)
        setLessons(data)
      } else {
        console.error('Ошибка загрузки уроков:', response.status)
      }
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error)
    }
  }

  useEffect(() => {
    fetchTopics()
    fetchLessons()
  }, [])

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicForm),
      })

      if (response.ok) {
        setMessage('Тема успешно добавлена!')
        setTopicForm({ title: '', description: '' })
        fetchTopics() // Обновляем список тем
      } else {
        setMessage('Ошибка при добавлении темы')
      }
    } catch (error) {
      setMessage('Ошибка при добавлении темы')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`/api/topics/${lessonForm.topicId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lessonForm.title,
          description: lessonForm.description || null,
          content: lessonForm.content || null,
          videoUrl: lessonForm.videoUrl || null,
          order: lessonForm.order
        }),
      })

      if (response.ok) {
        setMessage('Урок успешно добавлен!')
        setLessonForm({ title: '', description: '', content: '', videoUrl: '', topicId: 1, order: 0 })
        fetchLessons() // Обновляем список уроков
      } else {
        const errorData = await response.json()
        setMessage(`Ошибка: ${errorData.error || 'Не удалось добавить урок'}`)
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      setMessage('Ошибка при добавлении урока')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-lg sm:text-xl font-bold text-white font-[family-name:var(--font-orbitron)]">
                IsmaSpace Admin
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
            onClick={() => window.location.href = '/'}
            className="p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition-all group"
            title="Настройки"
          >
            <svg className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        

        {/* Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-cyan-400/20 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium transition-all text-sm sm:text-base ${
                activeTab === 'topics'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Темы
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium transition-all text-sm sm:text-base ${
                activeTab === 'lessons'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Уроки
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('успешно') 
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Topic Form */}
        {activeTab === 'topics' && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-cyan-400/20">
            <h2 className="text-xl font-bold text-white mb-6 font-[family-name:var(--font-orbitron)]">
              Добавить новую тему
            </h2>
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название темы
                </label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base"
                  placeholder="Введите название темы"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание темы
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none text-sm sm:text-base"
                  rows={4}
                  placeholder="Введите описание темы"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? 'Добавление...' : 'Добавить тему'}
              </button>
            </form>

            {/* Список тем */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                Существующие темы
              </h3>
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div key={topic.id} className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-cyan-400/20">
                    {editingTopic === topic.id ? (
                      <form onSubmit={handleEditTopicSubmit} className="space-y-3">
                        <input
                          type="text"
                          value={editTopicForm.title}
                          onChange={(e) => setEditTopicForm({...editTopicForm, title: e.target.value})}
                          className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                          required
                        />
                        <textarea
                          value={editTopicForm.description}
                          onChange={(e) => setEditTopicForm({...editTopicForm, description: e.target.value})}
                          className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none"
                          rows={3}
                          required
                        />
                        <div className="flex gap-1 flex-wrap">
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 px-3 py-1 rounded border border-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                            >
                              Сохранить
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTopic(null)}
                              className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 hover:text-gray-200 px-3 py-1 rounded border border-gray-500/30 transition-all text-xs whitespace-nowrap"
                            >
                              Отменить
                            </button>
                          </div>
                      </form>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <h4 className="text-white font-medium mb-2">{topic.title}</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{topic.description}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-start sm:justify-end">
                          <button
                            onClick={() => startEditingTopic(topic)}
                            disabled={isLoading}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-1 rounded border border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                          >
                            Редактировать
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Кнопка удаления нажата для темы ID:', topic.id)
                              handleDeleteTopic(topic.id)
                            }}
                            disabled={isLoading}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-1 rounded border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {topics.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Темы не найдены</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Form */}
        {activeTab === 'lessons' && (
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-cyan-400/20">
            <h2 className="text-xl font-bold text-white mb-6 font-[family-name:var(--font-orbitron)]">
              Добавить новый урок
            </h2>
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название урока
                </label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base"
                  placeholder="Введите название урока"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание урока
                </label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 h-24 resize-none text-sm sm:text-base"
                  placeholder="Введите описание урока"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Контент урока
                </label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 h-32 resize-none text-sm sm:text-base"
                  placeholder="Введите текстовый контент урока"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL видео
                </label>
                <input
                  type="url"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base"
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тема
                  </label>
                  <select
                    value={lessonForm.topicId}
                    onChange={(e) => setLessonForm({ ...lessonForm, topicId: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base"
                    required
                  >
                    <option value="" className="bg-gray-800 text-white">Выберите тему</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id} className="bg-gray-800 text-white">
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Порядок
                  </label>
                  <input
                    type="number"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 sm:px-4 py-2 bg-black/30 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm sm:text-base"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? 'Добавление...' : 'Добавить урок'}
              </button>
            </form>

            {/* Список уроков */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4 font-[family-name:var(--font-orbitron)]">
                Существующие уроки
              </h3>
              <div className="space-y-3">
                {lessons.length === 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 text-center">
                      Уроки не найдены. Создайте первый урок, используя форму выше.
                    </p>
                  </div>
                )}
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-cyan-400/20">
                    {editingLesson === lesson.id ? (
                      <form onSubmit={handleEditLessonSubmit} className="space-y-3">
                        <input
                          type="text"
                          value={editLessonForm.title}
                          onChange={(e) => setEditLessonForm({...editLessonForm, title: e.target.value})}
                          className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                          required
                        />
                        <textarea
                          value={editLessonForm.description}
                          onChange={(e) => setEditLessonForm({...editLessonForm, description: e.target.value})}
                          className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none"
                          rows={3}
                          required
                        />
                        <input
                          type="url"
                          placeholder="URL видео (опционально)"
                          value={editLessonForm.videoUrl}
                          onChange={(e) => setEditLessonForm({...editLessonForm, videoUrl: e.target.value})}
                          className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                        />
                        <select
                          value={editLessonForm.topicId}
                          onChange={(e) => setEditLessonForm({...editLessonForm, topicId: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white focus:border-cyan-400 focus:outline-none"
                          required
                        >
                          <option value={0} className="bg-gray-800 text-white">Выберите тему</option>
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id} className="bg-gray-800 text-white">
                              {topic.title}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1 flex-wrap">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 px-3 py-1 rounded border border-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLesson(null)}
                            className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 hover:text-gray-200 px-3 py-1 rounded border border-gray-500/30 transition-all text-xs whitespace-nowrap"
                          >
                            Отменить
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{lesson.title}</h4>
                          <p className="text-gray-300 text-sm mt-1">Тема: {lesson.topic?.title || `ID: ${lesson.topicId}`} | Порядок: {lesson.order || 0}</p>
                          {lesson.description && (
                            <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                          )}
                          {lesson.videoUrl && (
                            <p className="text-cyan-300 text-sm mt-1 truncate">{lesson.videoUrl}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          <button
                            onClick={() => startEditingLesson(lesson)}
                            disabled={isLoading}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-1 rounded border border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => setShowLessonDetails(showLessonDetails === lesson.id ? null : lesson.id)}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-3 py-1 rounded border border-blue-500/30 transition-all text-xs whitespace-nowrap"
                          >
                            {showLessonDetails === lesson.id ? 'Скрыть' : 'Детали'}
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            disabled={isLoading}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-1 rounded border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {showLessonDetails === lesson.id && (
                      <div className="mt-4 pt-4 border-t border-cyan-400/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-black/20 rounded-lg p-3">
                            <h5 className="text-cyan-300 font-medium mb-2">Советы ({lesson.tips?.length || 0})</h5>
                            <p className="text-gray-400 text-sm mb-2">Полезные советы для урока</p>
                            <button 
                              onClick={() => setManagingTips(managingTips === lesson.id ? null : lesson.id)}
                              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                            >
                              {managingTips === lesson.id ? 'Скрыть форму' : 'Добавить совет'}
                            </button>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3">
                            <h5 className="text-green-300 font-medium mb-2">Материалы ({lesson.materials?.length || 0})</h5>
                            <p className="text-gray-400 text-sm mb-2">Дополнительные материалы</p>
                            <button 
                              onClick={() => setManagingMaterials(managingMaterials === lesson.id ? null : lesson.id)}
                              className="text-green-400 hover:text-green-300 text-sm underline"
                            >
                              {managingMaterials === lesson.id ? 'Скрыть форму' : 'Добавить материал'}
                            </button>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3">
                            <h5 className="text-purple-300 font-medium mb-2">Файлы ({lesson.files?.length || 0})</h5>
                            <p className="text-gray-400 text-sm mb-2">Прикрепленные файлы</p>
                            <button 
                              onClick={() => setManagingFiles(managingFiles === lesson.id ? null : lesson.id)}
                              className="text-purple-400 hover:text-purple-300 text-sm underline"
                            >
                              {managingFiles === lesson.id ? 'Скрыть форму' : 'Добавить файл'}
                            </button>
                          </div>
                        </div>
                         
                         {/* Форма для добавления совета */}
                         {managingTips === lesson.id && (
                           <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-400/30">
                             <h6 className="text-cyan-300 font-medium mb-3">Добавить совет</h6>
                             <form onSubmit={(e) => handleTipSubmit(e, lesson.id)} className="space-y-3">
                               <input
                                 type="text"
                                 placeholder="Заголовок совета"
                                 value={tipForm.title}
                                 onChange={(e) => setTipForm({...tipForm, title: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                                 required
                               />
                               <textarea
                                 placeholder="Содержание совета"
                                 value={tipForm.content}
                                 onChange={(e) => setTipForm({...tipForm, content: e.target.value})}
                                 rows={3}
                                 className="w-full px-3 py-2 bg-black/30 border border-cyan-400/30 rounded text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none"
                                 required
                               />
                               <button
                                 type="submit"
                                 disabled={isLoading}
                                 className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 px-3 py-2 rounded border border-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                               >
                                 Добавить совет
                               </button>
                             </form>
                           </div>
                         )}
                         
                         {/* Форма для добавления материала */}
                         {managingMaterials === lesson.id && (
                           <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-400/30">
                             <h6 className="text-green-300 font-medium mb-3">Добавить материал</h6>
                             <form onSubmit={(e) => handleMaterialSubmit(e, lesson.id)} className="space-y-3">
                               <input
                                 type="text"
                                 placeholder="Название материала"
                                 value={materialForm.title}
                                 onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-green-400/30 rounded text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                                 required
                               />
                               <textarea
                                 placeholder="Описание материала"
                                 value={materialForm.description}
                                 onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                                 rows={2}
                                 className="w-full px-3 py-2 bg-black/30 border border-green-400/30 rounded text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none"
                               />
                               <input
                                 type="url"
                                 placeholder="URL материала (опционально)"
                                 value={materialForm.url}
                                 onChange={(e) => setMaterialForm({...materialForm, url: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-green-400/30 rounded text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                               />
                               <select
                                 value={materialForm.type}
                                 onChange={(e) => setMaterialForm({...materialForm, type: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-green-400/30 rounded text-white focus:border-green-400 focus:outline-none"
                               >
                                 <option value="link" className="bg-gray-800 text-white">Ссылка</option>
                                 <option value="document" className="bg-gray-800 text-white">Документ</option>
                                 <option value="video" className="bg-gray-800 text-white">Видео</option>
                                 <option value="image" className="bg-gray-800 text-white">Изображение</option>
                               </select>
                               <textarea
                                 placeholder="Дополнительный контент (опционально)"
                                 value={materialForm.content}
                                 onChange={(e) => setMaterialForm({...materialForm, content: e.target.value})}
                                 rows={3}
                                 className="w-full px-3 py-2 bg-black/30 border border-green-400/30 rounded text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none"
                               />
                               <button
                                 type="submit"
                                 disabled={isLoading}
                                 className="bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 px-3 py-2 rounded border border-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                               >
                                 Добавить материал
                               </button>
                             </form>
                           </div>
                         )}
                         
                         {/* Форма для добавления файла */}
                         {managingFiles === lesson.id && (
                           <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
                             <h6 className="text-purple-300 font-medium mb-3">Добавить файл</h6>
                             <form onSubmit={(e) => handleFileSubmit(e, lesson.id)} className="space-y-3">
                               <input
                                 type="text"
                                 placeholder="Название файла"
                                 value={fileForm.filename}
                                 onChange={(e) => setFileForm({...fileForm, filename: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-purple-400/30 rounded text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                                 required
                               />
                               <input
                                 type="url"
                                 placeholder="URL файла"
                                 value={fileForm.url}
                                 onChange={(e) => setFileForm({...fileForm, url: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-purple-400/30 rounded text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                                 required
                               />
                               <select
                                 value={fileForm.type}
                                 onChange={(e) => setFileForm({...fileForm, type: e.target.value})}
                                 className="w-full px-3 py-2 bg-black/30 border border-purple-400/30 rounded text-white focus:border-purple-400 focus:outline-none"
                               >
                                 <option value="document" className="bg-gray-800 text-white">Документ</option>
                                 <option value="image" className="bg-gray-800 text-white">Изображение</option>
                                 <option value="video" className="bg-gray-800 text-white">Видео</option>
                                 <option value="audio" className="bg-gray-800 text-white">Аудио</option>
                                 <option value="archive" className="bg-gray-800 text-white">Архив</option>
                               </select>
                               <button
                                 type="submit"
                                 disabled={isLoading}
                                 className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 px-3 py-2 rounded border border-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                               >
                                 Добавить файл
                               </button>
                             </form>
                           </div>
                         )}
                         
                         {/* Списки существующих советов, материалов и файлов */}
                         {showLessonDetails === lesson.id && (
                           <div className="mt-4 space-y-4">
                             {/* Список советов */}
                             {lesson.tips && lesson.tips.length > 0 && (
                               <div className="bg-cyan-500/5 rounded-lg p-3 border border-cyan-400/20">
                                 <h6 className="text-cyan-300 font-medium mb-3">Существующие советы:</h6>
                                 <div className="space-y-2">
                                   {lesson.tips.map((tip) => (
                                     <div key={tip.id} className="bg-black/20 rounded p-2">
                                       {editingTip === tip.id ? (
                                         <form onSubmit={handleEditTipSubmit} className="space-y-2">
                                           <input
                                             type="text"
                                             value={editTipForm.title}
                                             onChange={(e) => setEditTipForm({...editTipForm, title: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-cyan-400/30 rounded text-white text-sm"
                                             required
                                           />
                                           <textarea
                                             value={editTipForm.content}
                                             onChange={(e) => setEditTipForm({...editTipForm, content: e.target.value})}
                                             rows={2}
                                             className="w-full px-2 py-1 bg-black/30 border border-cyan-400/30 rounded text-white text-sm resize-none"
                                             required
                                           />
                                           <div className="flex gap-1">
                                             <button type="submit" className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">Сохранить</button>
                                             <button type="button" onClick={() => setEditingTip(null)} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs border border-gray-500/30">Отмена</button>
                                           </div>
                                         </form>
                                       ) : (
                                         <div>
                                           <div className="flex justify-between items-start gap-2">
                                             <div className="flex-1">
                                               <h7 className="text-cyan-200 font-medium text-sm">{tip.title}</h7>
                                               <p className="text-gray-300 text-xs mt-1">{tip.content}</p>
                                             </div>
                                             <div className="flex gap-1">
                                               <button onClick={() => startEditingTip(tip)} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">Изменить</button>
                                               <button onClick={() => handleDeleteTip(tip.id)} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs border border-red-500/30">Удалить</button>
                                             </div>
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                             
                             {/* Список материалов */}
                             {lesson.materials && lesson.materials.length > 0 && (
                               <div className="bg-green-500/5 rounded-lg p-3 border border-green-400/20">
                                 <h6 className="text-green-300 font-medium mb-3">Существующие материалы:</h6>
                                 <div className="space-y-2">
                                   {lesson.materials.map((material) => (
                                     <div key={material.id} className="bg-black/20 rounded p-2">
                                       {editingMaterial === material.id ? (
                                         <form onSubmit={handleEditMaterialSubmit} className="space-y-2">
                                           <input
                                             type="text"
                                             value={editMaterialForm.title}
                                             onChange={(e) => setEditMaterialForm({...editMaterialForm, title: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-green-400/30 rounded text-white text-sm"
                                             required
                                           />
                                           <textarea
                                             value={editMaterialForm.description}
                                             onChange={(e) => setEditMaterialForm({...editMaterialForm, description: e.target.value})}
                                             rows={2}
                                             className="w-full px-2 py-1 bg-black/30 border border-green-400/30 rounded text-white text-sm resize-none"
                                           />
                                           <input
                                             type="url"
                                             value={editMaterialForm.url}
                                             onChange={(e) => setEditMaterialForm({...editMaterialForm, url: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-green-400/30 rounded text-white text-sm"
                                           />
                                           <select
                                             value={editMaterialForm.type}
                                             onChange={(e) => setEditMaterialForm({...editMaterialForm, type: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-green-400/30 rounded text-white text-sm"
                                           >
                                             <option value="link">Ссылка</option>
                                             <option value="document">Документ</option>
                                             <option value="video">Видео</option>
                                             <option value="image">Изображение</option>
                                           </select>
                                           <div className="flex gap-1">
                                             <button type="submit" className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">Сохранить</button>
                                             <button type="button" onClick={() => setEditingMaterial(null)} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs border border-gray-500/30">Отмена</button>
                                           </div>
                                         </form>
                                       ) : (
                                         <div>
                                           <div className="flex justify-between items-start gap-2">
                                             <div className="flex-1">
                                               <h7 className="text-green-200 font-medium text-sm">{material.title}</h7>
                                               <p className="text-gray-300 text-xs mt-1">{material.description}</p>
                                               {material.url && <p className="text-green-300 text-xs mt-1 truncate">{material.url}</p>}
                                               <span className="inline-block bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs mt-1">{material.type}</span>
                                             </div>
                                             <div className="flex gap-1">
                                               <button onClick={() => startEditingMaterial(material)} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">Изменить</button>
                                               <button onClick={() => handleDeleteMaterial(material.id)} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs border border-red-500/30">Удалить</button>
                                             </div>
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                             
                             {/* Список файлов */}
                             {lesson.files && lesson.files.length > 0 && (
                               <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-400/20">
                                 <h6 className="text-purple-300 font-medium mb-3">Существующие файлы:</h6>
                                 <div className="space-y-2">
                                   {lesson.files.map((file) => (
                                     <div key={file.id} className="bg-black/20 rounded p-2">
                                       {editingFile === file.id ? (
                                         <form onSubmit={handleEditFileSubmit} className="space-y-2">
                                           <input
                                             type="text"
                                             value={editFileForm.filename}
                                             onChange={(e) => setEditFileForm({...editFileForm, filename: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-purple-400/30 rounded text-white text-sm"
                                             required
                                           />
                                           <input
                                             type="url"
                                             value={editFileForm.url}
                                             onChange={(e) => setEditFileForm({...editFileForm, url: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-purple-400/30 rounded text-white text-sm"
                                             required
                                           />
                                           <select
                                             value={editFileForm.type}
                                             onChange={(e) => setEditFileForm({...editFileForm, type: e.target.value})}
                                             className="w-full px-2 py-1 bg-black/30 border border-purple-400/30 rounded text-white text-sm"
                                           >
                                             <option value="document">Документ</option>
                                             <option value="image">Изображение</option>
                                             <option value="video">Видео</option>
                                             <option value="audio">Аудио</option>
                                             <option value="archive">Архив</option>
                                           </select>
                                           <div className="flex gap-1">
                                             <button type="submit" className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">Сохранить</button>
                                             <button type="button" onClick={() => setEditingFile(null)} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs border border-gray-500/30">Отмена</button>
                                           </div>
                                         </form>
                                       ) : (
                                         <div>
                                           <div className="flex justify-between items-start gap-2">
                                             <div className="flex-1">
                                               <h7 className="text-purple-200 font-medium text-sm">{file.filename}</h7>
                                               <p className="text-purple-300 text-xs mt-1 truncate">{file.url}</p>
                                               <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs mt-1">{file.type}</span>
                                             </div>
                                             <div className="flex gap-1">
                                               <button onClick={() => startEditingFile(file)} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">Изменить</button>
                                               <button onClick={() => handleDeleteFile(file.id)} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs border border-red-500/30">Удалить</button>
                                             </div>
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 ))}
                {lessons.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Уроки не найдены</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}