import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoreManager from '@/components/dashboard/ScoreManager'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import CharityCard from '@/components/dashboard/CharityCard'
import WinningsCard from '@/components/dashboard/WinningsCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, subRes, scoresRes, winningsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*, charities(*)').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('scores').select('*').eq('user_id', user.id)
      .order('played_at', { ascending: false }),
    supabase.from('draw_results').select('*, draws(*)')
      .eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const subscription = subRes.data
  const scores = scoresRes.data ?? []
  const winnings = winningsRes.data ?? []

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold">Golf<span className="text-lime-400">Gives</span></span>
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm">{profile?.full_name}</span>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-neutral-500 hover:text-white transition">Sign out</button>
          </form>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">
          Welcome back, <span className="text-lime-400">{profile?.full_name?.split(' ')[0]}</span>
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SubscriptionCard subscription={subscription} />
          <CharityCard subscription={subscription} />
          <WinningsCard winnings={winnings} />
        </div>

        <div className="mt-8">
          <ScoreManager userId={user.id} initialScores={scores} />
        </div>
      </div>
    </main>
  )
}