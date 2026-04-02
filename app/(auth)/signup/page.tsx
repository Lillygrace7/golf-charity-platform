'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getAllCharities } from '@/lib/services/charities'
import type { Charity, SubscriptionPlan } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 fields
  const [plan, setPlan] = useState<SubscriptionPlan>('monthly')
  const [charityId, setCharityId] = useState('')
  const [charityPct, setCharityPct] = useState(10)

  useEffect(() => {
    getAllCharities().then(setCharities)
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (authErr || !authData.user) {
      setError(authErr?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    // Create subscription (mocked payment)
    const now = new Date()
    const expiresAt = new Date(now)
    if (plan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1)
    else expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    await supabase.from('subscriptions').insert({
      user_id: authData.user.id,
      plan,
      status: 'active',
      charity_id: charityId || null,
      charity_percentage: charityPct,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            Golf<span className="text-lime-400">Gives</span>
          </Link>
          <p className="text-neutral-400 mt-2 text-sm">
            Step {step} of 2 — {step === 1 ? 'Your details' : 'Plan & charity'}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-5">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Full Name</label>
                <input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
                <input
                  type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
                  placeholder="Min. 6 characters"
                />
              </div>
              <button type="submit"
                className="w-full bg-lime-400 text-neutral-950 font-bold py-3 rounded-xl hover:bg-lime-300 transition">
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Plan selection */}
              <div>
                <label className="block text-sm text-neutral-400 mb-3">Choose plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['monthly', 'yearly'] as SubscriptionPlan[]).map((p) => (
                    <button type="button" key={p}
                      onClick={() => setPlan(p)}
                      className={`rounded-xl border p-4 text-left transition ${
                        plan === p
                          ? 'border-lime-400 bg-lime-400/10'
                          : 'border-neutral-700 hover:border-neutral-500'
                      }`}>
                      <div className="font-bold capitalize">{p}</div>
                      <div className="text-lime-400 font-black text-lg">
                        £{p === 'monthly' ? '10/mo' : '100/yr'}
                      </div>
                      {p === 'yearly' && (
                        <div className="text-xs text-neutral-400 mt-1">Save ~17%</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Charity selection */}
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Choose a charity</label>
                <select
                  value={charityId}
                  onChange={(e) => setCharityId(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition">
                  <option value="">Select charity (optional)</option>
                  {charities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Charity % */}
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">
                  Charity contribution: <span className="text-lime-400 font-bold">{charityPct}%</span>
                </label>
                <input type="range" min={10} max={50} step={5}
                  value={charityPct}
                  onChange={(e) => setCharityPct(parseInt(e.target.value))}
                  className="w-full accent-lime-400"
                />
                <div className="flex justify-between text-xs text-neutral-600 mt-1">
                  <span>Min 10%</span><span>Max 50%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-neutral-700 text-neutral-300 py-3 rounded-xl hover:border-neutral-500 transition">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-lime-400 text-neutral-950 font-bold py-3 rounded-xl hover:bg-lime-300 transition disabled:opacity-50">
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-neutral-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-lime-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}