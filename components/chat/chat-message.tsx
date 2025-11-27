"use client"

import type React from "react"
import { useState, useEffect, useRef, memo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  content: string | React.ReactNode
  type: "system" | "user" | "input"
  isTyping?: boolean
  typingSpeed?: number
  animate?: boolean
  className?: string
  animationStyle?: "natural" | "steady" | "fast"
}

export const ChatMessage = memo(function ChatMessage({
  content,
  type = "system",
  isTyping = false,
  typingSpeed = 15,
  animate = true,
  className,
  animationStyle = "natural",
}: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<NodeJS.Timeout | null>(null)
  const contentRef = useRef<string>("")
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  // Store the original content to ensure we don't lose characters
  useEffect(() => {
    if (typeof content === "string") {
      contentRef.current = content
    }
  }, [content])

  // Measure content height after render to maintain stable container
  useEffect(() => {
    if (messageRef.current && !contentHeight) {
      // Use setTimeout to ensure content has rendered
      const timer = setTimeout(() => {
        if (messageRef.current) {
          // Add a small buffer to prevent slight shifts
          const height = messageRef.current.offsetHeight + 2
          setContentHeight(height > 0 ? height : null)
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [displayedContent, isComplete, contentHeight])

  // Enhanced typing animation with improved performance and natural rhythm
  useEffect(() => {
    if (type === "system" && typeof content === "string" && !isTyping && animate) {
      // Reset state
      setDisplayedContent("")
      setIsComplete(false)

      // Ensure we use the full content string
      const fullContent = contentRef.current || content
      let index = 0

      // Clear any existing interval
      if (typingRef.current) {
        clearInterval(typingRef.current)
      }

      // Function to calculate dynamic delay for more natural typing
      const getTypingDelay = (char: string, prevChar: string) => {
        // Base delay adjusted for performance
        const baseDelay = typingSpeed * 0.8

        // Pause longer at punctuation
        if ([".", "!", "?"].includes(char)) {
          return baseDelay * 2.5
        }

        // Slight pause after punctuation
        if (prevChar && [".", "!", "?"].includes(prevChar)) {
          return baseDelay * 1.8
        }

        // Shorter pause at commas and semicolons
        if ([",", ";", ":"].includes(char)) {
          return baseDelay * 1.5
        }

        // Group words for more natural flow - slightly faster within words
        if (char === " ") {
          return baseDelay * 1.2
        }

        // Very slight random variation for natural feel (±10%)
        return baseDelay * (0.95 + Math.random() * 0.1)
      }

      // Use requestAnimationFrame for smoother animation
      const animateTyping = () => {
        if (index < fullContent.length) {
          const nextChar = fullContent.charAt(index)
          const prevChar = index > 0 ? fullContent.charAt(index - 1) : ""
          const delay = getTypingDelay(nextChar, prevChar)

          // Use setTimeout with requestAnimationFrame for optimal performance
          const timeoutId = setTimeout(() => {
            // Use functional update to ensure we're working with latest state
            setDisplayedContent((prev) => {
              // Ensure we don't duplicate characters
              if (prev.length < index) {
                return prev + nextChar
              }
              return prev + nextChar
            })

            index++

            // Continue animation in next frame
            requestAnimationFrame(animateTyping)
          }, delay)

          // Store timeout ID for cleanup
          typingRef.current = timeoutId as unknown as NodeJS.Timeout
        } else {
          setIsComplete(true)
        }
      }

      // Start the animation with requestAnimationFrame for better performance
      requestAnimationFrame(animateTyping)

      return () => {
        if (typingRef.current) {
          clearTimeout(typingRef.current as unknown as number)
          typingRef.current = null
        }
      }
    } else if (!animate && typeof content === "string") {
      // If not animating, show full content immediately
      setDisplayedContent(content)
      setIsComplete(true)
    }
  }, [content, type, isTyping, animate, typingSpeed])

  // Animation variants
  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.97,
      transition: {
        duration: 0.15,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.2, 0.0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  }

  return (
    <div className="relative" style={{ contain: "layout" }}>
      <motion.div
        ref={messageRef}
        initial="visible" // Changed from "hidden" to "visible" to avoid initial animation
        animate="visible"
        exit="exit"
        variants={messageVariants}
        className={cn(
          "w-full mb-4 ultra-smooth-enter",
          type === "user" ? "flex justify-end" : "",
          className,
          "exit-ready fixed-position-message", // Add fixed-position-message class
        )}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0) perspective(1000px)",
          contain: "content",
          isolation: "isolate",
          position: "relative", // Added for better stacking context
          minHeight: contentHeight ? `${contentHeight}px` : type === "system" ? "3rem" : "2.5rem", // Add stable height
          transformOrigin: "top center", // Changed to top center for better upward animation
          transition: "min-height 0.3s cubic-bezier(0.2, 0.0, 0.2, 1)", // Smooth height transitions
          pointerEvents: "auto", // Ensure interactions are always enabled
          zIndex: type === "input" ? 20 : 1, // Ensure input is always on top
        }}
        layoutId={`message-${type}-${typeof content === "string" ? content.substring(0, 10) : ""}`}
      >
        <div
          className={cn(
            "relative backdrop-blur-xl",
            type === "system" && "message-system",
            type === "user" && "message-user",
            type === "input" && "w-full max-w-full",
          )}
        >
          {/* Glass background with proper borders */}
          {type !== "input" && (
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden">
              {type === "system" && (
                <>
                  <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-secondary-300/15 to-transparent opacity-70" />
                  <div className="absolute inset-0 rounded-[inherit] border border-white/[0.05]" />
                  <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.1] to-transparent h-[50%]" />
                  {/* Added mint hue overlay */}
                  <div className="absolute inset-0 rounded-[inherit] bg-[#90DAB8]/[0.05] mix-blend-overlay" />
                </>
              )}
              {type === "user" && (
                <>
                  <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary-200/40 to-secondary-300/30 opacity-90" />
                  <div className="absolute inset-0 rounded-[inherit] border border-white/[0.15]" />
                  <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.2] to-transparent h-[50%]" />
                  {/* Added mint hue overlay */}
                  <div className="absolute inset-0 rounded-[inherit] bg-[#90DAB8]/[0.1] mix-blend-overlay" />
                </>
              )}
            </div>
          )}

          {/* Message content */}
          <div className="relative z-10">
            {/* Optimize the typing animation for smoother performance */}
            {isTyping ? (
              <div className="flex items-center py-2 px-1">
                {/* New sleek typing indicator with optimized animation */}
                <div className="typing-indicator transform-gpu">
                  <span style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}></span>
                  <span style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}></span>
                  <span style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}></span>
                </div>
              </div>
            ) : typeof content === "string" && type === "system" ? (
              <motion.p
                className="font-sans font-light tracking-wide leading-relaxed text-white min-h-[1.5em]"
                initial={{ opacity: 1, y: 0 }} // Changed from opacity: 0, y: 5 to avoid animation
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.35,
                    ease: [0.2, 0.0, 0.2, 1],
                    delay: 0.05,
                  },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.35, ease: [0.2, 0.0, 0.2, 1] },
                }}
                style={{
                  textShadow: "0 0 15px rgba(144, 218, 184, 0.1)",
                  transform: "translateZ(0)",
                  willChange: "contents",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  className="inline-block w-full"
                  style={{
                    display: "inline-block",
                    transform: "translateZ(0)",
                  }}
                >
                  {animate ? displayedContent : content}
                  {animate && !isComplete && (
                    <motion.span
                      animate={{
                        opacity: [0, 1, 0],
                        height: "1em",
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: [0.4, 0.0, 0.2, 1],
                        repeatType: "loop",
                      }}
                      className="inline-block w-0.5 h-[1em] ml-0.5 bg-secondary-300 transform-gpu align-middle"
                      style={{
                        verticalAlign: "middle",
                        marginBottom: "0.1em",
                        willChange: "opacity",
                        transform: "translateZ(0)",
                      }}
                    />
                  )}
                </span>
              </motion.p>
            ) : (
              <div
                className={type === "input" ? "input-content-wrapper" : ""}
                style={{ position: "relative", zIndex: 30 }}
              >
                {content}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
})
