"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"

interface CompletionScreenProps {
  formData: {
    name: string
    email: string
    company: string
    details: string
  }
}

export function CompletionScreen({ formData }: CompletionScreenProps) {
  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef<HTMLHeadingElement>(null)

  // Measure header position after render
  useEffect(() => {
    if (headerRef.current) {
      // Get the height of the header element
      const height = headerRef.current.offsetHeight
      setHeaderHeight(height)
    }
  }, [])

  return (
    <motion.div
      key="completion"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.8, // Delay to allow progress bar to checkmark animation to complete
      }}
      className="text-center space-y-4 relative"
    >
      {/* Position the checkmark absolutely relative to this container */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ marginTop: `-${headerHeight + 60}px` }}
      >
        <div className="checkmark-container">
          {/* The checkmark will be rendered by the ProgressIndicator component */}
        </div>
      </div>

      <h2 ref={headerRef} className="text-xl md:text-2xl font-display font-light text-white text-center mx-auto">
        Thank you, {formData.name}!
      </h2>
      <p className="text-white/80 font-sans font-light">Your submission has been received.</p>
      <div className="mt-6">
        <h3 className="text-lg md:text-xl font-sans font-light mb-3">Your information:</h3>
        <div className="text-left bg-black/40 p-3 md:p-4 rounded-xl border border-white/5 max-w-sm mx-auto w-fit min-w-[280px]">
          <p className="mb-1.5">
            <span className="text-white/60">Name:</span> {formData.name}
          </p>
          <p className="mb-1.5">
            <span className="text-white/60">Email:</span> {formData.email}
          </p>
          <p className="mb-1.5">
            <span className="text-white/60">Company:</span> {formData.company}
          </p>
          <p>
            <span className="text-white/60">Project Details:</span> {formData.details}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
