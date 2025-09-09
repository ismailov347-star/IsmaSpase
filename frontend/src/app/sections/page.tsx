"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BeamsBackground } from "@/components/ui/beams-background";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function SectionsPage() {
  return (
    <div className="relative min-h-screen">
      <BeamsBackground intensity="medium" className="absolute inset-0" />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 sm:gap-8 items-center justify-center px-2 sm:px-4 min-h-screen pt-16 sm:pt-20"
        >

        
        <div className="w-full max-w-xs sm:max-w-md px-2 sm:px-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-xl"
          >
            <div className="mb-3 sm:mb-4 flex justify-center">
              <div className="text-lg sm:text-2xl font-bold text-white" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                ПРАКТИКУМ
              </div>
            </div>
            <div className="text-base sm:text-xl font-bold text-white mb-2 text-center px-1" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              "СИСТЕМА ЛЕГКОГО КОНТЕНТА"
            </div>
            <p className="text-sm sm:text-base text-gray-300 text-center mb-4 sm:mb-6 mt-2 sm:mt-4 px-1">
              Изучите основы создания контента и продвижения в социальных сетях
            </p>
            <div className="flex justify-center">
              <Link href="/sections/practicum">
                <RainbowButton>
                  Открыть
                </RainbowButton>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <Link href="/">
          <RainbowButton>
            ← Вернуться на главную
          </RainbowButton>
        </Link>
        </motion.div>
      </div>
    </div>
  );
}