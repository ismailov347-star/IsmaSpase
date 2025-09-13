'use client'
import { useEffect } from 'react'

export function NavigationDiagnostics() {
  useEffect(() => {
    // Диагностика кликов по ссылкам
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a')
      if (a) {
        console.log('ANCHOR CLICKED', a.getAttribute('href'))
      }
    }

    // Диагностика hard-reload
    const handleBeforeUnload = () => {
      console.warn('HARD RELOAD!')
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}