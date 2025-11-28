import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
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

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const resumeText = body.resumeText

    if (!resumeText || typeof resumeText !== 'string') {
      return Response.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    const result = streamObject({
      model: openai('gpt-5-nano'),
      schema: questionsSchema,
      prompt: `Based on the following resume, generate exactly 3 multiple choice questions that test understanding of the candidate's experience, skills, and achievements. Make the questions insightful, relevant, and challenging but fair. Each question should have 4 options (A, B, C, D) and one correct answer.

Resume:
${resumeText}

Generate 3 questions that:
1. Test knowledge of specific technologies or tools mentioned
2. Assess understanding of their work experience and projects
3. Evaluate comprehension of their achievements or responsibilities

Make sure each question is clear, has plausible distractors, and the correct answer is based on information actually present in the resume.`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating questions:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
