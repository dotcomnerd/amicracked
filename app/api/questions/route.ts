import { streamObject } from 'ai'
import { generateResumeQuestions } from '@/lib/cache/questions'
import { z } from 'zod'

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.object({
        A: z.string(),
        B: z.string(),
        C: z.string(),
        D: z.string(),
      }),
      correctAnswer: z.enum(['A', 'B', 'C', 'D']),
    })
  ).length(3),
})

export const maxDuration = 30

const createStreamFromCachedObject = (obj: z.infer<typeof questionsSchema>) => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(JSON.stringify(obj)))
      controller.close()
    },
  })
}

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

    try {
      const cachedQuestions = await generateResumeQuestions(resumeText)

      const stream = createStreamFromCachedObject(cachedQuestions)
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    } catch (error) {
      console.log('Error with cache, falling back to stream generation:', error)

      const { openai } = await import('@ai-sdk/openai')
      const result = streamObject({
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

      return result.toTextStreamResponse()
    }
  } catch (error) {
    console.error('Error generating questions:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
