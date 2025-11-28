'use cache'

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { cacheLife } from 'next/cache'
import { z } from 'zod'

const questionSchema = z.object({
  question: z.string().describe('The question text'),
  options: z.object({
    A: z.string().describe('Option A'),
    B: z.string().describe('Option B'),
    C: z.string().describe('Option C'),
    D: z.string().describe('Option D'),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The correct answer'),
})

const questionsSchema = z.object({
  questions: z.array(questionSchema).length(3),
})

export async function generateResumeQuestions(resumeText: string) {
  cacheLife('hours')

  const result = await generateObject({
    model: openai('gpt-5-nano'),
    schema: questionsSchema,
    prompt: `You are creating a quiz to test someone's knowledge of their own resume. Based on the following resume text, generate exactly 3 multiple choice questions.

Resume Text:
${resumeText}

Requirements:
1. Each question must test knowledge of specific, factual information from the resume (technologies, companies, dates, achievements, etc.)
2. Questions should be clear and unambiguous
3. Each question must have exactly 4 options (A, B, C, D)
4. Only ONE option should be correct based on information explicitly stated in the resume
5. The incorrect options (distractors) should be plausible but clearly wrong
6. Questions should cover different aspects: technical skills, work experience, education, or achievements
7. Make questions challenging but fair - they should test if the person actually knows their resume

Generate 3 questions that are:
- Specific to the resume content
- Test factual knowledge (not opinions)
- Have one clearly correct answer
- Have plausible but incorrect distractors

Return exactly 3 questions in the required format.`,
  })

  return result.object
}
