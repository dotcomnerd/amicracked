import { create } from 'zustand'

interface PDFImage {
  page: number
  index: number
  base64: string
  width: number
  height: number
}

interface QuestionAnswer {
  questionIndex: number
  selectedAnswer: string
}

interface OnboardingState {
  currentStep: number
  resumeFile: File | null
  favoriteLanguage: string | null
  extractedText: string | null
  pdfScreenshot: string | null
  pdfImages: PDFImage[]
  questionAnswers: Record<number, string>
  setCurrentStep: (step: number) => void
  setResumeFile: (file: File | null) => void
  setFavoriteLanguage: (language: string) => void
  setExtractedText: (text: string | null) => void
  setPdfScreenshot: (screenshot: string | null) => void
  setPdfImages: (images: PDFImage[]) => void
  setQuestionAnswers: (answers: Record<number, string>) => void
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
  questionAnswers: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  setResumeFile: (file) => set({ resumeFile: file }),
  setFavoriteLanguage: (language) => set({ favoriteLanguage: language }),
  setExtractedText: (text) => set({ extractedText: text }),
  setPdfScreenshot: (screenshot) => set({ pdfScreenshot: screenshot }),
  setPdfImages: (images) => set({ pdfImages: images }),
  setQuestionAnswers: (answers) => set({ questionAnswers: answers }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}))
