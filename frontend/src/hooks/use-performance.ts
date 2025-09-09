'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'

// Хук для дебаунсинга значений
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Хук для троттлинга функций
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      } else {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRun.current = Date.now()
        }, delay - (Date.now() - lastRun.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Хук для мемоизации дорогих вычислений
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

// Хук для отслеживания производительности
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>()
  const measurements = useRef<number[]>([])

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      measurements.current.push(duration)
      
      // Ограничиваем количество измерений
      if (measurements.current.length > 100) {
        measurements.current = measurements.current.slice(-50)
      }
      
      // Логируем медленные операции
      if (duration > 100) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
      }
      
      return duration
    }
    return 0
  }, [name])

  const getStats = useCallback(() => {
    const times = measurements.current
    if (times.length === 0) return null

    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)
    
    return { avg, min, max, count: times.length }
  }, [])

  return { start, end, getStats }
}

// Хук для ленивой загрузки компонентов
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const load = useCallback(async () => {
    if (loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await loader()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [loader, loading])

  useEffect(() => {
    load()
  }, deps)

  return { data, loading, error, reload: load }
}

// Хук для оптимизации рендеринга списков
export function useListOptimization<T>(
  items: T[],
  pageSize: number = 20
) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return items
    
    return items.filter(item => {
      const searchableText = JSON.stringify(item).toLowerCase()
      return searchableText.includes(debouncedSearchTerm.toLowerCase())
    })
  }, [items, debouncedSearchTerm])

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount)
  }, [filteredItems, visibleCount])

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + pageSize, filteredItems.length))
  }, [pageSize, filteredItems.length])

  const hasMore = visibleCount < filteredItems.length

  return {
    visibleItems,
    searchTerm,
    setSearchTerm,
    loadMore,
    hasMore,
    totalCount: filteredItems.length
  }
}

// Хук для управления состоянием загрузки
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  return { setLoading, isLoading, isAnyLoading }
}

// Хук для оптимизации изображений
export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve()
        return
      }

      if (failedImages.has(src)) {
        reject(new Error('Image previously failed to load'))
        return
      }

      const img = new Image()
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]))
        resolve()
      }
      img.onerror = () => {
        setFailedImages(prev => new Set([...prev, src]))
        reject(new Error('Failed to load image'))
      }
      img.src = src
    })
  }, [loadedImages, failedImages])

  const preloadImages = useCallback(async (sources: string[]) => {
    const promises = sources.map(src => preloadImage(src).catch(() => null))
    await Promise.allSettled(promises)
  }, [preloadImage])

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src)
  }, [loadedImages])

  const isImageFailed = useCallback((src: string) => {
    return failedImages.has(src)
  }, [failedImages])

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageFailed
  }
}

// Хук для оптимизации скролла
export function useScrollOptimization() {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const throttledScrollHandler = useThrottle((e: Event) => {
    setScrollY(window.scrollY)
    setIsScrolling(true)

    clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, 16) // ~60fps

  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [throttledScrollHandler])

  return { scrollY, isScrolling }
}

// Хук для мониторинга памяти (если доступно)
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory)
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}