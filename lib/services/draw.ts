import { createClient } from '@/lib/supabase/client'
import {
  PRIZE_DISTRIBUTION,
  PRIZE_POOL_RATIO,
  SUBSCRIPTION_PRICES,
  type Draw,
  type MatchTier,
} from '@/types'

export function generateRandomNumbers(): number[] {
  const nums = new Set<number>()
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

export async function generateAlgorithmicNumbers(): Promise<number[]> {
  const supabase = createClient()
  const { data: scores } = await supabase.from('scores').select('score')

  if (!scores || scores.length === 0) return generateRandomNumbers()

  const freq: Record<number, number> = {}
  for (const { score } of scores) {
    freq[score] = (freq[score] ?? 0) + 1
  }

  const pool: number[] = []
  for (const [scoreStr, count] of Object.entries(freq)) {
    const n = parseInt(scoreStr)
    for (let i = 0; i < count; i++) pool.push(n)
  }

  const result = new Set<number>()
  const shuffled = pool.sort(() => Math.random() - 0.5)

  for (const n of shuffled) {
    result.add(n)
    if (result.size === 5) break
  }

  while (result.size < 5) {
    result.add(Math.floor(Math.random() * 45) + 1)
  }

  return Array.from(result).sort((a, b) => a - b)
}

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

export function matchScores(
  userScores: number[],
  drawnNumbers: number[]
): { matched: number[]; count: number } {
  const drawnSet = new Set(drawnNumbers)
  const matched = userScores.filter((s) => drawnSet.has(s))
  return { matched, count: matched.length }
}

export async function runDraw(
  drawType: 'random' | 'algorithmic',
  status: 'simulation' | 'published',
  adminId: string,
  existingRollover: number = 0
): Promise<{ draw: Draw | null; error: string | null }> {
  const supabase = createClient()

  const drawnNumbers =
    drawType === 'algorithmic'
      ? await generateAlgorithmicNumbers()
      : generateRandomNumbers()

  const prizePoolTotal = await calculatePrizePool(existingRollover)

  const { data: activeSubs, error: subsErr } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (subsErr) return { draw: null, error: subsErr.message }

  const userIds = (activeSubs ?? []).map((s) => s.user_id)

  const { data: allScores, error: scoresErr } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds)

  if (scoresErr) return { draw: null, error: scoresErr.message }

  const scoresByUser: Record<string, number[]> = {}

  for (const { user_id, score } of allScores ?? []) {
    if (!scoresByUser[user_id]) scoresByUser[user_id] = []
    scoresByUser[user_id].push(score)
  }

  const winnersByTier: Record<MatchTier, string[]> = {
    5: [],
    4: [],
    3: [],
  }

  // ✅ FIXED LINE HERE
  const matchDetails: Record<string, { matched: number[]; count: MatchTier }> = {}

  for (const userId of userIds) {
    const userScores = scoresByUser[userId] ?? []
    const { matched, count } = matchScores(userScores, drawnNumbers)

    if (count >= 3) {
      const tier = Math.min(count, 5) as MatchTier
      winnersByTier[tier].push(userId)
      matchDetails[userId] = { matched, count: tier }
    }
  }

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