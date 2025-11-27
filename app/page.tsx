'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/lib/store'
import React, { useEffect, useRef, useState } from 'react'

const TOTAL_STEPS = 3

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
    setResumeFile,
    setFavoriteLanguage,
    setExtractedText,
    nextStep,
    previousStep
  } = useOnboardingStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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
      if (data.success && data.full_text) {
        setExtractedText(data.full_text)
        console.log('Extracted text:', data.full_text)
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      setExtractedText(null)
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
    nextStep()
  }

  const progress = (currentStep / TOTAL_STEPS) * 100
  const score = calculateCrackedScore(!!resumeFile, favoriteLanguage)
  const status = getCrackedStatus(score)

  useEffect(() => {
    if (currentStep === 3 && extractedText) {
      console.log('Extracted PDF text:', extractedText)
    }
  }, [currentStep, extractedText])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Onboarding</CardTitle>
            <CardDescription>
              Step {currentStep} of {TOTAL_STEPS}
            </CardDescription>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your resume to help us understand your background
                </p>
              </div>

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
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{resumeFile.name}</p>
                    {isProcessing && (
                      <p className="text-xs text-muted-foreground">Processing PDF...</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResumeFile(null)
                        setExtractedText(null)
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
                      Drag and drop your resume here, or click to browse
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What's your favorite programming language?</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the language you enjoy working with most
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                disabled={currentStep === 2 && !favoriteLanguage}
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
    </div>
  )
}
