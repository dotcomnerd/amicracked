// language difficulty tiers - harder/less popular languages score higher
export const LANGUAGE_DIFFICULTY_TIERS: Record<string, { tier: number; points: number }> = {
  // Tier 1 (Hardest - 12-15 points): Low-level, systems programming
  'C++': { tier: 1, points: 15 },
  'Rust': { tier: 1, points: 15 },
  'Go': { tier: 1, points: 13 },

  // Tier 2 (Hard - 8-11 points): Modern typed languages with steeper learning curves
  'Swift': { tier: 2, points: 11 },
  'Kotlin': { tier: 2, points: 10 },
  'C#': { tier: 2, points: 9 },

  // Tier 3 (Medium - 5-7 points): Established languages
  'Java': { tier: 3, points: 7 },
  'Ruby': { tier: 3, points: 6 },
  'PHP': { tier: 3, points: 5 },

  // Tier 4 (Easy - 2-4 points): Most popular/accessible languages
  'TypeScript': { tier: 4, points: 4 },
  'JavaScript': { tier: 4, points: 3 },
  'Python': { tier: 4, points: 2 },

  // Tier 5 (Other - 3 points)
  'Other': { tier: 5, points: 3 },
}

export const calculateLanguageScore = (
  firstLanguage: string | null,
  secondLanguage: string | null
): number => {
  let score = 0

  if (!firstLanguage) return 0

  const firstLangData = LANGUAGE_DIFFICULTY_TIERS[firstLanguage] || LANGUAGE_DIFFICULTY_TIERS['Other']
  score += firstLangData.points

  if (secondLanguage && secondLanguage !== firstLanguage) {
    const secondLangData = LANGUAGE_DIFFICULTY_TIERS[secondLanguage] || LANGUAGE_DIFFICULTY_TIERS['Other']
    // second language gets 70% of tier points
    score += Math.round(secondLangData.points * 0.7 * 10) / 10

    // diversity bonus if different tiers
    if (firstLangData.tier !== secondLangData.tier) {
      score += 2
    }
  }

  return Math.round(score * 10) / 10
}

// time scoring using exponential decay
// faster completion = more points, with diminishing returns
export const calculateTimeScore = (timeInSeconds: number | null): number => {
  if (timeInSeconds === null || timeInSeconds <= 0) return 0

  // exponential decay: 25 * e^(-time/120)
  // gives us ~25 points at 0 seconds, ~15 at 60s, ~9 at 120s, ~2 at 300s
  const score = 25 * Math.exp(-timeInSeconds / 120)

  return Math.round(score * 10) / 10
}

// question accuracy scoring with curve that rewards perfection
export const calculateQuestionScore = (
  correctCount: number,
  totalQuestions: number
): number => {
  if (totalQuestions === 0) return 0

  const accuracy = correctCount / totalQuestions
  // curved formula: 30 * (accuracy)^1.5
  // this gives:
  // - 3/3 correct (100%): 30 points
  // - 2/3 correct (67%): ~16.4 points
  // - 1/3 correct (33%): ~5.7 points
  // - 0/3 correct (0%): 0 points
  const score = 30 * Math.pow(accuracy, 1.5)

  return Math.round(score * 10) / 10
}

// base score for completing the code challenge
export const CODE_CHALLENGE_BASE_SCORE = 35

// normalize score using log scale to create realistic distribution
// average performance (~50-60 raw points) should map to ~50-60 final score
// exceptional performance (100+ raw points) maps to 90-100
// poor performance (20-30 raw points) maps to 20-40
export const normalizeScore = (rawScore: number): number => {
  // theoretical max raw score is ~137 (35 base + 25 time + 17 language + 30 questions + 30 resume)
  // but most people will score 40-80 raw points
  const MAX_RAW = 137
  const AVERAGE_RAW = 55 // average user scores around here

  // log scale normalization
  // formula: 100 * (log(1 + rawScore) / log(1 + MAX_RAW))
  // but we want to shift so average maps to ~55
  // using: 100 * (log(1 + rawScore * scaleFactor) / log(1 + MAX_RAW * scaleFactor))

  // adjust scale factor so average raw score (55) maps to ~55 final score
  // log(1 + 55 * scale) / log(1 + 137 * scale) = 0.55
  // solving approximately: scaleFactor ≈ 0.15
  const scaleFactor = 0.15

  // apply log transformation
  const normalized = 100 * (Math.log(1 + rawScore * scaleFactor) / Math.log(1 + MAX_RAW * scaleFactor))

  // ensure minimum of 0 and cap at 100
  return Math.max(0, Math.min(100, normalized))
}

// calculate the full score (without resume, which is AI-evaluated)
export const calculateFormulaBasedScore = (
  firstLanguage: string | null,
  secondLanguage: string | null,
  codeChallengeTime: number | null,
  correctAnswers: number,
  totalQuestions: number,
  resumeScore: number = 0,
  codeChallengeGaveUp: boolean = false
): number => {
  let rawScore = 0

  // special case: if they only selected a favorite language and skipped everything else
  const onlySelectedFavoriteLanguage = firstLanguage !== null &&
    secondLanguage === null &&
    codeChallengeGaveUp &&
    totalQuestions === 0 &&
    resumeScore === 0

  if (onlySelectedFavoriteLanguage) {
    return 6.9
  }

  // special case: if they only did the coding challenge and skipped everything else
  const onlyCodingChallenge = firstLanguage === null &&
    secondLanguage === null &&
    !codeChallengeGaveUp &&
    codeChallengeTime !== null &&
    totalQuestions === 0 &&
    resumeScore === 0

  if (onlyCodingChallenge) {
    return 67
  }

  // code challenge base (35 points) - only if they didn't give up
  if (!codeChallengeGaveUp) {
    rawScore += CODE_CHALLENGE_BASE_SCORE

    // time score (0-25 points)
    rawScore += calculateTimeScore(codeChallengeTime)
  }

  // language score (0-17 points)
  rawScore += calculateLanguageScore(firstLanguage, secondLanguage)

  // question accuracy (0-30 points)
  rawScore += calculateQuestionScore(correctAnswers, totalQuestions)

  // resume prestige (0-30 points, AI-evaluated)
  rawScore += resumeScore

  // apply log-scale normalization for realistic distribution
  let normalizedScore = normalizeScore(rawScore)

  // boost score if they completed the coding challenge AND did at least one other thing
  const hasOtherContributions = (firstLanguage !== null || secondLanguage !== null) ||
    totalQuestions > 0 ||
    resumeScore > 0

  if (!codeChallengeGaveUp && codeChallengeTime !== null && hasOtherContributions) {
    normalizedScore = normalizedScore * 1.15
  }

  // apply harsh penalty if they gave up on code challenge
  // this ensures low-effort attempts (just picking languages) max out around 10%
  if (codeChallengeGaveUp) {
    normalizedScore = normalizedScore * 0.2
  }

  return Math.round(normalizedScore * 10) / 10
}
