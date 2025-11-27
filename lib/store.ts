import { create } from 'zustand'

interface OnboardingState {
  currentStep: number
  resumeFile: File | null
  favoriteLanguage: string | null
  extractedText: string | null
  setCurrentStep: (step: number) => void
  setResumeFile: (file: File | null) => void
  setFavoriteLanguage: (language: string) => void
  setExtractedText: (text: string | null) => void
  nextStep: () => void
  previousStep: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  resumeFile: null,
  favoriteLanguage: null,
  extractedText: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setResumeFile: (file) => set({ resumeFile: file }),
  setFavoriteLanguage: (language) => set({ favoriteLanguage: language }),
  setExtractedText: (text) => set({ extractedText: text }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}))
