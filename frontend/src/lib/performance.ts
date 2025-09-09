// Утилиты для оптимизации производительности в Telegram WebApp

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Хук для дебаунса функций (оптимизация для мобильных устройств)
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// Хук для throttle функций (ограничение частоты вызовов)
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

// Хук для ленивой загрузки компонентов
export function useLazyLoad(threshold = 0.1) {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return { elementRef, isVisible };
}

// Оптимизация анимаций для мобильных устройств
export const mobileAnimationConfig = {
  // Уменьшенная продолжительность для мобильных
  duration: 0.3,
  // Оптимизированные easing функции
  ease: [0.25, 0.46, 0.45, 0.94],
  // Отключение анимаций при слабом устройстве
  reduce: typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// Детекция производительности устройства
export function getDevicePerformance(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium';
  
  // Проверка количества ядер процессора
  const cores = (navigator as any).hardwareConcurrency || 2;
  
  // Проверка памяти устройства
  const memory = (navigator as any).deviceMemory || 2;
  
  if (cores >= 4 && memory >= 4) return 'high';
  if (cores >= 2 && memory >= 2) return 'medium';
  return 'low';
}

// Адаптивные настройки на основе производительности
export function getPerformanceConfig() {
  const performance = getDevicePerformance();
  
  return {
    enableAnimations: performance !== 'low',
    imageQuality: performance === 'high' ? 90 : performance === 'medium' ? 75 : 60,
    maxConcurrentRequests: performance === 'high' ? 6 : performance === 'medium' ? 4 : 2,
    enablePreloading: performance !== 'low'
  };
}