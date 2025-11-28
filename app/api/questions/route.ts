import { generateResumeQuestions } from '@/lib/cache/questions'

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

    const result = generateResumeQuestions(resumeText)
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating questions:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
