import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">
          Golf<span className="text-lime-400">Gives</span>
        </span>
        <div className="flex gap-3">
          <Link href="/charities"
            className="text-sm text-neutral-400 hover:text-white transition px-4 py-2">
            Charities
          </Link>
          <Link href="/login"
            className="text-sm text-neutral-300 hover:text-white transition px-4 py-2">
            Sign In
          </Link>
          <Link href="/signup"
            className="text-sm bg-lime-400 text-neutral-950 font-semibold px-4 py-2 rounded-lg hover:bg-lime-300 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-block bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase animate-fade-up">
          Play · Win · Give
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 animate-fade-up animation-delay-200">
          Every round you play<br />
          <span className="text-lime-400">changes lives.</span>
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-400">
          Subscribe, enter your golf scores, participate in monthly prize draws,
          and automatically support the charity closest to your heart.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up animation-delay-600">
          <Link href="/signup"
            className="bg-lime-400 text-neutral-950 font-bold px-8 py-4 rounded-xl text-lg hover:bg-lime-300 transition">
            Start Your Subscription
          </Link>
          <Link href="/charities"
            className="border border-neutral-700 text-neutral-300 font-medium px-8 py-4 rounded-xl text-lg hover:border-neutral-500 hover:text-white transition">
            Browse Charities
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-neutral-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-neutral-400 text-center mb-14 max-w-xl mx-auto">
            Three simple steps. Real impact. Real prizes.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Subscribe',
                desc: 'Choose monthly or yearly. A portion of every subscription goes directly to your chosen charity.',
              },
              {
                num: '02',
                title: 'Enter your scores',
                desc: 'Log your last 5 Stableford scores. We track your performance — and use them to power the draw.',
              },
              {
                num: '03',
                title: 'Win & give',
                desc: 'Monthly draws match your scores against drawn numbers. Match 3, 4, or 5 to win. Always giving.',
              },
            ].map((step) => (
              <div key={step.num}
                className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
                <div className="text-lime-400 text-4xl font-black mb-4">{step.num}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE TIERS */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-4">Prize tiers</h2>
        <p className="text-neutral-400 text-center mb-14 max-w-xl mx-auto">
          The bigger your match, the bigger the win. Jackpots roll over each month until claimed.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { match: '5 Numbers', share: '40%', label: 'Jackpot', note: 'Rolls over if unclaimed', accent: true },
            { match: '4 Numbers', share: '35%', label: 'Major Prize', note: 'Split equally among winners', accent: false },
            { match: '3 Numbers', share: '25%', label: 'Standard Prize', note: 'Split equally among winners', accent: false },
          ].map((tier) => (
            <div key={tier.match}
              className={`rounded-2xl p-8 border ${
                tier.accent
                  ? 'bg-lime-400/10 border-lime-400/40'
                  : 'bg-neutral-900 border-neutral-700'
              }`}>
              {tier.accent && (
                <span className="text-xs font-semibold text-lime-400 bg-lime-400/20 px-3 py-1 rounded-full mb-4 inline-block">
                  JACKPOT
                </span>
              )}
              <div className="text-3xl font-black mb-1 text-white">{tier.share}</div>
              <div className="text-lg font-bold mb-1">{tier.label}</div>
              <div className="text-neutral-400 text-sm mb-3">Match {tier.match}</div>
              <div className="text-xs text-neutral-500">{tier.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 py-10 text-center text-neutral-600 text-sm">
        © {new Date().getFullYear()} GolfGives. All rights reserved.
      </footer>
    </main>
  )
}