'use client'

import { ModeToggle } from '@/components/mode-toggle'
import { Questions } from '@/components/questions'
import { ResumePreview } from '@/components/resume-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ui/chain-of-thought'
import { ColourfulText } from '@/components/ui/colorful-text'
import { RainbowProgress } from '@/components/ui/rainbow-progress'
import { SandboxCodeEditor, SandboxLayout, SandboxPreview, SandboxProvider, SandboxTabs, SandboxTabsContent, SandboxTabsList, SandboxTabsTrigger } from '@/components/ui/sandbox'
import { allBrands } from '@/lib/brands'
import Grid, { type ItemConfig } from '@/lib/grid'
import {
  calculateFormulaBasedScore,
} from '@/lib/scoring'
import type { Question } from '@/lib/store'
import { useAudioStore, useOnboardingStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useSandpack } from '@codesandbox/sandpack-react'
import confetti from 'canvas-confetti'
import { CheckCircle2, Code2, Loader2, Pause, Play, Repeat, Sparkles, Timer, Volume2, VolumeX, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import React, { useCallback, useMemo, useRef, useState } from 'react'

const TOTAL_STEPS = 5

const GridCell = ({ gridIndex }: ItemConfig) => {
  const brand = allBrands[gridIndex % allBrands.length]
  const colors = [
    'bg-card/20 border-border/30',
    'bg-muted/20 border-border/30',
    'bg-accent/20 border-border/30',
    'bg-secondary/20 border-border/30',
    'bg-card/30 border-border/40',
    'bg-muted/30 border-border/40',
    'bg-accent/30 border-border/40',
    'bg-secondary/30 border-border/40',
  ]

  const colorClass = colors[gridIndex % colors.length]

  return (
    <div
      className={`absolute inset-1 flex items-center justify-center dark:brightness-50 brightness-100 ${colorClass} border rounded-lg`}
    >
      <img
        src={brand.url}
        alt={brand.name}
        className="w-12 h-12 object-contain"
        draggable={false}
      />
    </div>
  )
}

const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Ruby',
  'PHP',
  'Other',
]

const calculateCrackedScore = (
  favoriteLanguage: string | null,
  secondFavoriteLanguage: string | null,
  codeChallengeTime: number | null,
  questionAnswers: Record<number, string>,
  questions: Question[],
  resumeScore: number = 0,
  codeChallengeGaveUp: boolean = false
): number => {
  // count correct answers
  let correctCount = 0
  if (questions.length > 0) {
    questions.forEach((q, idx) => {
      if (questionAnswers[idx] === q.correctAnswer) {
        correctCount++
      }
    })
  }

  return calculateFormulaBasedScore(
    favoriteLanguage,
    secondFavoriteLanguage,
    codeChallengeTime,
    correctCount,
    questions.length,
    resumeScore,
    codeChallengeGaveUp
  )
}

const DEFAULT_CODE = `import React from 'react';

export default function App() {
  const status = 'loading';
  let message = '';

  switch (status) {
    case 'loading':
      message = 'Loading...';
    case 'ready':
      message = 'Ready';
    case 'error':
      message = 'Error occurred';
      break;
    default:
      message = 'Unknown status';
  }

  return (
    <div style={{
      display: 'grid',
      placeItems: 'center',
      height: '80vh',
    }}>
      <h1>{message}</h1>
    </div>
  );
}
`

const CodeEditor = ({ onCodeValidChange, isValid, onBadgeRef, timerStartTime, onTimeUpdate, hasSkipped }: { onCodeValidChange: (isValid: boolean) => void; isValid: boolean; onBadgeRef: (ref: HTMLSpanElement | null) => void; timerStartTime: number | null; onTimeUpdate: (time: number) => void; hasSkipped: boolean }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const badgeRef = useRef<HTMLSpanElement>(null)
  const sandboxFiles = useMemo(() => ({
    '/App.tsx': {
      code: DEFAULT_CODE,
      readOnly: false,
    },
  }), [])

  React.useEffect(() => {
    if (badgeRef.current) {
      onBadgeRef(badgeRef.current)
    }
  }, [onBadgeRef])

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Fix the bug(s) in the code to continue! </h3>
          </div>
          {isValid ? (
            <Badge
              ref={badgeRef}
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white border-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              AC
            </Badge>
          ) : (
            <Badge
              ref={badgeRef}
              variant="destructive"
            >
              <XCircle className="h-3 w-3" />
              NA
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {hasSkipped ? "There's no skipping this one...you want to know if you're cracked, right?" : "It's just JavaScript, should be easy"}
        </p>
      </div>
      <div className="rounded-xl overflow-hidden border-2 border-border/50 bg-card shadow-sm" style={{ height: '420px' }}>
        <SandboxProvider
          template="react-ts"
          files={sandboxFiles}
          options={{
            activeFile: '/App.tsx',
            visibleFiles: ['/App.tsx'],
            autoReload: true,
            recompileMode: 'immediate',
            recompileDelay: 100,
          }}
          theme={isDark ? 'dark' : 'light'}
        >
          <CodeEditorContent onCodeValidChange={onCodeValidChange} timerStartTime={timerStartTime} onTimeUpdate={onTimeUpdate} isValid={isValid} />
        </SandboxProvider>
      </div>
    </div>
  )
}

const CodeEditorContent = ({ onCodeValidChange, timerStartTime, onTimeUpdate, isValid }: { onCodeValidChange: (isValid: boolean) => void; timerStartTime: number | null; onTimeUpdate: (time: number) => void; isValid: boolean }) => {
  const { sandpack } = useSandpack()
  const files = sandpack.files || {}
  const appCode = files['/App.tsx']?.code || ''
  const [elapsedTime, setElapsedTime] = useState(0)

  React.useEffect(() => {
    if (timerStartTime === null) {
      setElapsedTime(0)
      return
    }

    if (isValid) {
      const finalTime = Math.floor((Date.now() - timerStartTime) / 1000)
      setElapsedTime(finalTime)
      onTimeUpdate(finalTime)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartTime) / 1000)
      setElapsedTime(elapsed)
      onTimeUpdate(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [timerStartTime, isValid, onTimeUpdate])

  React.useEffect(() => {
    const hasCompilationError = !!sandpack.error

    const loadingCaseIndex = appCode.indexOf("case 'loading':")
    const readyCaseIndex = appCode.indexOf("case 'ready':")
    const errorCaseIndex = appCode.indexOf("case 'error':")

    let hasLoadingBreak = false
    let hasReadyBreak = false

    if (loadingCaseIndex !== -1 && readyCaseIndex !== -1) {
      const loadingSection = appCode.substring(loadingCaseIndex, readyCaseIndex)
      hasLoadingBreak = /\bbreak\s*;?/.test(loadingSection)
    }

    if (readyCaseIndex !== -1 && errorCaseIndex !== -1) {
      const readySection = appCode.substring(readyCaseIndex, errorCaseIndex)
      hasReadyBreak = /\bbreak\s*;?/.test(readySection)
    }

    const isValid = !hasCompilationError && hasLoadingBreak && hasReadyBreak && appCode.length > 0
    onCodeValidChange(isValid)
  }, [appCode, sandpack.error, onCodeValidChange])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <SandboxLayout>
      <SandboxTabs defaultValue="code">
        <SandboxTabsList>
          <div className="flex items-center gap-2 flex-1">
            <SandboxTabsTrigger value="code">
              <Code2 className="h-3.5 w-3.5" />
              Code
            </SandboxTabsTrigger>
            <SandboxTabsTrigger value="preview">
              <Sparkles className="h-3.5 w-3.5" />
              Preview
            </SandboxTabsTrigger>
          </div>
          {timerStartTime !== null && (
            <div className="flex items-center gap-1.5 px-2 text-sm font-mono">
              <Timer className="h-3.5 w-3.5" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )}
        </SandboxTabsList>
        <SandboxTabsContent value="code" className="h-[360px]">
          <SandboxCodeEditor showLineNumbers wrapContent />
        </SandboxTabsContent>
        <SandboxTabsContent value="preview" className="h-[360px]">
          <SandboxPreview />
        </SandboxTabsContent>
      </SandboxTabs>
    </SandboxLayout>
  )
}

const getCrackedStatus = (score: number): string => {
  if (score >= 98) return 'Legendary 10x Engineer God'
  if (score >= 95) return 'True Wizard'
  if (score >= 92) return 'Mythic Engineer'
  if (score >= 89) return 'Cracked Beyond Repair'
  if (score >= 74) return 'Interviewer\'s Nightmare'
  if (score >= 71) return 'Blazing Senior'
  if (score >= 62) return 'Meme Legend'
  if (score >= 50) return 'Veteran Engineer'
  if (score >= 44) return 'Functionally Sound'
  if (score >= 35) return 'Methodical Debugger'
  if (score >= 32) return '“Just Ship-It” Beginner'
  if (score >= 29) return 'Not Quite Cracked'
  if (score >= 15) return 'An Earnest Amateur'
  if (score >= 2) return 'Just Here For The Memes'
  if (score >= 1) return 'Pressed a Button'
  if (score > 0) return 'Barely Tried'
  return 'Didn\'t Even Try'
}

export default function Home() {
  const {
    currentStep,
    resumeFile,
    favoriteLanguage,
    secondFavoriteLanguage,
    extractedText,
    questionAnswers,
    questions,
    setResumeFile,
    setFavoriteLanguage,
    setSecondFavoriteLanguage,
    setExtractedText,
    setQuestionAnswers,
    setQuestions,
    setCurrentStep,
    nextStep,
    previousStep
  } = useOnboardingStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const badgeRef = useRef<HTMLSpanElement | null>(null)
  const { isPlaying, isMuted, isLoopEnabled, toggle, toggleMute, toggleLoop } = useAudioStore()

  const handleToggleMute = () => {
    toggleMute()
  }

  const handleTogglePause = async () => {
    await toggle()
  }

  const handleToggleLoop = () => {
    toggleLoop()
  }
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCodeValid, setIsCodeValid] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [codeChallengeTime, setCodeChallengeTime] = useState<number | null>(null)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [resumeScore, setResumeScore] = useState<number>(0)
  const [isEvaluatingResume, setIsEvaluatingResume] = useState(false)
  const [codeChallengeGaveUp, setCodeChallengeGaveUp] = useState(false)
  const [hasSkipped, setHasSkipped] = useState(false)

  const handleBadgeRef = useCallback((ref: HTMLSpanElement | null) => {
    badgeRef.current = ref
  }, [])

  const handleQuestionsLoaded = useCallback((loadedQuestions: Question[]) => {
    setQuestions(loadedQuestions)
  }, [])


  React.useEffect(() => {
    if (currentStep === 4) {
      setIsCodeValid(false)
      setCodeChallengeGaveUp(false)
      if (timerStartTime === null) {
        setTimerStartTime(Date.now())
      }
      setCodeChallengeTime(null)
    } else if (currentStep !== 4 && timerStartTime !== null) {
      setTimerStartTime(null)
      setCodeChallengeTime(null)
    }
  }, [currentStep, timerStartTime])

  React.useEffect(() => {
    if (currentStep === 5 && score === null && !isGrading) {
      const hasResume = !!extractedText || resumeScore > 0
      const completedCodingChallenge = !codeChallengeGaveUp && codeChallengeTime !== null
      const hasQuestions = questions.length > 0

      // special case: only selected favorite language (no resume, gave up on coding challenge, no questions)
      const onlySelectedFavoriteLanguage = favoriteLanguage !== null &&
        secondFavoriteLanguage === null &&
        codeChallengeGaveUp &&
        !hasResume &&
        !hasQuestions

      // special case: only coding challenge (no languages, no resume, no questions, but completed challenge)
      const onlyCodingChallenge = favoriteLanguage === null &&
        secondFavoriteLanguage === null &&
        completedCodingChallenge &&
        !hasResume &&
        !hasQuestions

      // skip API call for special case: only selected favorite language (they get 6.9%)
      if (onlySelectedFavoriteLanguage) {
        setScore(calculateCrackedScore(favoriteLanguage, secondFavoriteLanguage, codeChallengeTime, questionAnswers, questions, resumeScore, codeChallengeGaveUp))
        return
      }

      // skip API call for special case: only coding challenge (they get 67%)
      if (onlyCodingChallenge) {
        setScore(67)
        return
      }

      // skip API call if they only selected languages (no resume, gave up on coding challenge)
      if (!hasResume && !completedCodingChallenge) {
        setScore(calculateCrackedScore(favoriteLanguage, secondFavoriteLanguage, codeChallengeTime, questionAnswers, questions, resumeScore, codeChallengeGaveUp))
        return
      }

      setIsGrading(true)
      const gradeUser = async () => {
        try {
          const response = await fetch('/api/grade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              favoriteLanguage,
              secondFavoriteLanguage,
              questionAnswers,
              questions,
              codeChallengeTime,
              resumeScore,
              codeChallengeGaveUp,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to grade')
          }

          const data = await response.json()
          if (data.success) {
            setScore(data.score)
          }
        } catch (error) {
          console.error('Error grading:', error)
          setScore(calculateCrackedScore(favoriteLanguage, secondFavoriteLanguage, codeChallengeTime, questionAnswers, questions, resumeScore, codeChallengeGaveUp))
        } finally {
          setIsGrading(false)
        }
      }
      gradeUser()
    }
  }, [currentStep, score, isGrading, favoriteLanguage, secondFavoriteLanguage, questionAnswers, questions, codeChallengeTime, resumeScore, codeChallengeGaveUp, extractedText])

  React.useEffect(() => {
    if (score !== null && !isGrading && currentStep === 5) {
      const end = Date.now() + 5 * 1000
      const colors = ['#83B320', '#2FC36A', '#2AA9D2', '#0470CA', '#6B0AFF', '#B700DA', '#DA00AB', '#E6405C', '#E8623F', '#F9812F', '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']

      const frame = () => {
        const randomColor1 = colors[Math.floor(Math.random() * colors.length)]
        const randomColor2 = colors[Math.floor(Math.random() * colors.length)]

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [randomColor1],
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [randomColor2],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    }
  }, [score, isGrading, currentStep])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const processPDF = async (file: File) => {
    if (!file.type.includes('pdf')) {
      return
    }

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process PDF')
      }

      const data = await response.json()
      if (data.success) {
        if (data.full_text) {
          setExtractedText(data.full_text)
          // evaluate resume prestige in the background
          evaluateResume(data.full_text)
        }
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      setExtractedText(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const evaluateResume = async (text: string) => {
    setIsEvaluatingResume(true)
    try {
      const response = await fetch('/api/resume-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extractedText: text }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && typeof data.score === 'number') {
          setResumeScore(data.score)
        }
      }
    } catch (error) {
      console.error('Error evaluating resume:', error)
    } finally {
      setIsEvaluatingResume(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setResumeFile(file)
      processPDF(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setResumeFile(file)
      processPDF(file)
    }
  }

  const handleSkip = () => {
    setHasSkipped(true)
    setResumeFile(null)
    setExtractedText(null)
    setResumeScore(0)
    setCurrentStep(extractedText ? 3 : 2)
  }

  const handleSkipLanguage = () => {
    setHasSkipped(true)
    if (currentStep === 2 && !extractedText) {
      setFavoriteLanguage(null)
      nextStep()
    } else if (currentStep === 3 && !favoriteLanguage) {
      setFavoriteLanguage(null)
      nextStep()
    } else if (currentStep === 3 && favoriteLanguage) {
      setSecondFavoriteLanguage(null)
      nextStep()
    }
  }

  const handleSkipQuestions = () => {
    setHasSkipped(true)
    setQuestionAnswers({})
    nextStep()
  }

  const handleNextStep = () => {
    if (currentStep === 2 && !extractedText) {
      setCurrentStep(3)
    } else {
      nextStep()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep === 3 && extractedText) {
      setCurrentStep(2)
    } else {
      previousStep()
    }
  }

  const progress = (currentStep / TOTAL_STEPS) * 100
  const finalScore = score ?? calculateCrackedScore(favoriteLanguage, secondFavoriteLanguage, codeChallengeTime, questionAnswers, questions, resumeScore, codeChallengeGaveUp)
  const status = getCrackedStatus(finalScore)

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-background to-muted/20">
        <Grid gridSize={120} renderItem={GridCell} />
      </div>
      <header className="fixed top-0 left-0 right-0 z-[99999] flex items-center justify-between px-4 py-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/" className="font-semibold tracking-widest text-primary/50 hover:text-primary cursor-pointer"><ColourfulText text="amicracked.com" /></Link>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleToggleLoop}
            onKeyDown={(e) => e.key === 'Enter' && handleToggleLoop()}
            tabIndex={0}
            aria-label={isLoopEnabled ? 'Disable audio loop' : 'Enable audio loop'}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isLoopEnabled
                ? 'bg-primary/20 hover:bg-primary/30 text-primary'
                : 'bg-secondary/80 hover:bg-secondary'
            )}
          >
            <Repeat className="h-4 w-4" />
          </button>
          <button
            onClick={handleTogglePause}
            onKeyDown={(e) => e.key === 'Enter' && handleTogglePause()}
            tabIndex={0}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={handleToggleMute}
            onKeyDown={(e) => e.key === 'Enter' && handleToggleMute()}
            tabIndex={0}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-4 pt-20">
        <Card variant="glass" className="w-full max-w-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl tracking-tight">Am I Cracked?</CardTitle>
                <CardDescription>
                  Step {currentStep} of {TOTAL_STEPS}
                </CardDescription>
              </div>
              <div className="text-3xl font-bold text-primary/20">
                {String(currentStep).padStart(2, '0')}
              </div>
            </div>
            <RainbowProgress value={progress} className="mt-4 h-4" />
          </CardHeader>

          <CardContent className="space-y-3 overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-4">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {resumeFile ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium">{resumeFile.name}</p>
                          {isProcessing && (
                            <p className="text-xs text-muted-foreground">Processing PDF...</p>
                          )}
                          <ResumePreview file={resumeFile} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setResumeFile(null)
                              setExtractedText(null)
                              setResumeScore(0)
                              fileInputRef.current?.click()
                            }}
                            disabled={isProcessing}
                          >
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                              Upload your resume to (maybe) boost your score.
                          </p>
                          <Button
                            variant="outline"
                            className="text-sm px-3 py-2 h-auto"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Select File
                        </Button>

                        <p className="text-sm text-muted-foreground">
                              Note: Your data is <span className="text-primary underline">not stored on my servers</span>.
                              <br />
                              <span className='text-[10px] text-muted-foreground'>OpenAI is the one who sees your data.</span>
                        </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            {currentStep === 2 && extractedText && (
                <motion.div
                  key="step-2-questions"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Trivia Time</h3>
                      <p className="text-sm text-muted-foreground">
                        Let's see what ya got.
                      </p>
                    </div>
                    <Questions
                      resumeText={extractedText}
                      onComplete={(answers) => {
                        setQuestionAnswers(answers)
                      }}
                      onQuestionsLoaded={handleQuestionsLoaded}
                    />
                  </div>
                </motion.div>
            )}

            {currentStep === 2 && !extractedText && (
                <motion.div
                  key="step-2-language"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <div className="col-span-full">
                        <h3 className="text-lg font-semibold">What's your favorite programming language?</h3>
                      </div>
                      {PROGRAMMING_LANGUAGES.map((language) => (
                        <Button
                          key={language}
                          variant={favoriteLanguage === language ? 'default' : 'outline'}
                          onClick={() => setFavoriteLanguage(language)}
                          className="h-auto py-3"
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && !favoriteLanguage && (
                <motion.div
                  key="step-3-first-language"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <div className="col-span-full">
                        <h3 className="text-lg font-semibold">What's your favorite programming language?</h3>
                      </div>
                      {PROGRAMMING_LANGUAGES.map((language) => (
                        <Button
                          key={language}
                          variant={favoriteLanguage === language ? 'default' : 'outline'}
                          onClick={() => setFavoriteLanguage(language)}
                          className="h-auto py-3"
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
            )}

              {currentStep === 3 && favoriteLanguage && (
                <motion.div
                  key="step-3-second-language"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <div className="col-span-full">
                        <h3 className="text-lg font-semibold">What's your second favorite programming language?</h3>
                      </div>
                      {PROGRAMMING_LANGUAGES.map((language) => (
                        <Button
                          key={language}
                          variant={secondFavoriteLanguage === language ? 'default' : 'outline'}
                          onClick={() => setSecondFavoriteLanguage(language)}
                          className="h-auto py-3"
                          disabled={language === favoriteLanguage}
                        >
                          {language}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
            )}

            {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <CodeEditor
                    onCodeValidChange={setIsCodeValid}
                    isValid={isCodeValid}
                    onBadgeRef={handleBadgeRef}
                    timerStartTime={timerStartTime}
                    onTimeUpdate={(time) => {
                      if (isCodeValid && codeChallengeTime === null) {
                        setCodeChallengeTime(time)
                      }
                    }}
                    hasSkipped={hasSkipped}
                  />
                </motion.div>
            )}

            {currentStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="space-y-6 text-center py-8">
                    {isGrading ? (
                      <Card variant="glass">
                        <CardContent className="pt-6">
                          <ChainOfThought defaultOpen>
                            <ChainOfThoughtHeader>
                              Calculating your cracked score
                            </ChainOfThoughtHeader>
                            <ChainOfThoughtContent>
                              <ChainOfThoughtStep
                                icon={<Loader2 className="size-4" />}
                                label="Analyzing your performance..."
                                description="Evaluating all things you've done so far, making sure you're not a crackpot"
                                status="active"
                                animateIcon
                              />
                            </ChainOfThoughtContent>
                          </ChainOfThought>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                      <div className="space-y-2">
                            <h3 className="text-2xl font-semibold">You are a</h3>
                        <div className="text-4xl font-bold text-primary"><ColourfulText text={status} /></div>
                        <div className="text-5xl font-bold"><ColourfulText text={`${finalScore}%`} /></div>
                        <div className="text-xs text-muted-foreground">Note: this is just a joke and is not to be taken seriously.</div>
                      </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
              onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <div className="flex gap-2">
              {currentStep === 1 && (
                <Button
                  variant="outline"
                  className="text-sm px-3 py-2 h-auto"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              )}
                {(currentStep === 2 && extractedText) && (
                  <Button
                    variant="outline"
                    className="text-sm px-3 py-2 h-auto"
                    onClick={handleSkipQuestions}
                  >
                    Skip
                  </Button>
                )}
                {((currentStep === 2 && !extractedText) || (currentStep === 3 && !favoriteLanguage) || (currentStep === 3 && favoriteLanguage)) && (
                  <Button
                    variant="outline"
                    className="text-sm px-3 py-2 h-auto"
                    onClick={handleSkipLanguage}
                  >
                    Skip
                  </Button>
                )}
              <Button
                  variant="outline"
                  className="text-sm px-3 py-2 h-auto"
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 2 && extractedText && Object.keys(questionAnswers).length !== 3) ||
                    (currentStep === 2 && !extractedText && !favoriteLanguage) ||
                    (currentStep === 3 && !favoriteLanguage) ||
                    (currentStep === 3 && favoriteLanguage && !secondFavoriteLanguage) ||
                    (currentStep === 4 && !isCodeValid)
                  }
              >
                Next
              </Button>
            </div>
          ) : (
            <Button
                  variant="outline"
                  className="text-sm px-3 py-2 h-auto"
                  onClick={() => {
                    setScore(null)
                    setIsGrading(false)
                    setCodeChallengeGaveUp(false)
                    setHasSkipped(false)
                    useOnboardingStore.getState().setCurrentStep(1)
                  }}
            >
              Start Over
            </Button>
          )}
        </CardFooter>
      </Card>
      </main>
    </div>
  )
}
