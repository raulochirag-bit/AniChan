import Profile from './Profile'
import {
  getSavedAnime,
  addSavedAnime,
  removeSavedAnime
} from './services/userLibrary'
import Library from './Library'
import { supabase } from './services/supabase'
import Auth from './Auth'
import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Search, Play, BookmarkPlus, Star, Flame, Compass, Menu, X, ChevronRight, ArrowLeft } from 'lucide-react'
import { fetchAnime, fetchAnimeById, searchAnime } from './services/anilist'
import { jikanSearch } from './services/jikan'

const titleOf = a => a?.title?.english || a?.title?.romaji || a?.title?.native || 'Untitled'

function Header() {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const nav = useNavigate()

  function submit(e) {
    e.preventDefault()
    if (term.trim()) {
      nav(`/search?q=${encodeURIComponent(term.trim())}`)
    }
  }

  return (
    <header className="header">
      <Link to="/" className="brand">
        <span className="brand-mark">A</span>
        Ani<span>Chan</span>
      </Link>

      <Link
        to="/login"
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
      >
        Login
      </Link>

     <nav>
  <Link to="/profile">My Profile</Link>
  <Link to="/">Home</Link>
  <Link to="/library">My Library</Link>
  <a href="/#trending">Trending</a>
  <a href="/#popular">Popular</a>
</nav>

      <form className="search" onSubmit={submit}>
        <Search size={18} />
        <input
          value={term}
          onChange={e => setTerm(e.target.value)}
          placeholder="Search anime..."
        />
        <button>Search</button>
      </form>

      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      {open && (
        <div className="mobile-links">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <a href="/#trending">Trending</a>
          <a href="/#popular">Popular</a>
        </div>
      )}
    </header>
  )
}

function AnimeCard({anime}){
 return <Link className="anime-card" to={`/anime/${anime.id}`}><div className="poster-wrap"><img src={anime.coverImage?.large || anime.coverImage?.extraLarge} alt={titleOf(anime)} loading="lazy"/><span className="score"><Star size={12} fill="currentColor"/> {anime.averageScore ? (anime.averageScore/10).toFixed(1):'NR'}</span><span className="card-hover"><Play fill="currentColor"/></span></div><div className="card-title">{titleOf(anime)}</div><div className="muted">{anime.format || 'Anime'} {anime.seasonYear ? `• ${anime.seasonYear}`:''}</div></Link>
}
function Section({title,icon:Icon,items,anchor}){return <section className="section" id={anchor}><div className="section-heading"><h2>{Icon&&<Icon size={20}/>} {title}</h2><span className="section-note">Powered by AniList</span></div><div className="anime-grid">{items.map(a=><AnimeCard key={a.id} anime={a}/>)}</div></section>}
function Home(){
 const [trending,setTrending]=useState([]),[popular,setPopular]=useState([]),[season,setSeason]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(true)
 useEffect(()=>{let live=true;(async()=>{try{const [t,p,s]=await Promise.all([fetchAnime({sort:['TRENDING_DESC']}),fetchAnime({sort:['POPULARITY_DESC']}),fetchAnime({sort:['START_DATE_DESC']})]);if(live){setTrending(t);setPopular(p);setSeason(s)}}catch(e){if(live)setError(e.message)}finally{if(live)setLoading(false)}})();return()=>{live=false}},[])
 const hero=trending[0]
 return <main>{hero&&<section className="hero" style={{backgroundImage:`linear-gradient(90deg,#090a12 5%,rgba(9,10,18,.88) 45%,rgba(9,10,18,.15)),url(${hero.bannerImage||hero.coverImage?.extraLarge})`}}><div className="hero-content"><span className="eyebrow"><Flame size={15}/> FEATURED • TRENDING</span><h1>{titleOf(hero)}</h1><p>{(hero.description||'Discover your next favourite anime on AniChan.').replace(/<[^>]*>/g,' ').slice(0,230)}...</p><div className="hero-meta"><span><Star size={15} fill="currentColor"/> {hero.averageScore?`${(hero.averageScore/10).toFixed(1)} / 10`:'Not rated'}</span><span>{hero.format||'Anime'}</span><span>{hero.seasonYear||'New'}</span></div><Link className="primary-btn" to={`/anime/${hero.id}`}><Play size={17} fill="currentColor"/> Explore anime</Link></div></section>}
 <div className="page-wrap">{error&&<div className="notice">Could not load catalogue: {error}. Please refresh in a moment.</div>}{loading&&<div className="loading">Loading anime catalogue...</div>}{!loading&&<><Section title="Trending now" icon={Flame} items={trending} anchor="trending"/><Section title="Popular anime" icon={Star} items={popular} anchor="popular"/><Section title="Recently added" icon={Compass} items={season}/></>}</div></main>
}
function SearchPage(){
 const params=new URLSearchParams(location.search), initial=params.get('q')||''
 const [term,setTerm]=useState(initial),[items,setItems]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState('')
 useEffect(()=>{if(!initial)return;let live=true;setLoading(true);searchAnime(initial).then(x=>{if(live)setItems(x)}).catch(async e=>{try{const x=await jikanSearch(initial);if(live)setItems(x.map(a=>({id:a.mal_id,title:{english:a.title},coverImage:{large:a.images?.jpg?.large_image_url},averageScore:a.score?Math.round(a.score*10):null,format:a.type,seasonYear:a.year})))}catch{if(live)setError(e.message)}}).finally(()=>live&&setLoading(false));return()=>{live=false}},[initial])
 const nav=useNavigate()
 return <main className="page-wrap inner-page"><h1>Search anime</h1><form className="search big-search" onSubmit={e=>{e.preventDefault();nav(`/search?q=${encodeURIComponent(term)}`);location.href=`/search?q=${encodeURIComponent(term)}`}}><Search/><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Try Naruto, One Piece..."/><button>Search</button></form>{loading&&<p className="loading">Searching...</p>}{error&&<p className="notice">{error}</p>}{!loading&&<div className="anime-grid">{items.map(a=><AnimeCard key={a.id} anime={a}/>)}</div>}{!loading&&!items.length&&initial&&<p className="muted">No results found. Try another title.</p>}</main>
}

function AnimeDetail(){
  const {id}=useParams()
  const [anime,setAnime]=useState(null)
  const [error,setError]=useState('')
  const [watchlisted,setWatchlisted]=useState(false)
  const [favourited,setFavourited]=useState(false)
  const [saveMessage,setSaveMessage]=useState('')

  useEffect(()=>{
    let live=true
    setAnime(null)
    setError('')

    fetchAnimeById(id)
      .then(x=>{if(live)setAnime(x)})
      .catch(e=>{if(live)setError(e.message)})

    return ()=>{live=false}
  },[id])

  useEffect(()=>{
    let live=true

    Promise.all([
      getSavedAnime('watchlist'),
      getSavedAnime('favourites')
    ]).then(([w,f])=>{
      if(live){
        setWatchlisted(w.includes(Number(id)))
        setFavourited(f.includes(Number(id)))
      }
    }).catch(()=>{
      if(live){
        setWatchlisted(false)
        setFavourited(false)
      }
    })

    return ()=>{live=false}
  },[id])

  async function toggleSaved(type){
    try{
      const saved=type==='watchlist'?watchlisted:favourited

      if(saved){
        await removeSavedAnime(type,id)
      }else{
        await addSavedAnime(type,id)
      }

      if(type==='watchlist')setWatchlisted(!saved)
      else setFavourited(!saved)

      setSaveMessage(saved?'Removed successfully!':'Saved successfully!')
    }catch(e){
      setSaveMessage(e.message||'Please log in first.')
    }
  }

  if(error)return (
    <div className="page-wrap inner-page">
      <p className="notice">{error}</p>
      <Link to="/">Back home</Link>
    </div>
  )

  if(!anime)return (
    <div className="loading inner-page">
      Loading anime details...
    </div>
  )

  const title=titleOf(anime)
  const recommendations=anime.recommendations?.nodes
    ?.map(x=>x.mediaRecommendation)
    .filter(Boolean)||[]

  const characters=anime.characters?.edges||[]
  const staff=anime.staff?.edges||[]

  const heading={
    marginTop:32,
    marginBottom:16,
    fontSize:22
  }

  const peopleGrid={
    display:'grid',
    gridTemplateColumns:'repeat(auto-fill,minmax(125px,1fr))',
    gap:16
  }

  const personCard={
    background:'#171725',
    borderRadius:12,
    overflow:'hidden',
    textAlign:'center',
    paddingBottom:12
  }

  return (
    <main>
      <div className="detail-banner"
        style={{
          backgroundImage:`linear-gradient(0deg,#090a12,transparent),url(${anime.bannerImage||anime.coverImage?.extraLarge})`
        }}
      />

      <div className="page-wrap detail-layout">
        <img
          className="detail-poster"
          src={anime.coverImage?.extraLarge}
          alt={title}
        />

        <div className="detail-info">
          <Link to="/" className="back">
            <ArrowLeft size={16}/> Home
          </Link>

          <h1>{title}</h1>
          <p className="native-title">{anime.title?.native}</p>

          <div className="hero-meta">
            <span>
              <Star size={15} fill="currentColor"/>
              {anime.averageScore?(anime.averageScore/10).toFixed(1):'NR'}
            </span>
            <span>{anime.format}</span>
            <span>{anime.episodes||'?'} episodes</span>
            <span>{anime.seasonYear||'TBA'}</span>
          </div>

          <div className="genres">
            {anime.genres?.map(g=><span key={g}>{g}</span>)}
          </div>

          <h3 style={heading}>Synopsis</h3>
          <p className="synopsis">
            {(anime.description||'No synopsis available.').replace(/<[^>]*>/g,' ')}
          </p>

          <h3 style={heading}>Information</h3>
          <p className="muted">
            Status: {anime.status||'Unknown'} ·
            Season: {anime.season||'Unknown'} ·
            Studio: {anime.studios?.nodes?.map(s=>s.name).join(', ')||'Unknown'}
          </p>

          <div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'20px 0'}}>
            <button
              onClick={()=>toggleSaved('watchlist')}
              className="px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold"
            >
              {watchlisted?'✓ In Watchlist':'+ Add to Watchlist'}
            </button>

            <button
              onClick={()=>toggleSaved('favourites')}
              className="px-5 py-3 rounded-lg bg-pink-600 text-white font-semibold"
            >
              {favourited?'♥ Favourited':'♡ Add to Favourites'}
            </button>
          </div>

          {saveMessage&&<p className="notice">{saveMessage}</p>}

          <div className="notice">
            Episodes are available only through official or licensed sources.
          </div>

          {characters.length>0&&<>
            <h2 style={heading}>Characters & Voice Actors</h2>
            <div style={peopleGrid}>
              {characters.map(edge=>(
                <div style={personCard} key={edge.node.id}>
                  <img src={edge.node.image?.large} alt={edge.node.name.full}
                    style={{width:'100%',height:155,objectFit:'cover'}}/>
                  <div style={{padding:8}}>
                    <strong>{edge.node.name.full}</strong>
                    <p className="muted">{edge.role}</p>
                    {edge.voiceActors?.[0]&&<>
                      <small>Japanese VA</small>
                      <p>{edge.voiceActors[0].name.full}</p>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </>}

          {staff.length>0&&<>
            <h2 style={heading}>Production Staff</h2>
            <div style={peopleGrid}>
              {staff.map(edge=>(
                <div style={personCard} key={edge.node.id}>
                  <img src={edge.node.image?.large} alt={edge.node.name.full}
                    style={{width:'100%',height:155,objectFit:'cover'}}/>
                  <div style={{padding:8}}>
                    <strong>{edge.node.name.full}</strong>
                    <p className="muted">{edge.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {recommendations.length>0&&<>
            <h2 style={heading}>You May Also Like</h2>
            <div className="anime-grid">
              {recommendations.map(a=><AnimeCard key={a.id} anime={a}/>)}
            </div>
          </>}
        </div>
      </div>
    </main>
  )
}

function App(){
  const [session,setSession]=useState(null)
  const [authLoading,setAuthLoading]=useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      setSession(data.session)
      setAuthLoading(false)
    })

    const {data:{subscription}}=supabase.auth.onAuthStateChange(
      (_event,session)=>{
        setSession(session)
      }
    )

    return ()=>subscription.unsubscribe()
  },[])

  if(authLoading)return <div className="loading">Loading AniChan...</div>

  return (
    <>
      <Header/>
      <Routes>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Auth/>}/>
        <Route path="/library" element={<Library/>}/>
        <Route path="/search" element={<SearchPage/>}/>
        <Route path="/anime/:id" element={<AnimeDetail/>}/>
        <Route path="*" element={
          <div className="page-wrap inner-page">
            <h1>Page not found</h1>
            <Link to="/">Return home</Link>
          </div>
        }/>
      </Routes>

      <footer>
        <Link to="/" className="brand">
          <span className="brand-mark">A</span>
          Ani<span>Chan</span>
        </Link>
        <p>Discover anime. Find your next adventure.</p>
        <small>
          Anime metadata provided by AniList and Jikan.
          AniChan is an independent discovery project.
        </small>
      </footer>
    </>
  )
}

export default App


function App() {
  return (
    <>
      <Header />
      <<Route path="/library" element={<Library />} />>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="*" element={
          <div className="page-wrap inner-page">
            <h1>Page not found</h1>
            <Link to="/">Return home</Link>
          </div>
        } />
      </Routes>
      <footer>
        <Link to="/" className="brand">
          <span className="brand-mark">A</span>
          Ani<span>Chan</span>
        </Link>
        <p>Discover anime. Find your next adventure.</p>
        <small>
          Anime metadata provided by AniList and Jikan.
          AniChan is an independent discovery project.
        </small>
      </footer>
    </>
  )
}
export default App
