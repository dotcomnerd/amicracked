import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const resumeScoreSchema = z.object({
  score: z.number().min(0).max(30).describe('Resume prestige score from 0-30'),
  reasoning: z.string().describe('Brief explanation of the score'),
  breakdown: z.object({
    school: z.number().min(0).max(8).optional().describe('School prestige score 0-8'),
    internships: z.number().min(0).max(8).optional().describe('Internship quality score 0-8'),
    companies: z.number().min(0).max(8).optional().describe('Company prestige score 0-8'),
    projects: z.number().min(0).max(8).optional().describe('Project quality score 0-8'),
  }).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { extractedText } = body

    if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
      return Response.json({
        success: true,
        score: 0,
        reasoning: 'No resume text provided',
        breakdown: null,
      })
    }

    const prompt = `You are evaluating a developer's resume for "prestige" and "clout" on a scale of 0-30. This is for a fun/satirical assessment, but be genuinely evaluative.

Resume content:
${extractedText.substring(0, 3000)}

Score based on these categories (total 0-30 points):

**School (0-8 points)**:
- 7-8: Top CS schools (MIT, Stanford, CMU, Berkeley, Princeton), top Ivies with strong CS
- 5-6: Good state schools with known CS programs (UT Austin, UIUC, Georgia Tech, UCLA, Michigan), other Ivies
- 3-4: Solid regional universities, international universities with good reputation
- 1-2: Unknown schools, community college transfers, bootcamps
- 0: No education mentioned or unclear

**Internships/Work Experience Quality (0-8 points)**:
- 7-8: Multiple top-tier internships (HFT like Jane Street/Citadel/Two Sigma, FAANG, unicorn startups pre-IPO)
- 5-6: One top-tier internship or multiple good tech companies (well-funded startups, mid-tier tech like Stripe/Airbnb)
- 3-4: Internships at recognizable companies, F500 non-tech, established startups
- 1-2: Small companies, unknown startups, limited experience
- 0: No work experience mentioned

**Company Prestige (0-8 points)**:
- 7-8: HFT firms (Jane Street, Citadel, Two Sigma, Jump, DRW, Hudson River), top quant funds
- 6-7: FAANG (Google, Meta, Apple, Amazon, Netflix), Microsoft, top unicorns (Stripe, Airbnb, Databricks)
- 4-5: Well-known tech companies (Lyft, Uber, Salesforce, Adobe, Snap, Twitter/X), successful startups
- 2-3: F500 tech departments, mid-tier startups, consulting
- 1: Small companies, unknown startups
- 0: No company information

**Projects (0-8 points)**:
- 7-8: Extremely impressive scale/impact (millions of users, highly popular open source with thousands of stars, novel technical achievements, major contributions)
- 5-6: Impressive scale/impact (millions of users, open source with stars, novel technical achievements)
- 3-4: Good technical projects with clear complexity (real apps, interesting systems)
- 1-2: Basic projects (todo apps, portfolio sites, coursework)
- 0: No projects mentioned or very weak projects

**IMPORTANT - Detecting Fake/Bluffed Metrics**:
- PENALIZE resumes with suspicious metrics like "improved performance by 500%", "increased revenue by $10M as an intern", "scaled to 1 billion users"
- Real metrics are usually modest and specific
- Generic buzzwords without substance should reduce the score
- "Helped", "assisted", "contributed to" without specifics = likely padding

Be critical and realistic. A score of 25-30 is extremely rare (think: Stanford CS grad with Jane Street + Google internships and a popular open source project). Average resumes should score 8-15. Weak resumes 0-7.

Return a score, reasoning, and optional breakdown by category.`

    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: resumeScoreSchema,
      prompt,
    })

    return Response.json({
      success: true,
      score: result.object.score,
      reasoning: result.object.reasoning,
      breakdown: result.object.breakdown || null,
    })
  } catch (error) {
    console.error('Error scoring resume:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to score resume' },
      { status: 500 }
    )
  }
}
