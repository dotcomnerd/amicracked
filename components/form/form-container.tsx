"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { memo } from "react"

interface FormContainerProps {
  children: ReactNode
  className?: string
}

export const FormContainer = memo(function FormContainer({ children, className = "" }: FormContainerProps) {
  return (
    <motion.div
      className={`glassmorphic p-6 md:p-8 w-full max-w-xl mx-auto ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
    >
      {children}
    </motion.div>
  )
})
