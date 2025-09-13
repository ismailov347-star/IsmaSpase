'use client'
import { useRouter } from 'next/navigation'

export function useSafeNavigate() {
  const router = useRouter()
  return (href: string) => {
    // внутренние пути (без протокола/домена)
    if (/^\/(?!\/)/.test(href)) {
      router.push(href)         // НИКАКИХ window.location
      return
    }
    // внешние ссылки — через Telegram API или новую вкладку
    const openLink = (window as any)?.Telegram?.WebApp?.openLink
    if (openLink) openLink(href, { try_instant_view: false })
    else window.open(href, '_blank', 'noopener,noreferrer')
  }
}