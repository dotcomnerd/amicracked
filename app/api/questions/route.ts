import { generateResumeQuestions } from '@/lib/cache/questions'
import { streamObject } from 'ai'
import { z } from 'zod'

const codeSchema = z.object({
  language: z.string(),
  src: z.string(),
})

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
      code: codeSchema,
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
        prompt: `You will generate exactly 3 technical multiple-choice questions based only on what the user explicitly wrote in their uploaded text. The text may be a resume, portfolio, project list, or similar.

Your job is to read their bullet points and pull out the real technologies, tools, workflows, stacks, systems, and claims they mention. Then write questions that test whether the person actually understands those specific things.

Uploaded Text:
${resumeText}

how to anchor the questions

Only generate questions about technologies, patterns, or systems that appear directly in their text.

If they mention React, you can ask about React.

If they mention Express + JWT, you can ask about auth flows or JWT behavior.

If they mention Kubernetes, you can ask about pods.

If they mention C++, you can ask about C++ memory or code they would realistically know.

Do not introduce new technologies they did not mention.

No assumptions. No guessing. No domain expansion.

Each question must be tightly tied to a specific bullet point, claim, or project.

Examples:

If they say they "refactored an Express API to use JWT auth", ask a question about token lifetimes, middleware ordering, or verifying signatures.

If they say they "moved a component to server-side rendering", ask about hydration or data-fetching order.

If they say they "optimized something", ask about the type of optimization that makes sense for that stack.

Never ask personal details.

No "Where did they work?"

No "What year did they graduate?"

No "What city…?"

Only technical content.

Tone:

Questions should feel clean, confident, and direct. Not robotic or stiff.

code snippet rules (REQUIRED)

EVERY question MUST include a code snippet. Code blocks are mandatory for all questions.

Include code whenever the question tests understanding of:
- API usage, function calls, or method behavior
- Syntax, patterns, or language-specific features
- Code output, behavior, or side effects
- Framework/library usage patterns
- Algorithm or data structure implementation

Only use languages that appear in their text.

If they list JavaScript or React, you may show JS/TS snippets.

If they list Python, you may show Python.

If they list C++, you may show C++.

Never use a language they did not mention.

If included, the snippet must:

be 5–20 lines

be syntactically valid and executable

be directly relevant to testing their claimed knowledge

appear as raw text only

go in:

code.language = "<language>"

code.src = "<raw source code>"

have no markdown fences

The code should be realistic code they would have written or worked with based on their claims.

question style

Make each question feel like something a senior engineer might ask after reading their resume.

Not trick questions.

No overly academic theory unless they referenced that domain.

Each question must have one correct answer and three plausible-but-wrong options based on the same ecosystem.

All three questions must cover three different bullet points or projects from their text.

output format

Follow this schema exactly:

{
  "questions": [
    {
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correctAnswer": "A" | "B" | "C" | "D",
      "code": {
        "language": "string",
        "src": "string"
      }
    }
  ]
}

code is REQUIRED. Every question must include a code block. The code field is mandatory in the schema.

deliverable

Produce three technical questions that test whether the person actually understands the technologies and engineering details they claimed in their own text.

No speculation.

No invented technologies.

Only what they explicitly said they used.`,
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
