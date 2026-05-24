# ErosMatch Cloudflare Worker Site

A React/Vite live match listing interface designed for Cloudflare Workers. The match list and stream URLs are loaded from your API, while the API key stays on Cloudflare as a runtime secret and is not exposed in the browser.

> Use this project only with stream sources that you own or have permission to publish.

## Changes in this version

- Removed the player footer text.
- Removed the "open stream in a new tab" button/link.
- The match list now refreshes automatically every 2 minutes.
- Static website UI text is now English.
- Common Turkish category names from the API are normalized to English where possible.

## Features

- API proxy: `/api/matches`
- Cloudflare runtime secret support through `MATCH_API_KEY`
- Search by team or league
- Category filters
- Responsive match cards
- HLS, DASH, MP4 and WebM player support
- Iframe fallback for embed-style stream URLs

## File structure

```txt
worker/index.js             Cloudflare Worker API proxy + static asset router
src/App.jsx                 Main React application
src/components              Match card, category bar and player components
src/styles.css              Visual design
public/_headers             Security headers
wrangler.toml               Cloudflare Worker deployment config
```

## Cloudflare Worker Git deploy

Use these settings in the Cloudflare Worker Git deploy screen:

```txt
Build command: npm run build
Deploy command: npx wrangler deploy
Path: /
```

If you uploaded the project inside a subfolder in GitHub, set `Path` to that folder name instead.

## Environment variables

After deployment, open your Worker project in Cloudflare and go to:

```txt
Settings > Variables and Secrets
```

Add these values:

```txt
MATCH_API_KEY = your API key
MATCH_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php
```

`MATCH_API_KEY` should be added as a secret. Do not upload `.env`, `.dev.vars`, or your real API key to GitHub.

## Local development

```bash
npm install
npm run build
npx wrangler dev
```

For local development, create a `.dev.vars` file:

```txt
MATCH_API_KEY="YOUR_API_KEY"
MATCH_API_URL="https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php"
```

## Player notes

The player tries sources in this order:

1. Direct video files such as `.mp4`, `.webm`, `.ogg`
2. DASH `.mpd` streams
3. HLS streams through `hls.js`
4. Iframe fallback for embed-style sources

If a stream source blocks CORS, requires DRM, blocks your domain/referrer, or returns missing media files such as `404` for `.m3u8` segments, the frontend cannot bypass that. The stream provider must allow your domain and provide a working source.
