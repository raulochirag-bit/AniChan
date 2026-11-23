
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSavedAnime, removeSavedAnime } from './services/userLibrary'
import { fetchAnimeById } from './services/anilist'

export default function Library() {
  const [tab, setTab] = useState('watchlist')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadLibrary() {
    setLoading(true)
    setError('')

    try {
      const ids = await getSavedAnime(tab)
      const animeList = await Promise.all(
        ids.map(id => fetchAnimeById(id).catch(() => null))
      )
      setItems(animeList.filter(Boolean))
    } catch (e) {
      setError(e.message || 'Could not load your library.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLibrary()
  }, [tab])

  async function handleRemove(id) {
    try {
      await removeSavedAnime(tab, id)
      setItems(current => current.filter(anime => anime.id !== id))
    } catch (e) {
      setError(e.message || 'Could not remove anime.')
    }
  }

  return (
    <main className="page-wrap inner-page">
      <h1>My Library</h1>
      <p className="muted">Your personal anime collection.</p>

      <div className="flex gap-3 my-6 flex-wrap">
        <button
          onClick={() => setTab('watchlist')}
          className={`px-5 py-3 rounded-lg font-semibold ${tab === 'watchlist' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-white'}`}
        >
          Watchlist
        </button>

        <button
          onClick={() => setTab('favourites')}
          className={`px-5 py-3 rounded-lg font-semibold ${tab === 'favourites' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-white'}`}
        >
          Favourites
        </button>
      </div>

      {loading && <p className="muted">Loading your library...</p>}

      {error && <p className="notice">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="notice">Nothing saved here yet.</p>
      )}

      <div className="anime-grid">
        {items.map(anime => (
          <div key={anime.id} className="relative">
            <Link to={`/anime/${anime.id}`}>
              <img
                src={anime.coverImage?.large}
                alt={anime.title?.english || anime.title?.romaji || 'Anime'}
                className="w-full rounded-xl"
              />
              <h3 className="mt-2 font-semibold">
                {anime.title?.english || anime.title?.romaji}
              </h3>
            </Link>

            <button
              onClick={() => handleRemove(anime.id)}
              className="mt-2 px-3 py-2 rounded-lg bg-red-600 text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
