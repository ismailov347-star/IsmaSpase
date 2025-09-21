'use client'

import { readTG } from './tg'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

export interface User {
  id: string
  telegramId: string
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

class AuthService {
  private token: string | null = null
  private user: User | null = null
  private listeners: Array<(state: AuthState) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      if (userData) {
        try {
          this.user = JSON.parse(userData)
        } catch (e) {
          console.error('Ошибка парсинга данных пользователя:', e)
          localStorage.removeItem('user_data')
        }
      }
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    const state: AuthState = {
      user: this.user,
      token: this.token,
      isAuthenticated: !!this.token && !!this.user,
      isLoading: false
    }
    this.listeners.forEach(listener => listener(state))
  }

  async authenticateWithTelegram(): Promise<boolean> {
    try {
      const { initData } = readTG()
      
      if (!initData) {
        console.log('Нет данных Telegram WebApp')
        return false
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      })

      if (!response.ok) {
        throw new Error(`Ошибка аутентификации: ${response.status}`)
      }

      const data = await response.json()
      
      this.token = data.token
      this.user = data.user
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
      }
      
      this.notify()
      return true
    } catch (error) {
      console.error('Ошибка аутентификации:', error)
      return false
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.logout()
        }
        return null
      }

      const user = await response.json()
      this.user = user
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(user))
      }
      
      this.notify()
      return user
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error)
      return null
    }
  }

  logout() {
    this.token = null
    this.user = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
    
    this.notify()
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  getState(): AuthState {
    return {
      user: this.user,
      token: this.token,
      isAuthenticated: !!this.token && !!this.user,
      isLoading: false
    }
  }
}

export const authService = new AuthService()