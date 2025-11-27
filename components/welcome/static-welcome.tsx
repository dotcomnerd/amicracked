// Server Component (no "use client" directive)
import { WelcomeBentoClient } from "./welcome-bento-client"

interface StaticWelcomeProps {
  onStart: () => void
}

export function StaticWelcome({ onStart }: StaticWelcomeProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main container with proper sizing - pre-rendered */}
      <div className="relative z-10 overflow-hidden rounded-2xl">
        {/* Glass background with proper borders - pre-rendered */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border border-white/10" />

        {/* Subtle top highlight - pre-rendered */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Content container with proper padding - pre-rendered */}
        <div className="relative z-10 px-8 py-10 text-center">
          {/* Heading with controlled width to prevent wrapping - pre-rendered */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-white tracking-tight mb-5">
            Hello there!
          </h1>

          <p className="text-sm sm:text-base text-secondary-300/90 font-sans font-light mb-8">
            Answer a few questions to get started, Count Dooku.
          </p>

          {/* Client component for interactive button */}
          <WelcomeBentoClient onStart={onStart} />
        </div>
      </div>

      {/* Subtle glow effect - properly sized and positioned - pre-rendered */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 rounded-[inherit] blur-lg -z-10" />

      {/* Bottom reflection - properly sized and positioned - pre-rendered */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-primary-500/10 blur-xl rounded-full -z-10" />
    </div>
  )
}
