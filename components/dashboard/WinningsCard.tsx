import type { DrawResult } from '@/types'

interface Props { winnings: DrawResult[] }

export default function WinningsCard({ winnings }: Props) {
  const totalWon = winnings.reduce((s, w) => s + Number(w.prize_amount), 0)
  const pending = winnings.filter((w) => w.payment_status === 'pending').length

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Winnings</div>
      <div className="text-4xl font-black text-lime-400 mb-1">
        £{totalWon.toFixed(2)}
      </div>
      <div className="text-neutral-400 text-sm mb-4">Total won</div>
      {pending > 0 && (
        <div className="text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-3 py-2 rounded-lg">
          {pending} payment{pending > 1 ? 's' : ''} pending verification
        </div>
      )}
      {winnings.length === 0 && (
        <div className="text-neutral-600 text-sm">No winnings yet. Good luck in the next draw!</div>
      )}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {winnings.map((w) => (
          <div key={w.id} className="flex justify-between text-sm">
            <span className="text-neutral-400">{w.match_count}-match</span>
            <span className="text-white font-medium">£{Number(w.prize_amount).toFixed(2)}</span>
            <span className={w.payment_status === 'paid' ? 'text-lime-400' : 'text-yellow-400'}>
              {w.payment_status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}