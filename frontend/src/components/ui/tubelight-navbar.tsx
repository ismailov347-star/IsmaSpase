"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTelegramWebApp } from "@/components/telegram-webapp"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { hapticFeedback, isInTelegram } = useTelegramWebApp()

  return (
    <nav className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-0.5 py-0">
      <div className="flex items-center space-x-1 sm:space-x-2 relative">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => {
                setActiveIndex(index)
                hapticFeedback('light')
              }}
              className={cn(
                "relative px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-200 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm touch-action-manipulation haptic-light hover:bg-transparent active:bg-transparent focus:bg-transparent focus:outline-none",
                activeIndex === index
                  ? "text-blue-400"
                  : "text-white/70"
              )}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium hidden xs:inline sm:inline">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}