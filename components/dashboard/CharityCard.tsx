import type { Subscription } from '@/types'

interface Props { subscription: Subscription | null }

export default function CharityCard({ subscription }: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Your Charity</div>
      {subscription?.charities ? (
        <>
          <div className="font-bold text-lg mb-1">{subscription.charities.name}</div>
          <div className="text-neutral-400 text-sm line-clamp-2 mb-4">
            {subscription.charities.description}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 rounded-full"
                style={{ width: `${subscription.charity_percentage}%` }}
              />
            </div>
            <span className="text-lime-400 font-bold text-sm">
              {subscription.charity_percentage}%
            </span>
          </div>
          <div className="text-xs text-neutral-600 mt-1">of your subscription</div>
        </>
      ) : (
        <div className="text-neutral-500 text-sm">No charity selected.</div>
      )}
    </div>
  )
}