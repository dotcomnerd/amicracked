import { create } from 'zustand'

interface PDFImage {
  page: number
  index: number
  base64: string
  width: number
  height: number
}

interface OnboardingState {
  currentStep: number
  resumeFile: File | null
  favoriteLanguage: string | null
  extractedText: string | null
  pdfScreenshot: string | null
  pdfImages: PDFImage[]
  setCurrentStep: (step: number) => void
  setResumeFile: (file: File | null) => void
  setFavoriteLanguage: (language: string) => void
  setExtractedText: (text: string | null) => void
  setPdfScreenshot: (screenshot: string | null) => void
  setPdfImages: (images: PDFImage[]) => void
  nextStep: () => void
  previousStep: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  resumeFile: null,
  favoriteLanguage: null,
  extractedText: null,
  pdfScreenshot: null,
  pdfImages: [],
  setCurrentStep: (step) => set({ currentStep: step }),
  setResumeFile: (file) => set({ resumeFile: file }),
  setFavoriteLanguage: (language) => set({ favoriteLanguage: language }),
  setExtractedText: (text) => set({ extractedText: text }),
  setPdfScreenshot: (screenshot) => set({ pdfScreenshot: screenshot }),
  setPdfImages: (images) => set({ pdfImages: images }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}))
