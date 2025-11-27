"use client"

import { motion } from "framer-motion"

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  canGoNext?: boolean
  isSubmitting?: boolean
  isLastStep?: boolean
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext = true,
  isSubmitting = false,
  isLastStep = false,
}: FormNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      <motion.button
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: currentStep === 1 ? 1 : 1.05 }}
        whileTap={{ scale: currentStep === 1 ? 1 : 0.95 }}
      >
        Back
      </motion.button>

      <motion.button
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: !canGoNext || isSubmitting ? 1 : 1.05 }}
        whileTap={{ scale: !canGoNext || isSubmitting ? 1 : 0.95 }}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : isLastStep ? (
          "Complete"
        ) : (
          "Continue"
        )}
      </motion.button>
    </div>
  )
}
