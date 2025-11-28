'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export const ModeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative h-9 w-9 rounded-full bg-secondary/50"
        aria-label="Toggle theme"
      />
    )
  }

  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={handleToggle}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      tabIndex={0}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
    >
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  )
}
