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
  secondFavoriteLanguage: string | null
  extractedText: string | null
  questionAnswers: Record<number, string>
  questions: Question[]
  setCurrentStep: (step: number) => void
  setResumeFile: (file: File | null) => void
  setFavoriteLanguage: (language: string | null) => void
  setSecondFavoriteLanguage: (language: string | null) => void
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
  secondFavoriteLanguage: null,
  extractedText: null,
  questionAnswers: {},
  questions: [],
  setCurrentStep: (step) => set({ currentStep: step }),
  setResumeFile: (file) => set({ resumeFile: file }),
  setFavoriteLanguage: (language) => set({ favoriteLanguage: language }),
  setSecondFavoriteLanguage: (language) => set({ secondFavoriteLanguage: language }),
  setExtractedText: (text) => set({ extractedText: text }),
  setQuestionAnswers: (answers) => set({ questionAnswers: answers }),
  setQuestions: (questions) => set({ questions }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
}))

const LOOP_START = 0
const LOOP_END = 25
const VOLUME = 1
const FADE_OUT_DURATION = 6 // note for dcm: seconds before loop end to start fading
let audioContext: AudioContext | null = null
let audioBuffer: AudioBuffer | null = null
let sourceNode: AudioBufferSourceNode | null = null
let gainNode: GainNode | null = null
let isInitialized = false
let isAudioPlaying = false
let fadeInterval: number | null = null
let playbackStartTime: number = 0
let currentIsLoopEnabled = false

const initAudio = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Audio can only be accessed in browser')
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  if (!audioBuffer && !isInitialized) {
    isInitialized = true
    try {
      const response = await fetch('/sample.mov')
      const arrayBuffer = await response.arrayBuffer()
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    } catch (error) {
      console.error('Failed to load audio:', error)
      isInitialized = false
      throw error
    }
  }
}

let currentIsMuted = false

const updateFadeVolume = () => {
  if (!gainNode || !playbackStartTime || currentIsMuted) return

  const now = performance.now()
  const elapsed = (now - playbackStartTime) / 1000

  const loopDuration = LOOP_END - LOOP_START

  if (!currentIsLoopEnabled) {
    const remaining = loopDuration - elapsed

    if (remaining <= 0) {
      stopAudio()
      return
    }

    if (remaining <= FADE_OUT_DURATION) {
      const fadeProgress = (FADE_OUT_DURATION - remaining) / FADE_OUT_DURATION
      const volumeMultiplier = 1 - fadeProgress
      gainNode.gain.value = volumeMultiplier * VOLUME
    } else {
      gainNode.gain.value = VOLUME
    }

    return
  }

  const positionInLoop = elapsed % loopDuration

  const fadeStartPoint = loopDuration - FADE_OUT_DURATION

  if (positionInLoop >= fadeStartPoint) {
    const fadeProgress = (positionInLoop - fadeStartPoint) / FADE_OUT_DURATION
    const volumeMultiplier = 1 - fadeProgress
    gainNode.gain.value = volumeMultiplier * VOLUME
  } else {
    gainNode.gain.value = VOLUME
  }
}

const startAudio = () => {
  if (!audioContext || !audioBuffer) return

  if (sourceNode) {
    try {
      sourceNode.stop()
      sourceNode.disconnect()
    } catch (e) { }
  }

  if (fadeInterval) {
    clearInterval(fadeInterval)
    fadeInterval = null
  }

  sourceNode = audioContext.createBufferSource()
  sourceNode.buffer = audioBuffer

  if (!gainNode) {
    gainNode = audioContext.createGain()
    gainNode.gain.value = VOLUME
    gainNode.connect(audioContext.destination)
  }

  sourceNode.connect(gainNode)

  playbackStartTime = performance.now()

  if (currentIsLoopEnabled) {
    sourceNode.loop = true
    sourceNode.loopStart = LOOP_START
    sourceNode.loopEnd = LOOP_END
    sourceNode.start(0, LOOP_START)
  } else {
    const clipDuration = LOOP_END - LOOP_START
    sourceNode.loop = false
    sourceNode.start(0, LOOP_START, clipDuration)
  }

  isAudioPlaying = true

  fadeInterval = window.setInterval(() => {
    updateFadeVolume()
  }, 50)
}

const stopAudio = () => {
  if (sourceNode && isAudioPlaying) {
    try {
      sourceNode.stop()
      sourceNode.disconnect()
    } catch (e) { }
    sourceNode = null
    isAudioPlaying = false
  }

  if (fadeInterval) {
    clearInterval(fadeInterval)
    fadeInterval = null
  }

  playbackStartTime = 0

  if (gainNode && !currentIsMuted) {
    gainNode.gain.value = VOLUME
  }
}

interface AudioState {
  isPlaying: boolean
  isMuted: boolean
  isLoopEnabled: boolean
  play: () => Promise<void>
  pause: () => void
  toggle: () => Promise<void>
  toggleMute: () => void
  toggleLoop: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  isMuted: false,
  isLoopEnabled: false,

  play: async () => {
    try {
      await initAudio()

      if (audioContext?.state === 'suspended') {
        await audioContext.resume()
      }

      startAudio()
      set({ isPlaying: true })
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  },

  pause: () => {
    stopAudio()
    set({ isPlaying: false })
  },

  toggle: async () => {
    const { isPlaying } = get()
    if (isPlaying) {
      stopAudio()
      set({ isPlaying: false })
    } else {
      try {
        await initAudio()

        if (audioContext?.state === 'suspended') {
          await audioContext.resume()
        }

        startAudio()
        set({ isPlaying: true })
      } catch (error) {
        console.error('Failed to toggle audio:', error)
      }
    }
  },

  toggleMute: () => {
    const { isMuted } = get()
    const newMuteState = !isMuted
    set({ isMuted: newMuteState })
    currentIsMuted = newMuteState

    if (gainNode) {
      if (newMuteState) {
        gainNode.gain.value = 0
      } else {
        updateFadeVolume()
      }
    }
  },

  toggleLoop: () => {
    const { isLoopEnabled } = get()
    const newLoopState = !isLoopEnabled
    set({ isLoopEnabled: newLoopState })
    currentIsLoopEnabled = newLoopState
  },
}))

// special audio player for 67% score achievement
export const playSixSevenAudio = async (): Promise<void> => {
  if (typeof window === 'undefined') return

  try {
    const audio = new Audio('/6-7.mp3')
    audio.volume = 1
    await audio.play()
  } catch (error) {
    console.error('Failed to play 6-7 audio:', error)
  }
}
