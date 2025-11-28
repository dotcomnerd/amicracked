'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

const questionSchema = z.object({
  question: z.string(),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
})

const questionsSchema = z.object({
  questions: z.array(questionSchema).length(3),
})

type Question = z.infer<typeof questionSchema>

interface QuestionsProps {
  resumeText: string
  onComplete?: (answers: Record<number, string>) => void
}

export function Questions({ resumeText, onComplete }: QuestionsProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({})
  const hasSubmittedRef = useRef(false)

  const { object, submit, isLoading, error } = useObject({
    api: '/api/questions',
    schema: questionsSchema,
    initialValue: { questions: [] },
  })

  useEffect(() => {
    if (resumeText && !hasSubmittedRef.current && !isLoading) {
      hasSubmittedRef.current = true
      submit({ resumeText })
    }
  }, [resumeText, isLoading, submit])

  const handleSelect = (questionIndex: number, answer: string) => {
    if (submittedAnswers[questionIndex]) return

    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = () => {
    if (onComplete) {
      onComplete(selectedAnswers)
    }
  }

  const questions = object?.questions || []
  const allQuestionsLoaded = questions.length === 3
  const allAnswered = Object.keys(selectedAnswers).length === 3

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <p>Failed to generate questions. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isLoading && questions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Generating questions...</p>
                <p className="text-sm text-muted-foreground">
                  Analyzing your resume and creating personalized questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {questions.map((question: Question | undefined, index: number) => {
        if (!question) return null

        const partialQuestion = question as Partial<Question>
        const options = partialQuestion.options
        const questionText = partialQuestion.question ?? 'Generating question...'
        const correctAnswer = partialQuestion.correctAnswer
        const isSubmitted = submittedAnswers[index]
        const selectedAnswer = selectedAnswers[index]
        const isCorrect = !!correctAnswer && selectedAnswer === correctAnswer

        return options ? (
          <Card
            key={index}
            className={`transition-all duration-500 ${
              question ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{
              animation: question
                ? `fadeInUp 0.5s ease-out ${index * 0.2}s both`
                : undefined,
            }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    Question {index + 1}
                  </CardTitle>
                  <CardDescription className="text-base text-foreground">
                    {questionText}
                  </CardDescription>
                </div>
                {isSubmitted && (
                  <div className="ml-4">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(['A', 'B', 'C', 'D'] as const).map(option => {
                  const optionText = options[option] ?? '...'
                  const isSelected = selectedAnswer === option
                  const isCorrectOption = !!correctAnswer && option === correctAnswer
                  const showResult = isSubmitted && isCorrectOption

                  return (
                    <Button
                      key={option}
                      variant={
                        isSelected
                          ? isSubmitted && isCorrect
                            ? 'default'
                            : isSubmitted && !isCorrect && isSelected
                            ? 'destructive'
                            : 'default'
                          : showResult
                          ? 'outline'
                          : 'outline'
                      }
                      onClick={() => handleSelect(index, option)}
                      disabled={isSubmitted}
                      className={`w-full justify-start h-auto py-3 px-4 transition-all ${
                        isSelected
                          ? 'ring-2 ring-primary ring-offset-2'
                          : ''
                      } ${
                        showResult && !isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : ''
                      } ${
                        isSubmitted && isSelected && !isCorrect
                          ? 'bg-destructive/10 hover:bg-destructive/10'
                          : ''
                      }`}
                    >
                      <span className="font-semibold mr-3 min-w-[24px]">
                        {option}.
                      </span>
                      <span className="text-left flex-1">{optionText}</span>
                      {isSubmitted && isCorrectOption && (
                        <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                      )}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            key={index}
            className="animate-pulse border-dashed border-muted"
          >
            <CardHeader>
              <CardTitle className="text-lg mb-2">Generating question {index + 1}...</CardTitle>
              <CardDescription className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        )
      })}

      {allQuestionsLoaded && allAnswered && Object.keys(submittedAnswers).length === 0 && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={() => {
              setSubmittedAnswers({ 0: true, 1: true, 2: true })
              setTimeout(() => {
                handleSubmit()
              }, 100)
            }}
            size="lg"
          >
            Submit Answers
          </Button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
