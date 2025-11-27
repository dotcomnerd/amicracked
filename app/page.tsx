// Server Component (no "use client" directive)
import { MultiStepForm } from "@/components/form/multi-step-form"
import { Suspense } from "react"

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030806]"></div>}>
      <MultiStepForm />
    </Suspense>
  )
}
