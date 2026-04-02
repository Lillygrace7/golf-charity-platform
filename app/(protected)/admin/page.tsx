import { createClient } from '@/lib/supabase/server'
import DrawEngine from '@/components/admin/DrawEngine'
import UserTable from '@/components/admin/UserTable'
import WinnersTable from '@/components/admin/WinnersTable'
import CharityManager from '@/components/admin/CharityManager'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [usersRes, charitiesRes, drawsRes, winnersRes] = await Promise.all([
    supabase.from('profiles').select('*, subscriptions(plan, status)'),
    supabase.from('charities').select('*'),
    supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('draw_results')
      .select('*, profiles(full_name, email), draws(drawn_numbers, published_at)')
      .order('created_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="text-xl font-bold">
          Golf<span className="text-lime-400">Gives</span>
          <span className="ml-3 text-xs text-lime-400 bg-lime-400/10 border border-lime-400/30 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </span>
        <form action="/api/auth/signout" method="post">
          <button className="text-sm text-neutral-500 hover:text-white transition">Sign out</button>
        </form>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: usersRes.data?.length ?? 0 },
            { label: 'Active Subs', value: usersRes.data?.filter((u: any) => u.subscriptions?.[0]?.status === 'active').length ?? 0 },
            { label: 'Total Draws', value: drawsRes.data?.length ?? 0 },
            { label: 'Total Winners', value: winnersRes.data?.length ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-lime-400">{stat.value}</div>
            </div>
          ))}
        </div>

        <DrawEngine adminId={user!.id} lastDraw={drawsRes.data?.[0] ?? null} />
        <UserTable users={usersRes.data ?? []} />
        <WinnersTable winners={winnersRes.data ?? []} />
        <CharityManager initialCharities={charitiesRes.data ?? []} />
      </div>
    </main>
  )
}