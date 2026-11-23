const endpoint = 'https://graphql.anilist.co'
const query = `query ($page:Int,$perPage:Int,$sort:[MediaSort],$search:String) {
 Page(page:$page,perPage:$perPage) {
  media(type:ANIME, sort:$sort, search:$search) {
   id idMal title { romaji english native } description(asHtml:false)
   coverImage { extraLarge large } bannerImage averageScore popularity
   episodes status season seasonYear genres format
   studios(isMain:true) { nodes { name } }
  }
 }
}`
export async function fetchAnime({page=1, perPage=18, sort=['TRENDING_DESC']}={}) {
 const res = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query,variables:{page,perPage,sort}})})
 if (!res.ok) throw new Error(`AniList request failed (${res.status})`)
 const json = await res.json()
 if (json.errors) throw new Error(json.errors[0]?.message || 'AniList error')
 return json.data.Page.media
}
export async function searchAnime(search) {
 const res = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query,variables:{page:1,perPage:24,sort:['SEARCH_MATCH'],search}})})
 if (!res.ok) throw new Error(`AniList request failed (${res.status})`)
 const json = await res.json()
 if (json.errors) throw new Error(json.errors[0]?.message || 'AniList error')
 return json.data.Page.media
}
export async function fetchAnimeById(id) {
 const q = `query ($id:Int) { Media(id:$id,type:ANIME) { id idMal title { romaji english native } description(asHtml:false) coverImage { extraLarge large } bannerImage averageScore popularity episodes status season seasonYear genres format startDate { year month day } studios(isMain:true) { nodes { name } } relations { edges { relationType node { id type title { romaji english } coverImage { large } } } } } }`
 const res = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:q,variables:{id:Number(id)}})})
 if (!res.ok) throw new Error(`AniList request failed (${res.status})`)
 const json = await res.json()
 if (json.errors) throw new Error(json.errors[0]?.message || 'AniList error')
 return json.data.Media
}
