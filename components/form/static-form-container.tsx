// Server Component (no "use client" directive)
import type { ReactNode } from "react"
import { DynamicFormContent } from "./dynamic-form-content"
import { Footer } from "@/components/layout/footer"

interface StaticFormContainerProps {
  children: ReactNode
  totalSteps: number
  currentStep: number
}

export function StaticFormContainer({ children, totalSteps, currentStep }: StaticFormContainerProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background placeholder - will be replaced by client component */}
      <div className="fixed inset-0 z-[-10] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030806] to-[#041007] z-[-12]" />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:py-16 md:px-6 z-10">
        {/* Dynamic content will be hydrated separately */}
        <DynamicFormContent totalSteps={totalSteps} currentStep={currentStep}>
          {children}
        </DynamicFormContent>
      </div>

      {/* Add Footer component */}
      <Footer />
    </div>
  )
}
