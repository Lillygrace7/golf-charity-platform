export type UserRole = 'subscriber' | 'admin'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed'
export type PaymentStatus = 'pending' | 'paid'
export type DrawStatus = 'simulation' | 'published'
export type DrawType = 'random' | 'algorithmic'
export type MatchTier = 3 | 4 | 5

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website: string | null
  is_featured: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  charity_id: string | null
  charity_percentage: number
  starts_at: string
  expires_at: string
  created_at: string
  charities?: Charity
}

export interface Score {
  id: string
  user_id: string
  score: number
  played_at: string
  created_at: string
}

export interface Draw {
  id: string
  drawn_numbers: number[]
  draw_type: DrawType
  status: DrawStatus
  prize_pool_total: number
  jackpot_rollover: number
  created_by: string | null
  published_at: string | null
  created_at: string
}

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  matched_numbers: number[]
  match_count: MatchTier
  prize_amount: number
  payment_status: PaymentStatus
  proof_url: string | null
  verified: boolean
  created_at: string
  profiles?: Profile
  draws?: Draw
}

// Prize pool distribution constants (PRD §07)
export const PRIZE_DISTRIBUTION = {
  5: 0.40,  // 40% — Jackpot (rolls over if no winner)
  4: 0.35,  // 35%
  3: 0.25,  // 25%
} as const

// Subscription pricing (mocked)
export const SUBSCRIPTION_PRICES = {
  monthly: 10,   // £10/month
  yearly: 100,   // £100/year (≈ 17% discount)
} as const

export const CHARITY_CONTRIBUTION_RATIO = 0.10  // 10% of subscription fee → charity
export const PRIZE_POOL_RATIO = 0.60            // 60% → prize pool