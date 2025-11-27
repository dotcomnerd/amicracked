"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  isCompleted?: boolean
}

// Optimized SVG checkmark with animated drawing effect
function CheckmarkIcon() {
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* Glow effect behind checkmark */}
      <motion.div
        className="absolute rounded-full bg-primary-400/20 blur-md"
        style={{
          width: "120%",
          height: "120%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          willChange: "transform, opacity",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.6 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      {/* Circle background */}
      <motion.div
        className="rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center"
        style={{
          width: "100%",
          height: "100%",
          boxShadow: "0 0 20px rgba(76, 175, 130, 0.4)",
          willChange: "transform",
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* SVG checkmark with drawing animation */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform-gpu"
        >
          <motion.path
            d="M6 12L10 16L18 8"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            style={{
              willChange: "stroke-dashoffset, opacity",
            }}
          />
        </svg>
      </motion.div>
    </div>
  )
}

export function ProgressIndicator({ currentStep, totalSteps, isCompleted = false }: ProgressIndicatorProps) {
  const percentage = (currentStep / totalSteps) * 100
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle the completion animation sequence
  useEffect(() => {
    if (isCompleted && !showCheckmark) {
      // Delay the checkmark animation to allow the progress bar to reach 100% first
      const timer = setTimeout(() => {
        setShowCheckmark(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, showCheckmark])

  // Track when the animation is fully complete
  const handleAnimationComplete = () => {
    if (showCheckmark) {
      setAnimationComplete(true)
    }
  }

  return (
    <div ref={containerRef} className="w-full max-w-[150%] mx-auto relative flex flex-col items-center">
      {/* Progress indicator that transforms into checkmark */}
      <motion.div
        className={`w-full transition-all duration-500 ease-out ${
          showCheckmark ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"
        }`}
        animate={{ opacity: showCheckmark ? 0 : 1, height: showCheckmark ? 0 : "auto" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/80 flex items-center font-medium">
            <span className="font-sans flex items-center">
              {currentStep}/{totalSteps}
              <CheckCircle size={16} className="ml-2 text-primary-400" />
            </span>
          </span>
          <span className="text-xs text-white/80 font-medium">{Math.round(percentage)}%</span>
        </div>
        <div className="h-[3px] bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-secondary-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 100,
            }}
          />
        </div>
      </motion.div>

      {/* Checkmark animation that appears after progress completion */}
      {showCheckmark && (
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none">
          <motion.div
            className="relative z-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.3 },
            }}
            onAnimationComplete={handleAnimationComplete}
          >
            <CheckmarkIcon />
          </motion.div>
        </div>
      )}
    </div>
  )
}
