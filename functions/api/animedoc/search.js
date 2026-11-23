
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const keyword = (url.searchParams.get("q") || "").trim()

  if (!keyword || keyword.length > 100) {
    return Response.json(
      { error: "Enter a search term (maximum 100 characters)." },
      { status: 400 }
    )
  }

  if (!env.ANIMEDOC_API_KEY) {
    return Response.json(
      { error: "AnimeDoc API key is not configured." },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      "https://api.animedoc.cloud/api/v2/anime/search/",
      {
        method: "POST",
        headers: {
          "X-API-Key": env.ANIMEDOC_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          keyword,
          page: 1,
          perPage: 15,
          subjectType: 0
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return Response.json(
        { error: result.detail || result.error || "AnimeDoc request failed." },
        { status: response.status }
      )
    }

    const items = (result.data?.items || []).map(item => ({
      title: item.title,
      description: item.description,
      releaseDate: item.releaseDate,
      genre: item.genre,
      cover: item.cover?.url || null,
      rating: item.imdbRatingValue || null
    }))

    return Response.json({
      success: true,
      total: result.data?.pager?.totalCount || items.length,
      items
    })
  } catch (error) {
    return Response.json(
      { error: "Could not connect to AnimeDoc." },
      { status: 502 }
    )
  }
}
