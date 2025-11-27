"use client"

import { useState, useEffect, useRef, memo, useCallback } from "react"
import { motion } from "framer-motion"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
// Add imports for validation
import { validateName, validateEmail, validateCompany, validateDetails } from "@/utils/form-validation"

/**
 * Form Step Component
 *
 * Renders a single step in the multi-step form with typing animation,
 * validation, and smooth transitions between steps.
 */
interface FormStepProps {
  step: number
  currentStep: number
  question: string
  onSubmit: (answer: string) => void
  isFirstTransition?: boolean
}

// Optimize the animation variants for smoother transitions
const messageVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    transition: {
      duration: 0.25,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.0, 0.0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20, // Changed from y to x for horizontal exit
    scale: 0.98,
    transition: {
      duration: 0.35,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

export const FormStep = memo(function FormStep({
  step,
  currentStep,
  question,
  onSubmit,
  isFirstTransition = false,
}: FormStepProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [messageVisible, setMessageVisible] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")
  const mountedRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  // Get the appropriate validator based on step
  const getValidator = useCallback(() => {
    switch (step) {
      case 1:
        return validateName
      case 2:
        return validateEmail
      case 3:
        return validateCompany
      case 4:
        return validateDetails
      default:
        return undefined
    }
  }, [step])

  // Reset state when component mounts
  useEffect(() => {
    mountedRef.current = true

    // Ensure clean unmount
    return () => {
      mountedRef.current = false
      // Clear any pending timers on unmount with null assignment
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [])

  // Update container height when content changes
  useEffect(() => {
    if (containerRef.current && (messageVisible || answered)) {
      // Use setTimeout to ensure content has rendered
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const height = containerRef.current.scrollHeight
          // Only update if height is larger than current or not set
          if (!containerHeight || height > containerHeight) {
            setContainerHeight(height)
          }
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [messageVisible, answered, userAnswer, containerHeight])

  // Optimize the useEffect for step changes to prevent flickering
  useEffect(() => {
    if (!mountedRef.current) return

    // Only show typing indicator when this is the current step
    if (currentStep === step) {
      // Reset state for this step
      setAnswered(false)
      setUserAnswer("")

      // For first transition from welcome screen, skip typing animation
      if (isFirstTransition && step === 1) {
        setIsTyping(false)
        setMessageVisible(true)
        return
      }

      // Important: Set message visible to false first, then set typing to true
      setMessageVisible(false)

      // Use a single requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        // Force a reflow to ensure state changes are processed
        document.body.offsetHeight

        setIsTyping(true)

        // Simulate typing time based on question length with improved timing
        const typingTime = Math.min(question.length * 15, 1200)

        // Clear any existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }

        // Set new timer
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setIsTyping(false)
            setMessageVisible(true)
          }
        }, typingTime)
      })
    }
  }, [currentStep, step, question, isFirstTransition])

  // Memoize the submit handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    (answer: string) => {
      if (!answer.trim() || !mountedRef.current) return

      // Set user answer immediately
      setUserAnswer(answer)

      // First, set answered state to show the user's response
      setAnswered(true)

      // Use requestAnimationFrame for smoother transitions
      requestAnimationFrame(() => {
        // Force a reflow to ensure the browser processes the previous state
        document.body.offsetHeight

        // Wait for exit animations to complete before proceeding to next step
        setTimeout(() => {
          if (mountedRef.current) {
            onSubmit(answer)
          }
        }, 300) // Reduced from 400ms for snappier transitions
      })
    },
    [onSubmit],
  )

  // Handle animation sequencing between steps
  useEffect(() => {
    if (currentStep > step && answered) {
      // When moving to next step, ensure current step animates out properly
      // No need to manually add classes with our new approach
      // The AnimatePresence will handle the exit animations
    }
  }, [currentStep, step, answered])

  // Only render if this is the current step or we're showing the answer
  if (currentStep < step) return null

  // If we've moved past this step and it's been answered, handle transition smoothly
  if (currentStep > step) {
    if (!answered) return null

    // Use RAF for smoother transition timing
    if (hideTimerRef.current === null) {
      hideTimerRef.current = setTimeout(() => {
        // Use triple requestAnimationFrame to sync with browser's rendering cycle
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (mountedRef.current) {
                // Fade out smoothly before removing
                setAnswered(false)
              }
            })
          })
        })
      }, 1000) // Increased from 800 to 1000ms for smoother exit
    }
  }

  return (
    <motion.div
      ref={containerRef}
      className="space-y-4 form-step-container"
      initial={{
        opacity: isFirstTransition && step === 1 ? 1 : 0,
        y: isFirstTransition && step === 1 ? 0 : 15,
        scale: isFirstTransition && step === 1 ? 1 : 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: isFirstTransition && step === 1 ? 0 : 0.45,
          ease: [0.2, 0.0, 0.2, 1],
        },
      }}
      exit={{
        opacity: 0,
        x: -20,
        scale: 0.95,
        transition: {
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
        },
      }}
      style={{
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0) perspective(1000px)",
        position: "relative",
        zIndex: currentStep === step ? 2 : 1,
        contain: "content",
        minHeight: containerHeight ? `${containerHeight}px` : step === 1 ? "120px" : "80px",
        transformOrigin: "top center",
        transition: "min-height 0.3s cubic-bezier(0.2, 0.0, 0.2, 1)",
        pointerEvents: currentStep === step ? "auto" : "none",
      }}
      layoutId={`form-step-${step}`}
    >
      {/* System message (question) */}
      <motion.div
        className="mb-4 transform-gpu"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.0, 0.2, 1] }}
      >
        <ChatMessage type="system" content={question} animate={!isFirstTransition || step !== 1} isTyping={isTyping} />
      </motion.div>

      {/* Input container - always present but conditionally visible */}
      {!answered && (
        <motion.div
          className="input-container-wrapper transform-gpu"
          initial={{ opacity: 0 }}
          animate={{
            opacity: messageVisible && !isTyping ? 1 : 0,
            y: messageVisible && !isTyping ? 0 : 10,
          }}
          transition={{ duration: 0.3, ease: [0.2, 0.0, 0.2, 1] }}
          style={{
            pointerEvents: messageVisible && !isTyping ? "auto" : "none",
            transform: "translateZ(0)",
            position: "relative",
            zIndex: 10, // Ensure input is above other elements
          }}
        >
          <ChatMessage
            type="input"
            content={
              <ChatInput
                onSubmit={handleSubmit}
                placeholder="Type your answer..."
                autoFocus
                validate={getValidator()}
              />
            }
          />
        </motion.div>
      )}

      {/* User answer - only shown after submission */}
      {answered && userAnswer && (
        <motion.div
          className="transform-gpu"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.0, 0.2, 1] }}
        >
          <ChatMessage type="user" content={userAnswer} animate={false} />
        </motion.div>
      )}
    </motion.div>
  )
})

export default FormStep
