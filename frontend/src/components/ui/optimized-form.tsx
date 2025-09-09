'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useDebounce, useThrottle } from '@/hooks/use-performance'
import { useTelegramWebApp } from '@/components/telegram-webapp'
import { cn } from '@/lib/utils'

interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select'
  label: string
  placeholder?: string
  required?: boolean
  validation?: (value: string) => string | null
  options?: { value: string; label: string }[]
  debounceMs?: number
}

interface OptimizedFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => Promise<void> | void
  className?: string
  submitText?: string
  resetText?: string
  showReset?: boolean
  autoSave?: boolean
  autoSaveKey?: string
}

export function OptimizedForm({
  fields,
  onSubmit,
  className,
  submitText = 'Отправить',
  resetText = 'Сбросить',
  showReset = false,
  autoSave = false,
  autoSaveKey = 'form-data'
}: OptimizedFormProps) {
  const { hapticFeedback, isInTelegram } = useTelegramWebApp()
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Загрузка сохраненных данных
  useEffect(() => {
    if (autoSave && typeof window !== 'undefined') {
      const saved = localStorage.getItem(autoSaveKey)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setValues(parsedData)
        } catch (error) {
          console.warn('Failed to parse saved form data:', error)
        }
      }
    }
  }, [autoSave, autoSaveKey])

  // Автосохранение с дебаунсом
  const debouncedValues = useDebounce(values, 1000)
  useEffect(() => {
    if (autoSave && typeof window !== 'undefined' && Object.keys(debouncedValues).length > 0) {
      localStorage.setItem(autoSaveKey, JSON.stringify(debouncedValues))
    }
  }, [debouncedValues, autoSave, autoSaveKey])

  // Валидация с дебаунсом
  const validateField = useCallback((name: string, value: string) => {
    const field = fields.find(f => f.name === name)
    if (!field) return null

    if (field.required && !value.trim()) {
      return 'Это поле обязательно для заполнения'
    }

    if (field.validation) {
      return field.validation(value)
    }

    // Базовая валидация по типу
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? null : 'Введите корректный email'
      case 'tel':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        return phoneRegex.test(value.replace(/\s/g, '')) ? null : 'Введите корректный номер телефона'
      case 'url':
        try {
          new URL(value)
          return null
        } catch {
          return 'Введите корректный URL'
        }
      default:
        return null
    }
  }, [fields])

  const debouncedValidation = useThrottle((name: string, value: string) => {
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }))
  }, 300)

  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Валидация только для тронутых полей
    if (touched[name]) {
      debouncedValidation(name, value)
    }
  }, [touched, debouncedValidation])

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const value = values[name] || ''
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }))
  }, [values, validateField])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return

    // Валидация всех полей
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    fields.forEach(field => {
      const value = values[field.name] || ''
      const error = validateField(field.name, value)
      if (error) {
        newErrors[field.name] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}))

    if (hasErrors) {
      hapticFeedback('error')
      return
    }

    setIsSubmitting(true)
    hapticFeedback('light')

    try {
      await onSubmit(values)
      hapticFeedback('success')
      
      // Очистка автосохранения после успешной отправки
      if (autoSave && typeof window !== 'undefined') {
        localStorage.removeItem(autoSaveKey)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      hapticFeedback('error')
    } finally {
      setIsSubmitting(false)
    }
  }, [values, fields, validateField, onSubmit, isSubmitting, hapticFeedback, autoSave, autoSaveKey])

  const handleReset = useCallback(() => {
    setValues({})
    setErrors({})
    setTouched({})
    hapticFeedback('light')
    
    if (autoSave && typeof window !== 'undefined') {
      localStorage.removeItem(autoSaveKey)
    }
  }, [hapticFeedback, autoSave, autoSaveKey])

  const isValid = useMemo(() => {
    return fields.every(field => {
      const value = values[field.name] || ''
      return !validateField(field.name, value)
    })
  }, [values, fields, validateField])

  const renderField = useCallback((field: FormField) => {
    const value = values[field.name] || ''
    const error = errors[field.name]
    const isTouched = touched[field.name]
    const showError = isTouched && error

    const baseInputProps = {
      id: field.name,
      name: field.name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
      placeholder: field.placeholder,
      required: field.required,
      className: cn(
        'tg-input w-full transition-colors',
        showError && 'border-red-500 focus:border-red-500',
        isInTelegram && 'tg-bg tg-text'
      )
    }

    return (
      <div key={field.name} className="space-y-2">
        <label 
          htmlFor={field.name} 
          className={cn(
            'block text-sm font-medium',
            isInTelegram ? 'tg-text' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            {...baseInputProps}
            rows={4}
            className={cn(baseInputProps.className, 'resize-none')}
          />
        ) : field.type === 'select' ? (
          <select {...baseInputProps}>
            <option value="">{field.placeholder || 'Выберите...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...baseInputProps}
            type={field.type}
            inputMode={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'numeric' : 'text'}
            autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'}
          />
        )}
        
        {showError && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }, [values, errors, touched, handleChange, handleBlur, isInTelegram])

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn('space-y-4', className)}
      noValidate
    >
      {fields.map(renderField)}
      
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={cn(
            'flex-1 tg-button disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px] font-medium text-base',
            isInTelegram && 'tg-button'
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="tg-loading" />
              Отправка...
            </div>
          ) : (
            submitText
          )}
        </button>
        
        {showReset && (
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              'px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg',
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              'min-h-[48px] font-medium text-base',
              isInTelegram && 'tg-secondary-bg tg-text border-0'
            )}
          >
            {resetText}
          </button>
        )}
      </div>
    </form>
  )
}

// Компонент для быстрого создания простых форм
export function QuickForm({
  fields,
  onSubmit,
  title,
  description
}: {
  fields: Omit<FormField, 'validation'>[]
  onSubmit: (data: Record<string, string>) => Promise<void> | void
  title?: string
  description?: string
}) {
  const { isInTelegram } = useTelegramWebApp()

  return (
    <div className={cn(
      'max-w-md mx-auto p-6 rounded-lg',
      isInTelegram ? 'tg-bg' : 'bg-white dark:bg-gray-800 shadow-lg'
    )}>
      {title && (
        <h2 className={cn(
          'text-xl font-bold mb-2',
          isInTelegram ? 'tg-text' : 'text-gray-900 dark:text-white'
        )}>
          {title}
        </h2>
      )}
      
      {description && (
        <p className={cn(
          'text-sm mb-6',
          isInTelegram ? 'tg-hint' : 'text-gray-600 dark:text-gray-400'
        )}>
          {description}
        </p>
      )}
      
      <OptimizedForm
        fields={fields}
        onSubmit={onSubmit}
        autoSave
        autoSaveKey={`quick-form-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}
      />
    </div>
  )
}