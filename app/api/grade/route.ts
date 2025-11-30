import {
  calculateLanguageScore,
  calculateQuestionScore,
  calculateTimeScore,
  CODE_CHALLENGE_BASE_SCORE,
  LANGUAGE_DIFFICULTY_TIERS,
  normalizeScore,
} from '@/lib/scoring'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const reasoningSchema = z.object({
  reasoning: z.string().describe('Brief, fun explanation of the final score incorporating all factors'),
  adjustmentSuggestion: z.number().min(-5).max(5).describe('Optional small adjustment (-5 to +5) based on overall impression'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      favoriteLanguage,
      secondFavoriteLanguage,
      questionAnswers,
      codeChallengeTime,
      resumeScore,
      codeChallengeGaveUp,
    } = body

    const questions = Array.isArray(body.questions) ? body.questions : []

    // calculate question accuracy
    let correctCount = 0
    const questionResults: string[] = []
    if (questions.length > 0 && questionAnswers) {
      questions.forEach((q: { question: string; correctAnswer: string }, idx: number) => {
        const userAnswer = questionAnswers[idx]
        const isCorrect = userAnswer === q.correctAnswer
        if (isCorrect) correctCount++
        questionResults.push(`Q${idx + 1}: ${isCorrect ? 'CORRECT' : 'WRONG'}`)
      })
    }

    // calculate all score components
    const languageScore = calculateLanguageScore(favoriteLanguage, secondFavoriteLanguage)
    const timeScore = codeChallengeGaveUp ? 0 : calculateTimeScore(codeChallengeTime)
    const questionScore = calculateQuestionScore(correctCount, questions.length)
    const validResumeScore = typeof resumeScore === 'number' ? Math.min(resumeScore, 30) : 0

    // calculate raw score before normalization
    const codeChallengePoints = codeChallengeGaveUp ? 0 : CODE_CHALLENGE_BASE_SCORE
    const rawScore = codeChallengePoints + languageScore + timeScore + questionScore + validResumeScore

    // normalize using log scale
    // this ensures average performance (~50-60 raw) maps to ~50-60 final score
    let normalizedScore = normalizeScore(rawScore)

    // apply harsh penalty if they gave up on code challenge
    // this ensures low-effort attempts (just picking languages) max out around 10%
    if (codeChallengeGaveUp) {
      normalizedScore = normalizedScore * 0.2
    }

    // only generate AI reasoning if they have a resume or completed the coding challenge
    const hasResume = validResumeScore > 0 || questions.length > 0
    const completedCodingChallenge = !codeChallengeGaveUp && codeChallengeTime !== null
    let adjustment = 0
    let reasoning = ''

    if (hasResume || completedCodingChallenge) {
      // get language tier info for the prompt
      const firstLangInfo = favoriteLanguage ? LANGUAGE_DIFFICULTY_TIERS[favoriteLanguage] || LANGUAGE_DIFFICULTY_TIERS['Other'] : null
      const secondLangInfo = secondFavoriteLanguage ? LANGUAGE_DIFFICULTY_TIERS[secondFavoriteLanguage] || LANGUAGE_DIFFICULTY_TIERS['Other'] : null

      const prompt = `You are generating a fun, brief explanation for a developer's "cracked" score. The score has already been calculated - just provide commentary.

**Score Breakdown (Raw Points):**
- Code challenge base: ${codeChallengeGaveUp ? '0 (gave up)' : `${CODE_CHALLENGE_BASE_SCORE}`} points
- Time bonus (${codeChallengeGaveUp ? 'N/A (gave up)' : codeChallengeTime !== null ? `${codeChallengeTime}s` : 'N/A'}): ${timeScore.toFixed(1)} points
- Language score: ${languageScore.toFixed(1)} points
  - First: ${favoriteLanguage || 'None'} (Tier ${firstLangInfo?.tier || 'N/A'})
  - Second: ${secondFavoriteLanguage || 'None'} (Tier ${secondLangInfo?.tier || 'N/A'})
- Question accuracy (${correctCount}/${questions.length}): ${questionScore.toFixed(1)} points
- Resume prestige: ${validResumeScore.toFixed(1)} points

**Raw Total: ${rawScore.toFixed(1)} points** → **Normalized Score: ${normalizedScore.toFixed(1)}/100**

${questionResults.length > 0 ? `Question results: ${questionResults.join(', ')}` : 'No resume questions answered.'}

Generate a brief, witty explanation (2-3 sentences) that summarizes their performance. Be playful but honest.

Also suggest a small adjustment (-5 to +5 points) if there's something notable:
- +3 to +5: Exceptional combination (e.g., Rust + Go dev who aced everything in under 30s)
- +1 to +2: Good synergy (e.g., interesting language combo, impressive speed)
- 0: Standard performance, no adjustment needed
- -1 to -2: Minor red flags (e.g., picked "Other" twice, suspiciously slow)
- -3 to -5: Something off (e.g., completed in 1 second suggesting gaming, picked same language twice somehow)

Most users should get 0 adjustment. Only suggest non-zero for notable cases.`

      const result = await generateObject({
        model: openai('gpt-4.1-mini'),
        schema: reasoningSchema,
        prompt,
      })

      // apply the AI's suggested adjustment (small, since we're already normalized)
      adjustment = result.object.adjustmentSuggestion || 0
      reasoning = result.object.reasoning || ''
      normalizedScore = Math.min(Math.max(normalizedScore + adjustment, 0), 100)
    }

    // round to 1 decimal place
    const finalScore = Math.round(normalizedScore * 10) / 10

    return Response.json({
      success: true,
      score: finalScore,
      reasoning: reasoning || `You scored ${finalScore.toFixed(1)}% based on your language selections${codeChallengeGaveUp ? ' (you gave up on the coding challenge)' : ''}.`,
      breakdown: {
        raw: rawScore,
        normalized: finalScore,
        base: codeChallengeGaveUp ? 0 : CODE_CHALLENGE_BASE_SCORE,
        time: timeScore,
        language: languageScore,
        questions: questionScore,
        resume: validResumeScore,
        adjustment,
      },
    })
  } catch (error) {
    console.error('Error grading:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to grade' },
      { status: 500 }
    )
  }
}
