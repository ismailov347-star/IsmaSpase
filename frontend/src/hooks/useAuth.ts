'use client'

import { useState, useEffect } from 'react'
import { authService, AuthState } from '@/lib/auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    // Подписываемся на изменения состояния аутентификации
    const unsubscribe = authService.subscribe(setAuthState)
    
    // Получаем текущее состояние
    const currentState = authService.getState()
    setAuthState({ ...currentState, isLoading: false })
    
    // Пытаемся аутентифицироваться с Telegram при загрузке
    const initAuth = async () => {
      if (!currentState.isAuthenticated) {
        await authService.authenticateWithTelegram()
      } else {
        // Проверяем актуальность токена
        await authService.getCurrentUser()
      }
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
    
    initAuth()
    
    return unsubscribe
  }, [])

  const login = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    const success = await authService.authenticateWithTelegram()
    setAuthState(prev => ({ ...prev, isLoading: false }))
    return success
  }

  const logout = () => {
    authService.logout()
  }

  const getAuthHeaders = () => {
    return authService.getAuthHeaders()
  }

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders
  }
}