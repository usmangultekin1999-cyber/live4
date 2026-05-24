# erosmactv Cloudflare Worker Site

A React/Vite live match listing interface for Cloudflare Workers. The match list and stream URLs are loaded from your API, while the API key stays on Cloudflare as a runtime secret and is not exposed in the browser.

> Use this project only with stream sources that you own or have permission to publish.

## Changes in this version

- Added a language selector for English, Turkish, German, Spanish, Chinese, Hindi and French.
- The site name stays `erosmactv` in every language.
- Cleaned upstream match/league text before rendering. Decorative HTML/CSS such as `<style>...</style><span>GÜNÜN MAÇI</span>` is stripped so it no longer appears on match cards or in the player header.
- The match list continues to auto-refresh every 2 minutes.
- The player footer text and the old “open in new tab” link remain removed.

## Features

- API proxy: `/api/matches`
- Cloudflare runtime secret support through `MATCH_API_KEY`
- Multilingual UI: EN, TR, DE, ES, ZH, HI, FR
- Search by team or league
- Category filters with translated common sports labels
- Responsive match cards
- HLS, DASH, MP4 and WebM player support
- Iframe fallback for embed-style stream URLs

## File structure

```txt
worker/index.js             Cloudflare Worker API proxy + static asset router
functions/api/matches.js    Cloudflare Pages Functions API proxy fallback
src/App.jsx                 Main React application
src/lib/i18n.js             Language text and category translations
src/lib/helpers.js          Text cleanup, parsing and formatting helpers
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
