'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ui/chain-of-thought'
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
import { CheckCircle2, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Streamdown } from 'streamdown'
import { z } from 'zod'

const rainbowColors = [
  '#ff437a',
  'orange',
  'yellow',
  '#e2ff73',
  '#8fd4ff',
  '#b360ff',
  'violet',
]

const RainbowSpinner = () => {
  return (
    <div className="relative size-4">
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background: `conic-gradient(from 0deg, ${rainbowColors.join(', ')}, ${rainbowColors[0]})`,
          mask: 'radial-gradient(circle, transparent 30%, black 30%)',
          WebkitMask: 'radial-gradient(circle, transparent 30%, black 30%)',
        }}
      />
    </div>
  )
}

const RainbowText = ({ text }: { text: string }) => {
  return text.split("").map((char, index) => (
    <motion.span
      key={`${char}-${index}`}
      initial={{ y: 0 }}
      animate={{
        color: rainbowColors[index % rainbowColors.length],
        y: [0, -3, 0],
        scale: [1, 1.01, 1],
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
      }}
      className="inline-block whitespace-pre font-sans tracking-tight"
    >
      {char}
    </motion.span>
  ))
}

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

const questionsResponseSchema = z.object({
  questions: z.array(questionSchema),
})

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
    schema: questionsResponseSchema,
    initialValue: { questions: [] },
  })

  useEffect(() => {
    if (resumeText && !hasSubmittedRef.current && !isLoading) {
      hasSubmittedRef.current = true
      hasLoadedQuestionsRef.current = false
      submit({ resumeText })
    }
  }, [resumeText, isLoading, submit])

  useEffect(() => {
    const streamedQuestions = object?.questions
    if (streamedQuestions && streamedQuestions.length === 3 && onQuestionsLoaded && !hasLoadedQuestionsRef.current) {
      const validQuestions = streamedQuestions.filter((q: any) => q !== undefined && q !== null) as unknown as Question[]
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

  const questions = object?.questions || []
  const allQuestionsLoaded = questions.length === 3
  const allAnswered = Object.keys(selectedAnswers).length === 3
  const [showCompleteMessage, setShowCompleteMessage] = useState(false)

  useEffect(() => {
    if (allQuestionsLoaded) {
      setShowCompleteMessage(true)
      const timer = setTimeout(() => {
        setShowCompleteMessage(false)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setShowCompleteMessage(false)
    }
  }, [allQuestionsLoaded])

  const getCurrentStep = () => {
    if (showCompleteMessage) {
      return { type: 'complete' as const, questionNumber: null }
    }
    if (allQuestionsLoaded) {
      return null
    }
    if (questions.length === 0 && isLoading) {
      return { type: 'analyzing' as const, questionNumber: null }
    }
    if (questions.length < 3 && isLoading) {
      return { type: 'generating' as const, questionNumber: questions.length + 1 }
    }
    return null
  }

  const currentStep = getCurrentStep()
  const showChainOfThought = (isLoading && questions.length < 3) || showCompleteMessage

  if (error) {
    return (
      <Card variant="glass" className="border-destructive">
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
      <AnimatePresence>
        {showChainOfThought && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card variant="glass">
              <CardContent>
                <ChainOfThought defaultOpen>
                  <ChainOfThoughtHeader>
                    <AnimatePresence mode="wait">
                      {showCompleteMessage ? (
                        <motion.span
                          key="complete"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          Questions Generated
                        </motion.span>
                      ) : (
                        <motion.span
                          key="generating"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                            Streaming questions in...
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </ChainOfThoughtHeader>
                  <ChainOfThoughtContent>
                    <AnimatePresence mode="wait">
                      {currentStep && currentStep.type === 'complete' && (
                        <motion.div
                          key="complete"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChainOfThoughtStep
                            icon={<CheckCircle2 className="size-4" />}
                            label={<RainbowText text="All questions ready!" />}
                            description="Good luck out there, champ. You'll need it."
                            status="complete"
                            animateIcon={false}
                            disableDefaultAnimation={true}
                          />
                        </motion.div>
                      )}
                      {currentStep && currentStep.type === 'analyzing' && (
                        <motion.div
                          key="analyzing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChainOfThoughtStep
                            icon={<RainbowSpinner />}
                            label="On question 1..."
                            description="Wow, this resume's nice!!"
                            status="active"
                            animateIcon={false}
                            disableDefaultAnimation={true}
                          />
                        </motion.div>
                      )}
                      {currentStep && currentStep.type === 'generating' && (
                        <motion.div
                          key={`question-${currentStep.questionNumber}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChainOfThoughtStep
                            icon={<RainbowSpinner />}
                            label={
                              <span>
                                On question{' '}
                                <motion.span
                                  key={currentStep.questionNumber}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className="inline-block"
                                >
                                  {currentStep.questionNumber}
                                </motion.span>
                              </span>
                            }
                            description={
                              currentStep.questionNumber === 1
                                ? "Wow, this resume's nice!!"
                                : currentStep.questionNumber === 2
                                ? "Figuring out what you hate and asking you about it (/jk)"
                                : "Forging the final question..."
                            }
                            status="active"
                            animateIcon={false}
                            disableDefaultAnimation={true}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ChainOfThoughtContent>
                </ChainOfThought>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {questions.map((question: Question | undefined, index: number) => {
        if (!question) return null

        const partialQuestion = question as Partial<Question>
        const options = partialQuestion.options
        const questionText = partialQuestion.question ?? 'Loading question...'
        const correctAnswer = partialQuestion.correctAnswer
        const isSubmitted = submittedAnswers[index]
        const selectedAnswer = selectedAnswers[index]
        const isCorrect = !!correctAnswer && selectedAnswer === correctAnswer

        const codeData = partialQuestion.code

        return options ? (
          <Card
            key={index}
            variant="glass"
            className="overflow-hidden"
          >
            {codeData?.language && codeData?.src && (
              <div className="p-4 pb-0 overflow-hidden">
                <CodeBlock
                  className="mb-0 max-w-full overflow-x-auto"
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
                      className={`w-full justify-start h-auto py-3 px-4 transition-all overflow-auto whitespace-normal ${
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
                        <div className="flex-1 min-w-0 text-left overflow-hidden [&_p]:text-sm [&_p]:m-0 [&_p:last-child]:mb-0 [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded-md [&_pre]:max-w-full">
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
            variant="glass"
            className="animate-pulse border-dashed border-muted"
          >
            <CardHeader>
              <CardTitle className="text-lg mb-2">Loading question {index + 1}...</CardTitle>
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
