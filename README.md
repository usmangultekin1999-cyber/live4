# ErosMacTV Cloudflare Worker Site

A React/Vite live match listing interface for Cloudflare Workers. The stream match list is loaded from your stream API. Live video URLs are not proxied through Cloudflare: the browser plays the original provider URL directly. Extra event data, odds, statistics, timeline, lineups and related matches are fetched server-side from SportsAPI as optional enrichment. API keys stay on Cloudflare as runtime secrets and are not exposed in the browser.

> Use this project only with stream sources and sports data feeds that you own or have permission to publish.

## Changes in v23

- Added SLA / SportLiveAPI Playback Links integration. The Worker can now load playable matches from the SLA `/lives/streams` API and map `liveList` stream lines to the existing ErosMacTV popup player.
- Added support for multiple stream lines per match, including `m3u8`, DASH and direct playback options when the provider returns backup lines. FLV/RTMP links are kept as provider-direct iframe fallbacks instead of being proxied.
- Added `MATCH_SOURCE_MODE` so you can use `merge`, `sla`, or `legacy` source mode.
- The SLA auth key stays server-side in Cloudflare secrets and is never committed to GitHub or sent as a browser-visible frontend variable.

## Changes in v21

- Removed the left menu navigation items: Home, Live Now, Sports, Schedule, Favourites and Notifications.
- Removed the sidebar More button. The sidebar now contains only Follow Us and Sports filters.
- Made the desktop search box compact and right-aligned.
- Forced category ordering everywhere: Football first, Basketball second, Volleyball third, then the remaining sports.
- Kept popup player behaviour and direct-provider stream playback.

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

- API proxy: `/api/matches` for legacy stream API + optional SLA / SportLiveAPI playback links
- Sports details proxy: `/api/match-details`
- Cloudflare runtime secret support through `MATCH_API_KEY`, `SLA_API_AUTH` and `SPORTS_API_KEY`
- Multilingual UI: EN, TR, DE, ES, ZH, HI, FR
- Search by team or league
- Category filters with translated common sports labels
- Responsive match cards
- HLS, DASH, MP4 and WebM player support without server-side stream proxying; FLV/RTMP sources use provider-direct iframe fallback
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
MATCH_API_KEY = your legacy stream API key
MATCH_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php

# SLA / SportLiveAPI playback links. Add SLA_API_AUTH as a Secret.
SLA_API_AUTH = your SLA auth key
SLA_API_URL = https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams
# Optional if your provider gave you the /lives/page URL:
SLA_API_PAGE_URL = https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/page
# Optional: merge, sla, or legacy. Default is merge.
MATCH_SOURCE_MODE = merge

SPORTS_API_KEY = your SportsAPI key
SPORTS_API_BASE_URL = https://sports-api.net/api
# Optional only if you want the heavier odds-first SportsAPI search:
# SPORTS_API_RICH_MODE = 1
```

`MATCH_API_KEY`, `SLA_API_AUTH` and `SPORTS_API_KEY` should be added as secrets. Do not upload `.env`, `.dev.vars`, or real API keys to GitHub.

You can also use `SPORTS_API_EVENTS_URL` instead of `SPORTS_API_KEY` + `SPORTS_API_BASE_URL` if you prefer storing the complete SportsAPI events URL in Cloudflare, but the recommended setup is to keep only the key in `SPORTS_API_KEY`.

## SLA / SportLiveAPI integration

The SLA integration uses Playback Links mode. The Worker requests the SLA API server-side, normalizes matches into the existing ErosMacTV match format, and sends the visitor browser the original provider playback URL directly. It does **not** proxy live manifests or media segments through Cloudflare.

Recommended configuration:

```txt
SLA_API_AUTH = your SLA auth key
SLA_API_URL = https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams
MATCH_SOURCE_MODE = merge
```

If you want to use only the SLA API and ignore the old stream API, set:

```txt
MATCH_SOURCE_MODE = sla
```

If your provider specifically gave you a `/lives/page?auth=...` URL, do **not** commit that URL with the real auth key to GitHub. Add the auth key as `SLA_API_AUTH`; optionally set `SLA_API_PAGE_URL` to the page endpoint without the auth query. The Worker will try the page response first and fall back to the documented `/lives/streams` endpoint when needed.

The default SLA sports requests include these type mappings:

```txt
1 Soccer / Football
18 Basketball
91 Volleyball
94 Badminton
16 Baseball
3 Cricket
13 Tennis
17 Ice Hockey
92 Table Tennis
14 Snooker
12 American Football
151 E-sports with gameId 1, 2, 3 and 4
```

To override the requested SLA types:

```txt
SLA_API_TYPES = 1,18,91,94,151:1,151:2
```

## Local development

```bash
npm install
npm run build
npx wrangler dev
```

For local development, create a `.dev.vars` file:

```txt
MATCH_API_KEY="YOUR_LEGACY_STREAM_API_KEY"
MATCH_API_URL="https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php"
SLA_API_AUTH="YOUR_SLA_AUTH_KEY"
SLA_API_URL="https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams"
MATCH_SOURCE_MODE="merge"
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
4. Iframe fallback for embed-style, FLV or RTMP sources

If a stream source blocks CORS, requires DRM, blocks your domain/referrer, or returns missing media files such as `404` for `.m3u8` segments, the frontend cannot bypass that. The stream provider must allow your domain and provide a working source.


## Branding assets

The site logo is served from `public/LOGO.PNG`. The favicon and Apple touch icon are served from `public/12.png`.


## Cloudflare stream-load protection

This version intentionally has no `/api/stream`, `/proxy`, `/hls` or media relay endpoint. If a request for a media file reaches your Worker by mistake, the Worker returns `410` and does not fetch the upstream stream. This protects your Cloudflare Worker from bandwidth/subrequest limits and keeps the stream traffic between the visitor and the provider URL.


## v17 update

The match player now opens as a fixed popup overlay again. A CSS override that caused the player to render at the bottom of the page has been removed, and the player is rendered through a React portal to prevent layout conflicts.


## v20 changes

- Removed the static Home/Live Now/Sports/Schedule/Favourites/Notifications links from the left menu.
- Reduced and right-aligned the search area.
- Prioritized Football, Basketball and Volleyball categories at the top of tabs, sidebar and sections.
