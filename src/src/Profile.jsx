
import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {supabase} from './services/supabase'
import {getSavedAnime} from './services/userLibrary'

export default function Profile(){
  const [user,setUser]=useState(null)
  const [watchlistCount,setWatchlistCount]=useState(0)
  const [favouriteCount,setFavouriteCount]=useState(0)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    async function loadProfile(){
      try{
        const {data,error}=await supabase.auth.getUser()
        if(error)throw error
        if(!data.user){
          setError('Please log in to view your profile.')
          return
        }

        setUser(data.user)

        const [watchlist,favourites]=await Promise.all([
          getSavedAnime('watchlist'),
          getSavedAnime('favourites')
        ])

        setWatchlistCount(watchlist.length)
        setFavouriteCount(favourites.length)
      }catch(e){
        setError(e.message||'Could not load profile.')
      }finally{
        setLoading(false)
      }
    }

    loadProfile()
  },[])

  if(loading)return <div className="loading">Loading profile...</div>

  if(error)return (
    <main className="page-wrap inner-page">
      <h1>My Profile</h1>
      <p className="notice">{error}</p>
      <Link to="/login">Go to Login</Link>
    </main>
  )

  return (
    <main className="page-wrap inner-page">
      <h1>My Profile</h1>
      <div className="notice" style={{marginTop:24,padding:24}}>
        <h2 style={{fontSize:24,marginBottom:12}}>
          {user?.user_metadata?.username||user?.email?.split('@')[0]||'Anime Fan'}
        </h2>
        <p className="muted">{user?.email}</p>
        <p className="muted" style={{marginTop:8}}>
          Member since: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="anime-grid" style={{marginTop:24}}>
        <div className="notice">
          <h2>Watchlist</h2>
          <p style={{fontSize:30,fontWeight:700}}>{watchlistCount}</p>
          <Link to="/library">View Watchlist</Link>
        </div>

        <div className="notice">
          <h2>Favourites</h2>
          <p style={{fontSize:30,fontWeight:700}}>{favouriteCount}</p>
          <Link to="/library">View Favourites</Link>
        </div>
      </div>
    </main>
  )
}
