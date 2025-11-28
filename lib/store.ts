import { create } from 'zustand'

interface QuestionAnswer {
  questionIndex: number
  selectedAnswer: string
}

export interface Question {
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  code: {
    language: string
    src: string
  }
}

interface OnboardingState {
  currentStep: number
  resumeFile: File | null
  favoriteLanguage: string | null
  extractedText: string | null
  questionAnswers: Record<number, string>
  questions: Question[]
  setCurrentStep: (step: number) => void
  setResumeFile: (file: File | null) => void
  setFavoriteLanguage: (language: string) => void
  setExtractedText: (text: string | null) => void
  setQuestionAnswers: (answers: Record<number, string>) => void
  setQuestions: (questions: Question[]) => void
  nextStep: () => void
  previousStep: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  resumeFile: null,
  favoriteLanguage: null,
  extractedText: null,
  questionAnswers: {},
  questions: [],
  setCurrentStep: (step) => set({ currentStep: step }),
  setResumeFile: (file) => set({ resumeFile: file }),
  setFavoriteLanguage: (language) => set({ favoriteLanguage: language }),
  setExtractedText: (text) => set({ extractedText: text }),
  setQuestionAnswers: (answers) => set({ questionAnswers: answers }),
  setQuestions: (questions) => set({ questions }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}))
