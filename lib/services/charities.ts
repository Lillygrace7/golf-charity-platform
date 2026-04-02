import { createClient } from '@/lib/supabase/client'
import type { Charity } from '@/types'

export async function getAllCharities(): Promise<Charity[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('charities')
    .select('*')
    .order('is_featured', { ascending: false })
  return data ?? []
}

export async function getFeaturedCharity(): Promise<Charity | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('charities')
    .select('*')
    .eq('is_featured', true)
    .limit(1)
    .single()
  return data ?? null
}

export async function upsertCharity(
  charity: Partial<Charity> & { name: string }
): Promise<{ data: Charity | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('charities')
    .upsert(charity)
    .select()
    .single()
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function deleteCharity(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('charities').delete().eq('id', id)
  return !error
}