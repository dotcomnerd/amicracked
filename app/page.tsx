'use client'

import { ModeToggle } from '@/components/mode-toggle'
import { ResumePreview } from '@/components/resume-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SandboxCodeEditor, SandboxLayout, SandboxPreview, SandboxProvider, SandboxTabs, SandboxTabsContent, SandboxTabsList, SandboxTabsTrigger } from '@/components/ui/sandbox'
import { useOnboardingStore } from '@/lib/store'
import { useSandpack } from '@codesandbox/sandpack-react'
import { CheckCircle2, Code2, Sparkles, XCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Confetti from 'react-confetti'

const TOTAL_STEPS = 4

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

const calculateCrackedScore = (hasResume: boolean, language: string | null): number => {
  let score = 0

  if (hasResume) {
    score += 40
  }

  if (language) {
    const languageScores: Record<string, number> = {
      'Rust': 30,
      'Go': 25,
      'TypeScript': 25,
      'C++': 20,
      'Swift': 20,
      'Kotlin': 20,
      'JavaScript': 15,
      'Python': 15,
      'Java': 10,
      'C#': 10,
      'Ruby': 10,
      'PHP': 5,
      'Other': 5,
    }
    score += languageScores[language] || 5
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
  if (score >= 80) return 'Extremely Cracked'
  if (score >= 60) return 'Very Cracked'
  if (score >= 40) return 'Moderately Cracked'
  if (score >= 20) return 'Somewhat Cracked'
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
    setResumeFile,
    setFavoriteLanguage,
    setExtractedText,
    setPdfScreenshot,
    setPdfImages,
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

  const handleBadgeRef = useCallback((ref: HTMLSpanElement | null) => {
    badgeRef.current = ref
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
    if (currentStep === 3) {
      setIsCodeValid(false)
      setShowConfetti(false)
    }
  }, [currentStep])

  React.useEffect(() => {
    if (isCodeValid && currentStep === 3 && badgeRef.current) {
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
    nextStep()
  }

  const progress = (currentStep / TOTAL_STEPS) * 100
  const score = calculateCrackedScore(!!resumeFile, favoriteLanguage)
  const status = getCrackedStatus(score)

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
          <span className="font-semibold tracking-widest text-primary/50 ">amicracked.com</span>
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

          {currentStep === 2 && (
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
              <CodeEditor onCodeValidChange={setIsCodeValid} isValid={isCodeValid} onBadgeRef={handleBadgeRef} />
            )}

            {currentStep === 4 && (
            <div className="space-y-6 text-center py-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">You Are</h3>
                <div className="text-4xl font-bold text-primary">{status}</div>
              </div>

              <div className="space-y-2">
                <div className="text-5xl font-bold">{score}%</div>
                <div className="text-sm text-muted-foreground">Cracked Score</div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  {resumeFile && <p>Resume uploaded: +40 points</p>}
                  {favoriteLanguage && (
                    <p>Favorite language: {favoriteLanguage}</p>
                  )}
                </div>
                  {(pdfScreenshot || pdfImages.length > 0) && (
                    <div className="text-left mt-4">
                      <h4 className="text-sm font-semibold mb-2">
                        Resume Images ({pdfImages.length > 0 ? pdfImages.length : 1}):
                      </h4>
                      <div className="space-y-3">
                        {pdfScreenshot && (
                          <div className="bg-muted p-2 rounded-lg overflow-hidden">
                            <img
                              src={`data:image/png;base64,${pdfScreenshot}`}
                              alt="PDF preview"
                              className="w-full h-auto max-h-96 object-contain rounded"
                            />
                          </div>
                        )}
                        {pdfImages.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {pdfImages.map((img, idx) => (
                              <div key={idx} className="bg-muted p-2 rounded-lg overflow-hidden">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Page {img.page}, Image {img.index}
                                  {img.width > 0 && img.height > 0 && (
                                    <span className="ml-2">({img.width}×{img.height})</span>
                                  )}
                                </div>
                                <img
                                  src={`data:image/png;base64,${img.base64}`}
                                  alt={`Page ${img.page} Image ${img.index}`}
                                  className="w-full h-auto max-h-64 object-contain rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                {extractedText && (
                  <div className="text-left mt-4">
                    <h4 className="text-sm font-semibold mb-2">Extracted Resume Text:</h4>
                    <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">{extractedText}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={previousStep}
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
                onClick={nextStep}
                  disabled={(currentStep === 2 && !favoriteLanguage) || (currentStep === 3 && !isCodeValid)}
              >
                Next
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => useOnboardingStore.getState().setCurrentStep(1)}
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
