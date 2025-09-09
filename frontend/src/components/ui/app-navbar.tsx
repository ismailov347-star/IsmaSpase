"use client"

import { Home, BookOpen, GraduationCap } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function AppNavBar() {
  const navItems = [
    { name: 'Главная', url: '/', icon: Home },
    { name: 'Курсы', url: '/sections', icon: BookOpen },
    { name: 'Обучение', url: '/sections/practicum', icon: GraduationCap }
  ]

  return <NavBar items={navItems} />
}