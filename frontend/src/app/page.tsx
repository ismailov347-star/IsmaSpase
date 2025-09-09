"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BeamsBackground } from "@/components/ui/beams-background";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { HyperText } from "@/components/ui/hyper-text";
import { useTelegramWebApp } from "@/components/telegram-webapp";

export default function Home() {
  const { hapticFeedback, isInTelegram } = useTelegramWebApp();
  
  return (
    <div className="min-h-screen">
      <div className="relative min-h-screen">
        <BeamsBackground intensity="strong" className="absolute inset-0" />
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-2 sm:gap-4 items-center justify-center px-2 sm:px-4 min-h-screen z-10 pt-16 sm:pt-20"
        >
        <div className="text-xl sm:text-3xl md:text-7xl font-bold text-center px-2 text-white">
          ОБУЧАЮЩАЯ ПЛАТФОРМА
        </div>
        <div className="mb-4 sm:mb-8">
          <HyperText
            text="IsmaSpace"
            className="text-2xl sm:text-4xl md:text-8xl font-black tracking-wider text-white"
            style={{
              fontFamily: '"Montserrat Alternates", system-ui, sans-serif',
              fontWeight: '900',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
            duration={1000}
            animateOnLoad={true}
          />
        </div>
        <div className="font-bold text-sm sm:text-base md:text-2xl py-2 sm:py-4 text-center italic max-w-4xl mx-auto px-2 sm:px-4 text-gray-300" style={{ fontFamily: '"CMU Concrete", serif' }}>
          "Каждый, кто делает шаг к новым знаниям, открывает для себя путь к возможностям, о которых вчера даже не догадывался"
        </div>
        <div className="flex justify-center mt-4 sm:mt-8">
          <Link href="/sections">
            <RainbowButton 
              className="touch-action-manipulation haptic-medium"
              onClick={() => hapticFeedback('medium')}
            >
              Начать обучение
            </RainbowButton>
          </Link>
        </div>
        </motion.div>
      </div>
    </div>
  );
}