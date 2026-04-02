import { createClient } from '@/lib/supabase/client'
import type { Score } from '@/types'

const MAX_SCORES = 5

/**
 * Add a new score for a user.
 * PRD §05: Max 5 scores. If at limit, delete the oldest before inserting.
 */
export async function addScore(
  userId: string,
  score: number,
  playedAt: string
): Promise<{ data: Score | null; error: string | null }> {
  if (score < 1 || score > 45) {
    return { data: null, error: 'Score must be between 1 and 45 (Stableford format).' }
  }

  const supabase = createClient()

  // Fetch current scores ordered oldest first
  const { data: existing, error: fetchErr } = await supabase
    .from('scores')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (fetchErr) return { data: null, error: fetchErr.message }

  // Delete oldest if at max capacity
  if (existing && existing.length >= MAX_SCORES) {
    const oldest = existing[0]
    const { error: delErr } = await supabase
      .from('scores')
      .delete()
      .eq('id', oldest.id)
    if (delErr) return { data: null, error: delErr.message }
  }

  // Insert new score
  const { data, error } = await supabase
    .from('scores')
    .insert({ user_id: userId, score, played_at: playedAt })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

/**
 * Get user scores in reverse chronological order (PRD §05)
 */
export async function getUserScores(userId: string): Promise<Score[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
  return data ?? []
}

export async function deleteScore(scoreId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('scores').delete().eq('id', scoreId)
  return !error
}