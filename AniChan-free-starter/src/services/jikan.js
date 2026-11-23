const base = 'https://api.jikan.moe/v4'
export async function jikanSearch(term) {
 const res = await fetch(`${base}/anime?q=${encodeURIComponent(term)}&limit=12`)
 if (!res.ok) throw new Error(`Jikan request failed (${res.status})`)
 return (await res.json()).data
}
// Jikan is a backup metadata source. Respect its rate limits; avoid rapid repeated requests.