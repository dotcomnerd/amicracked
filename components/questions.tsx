'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from '@/components/ui/codeblock'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Streamdown } from 'streamdown'
import { z } from 'zod'

const codeSchema = z.object({
  language: z.string(),
  src: z.string(),
})

const questionSchema = z.object({
  question: z.string(),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  code: codeSchema,
})

const questionsSchema = z.array(questionSchema)

type Question = z.infer<typeof questionSchema>

interface QuestionsProps {
  resumeText: string
  onComplete?: (answers: Record<number, string>) => void
  onQuestionsLoaded?: (questions: Question[]) => void
}

export function Questions({ resumeText, onComplete, onQuestionsLoaded }: QuestionsProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({})
  const hasSubmittedRef = useRef(false)
  const hasLoadedQuestionsRef = useRef(false)

  const { object, submit, isLoading, error } = useObject({
    api: '/api/questions',
    schema: questionsSchema,
    initialValue: [],
  })

  useEffect(() => {
    if (resumeText && !hasSubmittedRef.current && !isLoading) {
      hasSubmittedRef.current = true
      hasLoadedQuestionsRef.current = false
      submit({ resumeText })
    }
  }, [resumeText, isLoading, submit])

  useEffect(() => {
    if (object && Array.isArray(object) && object.length === 3 && onQuestionsLoaded && !hasLoadedQuestionsRef.current) {
      const validQuestions = (object as unknown[]).filter((q): q is Question => {
        return q !== undefined && q !== null && typeof q === 'object' && 'question' in q && 'correctAnswer' in q
      })
      if (validQuestions.length === 3) {
        hasLoadedQuestionsRef.current = true
        onQuestionsLoaded(validQuestions)
      }
    }
  }, [object, onQuestionsLoaded])

  const handleSelect = (questionIndex: number, answer: string) => {
    if (submittedAnswers[questionIndex]) return

    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = () => {
    if (onComplete) {
      onComplete(selectedAnswers)
    }
  }

  const questions = object || []
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
          <CardContent>
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

        const codeData = partialQuestion.code

        return options ? (
          <Card
            key={index}
            className="overflow-hidden"
          >
            {codeData?.language && codeData?.src && (
              <div className="p-4 pb-0 overflow-hidden">
                <CodeBlock
                  className="mb-0 max-w-full"
                  data={[{
                    language: codeData.language,
                    filename: `snippet.${codeData.language}`,
                    code: codeData.src,
                  }]}
                  defaultValue={codeData.language}
                >
                  <CodeBlockHeader>
                    <CodeBlockFiles>
                      {(item) => (
                        <CodeBlockFilename key={item.language} value={item.language}>
                          {item.language}
                        </CodeBlockFilename>
                      )}
                    </CodeBlockFiles>
                    <CodeBlockCopyButton />
                  </CodeBlockHeader>
                  <CodeBlockBody>
                    {(item) => (
                      <CodeBlockItem key={item.language} value={item.language} lineNumbers>
                        <CodeBlockContent language={item.language as BundledLanguage}>
                          {item.code}
                        </CodeBlockContent>
                      </CodeBlockItem>
                    )}
                  </CodeBlockBody>
                </CodeBlock>
              </div>
            )}
            <CardHeader className="overflow-hidden">
              <div className="flex items-start justify-between gap-4 min-w-0">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <CardTitle className="text-lg mb-2 break-words">
                    Question {index + 1}
                  </CardTitle>
                  <CardDescription className="text-base text-foreground break-words overflow-wrap-anywhere hyphens-auto">
                    {questionText}
                  </CardDescription>
                </div>
                {isSubmitted && (
                  <div className="ml-4 shrink-0">
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
                      <div className="flex items-start gap-3 w-full min-w-0">
                        <span className="font-semibold shrink-0 mt-0.5">
                          {option}.
                        </span>
                        <div className="flex-1 min-w-0 text-left [&_p]:text-sm [&_p]:m-0 [&_p:last-child]:mb-0 [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded-md">
                          <Streamdown isAnimating={isLoading}>
                            {optionText}
                          </Streamdown>
                        </div>
                        {isSubmitted && isCorrectOption && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        )}
                      </div>
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
    </div>
  )
}
