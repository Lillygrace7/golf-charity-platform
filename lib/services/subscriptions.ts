import { createClient } from '@/lib/supabase/client'
import type { Subscription, SubscriptionPlan } from '@/types'
import { SUBSCRIPTION_PRICES } from '@/types'

export async function createSubscription(
  userId: string,
  plan: SubscriptionPlan,
  charityId: string,
  charityPercentage: number
): Promise<{ data: Subscription | null; error: string | null }> {
  const supabase = createClient()

  const now = new Date()
  const expiresAt = new Date(now)
  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1)
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      status: 'active',
      charity_id: charityId,
      charity_percentage: Math.max(10, Math.min(100, charityPercentage)),
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select('*, charities(*)')
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*, charities(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data ?? null
}

export async function cancelSubscription(subId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'inactive' })
    .eq('id', subId)
  return !error
}

export function getSubscriptionPrice(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PRICES[plan]
}