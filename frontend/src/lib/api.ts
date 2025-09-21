import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      ...authService.getAuthHeaders(),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Токен истек или недействителен
        authService.logout()
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Методы для работы с темами
  async getTopics() {
    return this.request('/topics')
  }

  async getTopic(id: string) {
    return this.request(`/topics/${id}`)
  }

  async getTopicLessons(topicId: string) {
    return this.request(`/topics/${topicId}/lessons`)
  }

  // Методы для работы с уроками
  async getLessons() {
    return this.request('/lessons')
  }

  async getLesson(id: string) {
    return this.request(`/lessons/${id}`)
  }

  async completeLesson(id: string, completed: boolean) {
    return this.request(`/lessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed })
    })
  }

  // Методы для работы с прогрессом
  async getProgress() {
    return this.request('/progress')
  }

  // Методы для работы с советами
  async getLessonTips(lessonId: string) {
    return this.request(`/lessons/${lessonId}/tips`)
  }

  async createLessonTip(lessonId: string, data: { title: string; content: string }) {
    return this.request(`/lessons/${lessonId}/tips`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLessonTip(lessonId: string, tipId: string, data: { title: string; content: string }) {
    return this.request(`/lessons/${lessonId}/tips/${tipId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteLessonTip(lessonId: string, tipId: string) {
    return this.request(`/lessons/${lessonId}/tips/${tipId}`, {
      method: 'DELETE'
    })
  }

  // Методы для работы с материалами
  async getLessonMaterials(lessonId: string) {
    return this.request(`/lessons/${lessonId}/materials`)
  }

  async createLessonMaterial(lessonId: string, data: { title: string; type: string; url: string; description?: string }) {
    return this.request(`/lessons/${lessonId}/materials`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLessonMaterial(lessonId: string, materialId: string, data: { title: string; type: string; url: string; description?: string }) {
    return this.request(`/lessons/${lessonId}/materials/${materialId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteLessonMaterial(lessonId: string, materialId: string) {
    return this.request(`/lessons/${lessonId}/materials/${materialId}`, {
      method: 'DELETE'
    })
  }

  // Методы для работы с файлами
  async getLessonFiles(lessonId: string) {
    return this.request(`/lessons/${lessonId}/files`)
  }

  async createLessonFile(lessonId: string, data: { filename: string; type: string; url: string; description?: string }) {
    return this.request(`/lessons/${lessonId}/files`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateLessonFile(lessonId: string, fileId: string, data: { filename: string; type: string; url: string; description?: string }) {
    return this.request(`/lessons/${lessonId}/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteLessonFile(lessonId: string, fileId: string) {
    return this.request(`/lessons/${lessonId}/files/${fileId}`, {
      method: 'DELETE'
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)