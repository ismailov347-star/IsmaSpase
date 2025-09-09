import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/telegram.css'
import { AppNavBar } from '@/components/ui/app-navbar'
import { TelegramWebApp } from '@/components/telegram-webapp'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ОБУЧАЮЩАЯ ПЛАТФОРМА | IsmaSpace',
  description: 'Telegram обучающая платформа для изучения различных тем. Интерактивные курсы, практикум и персонализированное обучение.',
  keywords: 'обучение, курсы, telegram, образование, практикум, IsmaSpace',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IsmaSpace',
  },
  manifest: '/manifest.json',
  robots: 'index, follow',
  openGraph: {
    title: 'ОБУЧАЮЩАЯ ПЛАТФОРМА | IsmaSpace',
    description: 'Telegram обучающая платформа для изучения различных тем',
    type: 'website',
    locale: 'ru_RU',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const themeColor = '#3b82f6'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="application-name" content="IsmaSpace" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="telegram-web-app" content="true" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className={`${inter.className} h-full`}>
        <TelegramWebApp />
        <AppNavBar />
        {children}
      </body>
    </html>
  )
}