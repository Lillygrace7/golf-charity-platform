'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr || !data.user) {
      setError(authErr?.message ?? 'Login failed')
      setLoading(false)
      return
    }
    // Check if admin
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()
    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            Golf<span className="text-lime-400">Gives</span>
          </Link>
          <p className="text-neutral-400 mt-2 text-sm">Welcome back</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
              <input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
                placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
              <input type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
                placeholder="Your password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-lime-400 text-neutral-950 font-bold py-3 rounded-xl hover:bg-lime-300 transition disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-neutral-500 text-sm mt-6">
            No account?{' '}
            <Link href="/signup" className="text-lime-400 hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </main>
  )
}