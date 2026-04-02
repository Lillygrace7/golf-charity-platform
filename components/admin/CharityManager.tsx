'use client'
import { useState } from 'react'
import { upsertCharity, deleteCharity } from '@/lib/services/charities'
import type { Charity } from '@/types'

interface Props { initialCharities: Charity[] }

export default function CharityManager({ initialCharities }: Props) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [featured, setFeatured] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data } = await upsertCharity({ name, description: desc, is_featured: featured })
    if (data) setCharities([...charities, data])
    setName(''); setDesc(''); setFeatured(false)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await deleteCharity(id)
    setCharities(charities.filter((c) => c.id !== id))
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-6">Charity Management</h2>

      <form onSubmit={handleAdd} className="flex gap-3 mb-6 flex-wrap">
        <input value={name} onChange={(e) => setName(e.target.value)} required
          placeholder="Charity name"
          className="flex-1 min-w-[150px] bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition text-sm" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 min-w-[150px] bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-lime-400 transition text-sm" />
        <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
            className="accent-lime-400" />
          Featured
        </label>
        <button type="submit" disabled={loading}
          className="bg-lime-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl hover:bg-lime-300 transition text-sm disabled:opacity-50">
          Add Charity
        </button>
      </form>

      <div className="space-y-3">
        {charities.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-neutral-800 rounded-xl px-5 py-3">
            <div>
              <span className="font-medium text-white">{c.name}</span>
              {c.is_featured && (
                <span className="ml-2 text-xs bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded-full">Featured</span>
              )}
              {c.description && (
                <div className="text-xs text-neutral-500 mt-0.5">{c.description}</div>
              )}
            </div>
            <button onClick={() => handleDelete(c.id)}
              className="text-neutral-600 hover:text-red-400 transition text-sm ml-4">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}