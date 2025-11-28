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
import { Progress } from '@/components/ui/progress'
import { SandboxCodeEditor, SandboxLayout, SandboxPreview, SandboxProvider, SandboxTabs, SandboxTabsContent, SandboxTabsList, SandboxTabsTrigger } from '@/components/ui/sandbox'
import type { Question } from '@/lib/store'
import { useOnboardingStore } from '@/lib/store'
import { useSandpack } from '@codesandbox/sandpack-react'
import { CheckCircle2, Code2, Loader2, Sparkles, XCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Confetti from 'react-confetti'

const TOTAL_STEPS = 5

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
  hasResume: boolean,
  language: string | null,
  questionAnswers: Record<number, string>,
  hasExtractedText: boolean
): number => {
  let score = 0

  score += 40

  if (hasResume) {
    score += 20
  }

  if (language) {
    score += 10
  }

  if (hasExtractedText && Object.keys(questionAnswers).length === 3) {
    score += 30
  }

  return Math.min(score, 100)
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

const CodeEditor = ({ onCodeValidChange, isValid, onBadgeRef }: { onCodeValidChange: (isValid: boolean) => void; isValid: boolean; onBadgeRef: (ref: HTMLSpanElement | null) => void }) => {
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
            <Code2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Debugging</h3>
          </div>
          {isValid ? (
            <Badge
              ref={badgeRef}
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white border-green-600"
            >
              <CheckCircle2 className="h-3 w-3" />
              Nice work! Continue on to the next question.
            </Badge>
          ) : (
            <Badge
              ref={badgeRef}
              variant="destructive"
            >
              <XCircle className="h-3 w-3" />
              Keep trying!
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Fix the bug in the code to continue ;)
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
          <CodeEditorContent onCodeValidChange={onCodeValidChange} />
        </SandboxProvider>
      </div>
    </div>
  )
}

const CodeEditorContent = ({ onCodeValidChange }: { onCodeValidChange: (isValid: boolean) => void }) => {
  const { sandpack } = useSandpack()
  const files = sandpack.files || {}
  const appCode = files['/App.tsx']?.code || ''

  React.useEffect(() => {
    const hasCompilationError = !!sandpack.error

    const loadingCaseIndex = appCode.indexOf("case 'loading':")
    const readyCaseIndex = appCode.indexOf("case 'ready':")
    const errorCaseIndex = appCode.indexOf("case 'error':")

    let hasLoadingBreak = false
    let hasReadyBreak = false

    if (loadingCaseIndex !== -1 && readyCaseIndex !== -1) {
      const loadingSection = appCode.substring(loadingCaseIndex, readyCaseIndex)
      hasLoadingBreak = loadingSection.includes('break;')
    }

    if (readyCaseIndex !== -1 && errorCaseIndex !== -1) {
      const readySection = appCode.substring(readyCaseIndex, errorCaseIndex)
      hasReadyBreak = readySection.includes('break;')
    }

    const isValid = !hasCompilationError && hasLoadingBreak && hasReadyBreak && appCode.length > 0
    onCodeValidChange(isValid)
  }, [appCode, sandpack.error, onCodeValidChange])

  return (
    <SandboxLayout>
      <SandboxTabs defaultValue="code">
        <SandboxTabsList>
          <SandboxTabsTrigger value="code">
            <Code2 className="h-3.5 w-3.5" />
            Code
          </SandboxTabsTrigger>
          <SandboxTabsTrigger value="preview">
            <Sparkles className="h-3.5 w-3.5" />
            Preview
          </SandboxTabsTrigger>
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
  if (score >= 86) return 'Savant Tier Engineer'
  if (score >= 83) return 'Super Cracked'
  if (score >= 80) return 'Extremely Cracked'
  if (score >= 77) return 'Notoriously Cracked'
  if (score >= 74) return 'Interviewer\'s Nightmare'
  if (score >= 71) return 'Blazing Senior'
  if (score >= 68) return 'Commit Genius'
  if (score >= 65) return 'Syntax Maestro'
  if (score >= 62) return 'Framework Whisperer'
  if (score >= 59) return 'Very Cracked'
  if (score >= 56) return 'Dependabot Supreme'
  if (score >= 53) return 'Merge Master'
  if (score >= 50) return 'Solid PR Author'
  if (score >= 47) return 'Bug Squasher'
  if (score >= 44) return 'Functionally Sound'
  if (score >= 41) return 'Moderately Cracked'
  if (score >= 38) return 'Reliable Contributor'
  if (score >= 35) return 'Methodical Debugger'
  if (score >= 32) return 'Ship-It Beginner'
  if (score >= 29) return 'Somewhat Cracked'
  if (score >= 26) return 'Needs More Coffee'
  if (score >= 23) return 'Syntax Survivor'
  if (score >= 20) return 'Stack Overflow Explorer'
  if (score >= 17) return 'Junior Enthusiast'
  if (score >= 14) return 'Learning Looper'
  if (score >= 11) return 'Tutorial Follower'
  if (score >= 8) return 'Bootcamp Grad'
  if (score >= 5) return 'Wrote Some Code'
  if (score >= 2) return 'Just Here For The Memes'
  if (score === 1) return 'Pressed a Button'
  return 'Not Very Cracked'
}

export default function Home() {
  const {
    currentStep,
    resumeFile,
    favoriteLanguage,
    extractedText,
    pdfScreenshot,
    pdfImages,
    questionAnswers,
    questions,
    setResumeFile,
    setFavoriteLanguage,
    setExtractedText,
    setPdfScreenshot,
    setPdfImages,
    setQuestionAnswers,
    setQuestions,
    setCurrentStep,
    nextStep,
    previousStep
  } = useOnboardingStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const badgeRef = useRef<HTMLSpanElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCodeValid, setIsCodeValid] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiSource, setConfettiSource] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [score, setScore] = useState<number | null>(null)
  const [isGrading, setIsGrading] = useState(false)

  const handleBadgeRef = useCallback((ref: HTMLSpanElement | null) => {
    badgeRef.current = ref
  }, [])

  const handleQuestionsLoaded = useCallback((loadedQuestions: Question[]) => {
    setQuestions(loadedQuestions)
  }, [])

  React.useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  React.useEffect(() => {
    if (currentStep === 4) {
      setIsCodeValid(false)
      setShowConfetti(false)
    }
  }, [currentStep])

  React.useEffect(() => {
    if (currentStep === 5 && score === null && !isGrading) {
      setIsGrading(true)
      const gradeUser = async () => {
        try {
          const response = await fetch('/api/grade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              hasResume: !!resumeFile,
              favoriteLanguage,
              questionAnswers,
              questions,
              codeChallengeCompleted: true,
              extractedText,
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
          setScore(calculateCrackedScore(!!resumeFile, favoriteLanguage, questionAnswers, !!extractedText))
        } finally {
          setIsGrading(false)
        }
      }
      gradeUser()
    }
  }, [currentStep, score, isGrading, resumeFile, favoriteLanguage, questionAnswers, questions, extractedText])

  React.useEffect(() => {
    if (isCodeValid && currentStep === 4 && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      const source = {
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      }
      setConfettiSource(source)
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
        setConfettiSource(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCodeValid, currentStep])

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
        }
        if (data.screenshot) {
          setPdfScreenshot(data.screenshot)
        }
        if (data.images && Array.isArray(data.images)) {
          setPdfImages(data.images)
        }
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      setExtractedText(null)
      setPdfScreenshot(null)
      setPdfImages([])
    } finally {
      setIsProcessing(false)
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
    setResumeFile(null)
    setExtractedText(null)
    setPdfScreenshot(null)
    setPdfImages([])
    setCurrentStep(extractedText ? 3 : 2)
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
  const finalScore = score ?? calculateCrackedScore(!!resumeFile, favoriteLanguage, questionAnswers, !!extractedText)
  const status = getCrackedStatus(finalScore)

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {showConfetti && windowDimensions.width > 0 && confettiSource && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={300}
          confettiSource={confettiSource}
          initialVelocityX={15}
          initialVelocityY={20}
          gravity={0.8}
          wind={0.05}
          friction={0.99}
        />
      )}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-background/80 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold tracking-widest text-primary/50 hover:text-primary cursor-pointer"><ColourfulText text="amicracked.com" /></Link>
        </div>
        <ModeToggle />
      </header>

      <main className="flex min-h-screen items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-2xl shadow-lg border-border/50">
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
            <Progress value={progress} className="mt-4 h-2" />
          </CardHeader>

        <CardContent className="space-y-3">
          {currentStep === 1 && (
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
                        setPdfScreenshot(null)
                        setPdfImages([])
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
                      Optionally upload your resume to (maybe) boost your score ;)
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                        </Button>

                        <p className="text-sm text-muted-foreground">
                          Note: Your data is not stored. <a href="https://github.com/dotcomnerd/amicracked" className="text-primary underline">Don't believe us? Check the code.</a>
                        </p>
                  </div>
                )}
              </div>
            </div>
          )}

            {currentStep === 2 && extractedText && (
            <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Resume Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Answer these questions based on your resume to test your knowledge
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
            )}

            {currentStep === 2 && !extractedText && (
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
          )}

          {currentStep === 3 && (
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
            )}

            {currentStep === 4 && (
              <CodeEditor onCodeValidChange={setIsCodeValid} isValid={isCodeValid} onBadgeRef={handleBadgeRef} />
            )}

            {currentStep === 5 && (
            <div className="space-y-6 text-center py-8">
                {isGrading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <ChainOfThought defaultOpen>
                        <ChainOfThoughtHeader>
                          Calculating your cracked score
                        </ChainOfThoughtHeader>
                        <ChainOfThoughtContent>
                          <ChainOfThoughtStep
                            icon={Loader2}
                            label="Analyzing your performance"
                            description="Evaluating code challenge completion, resume quality, language selection, and question accuracy"
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
                        <h3 className="text-2xl font-semibold">You Are</h3>
                        <div className="text-4xl font-bold text-primary"><ColourfulText text={status} /></div>
                        <div className="text-5xl font-bold"><ColourfulText text={`${finalScore}%`} /></div>
                        <div className="text-xs text-muted-foreground">Note: this is just a joke and is not to be taken seriously.</div>
                      </div>
                  </>
                )}
              </div>
          )}
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
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              )}
              <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 2 && extractedText && Object.keys(questionAnswers).length !== 3) ||
                    (currentStep === 2 && !extractedText && !favoriteLanguage) ||
                    (currentStep === 3 && !favoriteLanguage) ||
                    (currentStep === 4 && !isCodeValid)
                  }
              >
                Next
              </Button>
            </div>
          ) : (
            <Button
                  onClick={() => {
                    setScore(null)
                    setIsGrading(false)
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
