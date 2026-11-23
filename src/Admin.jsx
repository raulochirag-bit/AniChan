
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'

export default function Admin() {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [anime, setAnime] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const [animeForm, setAnimeForm] = useState({
    title: '',
    synopsis: '',
    poster_url: ''
  })

  const [episodeForm, setEpisodeForm] = useState({
    anime_id: '',
    episode_number: 1,
    title: '',
    file: null
  })

  async function loadData() {
    const [animeResult, episodeResult] = await Promise.all([
      supabase.from('manual_anime').select('*').order('created_at', {
        ascending: false
      }),
      supabase.from('manual_episodes').select('*').order('episode_number')
    ])

    if (animeResult.error) throw animeResult.error
    if (episodeResult.error) throw episodeResult.error

    setAnime(animeResult.data || [])
    setEpisodes(episodeResult.data || [])
  }

  useEffect(() => {
    async function initialize() {
      try {
        const { data: { user }, error } =
          await supabase.auth.getUser()

        if (error) throw error
        if (!user) throw new Error('Please log in first.')

        const { data, error: adminError } =
          await supabase.rpc('is_admin')

        if (adminError) throw adminError
        if (!data) throw new Error('Admin access required.')

        setAllowed(true)
        await loadData()
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  async function addAnime(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('manual_anime')
        .insert(animeForm)

      if (error) throw error

      setAnimeForm({
        title: '',
        synopsis: '',
        poster_url: ''
      })

      await loadData()
      setMessage('Anime added successfully!')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function uploadEpisode(e) {
    e.preventDefault()

    const file = episodeForm.file

    if (!file || !episodeForm.anime_id) {
      setMessage('Select an anime and a video file.')
      return
    }

    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      setMessage('Only MP4 and WebM files are supported.')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage('File must be 50 MB or smaller.')
      return
    }

    setBusy(true)
    setMessage('Uploading episode...')

    const path =
      `${episodeForm.anime_id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('anichan-episodes')
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('anichan-episodes')
        .getPublicUrl(path)

      const { error: insertError } = await supabase
        .from('manual_episodes')
        .insert({
          anime_id: episodeForm.anime_id,
          episode_number: Number(episodeForm.episode_number),
          title: episodeForm.title,
          video_path: data.publicUrl
        })

      if (insertError) {
        await supabase.storage
          .from('anichan-episodes')
          .remove([path])
        throw insertError
      }

      setEpisodeForm({
        anime_id: '',
        episode_number: 1,
        title: '',
        file: null
      })

      document.getElementById('episode-file').value = ''

      await loadData()
      setMessage('Episode uploaded successfully!')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteEpisode(episode) {
    if (!confirm('Delete this episode?')) return

    setBusy(true)

    try {
      const url = new URL(episode.video_path)
      const marker = '/anichan-episodes/'
      const index = url.pathname.indexOf(marker)

      if (index === -1) throw new Error('Invalid video storage URL.')

      const path = decodeURIComponent(
        url.pathname.slice(index + marker.length)
      )

      const { error: deleteFileError } = await supabase.storage
        .from('anichan-episodes')
        .remove([path])

      if (deleteFileError) throw deleteFileError

      const { error } = await supabase
        .from('manual_episodes')
        .delete()
        .eq('id', episode.id)

      if (error) throw error

      await loadData()
      setMessage('Episode deleted.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <main className="page-wrap">Checking admin access...</main>
  }

  if (!allowed) {
    return (
      <main className="page-wrap inner-page">
        <h1>Admin Access Denied</h1>
        <p>{message}</p>
      </main>
    )
  }

  return (
    <main className="page-wrap inner-page">
      <h1>AniChan Admin</h1>
      <p className="muted">Manage your anime and authorized episodes.</p>

      {message && (
        <p className="notice" style={{ marginTop: 20 }}>
          {message}
        </p>
      )}

      <section className="notice" style={{ marginTop: 24, padding: 24 }}>
        <h2>Add Anime</h2>

        <form onSubmit={addAnime}>
          <input
            required
            placeholder="Anime title"
            value={animeForm.title}
            onChange={e => setAnimeForm({
              ...animeForm,
              title: e.target.value
            })}
          />

          <textarea
            placeholder="Synopsis"
            value={animeForm.synopsis}
            onChange={e => setAnimeForm({
              ...animeForm,
              synopsis: e.target.value
            })}
          />

          <input
            type="url"
            placeholder="Poster image URL"
            value={animeForm.poster_url}
            onChange={e => setAnimeForm({
              ...animeForm,
              poster_url: e.target.value
            })}
          />

          <button disabled={busy} type="submit">
            Add Anime
          </button>
        </form>
      </section>

      <section className="notice" style={{ marginTop: 24, padding: 24 }}>
        <h2>Upload Episode</h2>

        <form onSubmit={uploadEpisode}>
          <select
            required
            value={episodeForm.anime_id}
            onChange={e => setEpisodeForm({
              ...episodeForm,
              anime_id: e.target.value
            })}
          >
            <option value="">Select anime</option>
            {anime.map(item => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            min="1"
            placeholder="Episode number"
            value={episodeForm.episode_number}
            onChange={e => setEpisodeForm({
              ...episodeForm,
              episode_number: e.target.value
            })}
          />

          <input
            placeholder="Episode title"
            value={episodeForm.title}
            onChange={e => setEpisodeForm({
              ...episodeForm,
              title: e.target.value
            })}
          />

          <label htmlFor="episode-file">Video file (MP4/WebM, max 50 MB)</label>

          <input
            id="episode-file"
            required
            type="file"
            accept="video/mp4,video/webm"
            onChange={e => setEpisodeForm({
              ...episodeForm,
              file: e.target.files?.[0] || null
            })}
          />

          <button disabled={busy || anime.length === 0} type="submit">
            {busy ? 'Please wait...' : 'Upload Episode'}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Your Anime ({anime.length})</h2>

        {anime.map(item => (
          <div className="notice" key={item.id}
            style={{ marginTop: 12, padding: 16 }}>
            <strong>{item.title}</strong>
            <p className="muted">
              {episodes.filter(ep => ep.anime_id === item.id).length} episodes
            </p>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Episode Manager ({episodes.length})</h2>

        {episodes.map(ep => (
          <div className="notice" key={ep.id}
            style={{ marginTop: 12, padding: 16 }}>
            <strong>
              {anime.find(a => a.id === ep.anime_id)?.title || 'Anime'}
              {' '} — Episode {ep.episode_number}
            </strong>

            <p className="muted">{ep.title}</p>

            <a href={ep.video_path} target="_blank" rel="noreferrer">
              Preview video
            </a>

            <br />

            <button
              disabled={busy}
              onClick={() => deleteEpisode(ep)}
              style={{ marginTop: 12 }}
            >
              Delete Episode
            </button>
          </div>
        ))}
      </section>
    </main>
  )
}
