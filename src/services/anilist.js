
const endpoint = 'https://graphql.anilist.co'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

async function request(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  })

  if (!res.ok) {
    throw new Error(`AniList request failed (${res.status})`)
  }

  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'AniList error')
  }

  return json.data
}

const animeFields = `
  id
  idMal
  title { romaji english native }
  description(asHtml:false)
  coverImage { extraLarge large }
  bannerImage
  averageScore
  popularity
  episodes
  duration
  status
  season
  seasonYear
  genres
  format
  startDate { year month day }
  studios(isMain:true) {
    nodes { id name }
  }
`

const catalogueQuery = `
  query ($page:Int, $perPage:Int, $sort:[MediaSort], $search:String) {
    Page(page:$page, perPage:$perPage) {
      media(type:ANIME, sort:$sort, search:$search) {
        ${animeFields}
      }
    }
  }
`

export async function fetchAnime({
  page = 1,
  perPage = 18,
  sort = ['TRENDING_DESC']
} = {}) {
  const data = await request(catalogueQuery, {
    page,
    perPage,
    sort
  })

  return data.Page.media
}

export async function searchAnime(search) {
  const data = await request(catalogueQuery, {
    page: 1,
    perPage: 24,
    sort: ['SEARCH_MATCH'],
    search
  })

  return data.Page.media
}

export async function fetchAnimeById(id) {
  const query = `
    query ($id:Int) {
      Media(id:$id, type:ANIME) {
        ${animeFields}

        relations {
          edges {
            relationType
            node {
              id
              type
              title { romaji english }
              coverImage { large }
            }
          }
        }

        recommendations(sort:RATING_DESC, page:1, perPage:10) {
          nodes {
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { large }
              averageScore
              format
              seasonYear
            }
          }
        }

        characters(sort:ROLE, page:1, perPage:12) {
          edges {
            role
            node {
              id
              name { full }
              image { large }
            }
            voiceActors(language:JAPANESE) {
              id
              name { full }
              image { large }
            }
          }
        }

        staff(sort:RELEVANCE, page:1, perPage:10) {
          edges {
            role
            node {
              id
              name { full }
              image { large }
            }
          }
        }
      }
    }
  `

  const data = await request(query, {
    id: Number(id)
  })

  return data.Media
}
