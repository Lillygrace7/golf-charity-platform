'use client'
import { useState } from 'react'
import { runDraw } from '@/lib/services/draw'
import type { Draw } from '@/types'

interface Props {
  adminId: string
  lastDraw: Draw | null
}

export default function DrawEngine({ adminId, lastDraw }: Props) {
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Draw | null>(null)
  const [error, setError] = useState('')

  async function handleRun(status: 'simulation' | 'published') {
    setLoading(true)
    setError('')
    const rollover = lastDraw?.jackpot_rollover ?? 0
    const { draw, error: err } = await runDraw(drawType, status, adminId, rollover)
    if (err) { setError(err); setLoading(false); return }
    setResult(draw)
    setLoading(false)
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">Draw Engine</h2>

      <div className="flex gap-3 mb-6">
        {(['random', 'algorithmic'] as const).map((t) => (
          <button key={t} onClick={() => setDrawType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition capitalize ${
              drawType === t
                ? 'bg-lime-400 text-neutral-950 border-lime-400'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => handleRun('simulation')} disabled={loading}
          className="border border-neutral-700 text-neutral-300 px-5 py-2.5 rounded-xl hover:border-neutral-500 transition text-sm disabled:opacity-50">
          {loading ? '…' : '🔍 Run Simulation'}
        </button>
        <button onClick={() => handleRun('published')} disabled={loading}
          className="bg-lime-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl hover:bg-lime-300 transition text-sm disabled:opacity-50">
          {loading ? '…' : '🚀 Publish Draw'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {result && (
        <div className="bg-neutral-800 rounded-xl p-5">
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3">
            {result.status === 'simulation' ? 'Simulation Result' : 'Published Draw'}
          </div>
          <div className="flex gap-3 mb-4">
            {result.drawn_numbers.map((n) => (
              <span key={n}
                className="w-12 h-12 flex items-center justify-center bg-lime-400 text-neutral-950 font-black text-lg rounded-full">
                {n}
              </span>
            ))}
          </div>
          <div className="text-sm text-neutral-400">
            Prize Pool: <span className="text-white font-bold">£{Number(result.prize_pool_total).toFixed(2)}</span>
            {Number(result.jackpot_rollover) > 0 && (
              <span className="ml-4 text-yellow-400">
                Jackpot rollover: £{Number(result.jackpot_rollover).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}

      {lastDraw && !result && (
        <div className="text-sm text-neutral-500">
          Last draw: {new Date(lastDraw.created_at).toLocaleDateString('en-GB')} —{' '}
          [{lastDraw.drawn_numbers.join(', ')}]
          {Number(lastDraw.jackpot_rollover) > 0 && (
            <span className="text-yellow-400 ml-2">
              Rollover: £{Number(lastDraw.jackpot_rollover).toFixed(2)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}