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
          "relative h-6 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-800",
          className
        )}
      >
        <div className="relative h-full w-full rounded-full border border-black/10 shadow-[inset_0_0_1px_3px_rgba(255,255,255,0.75)] dark:shadow-[inset_0_0_1px_3px_rgba(255,255,255,0.15)]">
          {/* rainbow fill */}
          <div
            className="absolute inset-0 rounded-full transition-[clip-path] duration-1000 ease-out"
            style={{
              background: `linear-gradient(
                -90deg,
                violet,
                #b360ff,
                #8fd4ff,
                #e2ff73,
                yellow,
                orange,
                #ff437a
              )`,
              clipPath: `inset(0 ${100 - clampedValue}% 0 0)`,
            }}
          >
            {/* stripe overlay */}
            <div
              className="absolute inset-0 rounded-full opacity-75 mix-blend-overlay"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 10px,
                  black 10px,
                  black 20px
                )`,
              }}
            />
          </div>
          {/* glossy light bar */}
          <div
            className="pointer-events-none absolute left-1/2 top-[2px] h-[10px] w-[96%] -translate-x-1/2 rounded-[20px]"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(255,255,255,0.85) 30%,
                transparent 120%
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
