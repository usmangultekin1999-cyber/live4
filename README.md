# ErosMacTV Cloudflare Worker Site

A React/Vite live match listing interface for Cloudflare Workers. The stream match list is loaded from your stream API. Live video URLs are not proxied through Cloudflare: the browser plays the original provider URL directly. Extra event data, odds, statistics, timeline, lineups and related matches are fetched server-side from SportsAPI as optional enrichment. API keys stay on Cloudflare as runtime secrets and are not exposed in the browser.

> Use this project only with stream sources and sports data feeds that you own or have permission to publish.

## Changes in this version

- Site name remains `ErosMacTV` everywhere, including the header.
- Category filters are now a vertical left sidebar. Telegram and X/Twitter links are shown at the top of the sidebar.
- Live stream proxying is explicitly disabled in the Worker. Accidental same-domain HLS/DASH/media requests such as `/v/...`, `.m3u8`, `.ts`, `.m4s` and `.mp4` are rejected instead of being fetched through Cloudflare.
- The player now uses only the original absolute `videoid` URL from the provider. Relative stream URLs are treated as unavailable so they do not hit your Worker.
- `/api/match-details` is now fail-safe: SportsAPI timeouts, quota issues or 5xx responses return an empty successful payload instead of a Cloudflare 503. This prevents optional match data from breaking playback.
- SportsAPI lookups are lighter by default. Rich `/api/sportsbook` scanning is off unless `SPORTS_API_RICH_MODE=1` is added.
- Added `/api/sports-status`, a safe debug endpoint that shows how many SportsAPI events were loaded and the nearest candidates for a stream match.
- Added player detail panels: event info, statistics, odds, timeline, lineups and related matches.
- Keeps the language selector for English, Turkish, German, Spanish, Chinese, Hindi and French.
- Cleans upstream match/league text before rendering. Decorative HTML/CSS such as `<style>...</style><span>GÜNÜN MAÇI</span>` is stripped so it no longer appears on cards or player headings.
- The match list auto-refreshes every 2 minutes.

## Features

- API proxy: `/api/matches`
- Sports details proxy: `/api/match-details`
- Cloudflare runtime secret support through `MATCH_API_KEY` and `SPORTS_API_KEY`
- Multilingual UI: EN, TR, DE, ES, ZH, HI, FR
- Search by team or league
- Category filters with translated common sports labels
- Responsive match cards
- HLS, DASH, MP4 and WebM player support without server-side stream proxying
- Iframe fallback for embed-style stream URLs
- Detail panels hide gracefully when SportsAPI has no data for a match
- SportsAPI diagnostic coverage messages are hidden from viewers when no matching SportsAPI event exists

## File structure

```txt
worker/api.js                    Shared Cloudflare API handlers
worker/index.js                  Cloudflare Worker API router + static asset router
functions/api/matches.js         Cloudflare Pages Functions fallback for match list
functions/api/match-details.js   Cloudflare Pages Functions fallback for match details
functions/api/sports-status.js   Cloudflare Pages Functions fallback for SportsAPI diagnostics
src/App.jsx                      Main React application
src/lib/i18n.js                  Language text and category translations
src/lib/helpers.js               Text cleanup, parsing and formatting helpers
src/components                   Match card, category bar, player and data panels
src/styles.css                   Visual design
public/_headers                  Security headers
wrangler.toml                    Cloudflare Worker deployment config
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
MATCH_API_KEY = your stream API key
MATCH_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php
SPORTS_API_KEY = your SportsAPI key
SPORTS_API_BASE_URL = https://sports-api.net/api
# Optional only if you want the heavier odds-first SportsAPI search:
# SPORTS_API_RICH_MODE = 1
```

`MATCH_API_KEY` and `SPORTS_API_KEY` should be added as secrets. Do not upload `.env`, `.dev.vars`, or real API keys to GitHub.

You can also use `SPORTS_API_EVENTS_URL` instead of `SPORTS_API_KEY` + `SPORTS_API_BASE_URL` if you prefer storing the complete SportsAPI events URL in Cloudflare, but the recommended setup is to keep only the key in `SPORTS_API_KEY`.

## Local development

```bash
npm install
npm run build
npx wrangler dev
```

For local development, create a `.dev.vars` file:

```txt
MATCH_API_KEY="YOUR_STREAM_API_KEY"
MATCH_API_URL="https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php"
SPORTS_API_KEY="YOUR_SPORTS_API_KEY"
SPORTS_API_BASE_URL="https://sports-api.net/api"
```

## Checking SportsAPI coverage

You can check whether SportsAPI contains a stream match by opening:

```txt
/api/sports-status?home=Megapolis%20FC&away=Victory%20FC&category=Football&league=09%3A00%20%7C%20Regional%20League.%20A
```

If `matched` is `false`, the stream match is not present in SportsAPI coverage. The public player hides SportsAPI diagnostic text and simply omits the extra data panels for that match.

## How the SportsAPI enrichment works

When a user opens a match, the Worker first checks lightweight SportsAPI event routes such as `/events/filter` and `/events/live`. If you enable `SPORTS_API_RICH_MODE=1`, it can also check `/sportsbook`, which may include events, main odds and inline mapped stats but is heavier. It compares event names with the stream match `home`, `away`, `category` and `league`, then fetches additional routes such as `/events/:id`, `/offers/:eventId`, `/group/:groupId` and statistics routes when SportsAPI exposes a usable stats ID.

If SportsAPI cannot match a stream match or has no statistics/odds/lineups for that event, the site omits those public panels instead of showing diagnostic coverage text or fake values.

## Player notes

The player never downloads or re-serves live video through Cloudflare. It gives the visitor browser the provider URL directly and tries sources in this order:

1. Direct video files such as `.mp4`, `.webm`, `.ogg`
2. DASH `.mpd` streams
3. HLS streams through `hls.js`
4. Iframe fallback for embed-style sources

If a stream source blocks CORS, requires DRM, blocks your domain/referrer, or returns missing media files such as `404` for `.m3u8` segments, the frontend cannot bypass that. The stream provider must allow your domain and provide a working source.


## Branding assets

The site logo is served from `public/LOGO.PNG`. The favicon and Apple touch icon are served from `public/12.png`.


## Cloudflare stream-load protection

This version intentionally has no `/api/stream`, `/proxy`, `/hls` or media relay endpoint. If a request for a media file reaches your Worker by mistake, the Worker returns `410` and does not fetch the upstream stream. This protects your Cloudflare Worker from bandwidth/subrequest limits and keeps the stream traffic between the visitor and the provider URL.


## v17 update

The match player now opens as a fixed popup overlay again. A CSS override that caused the player to render at the bottom of the page has been removed, and the player is rendered through a React portal to prevent layout conflicts.
