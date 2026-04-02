'use client'
import type { Subscription } from '@/types'

interface Props { subscription: Subscription | null }

export default function SubscriptionCard({ subscription }: Props) {
  const statusColor = {
    active: 'text-lime-400 bg-lime-400/10 border-lime-400/30',
    inactive: 'text-red-400 bg-red-400/10 border-red-400/30',
    lapsed: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Subscription</div>
      {subscription ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-xl capitalize">{subscription.plan}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[subscription.status]}`}>
              {subscription.status}
            </span>
          </div>
          <div className="text-sm text-neutral-400">
            Renews: <span className="text-white">
              {new Date(subscription.expires_at).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="text-sm text-neutral-400 mt-1">
            Plan: <span className="text-white">
              £{subscription.plan === 'monthly' ? '10 / month' : '100 / year'}
            </span>
          </div>
        </>
      ) : (
        <div className="text-neutral-500 text-sm">No active subscription.</div>
      )}
    </div>
  )
}