import { getAllCharities } from '@/lib/services/charities'
import Link from 'next/link'

export default async function CharitiesPage() {
  const charities = await getAllCharities()

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-neutral-800">
        <Link href="/" className="text-xl font-bold">
          Golf<span className="text-lime-400">Gives</span>
        </Link>
        <Link href="/signup"
          className="text-sm bg-lime-400 text-neutral-950 font-semibold px-4 py-2 rounded-lg hover:bg-lime-300 transition">
          Get Started
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-3">Our Charities</h1>
        <p className="text-neutral-400 mb-12 max-w-xl">
          Every GolfGives subscription automatically contributes to the charity you choose.
          Browse our partner charities below.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {charities.map((c) => (
            <div key={c.id}
              className={`rounded-2xl border p-8 ${
                c.is_featured
                  ? 'border-lime-400/40 bg-lime-400/5'
                  : 'border-neutral-800 bg-neutral-900'
              }`}>
              {c.is_featured && (
                <span className="text-xs font-semibold text-lime-400 bg-lime-400/20 px-3 py-1 rounded-full mb-4 inline-block">
                  Featured Charity
                </span>
              )}
              <h2 className="text-xl font-bold mb-2">{c.name}</h2>
              {c.description && (
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">{c.description}</p>
              )}
              {c.website && (
                <a href={c.website} target="_blank" rel="noopener noreferrer"
                  className="text-lime-400 text-sm hover:underline">
                  Visit website →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}