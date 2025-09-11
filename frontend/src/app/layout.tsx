import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { FlickeringGrid } from '@/components/ui/flickering-grid'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'Платформа обучения',
  description: 'Образовательная платформа с интерактивными уроками',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
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
              <nav className="bg-black/20 backdrop-blur-md border-b border-cyan-400/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                      <div className="text-xl font-bold text-white font-[family-name:var(--font-orbitron)]">
                        IsmaSpace
                      </div>
                    </div>
                    <div className="flex items-center">
                       <a href="/" className="group p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25">
                         <div className="relative">
                           <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                           <svg className="relative w-6 h-6 text-cyan-400 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                           </svg>
                         </div>
                       </a>
                     </div>
                  </div>
                </div>
              </nav>
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}