"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "@/components/icons"

/**
 * Chat Input Component
 *
 * Renders an input field with validation support and animated submit button.
 * Handles focus states and error display.
 */
interface ChatInputProps {
  onSubmit: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  validate?: (value: string) => { isValid: boolean; errorMessage?: string }
}

export const ChatInput = React.memo(function ChatInput({
  onSubmit,
  placeholder = "Type your answer...",
  autoFocus = false,
  disabled = false,
  validate,
}: ChatInputProps) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Delay focus to ensure the element is fully rendered and visible
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (disabled || !value.trim()) return

    if (validate) {
      const result = validate(value)
      if (!result.isValid) {
        setError(result.errorMessage)
        return
      }
    }

    setError(undefined)
    onSubmit(value)
    setValue("")
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (containerRef.current) {
      containerRef.current.classList.add("active")
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (containerRef.current) {
      containerRef.current.classList.remove("active")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full transform-gpu no-flicker"
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "opacity",
        contain: "layout",
        position: "relative",
        zIndex: 30, // Ensure form is always on top
        pointerEvents: "auto", // Ensure interactions are always enabled
      }}
    >
      <div
        ref={containerRef}
        className={`input-container relative flex items-center ${error ? "error" : ""} no-flicker`}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "opacity",
          contain: "layout",
          position: "relative",
          zIndex: 30, // Ensure container is always on top
          pointerEvents: "auto", // Ensure interactions are always enabled
          borderRadius: "0.75rem", // Match input border radius
          overflow: "hidden", // Ensure border effects stay within bounds
        }}
      >
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 rounded-[inherit] border border-white/[0.1]" />
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.08] to-transparent h-[50%]" />
          <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="form-input pr-12"
          aria-label="Your answer"
          aria-invalid={!!error}
          style={{
            position: "relative",
            zIndex: 31, // Ensure input is always on top
            pointerEvents: "auto", // Ensure interactions are always enabled
          }}
        />

        <motion.button
          type="submit"
          disabled={!value.trim() || disabled}
          className="absolute right-3 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          whileHover={{
            scale: !disabled && value.trim() ? 1.05 : 1,
            boxShadow: !disabled && value.trim() ? "0 0 8px rgba(76, 175, 130, 0.5)" : "none",
          }}
          whileTap={{ scale: !disabled && value.trim() ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
          aria-label="Submit answer"
          style={{
            position: "absolute",
            zIndex: 32, // Ensure button is always on top
            pointerEvents: "auto", // Ensure interactions are always enabled
          }}
        >
          <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
            <ArrowRight size={18} className="absolute" />
          </div>
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 mt-1 ml-1"
        >
          {error}
        </motion.div>
      )}
    </form>
  )
})
