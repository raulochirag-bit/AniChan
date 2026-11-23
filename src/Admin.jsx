
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'

export default function Admin() {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error: authError } =
          await supabase.auth.getUser()

        if (authError) throw authError
        if (!user) throw new Error('Please log in first.')

        const { data, error: adminError } = await supabase
          .rpc('is_admin')

        if (adminError) throw adminError
        if (!data) throw new Error('You do not have admin access.')

        setAllowed(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (loading) return <main className="page-wrap">Checking admin access...</main>

  if (!allowed) {
    return (
      <main className="page-wrap inner-page">
        <h1>Admin Access Denied</h1>
        <p>{error}</p>
      </main>
    )
  }

  return (
    <main className="page-wrap inner-page">
      <h1>AniChan Admin Dashboard</h1>
      <p className="muted">Welcome, administrator!</p>

      <div className="anime-grid" style={{ marginTop: 24 }}>
        <div className="notice">
          <h2>Add Anime</h2>
          <p>Register anime in your manual catalogue.</p>
          <button disabled>Add Anime (next step)</button>
        </div>

        <div className="notice">
          <h2>Upload Episodes</h2>
          <p>Manage your authorized video files.</p>
          <button disabled>Upload Episode (next step)</button>
        </div>

        <div className="notice">
          <h2>Manage Episodes</h2>
          <p>Edit or remove existing episodes.</p>
          <button disabled>Manage Episodes (next step)</button>
        </div>
      </div>
    </main>
  )
}
