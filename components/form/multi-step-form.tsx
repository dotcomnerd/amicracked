"use client"

import { useState, useEffect, useCallback, memo, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StaticFormContainer } from "@/components/form/static-form-container"
import { FormStep } from "@/components/form/form-step"
import { StaticWelcome } from "@/components/welcome/static-welcome"
import dynamic from "next/dynamic"

// Dynamically import later form steps with increased delay
const DynamicFormStep = dynamic(() => import("./form-step").then((mod) => ({ default: mod.FormStep })), {
  ssr: false,
  loading: () => <div className="min-h-[60px]"></div>,
})

// Facade for completion screen - only loaded when needed
const CompletionScreen = dynamic(
  () =>
    new Promise((resolve) => {
      // Delay loading the completion screen until needed
      setTimeout(() => {
        import("../completion/completion-screen").then((mod) => resolve(mod.CompletionScreen))
      }, 300)
    }),
  {
    ssr: false,
    loading: () => (
      <div className="text-center p-4">
        <div className="animate-pulse bg-white/10 h-6 w-32 mx-auto rounded mb-4"></div>
        <div className="animate-pulse bg-white/5 h-4 w-48 mx-auto rounded"></div>
      </div>
    ),
  },
)

/**
 * Multi-Step Form Component
 *
 * Main form controller that manages the form state, steps, and transitions.
 * Handles welcome screen, form steps, and completion screen.
 */
interface FormData {
  name: string
  email: string
  company: string
  details: string
}

export const MultiStepForm = memo(function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    details: "",
  })
  // Add a ref to track if we're transitioning from welcome to first step
  const isFirstTransitionRef = useRef(false)
  // Add a ref to track if the form is completed
  const completionAnimationRef = useRef(false)
  // Track hydration status
  const [isHydrated, setIsHydrated] = useState(false)

  // Mark when hydration is complete
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const getQuestionForStep = useCallback(
    (step: number): string => {
      switch (step) {
        case 1:
          return "Welcome! What's your name?"
        case 2:
          return `Nice to meet you${formData.name ? ", " + formData.name : ""}! What's your email address?`
        case 3:
          return `Thanks! Which company do you work for?`
        case 4:
          return `Tell me more about your project${formData.name ? ", " + formData.name : ""}.`
        default:
          return ""
      }
    },
    [formData.name],
  )

  // Optimize the handleSubmit function for smoother transitions
  const handleSubmit = useCallback((step: number, answer: string) => {
    // Update form data immediately
    setFormData((prev) => {
      switch (step) {
        case 1:
          return { ...prev, name: answer }
        case 2:
          return { ...prev, email: answer }
        case 3:
          return { ...prev, company: answer }
        case 4:
          return { ...prev, details: answer }
        default:
          return prev
      }
    })

    // Use a single requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Force a reflow to ensure the browser processes the previous state
      document.body.offsetHeight

      // For the final step, add a slight delay to allow the progress bar to reach 100%
      if (step === 4) {
        completionAnimationRef.current = true
        // Increased delay to ensure proper animation sequencing
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1)
        }, 500) // Increased from 300ms to 500ms for better animation timing
      } else {
        // For other steps, proceed immediately
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1)
        }, 300)
      }
    })
  }, [])

  useEffect(() => {
    setCurrentStep(0)
    setFormData({
      name: "",
      email: "",
      company: "",
      details: "",
    })
    isFirstTransitionRef.current = false
    completionAnimationRef.current = false
  }, [])

  const handleStart = useCallback(() => {
    // Set the first transition flag
    isFirstTransitionRef.current = true
    // Immediately set the current step
    setCurrentStep(1)

    // Preload the next step component when user starts
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(
        () => {
          import("./form-step")
        },
        { timeout: 2000 },
      )
    }
  }, [])

  // Pre-render the first form step question
  const firstStepQuestion = getQuestionForStep(1)

  return (
    <StaticFormContainer totalSteps={4} currentStep={currentStep}>
      <div className="relative">
        {/* Welcome screen */}
        {currentStep === 0 && <StaticWelcome onStart={handleStart} />}

        {/* Form steps - always render but conditionally show */}
        <div
          className={`${currentStep === 0 ? "hidden" : "block"} animation-container animation-optimize`}
          style={{
            position: "relative",
            zIndex: currentStep === 0 ? -1 : 1,
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
            contain: "layout",
          }}
        >
          <div className="steps-container relative">
            {/* Use a single AnimatePresence with mode="wait" to ensure clean transitions */}
            <AnimatePresence mode="wait" initial={false}>
              {currentStep >= 1 && currentStep <= 4 && (
                <motion.div
                  key={`step-${currentStep}`}
                  className="step-wrapper transform-gpu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 },
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    willChange: "transform, opacity",
                    contain: "content",
                    isolation: "isolate",
                  }}
                >
                  {/* First step is always rendered for immediate interaction */}
                  {currentStep === 1 && (
                    <FormStep
                      step={1}
                      currentStep={currentStep}
                      question={firstStepQuestion}
                      onSubmit={(answer) => handleSubmit(1, answer)}
                      isFirstTransition={isFirstTransitionRef.current}
                    />
                  )}

                  {/* Later steps are dynamically loaded when needed */}
                  {isHydrated && currentStep === 2 && (
                    <Suspense fallback={<div className="min-h-[60px]"></div>}>
                      <DynamicFormStep
                        step={2}
                        currentStep={currentStep}
                        question={getQuestionForStep(2)}
                        onSubmit={(answer) => handleSubmit(2, answer)}
                      />
                    </Suspense>
                  )}

                  {isHydrated && currentStep === 3 && (
                    <Suspense fallback={<div className="min-h-[60px]"></div>}>
                      <DynamicFormStep
                        step={3}
                        currentStep={currentStep}
                        question={getQuestionForStep(3)}
                        onSubmit={(answer) => handleSubmit(3, answer)}
                      />
                    </Suspense>
                  )}

                  {isHydrated && currentStep === 4 && (
                    <Suspense fallback={<div className="min-h-[60px]"></div>}>
                      <DynamicFormStep
                        step={4}
                        currentStep={currentStep}
                        question={getQuestionForStep(4)}
                        onSubmit={(answer) => handleSubmit(4, answer)}
                      />
                    </Suspense>
                  )}
                </motion.div>
              )}

              {currentStep > 4 && (
                <Suspense
                  fallback={
                    <div className="text-center space-y-4">
                      <div className="animate-pulse bg-white/10 h-6 w-32 mx-auto rounded mb-4"></div>
                      <div className="animate-pulse bg-white/5 h-4 w-48 mx-auto rounded"></div>
                    </div>
                  }
                >
                  <CompletionScreen formData={formData} />
                </Suspense>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </StaticFormContainer>
  )
})
