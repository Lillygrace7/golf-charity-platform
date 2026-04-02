'use client'
import { useState } from 'react'
import { addScore, deleteScore } from '@/lib/services/scores'
import type { Score } from '@/types'

interface Props {
  userId: string
  initialScores: Score[]
}

export default function ScoreManager({ userId, initialScores }: Props) {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [newScore, setNewScore] = useState('')
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const val = parseInt(newScore)
    if (isNaN(val) || val < 1 || val > 45) {
      setError('Score must be between 1 and 45.')
      return
    }
    setLoading(true)
    const { data, error: err } = await addScore(userId, val, playedAt)
    if (err) { setError(err); setLoading(false); return }

    // Refresh: fetch latest 5
    const updated = [data!, ...scores].sort(
      (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
    ).slice(0, 5)
    setScores(updated)
    setNewScore('')
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await deleteScore(id)
    setScores(scores.filter((s) => s.id !== id))
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Golf Scores</div>
          <h2 className="text-xl font-bold">Your last 5 scores</h2>
        </div>
        <span className="text-sm text-neutral-500">{scores.length} / 5</span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6 flex-wrap">
        <input
          type="number" min={1} max={45} value={newScore}
          onChange={(e) => setNewScore(e.target.value)}
          placeholder="Score (1–45)"
          className="flex-1 min-w-[120px] bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition text-sm"
        />
        <input
          type="date" value={playedAt}
          onChange={(e) => setPlayedAt(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition text-sm"
        />
        <button type="submit" disabled={loading}
          className="bg-lime-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl hover:bg-lime-300 transition disabled:opacity-50 text-sm">
          {loading ? '…' : 'Add Score'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Score list */}
      {scores.length === 0 ? (
        <p className="text-neutral-600 text-sm text-center py-8">
          No scores yet. Add your first round!
        </p>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => (
            <div key={s.id}
              className="flex items-center justify-between bg-neutral-800 rounded-xl px-5 py-3">
              <div className="flex items-center gap-4">
                <span className="text-neutral-600 text-sm w-4">{i + 1}</span>
                <span className="text-2xl font-black text-white">{s.score}</span>
                <span className="text-neutral-400 text-sm">
                  {new Date(s.played_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-neutral-600 hover:text-red-400 transition text-sm">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}