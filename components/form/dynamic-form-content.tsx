"use client"

import { useState, useEffect, type ReactNode } from "react"
import { motion } from "framer-motion"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { DynamicBackground } from "@/components/background/dynamic-background"

interface DynamicFormContentProps {
  children: ReactNode
  totalSteps: number
  currentStep: number
}

export function DynamicFormContent({ children, totalSteps, currentStep }: DynamicFormContentProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [step, setStep] = useState(0)
  const isCompleted = currentStep > totalSteps

  // Mark when hydration is complete
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Update local step when currentStep changes
  useEffect(() => {
    setStep(currentStep)
  }, [currentStep])

  // Load background component after hydration
  useEffect(() => {
    // Only load background after initial render and hydration
    if (isHydrated) {
      // This will be handled by the DynamicBackground component
    }
  }, [isHydrated])

  return (
    <>
      {/* Load background dynamically after hydration */}
      {isHydrated && <DynamicBackground />}

      {/* Progress indicator - only show when form has started */}
      {step > 0 && (
        <motion.div
          initial={{ opacity: currentStep === 1 ? 1 : 0, y: currentStep === 1 ? 0 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: currentStep === 1 ? 0 : 0.5 }}
          className="w-full max-w-md md:max-w-lg mx-auto mb-12 mt-[10px]"
        >
          <ProgressIndicator
            currentStep={Math.min(step, totalSteps)}
            totalSteps={totalSteps}
            isCompleted={isCompleted}
          />
        </motion.div>
      )}

      {/* Main content container */}
      <motion.div
        key="form"
        className="w-full max-w-md md:max-w-lg relative"
        initial={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
        exit={{
          opacity: 0,
          y: -10,
          scale: 0.98,
          transition: {
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0) perspective(1000px)",
          isolation: "isolate",
          contain: "content",
          zIndex: 1,
        }}
      >
        {/* Enhanced Vision Pro glassmorphic container */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden z-0">
          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
            style={{
              backgroundImage:
                "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')",
              backgroundSize: "200px 200px",
            }}
          />

          {/* Base glassmorphic effect with increased contrast */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-0" />

          {/* Subtle edge highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30" />

          {/* Inner glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-300/10 via-transparent to-secondary-300/10 opacity-20 blur-xl" />
        </div>

        {/* Content with proper z-index */}
        <div
          className="relative z-10 p-4 md:p-6 rounded-xl"
          style={{
            background: "transparent",
            transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
            willChange: "opacity, transform",
            backdropFilter: "none",
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  )
}
