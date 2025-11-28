"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RainbowProgressProps {
  value?: number
  className?: string
}

const RainbowProgress = React.forwardRef<HTMLDivElement, RainbowProgressProps>(
  ({ value = 0, className }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-lg bg-muted shadow-inner border border-border/50",
          className
        )}
      >
        <div className="relative h-full w-full rounded-lg">
          {/* rainbow fill */}
          <div
            className="absolute inset-0 rounded-lg transition-[clip-path] duration-700 ease-out"
            style={{
              background: `linear-gradient(
                90deg,
                #ff437a,
                orange,
                yellow,
                #e2ff73,
                #8fd4ff,
                #b360ff,
                violet
              )`,
              clipPath: `inset(0 ${100 - clampedValue}% 0 0)`,
            }}
          >
            {/* stripe overlay */}
            <div
              className="absolute inset-0 rounded-lg opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 6px,
                  rgba(0,0,0,0.4) 6px,
                  rgba(0,0,0,0.4) 12px
                )`,
              }}
            />
          </div>
          {/* glossy light bar */}
          <div
            className="pointer-events-none absolute left-1 right-1 top-[2px] h-[6px] rounded-md"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(255,255,255,0.5) 0%,
                rgba(255,255,255,0.1) 100%
              )`,
            }}
          />
        </div>
      </div>
    )
  }
)

RainbowProgress.displayName = "RainbowProgress"

export { RainbowProgress }
