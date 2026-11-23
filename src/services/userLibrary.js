
import { supabase } from './supabase'

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Please log in first.')
  return data.user
}

export async function getSavedAnime(type) {
  const user = await getCurrentUser()
  const table = type === 'favourites' ? 'favourites' : 'watchlist'

  const { data, error } = await supabase
    .from(table)
    .select('anime_id')
    .eq('user_id', user.id)

  if (error) throw error
  return data.map(item => item.anime_id)
}

export async function addSavedAnime(type, animeId) {
  const user = await getCurrentUser()
  const table = type === 'favourites' ? 'favourites' : 'watchlist'

  const { error } = await supabase
    .from(table)
    .upsert(
      { user_id: user.id, anime_id: Number(animeId) },
      { onConflict: 'user_id,anime_id' }
    )

  if (error) throw error
}

export async function removeSavedAnime(type, animeId) {
  const user = await getCurrentUser()
  const table = type === 'favourites' ? 'favourites' : 'watchlist'

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('user_id', user.id)
    .eq('anime_id', Number(animeId))

  if (error) throw error
}
