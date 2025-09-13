import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import TelegramWebApp from '@/components/TelegramWebApp'
import { NavigationDiagnostics } from '@/components/NavigationDiagnostics'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'Платформа обучения',
  description: 'Образовательная платформа с интерактивными уроками',
  other: {
    'telegram-web-app': 'true',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="telegram-web-app" content="true" />
        <meta name="format-detection" content="telephone=no" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className={`${inter.className} ${orbitron.variable}`}>
        <div className="min-h-screen relative">
          <div className="relative min-h-screen bg-black">
            <FlickeringGrid
               className="fixed inset-0 z-0"
               squareSize={3}
               gridGap={4}
               color="rgb(64, 64, 64)"
               maxOpacity={0.6}
               flickerChance={0.4}
             />
            <div className="relative z-10 min-h-screen">
              <Navigation />
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <NavigationDiagnostics />
                <TelegramWebApp>
                  {children}
                </TelegramWebApp>
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}