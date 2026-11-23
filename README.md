# AniChan

A free-to-start anime discovery website built with React + Vite. Anime metadata comes from the public AniList GraphQL API, with Jikan available as a fallback search provider.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder.
3. Open a terminal in this folder and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite.

## Free deployment

### GitHub Pages (static site)
For the simplest free hosting, push this repository to GitHub and deploy with Cloudflare Pages (recommended) or GitHub Pages. On Cloudflare Pages choose:
- Connect to Git
- Build command: `npm run build`
- Build output directory: `dist`

Cloudflare Pages has a free tier. A custom domain is optional; the free `pages.dev` address is enough.

### GitHub Pages note
If using GitHub Pages, configure Vite's `base` to your repository path in `vite.config.js`, and add SPA fallback handling for client-side routes. Cloudflare Pages is simpler for this app's routes.

## APIs

- AniList GraphQL: https://graphql.anilist.co/
- Jikan REST API: https://api.jikan.moe/v4/

Public metadata APIs do not require a private API key. Respect rate limits, cache responses, and follow each service's terms and attribution requirements.

## Supabase (optional next stage)

The app includes a Supabase client placeholder. To enable accounts, create a free Supabase project, copy its project URL and public anon/publishable key into `.env` (based on `.env.example`), and implement database tables plus Row Level Security before exposing user data. Never use a service-role key in frontend code.

## Playback and copyright

This starter is an anime discovery catalogue, not a source of pirated episodes. Actual playback should only be enabled for video sources you own, have permission to distribute, or are officially licensed to embed. The detail page intentionally explains this boundary. No unauthorized stream scraping or extraction is included.

## Current features

- Responsive dark purple AniChan design
- Trending, popular, and recent anime from AniList
- Search through AniList with Jikan fallback
- Anime detail pages with synopsis, genres, score, studios and related metadata
- Optional Supabase client setup placeholder

## Next stages

1. Supabase authentication, watchlist, favourites and viewing history with RLS.
2. Admin dashboard for anime and licensed episode-source management.
3. Authorized HTML5/HLS playback and subtitle support.
4. Caching, pagination, API retry/backoff and automated deployment.
