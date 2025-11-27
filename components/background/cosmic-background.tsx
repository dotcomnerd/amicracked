"use client"

import { useEffect, useRef, memo, useState } from "react"
import { motion } from "framer-motion"

export default memo(function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Defer animation start to after critical content loads
  useEffect(() => {
    // Use requestIdleCallback to defer non-critical initialization
    const idleCallback =
      "requestIdleCallback" in window ? window.requestIdleCallback : (cb: Function) => setTimeout(() => cb(), 200)

    const idleCallbackId = idleCallback(
      () => {
        setIsVisible(true)
      },
      { timeout: 1000 },
    )

    return () => {
      if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId as any)
      } else {
        clearTimeout(idleCallbackId as any)
      }
    }
  }, [])

  // Canvas-based star field with optimized rendering
  useEffect(() => {
    // Only initialize canvas when component is visible
    if (!isVisible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Star properties
    const stars: {
      x: number
      y: number
      size: number
      opacity: number
      speed: number
      color: string
    }[] = []

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)

      // Redraw stars when resizing
      drawStars()
    }

    // Initialize stars with optimized density calculation
    function drawStars() {
      stars.length = 0

      // Adjust density based on screen size and device capabilities
      const isLowPowerDevice = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const baseDensity = isLowPowerDevice ? 20 : 40 // Further reduced density
      const density = Math.max(
        baseDensity,
        Math.floor((canvas.width * canvas.height) / (isLowPowerDevice ? 50000 : 40000)), // Reduced density
      )

      // Color palette
      const colors = [
        "rgba(144, 218, 184, opacity)", // Mint
        "rgba(160, 230, 200, opacity)", // Light mint
        "rgba(200, 255, 230, opacity)", // Very light mint
        "rgba(255, 255, 255, opacity)", // White
      ]

      for (let i = 0; i < density; i++) {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight
        const size = Math.random() * 1 + 0.3 // Further reduced size
        const opacity = Math.random() * 0.4 + 0.2 // Reduced opacity
        const speed = Math.random() * 0.03 + 0.01 // Reduced speed
        const colorIndex = Math.floor(Math.random() * colors.length)

        stars.push({
          x,
          y,
          size,
          opacity,
          speed,
          color: colors[colorIndex].replace("opacity", opacity.toString()),
        })
      }
    }

    // Debounce resize handler
    let resizeTimerId: NodeJS.Timeout | null = null
    const debouncedResize = () => {
      if (resizeTimerId) clearTimeout(resizeTimerId)
      resizeTimerId = setTimeout(handleResize, 200) // Increased debounce time
    }

    window.addEventListener("resize", debouncedResize)
    handleResize()

    // Animation loop with requestAnimationFrame for performance
    let lastFrameTime = 0
    const targetFPS = 20 // Further reduced from 24 to 20 FPS for background animation

    function animate(currentTime = 0) {
      // Skip frames to achieve target FPS
      if (currentTime - lastFrameTime < 1000 / targetFPS) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = currentTime

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Draw stars with batched rendering
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = star.color

        // Add glow effect only to larger stars to reduce rendering cost
        if (star.size > 1) {
          ctx.shadowBlur = star.size * 1.5 // Reduced blur
          ctx.shadowColor = star.color
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fill()

        // Move star
        star.y -= star.speed

        // Wrap around
        if (star.y < -10) {
          star.y = window.innerHeight + 10
          star.x = Math.random() * window.innerWidth
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Defer animation start
    const animationTimer = setTimeout(() => {
      animate()
    }, 500) // Increased delay

    return () => {
      window.removeEventListener("resize", debouncedResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (animationTimer) {
        clearTimeout(animationTimer)
      }
      if (resizeTimerId) {
        clearTimeout(resizeTimerId)
      }
    }
  }, [isVisible])

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030806] to-[#041007] z-[-12]" />

      {/* Canvas for stars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[-11]"
        style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease-in" }}
      />

      {/* Ambient glow effects - deferred loading */}
      {isVisible && (
        <>
          <motion.div
            className="absolute top-0 left-1/4 w-[40vw] h-[30vh] rounded-full opacity-[0.03] bg-[#90DAB8] blur-[80px]"
            animate={{
              opacity: ["0.03", "0.05", "0.03"],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 10, // Increased from 8 to 10 for less CPU usage
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />

          <motion.div
            className="absolute bottom-0 right-1/4 w-[35vw] h-[25vh] rounded-full opacity-[0.025] bg-[#90DAB8] blur-[100px]"
            animate={{
              opacity: ["0.025", "0.04", "0.025"],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 12, // Increased from 10 to 12 for less CPU usage
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </>
      )}

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay z-[-9]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  )
})
