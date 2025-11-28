import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const gradeSchema = z.object({
  score: z.number().min(0).max(100).describe('The cracked score from 0-100'),
  reasoning: z.string().describe('Brief explanation of the score'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      hasResume,
      favoriteLanguage,
      questionAnswers,
      codeChallengeCompleted,
      extractedText,
    } = body

    const questions = Array.isArray(body.questions) ? body.questions : []

    let questionResults = ''
    if (questions.length > 0 && questionAnswers) {
      questions.forEach((q: { question: string; correctAnswer: string }, idx: number) => {
        const userAnswer = questionAnswers[idx]
        const isCorrect = userAnswer === q.correctAnswer
        questionResults += `Question ${idx + 1}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} (User: ${userAnswer || 'No answer'}, Correct: ${q.correctAnswer})\n`
      })
    }

    const prompt = `You are grading a developer's "cracked" score based on their performance in a technical assessment.

Assessment Details:
- Resume uploaded: ${hasResume ? 'Yes' : 'No'}
- Favorite programming language: ${favoriteLanguage || 'Not selected'}
- Code challenge completed: ${codeChallengeCompleted ? 'Yes' : 'No'}
- Resume questions answered: ${Object.keys(questionAnswers || {}).length} out of ${questions.length}

${questionResults ? `Question Results:\n${questionResults}` : 'No resume questions were answered.'}

${extractedText ? `Resume content (for context):\n${extractedText.substring(0, 1000)}...` : ''}

Score the developer on a scale of 0-100 based on:
1. Code challenge completion (required to reach this point) - base score
2. Resume upload (shows initiative) - bonus points
3. Language selection (shows self-awareness) - bonus points
4. Resume question accuracy (tests actual knowledge) - significant points

The score should reflect their actual technical competence and engagement. Be fair but realistic.
A perfect score (100) should be rare and require excellent performance across all areas.
A good score (70-85) should reflect solid performance.
An average score (50-69) should reflect basic completion.
A low score (0-49) should reflect poor performance or incomplete assessment.

Return a score from 0-100 and a brief reasoning.`

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: gradeSchema,
      prompt,
    })

    return Response.json({
      success: true,
      score: result.object.score,
      reasoning: result.object.reasoning,
    })
  } catch (error) {
    console.error('Error grading:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to grade' },
      { status: 500 }
    )
  }
}
