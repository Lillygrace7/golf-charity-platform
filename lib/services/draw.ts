import { createClient } from '@/lib/supabase/client'
import {
  PRIZE_DISTRIBUTION,
  PRIZE_POOL_RATIO,
  SUBSCRIPTION_PRICES,
  type Draw,
  type DrawResult,
  type MatchTier,
} from '@/types'

/**
 * Generate 5 random draw numbers from the Stableford range (1–45)
 */
export function generateRandomNumbers(): number[] {
  const nums = new Set<number>()
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

/**
 * Generate 5 numbers weighted by frequency of user scores.
 * More-frequent scores have higher chance of being drawn.
 */
export async function generateAlgorithmicNumbers(): Promise<number[]> {
  const supabase = createClient()
  const { data: scores } = await supabase.from('scores').select('score')

  if (!scores || scores.length === 0) return generateRandomNumbers()

  // Build frequency map
  const freq: Record<number, number> = {}
  for (const { score } of scores) {
    freq[score] = (freq[score] ?? 0) + 1
  }

  // Build weighted pool
  const pool: number[] = []
  for (const [scoreStr, count] of Object.entries(freq)) {
    const n = parseInt(scoreStr)
    for (let i = 0; i < count; i++) pool.push(n)
  }

  // Sample 5 unique from pool
  const result = new Set<number>()
  const shuffled = pool.sort(() => Math.random() - 0.5)
  for (const n of shuffled) {
    result.add(n)
    if (result.size === 5) break
  }

  // Fill gaps with random if needed
  while (result.size < 5) {
    result.add(Math.floor(Math.random() * 45) + 1)
  }

  return Array.from(result).sort((a, b) => a - b)
}

/**
 * Calculate the prize pool from active subscribers
 */
export async function calculatePrizePool(
  rollover: number = 0
): Promise<number> {
  const supabase = createClient()
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('status', 'active')

  if (!subs) return rollover

  const total = subs.reduce((sum, s) => {
    const monthly =
      s.plan === 'yearly'
        ? SUBSCRIPTION_PRICES.yearly / 12
        : SUBSCRIPTION_PRICES.monthly
    return sum + monthly * PRIZE_POOL_RATIO
  }, 0)

  return parseFloat((total + rollover).toFixed(2))
}

/**
 * Match a user's 5 scores against the drawn numbers.
 * Returns matched numbers and count.
 */
export function matchScores(
  userScores: number[],
  drawnNumbers: number[]
): { matched: number[]; count: number } {
  const drawnSet = new Set(drawnNumbers)
  const matched = userScores.filter((s) => drawnSet.has(s))
  return { matched, count: matched.length }
}

/**
 * Run the full draw:
 * 1. Generate numbers
 * 2. Match against all active subscribers' scores
 * 3. Calculate prize shares per tier
 * 4. Store draw + results in DB
 */
export async function runDraw(
  drawType: 'random' | 'algorithmic',
  status: 'simulation' | 'published',
  adminId: string,
  existingRollover: number = 0
): Promise<{ draw: Draw | null; error: string | null }> {
  const supabase = createClient()

  // 1. Generate drawn numbers
  const drawnNumbers =
    drawType === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers()

  // 2. Calculate prize pool
  const prizePoolTotal = await calculatePrizePool(existingRollover)

  // 3. Fetch all active subscribers with their latest 5 scores
  const { data: activeSubs, error: subsErr } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (subsErr) return { draw: null, error: subsErr.message }

  const userIds = (activeSubs ?? []).map((s) => s.user_id)

  // 4. Fetch scores for all active users
  const { data: allScores, error: scoresErr } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds)

  if (scoresErr) return { draw: null, error: scoresErr.message }

  // Group scores by user
  const scoresByUser: Record<string, number[]> = {}
  for (const { user_id, score } of allScores ?? []) {
    if (!scoresByUser[user_id]) scoresByUser[user_id] = []
    scoresByUser[user_id].push(score)
  }

  // 5. Find winners per tier
  const winnersByTier: Record<MatchTier, string[]> = { 5: [], 4: [], 3: [] }
  const matchDetails: Record
    string,
    { matched: number[]; count: MatchTier }
  > = {}

  for (const userId of userIds) {
    const userScores = scoresByUser[userId] ?? []
    const { matched, count } = matchScores(userScores, drawnNumbers)
    if (count >= 3) {
      const tier = Math.min(count, 5) as MatchTier
      winnersByTier[tier].push(userId)
      matchDetails[userId] = { matched, count: tier }
    }
  }

  // 6. Calculate prize per winner per tier
  // 5-match: if no winner, jackpot rolls over
  const jackpotWinners = winnersByTier[5].length
  const newJackpotRollover =
    jackpotWinners === 0
      ? parseFloat((prizePoolTotal * PRIZE_DISTRIBUTION[5]).toFixed(2))
      : 0

  const prizePerWinner: Record<MatchTier, number> = {
    5:
      jackpotWinners > 0
        ? parseFloat(
            ((prizePoolTotal * PRIZE_DISTRIBUTION[5]) / jackpotWinners).toFixed(2)
          )
        : 0,
    4:
      winnersByTier[4].length > 0
        ? parseFloat(
            (
              (prizePoolTotal * PRIZE_DISTRIBUTION[4]) /
              winnersByTier[4].length
            ).toFixed(2)
          )
        : 0,
    3:
      winnersByTier[3].length > 0
        ? parseFloat(
            (
              (prizePoolTotal * PRIZE_DISTRIBUTION[3]) /
              winnersByTier[3].length
            ).toFixed(2)
          )
        : 0,
  }

  // 7. Insert draw record
  const { data: draw, error: drawErr } = await supabase
    .from('draws')
    .insert({
      drawn_numbers: drawnNumbers,
      draw_type: drawType,
      status,
      prize_pool_total: prizePoolTotal,
      jackpot_rollover: newJackpotRollover,
      created_by: adminId,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (drawErr) return { draw: null, error: drawErr.message }

  // 8. Insert draw results for each winner
  const resultsToInsert = []
  for (const tier of [5, 4, 3] as MatchTier[]) {
    for (const userId of winnersByTier[tier]) {
      resultsToInsert.push({
        draw_id: draw.id,
        user_id: userId,
        matched_numbers: matchDetails[userId].matched,
        match_count: tier,
        prize_amount: prizePerWinner[tier],
        payment_status: 'pending',
      })
    }
  }

  if (resultsToInsert.length > 0) {
    await supabase.from('draw_results').insert(resultsToInsert)
  }

  return { draw, error: null }
}