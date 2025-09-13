'use client'

import { ButtonCta } from '@/components/ui/button-shiny'
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation'

const scrollToTopics = () => {
  const topicsSection = document.getElementById('topics-section')
  if (topicsSection) {
    topicsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

export default function Home() {
  const { navigate } = useTelegramNavigation()

  return (
    <div className="px-4 py-8">
      {/* Заголовок */}
      <div className="text-center mb-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            ОБУЧАЮЩАЯ ПЛАТФОРМА
          </h1>
          <h2 className="text-6xl font-bold font-[family-name:var(--font-orbitron)] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] animate-pulse">
            IsmaSpace
          </h2>
        </div>
      </div>

      {/* Single Theme Card */}
       <div id="topics-section" className="max-w-md mx-auto">
         <div className="p-8 rounded-2xl border border-cyan-400/35 shadow-[0_0_12px_rgba(0,180,255,0.18),0_0_28px_rgba(0,180,255,0.08)] hover:shadow-[0_0_16px_rgba(0,180,255,0.25),0_0_35px_rgba(0,180,255,0.12)] hover:-translate-y-0.5 transition-all duration-300" style={{background: 'rgba(20,22,28,0.18)', backdropFilter: 'blur(4px)'}}>
           <h3 className="text-2xl font-bold text-white mb-4">
             Практикум<br/>
             «СИСТЕМА ЛЁГКОГО КОНТЕНТА»
           </h3>
           <p className="text-gray-300 mb-6 leading-relaxed">
              Простая система, которая помогает вести блог без лишней суеты: писать живые посты, удерживать интерес людей и постепенно набирать подписчиков.
            </p>
           <ButtonCta 
             label="Изучать тему" 
             onNavigate={() => navigate('/topics/1')}
           />
         </div>
       </div>
    </div>
  )
}