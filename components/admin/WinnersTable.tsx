'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props { winners: any[] }

export default function WinnersTable({ winners: initial }: Props) {
  const [winners, setWinners] = useState(initial)
  const supabase = createClient()

  async function markPaid(id: string) {
    await supabase.from('draw_results').update({ payment_status: 'paid', verified: true }).eq('id', id)
    setWinners(winners.map((w) => w.id === id ? { ...w, payment_status: 'paid', verified: true } : w))
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">Winners ({winners.length})</h2>
      {winners.length === 0 ? (
        <p className="text-neutral-600 text-sm">No winners yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-neutral-500 text-left border-b border-neutral-800">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Match</th>
                <th className="pb-3 font-medium">Prize</th>
                <th className="pb-3 font-medium">Draw Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {winners.map((w) => (
                <tr key={w.id} className="text-neutral-300">
                  <td className="py-3">
                    <div className="font-medium text-white">{w.profiles?.full_name}</div>
                    <div className="text-neutral-500 text-xs">{w.profiles?.email}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      w.match_count === 5
                        ? 'bg-lime-400/20 text-lime-400'
                        : w.match_count === 4
                        ? 'bg-blue-400/20 text-blue-400'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}>
                      {w.match_count}-match
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">
                    £{Number(w.prize_amount).toFixed(2)}
                  </td>
                  <td className="py-3 text-neutral-500 text-xs">
                    {w.draws?.published_at
                      ? new Date(w.draws.published_at).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      w.payment_status === 'paid'
                        ? 'bg-lime-400/20 text-lime-400'
                        : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {w.payment_status}
                    </span>
                  </td>
                  <td className="py-3">
                    {w.payment_status === 'pending' && (
                      <button onClick={() => markPaid(w.id)}
                        className="text-xs bg-lime-400 text-neutral-950 font-bold px-3 py-1 rounded-lg hover:bg-lime-300 transition">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}