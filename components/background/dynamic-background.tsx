"use client"

import { Suspense, lazy, useState, useEffect, useRef } from "react"

// Dynamically import the CosmicBackground component
const CosmicBackground = lazy(() => import("./cosmic-background"))

export function DynamicBackground() {
  const [isClient, setIsClient] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only load on client-side after initial render
  useEffect(() => {
    setIsClient(true)

    // Use Intersection Observer to only load the background when it's visible
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true)
              observer.disconnect()
            }
          })
        },
        { rootMargin: "200px" }, // Load a bit before it comes into view
      )

      if (containerRef.current) {
        observer.observe(containerRef.current)
      }

      return () => observer.disconnect()
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsVisible(true)
    }
  }, [])

  // Simple placeholder while loading
  return (
    <div ref={containerRef} className="fixed inset-0 z-[-10] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030806] to-[#041007] z-[-12]" />

      {isClient && isVisible && (
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-[#030806] to-[#041007] z-[-12]" />}>
          <CosmicBackground />
        </Suspense>
      )}
    </div>
  )
}
