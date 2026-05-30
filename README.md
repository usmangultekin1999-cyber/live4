# ErosMacTV Worker Site

Cloudflare Worker + Vite/React live match and channel interface for ErosMacTV.

This build keeps the broadcast flow simple:

- Match list: legacy match API + SLA / SportLiveAPI.
- Channels: ErosMacTV channel API.
- Player: uses the original stream URL directly in the visitor browser. The Worker does not proxy HLS/DASH/MP4 segments.
- Optional odds: official odds provider configured with `ODDS_API_*`.
- Optional standings: only from a custom official `STANDINGS_API_URL` if you add one.

Removed from this build:

- Previous external match-data integrations.
- Any match details loaded from those removed providers.

## Cloudflare build settings

```txt
Build command: npm run build
Deploy command: npx wrangler deploy
Path: /
```

## Required runtime variables

Add these in Cloudflare Workers & Pages > your project > Settings > Variables and Secrets:

```txt
MATCH_API_KEY          Secret
MATCH_API_URL          https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php
MATCH_SOURCE_MODE      merge

SLA_API_AUTH           Secret
SLA_API_URL            https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams

CHANNELS_API_URL       https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/channels.php
```

`CHANNELS_API_KEY` is optional. If it is not set, the Worker uses `MATCH_API_KEY` for the channel endpoint.

## Optional odds variables

```txt
ODDS_API_ENABLED       1
ODDS_API_KEY           Secret
ODDS_API_BASE_URL      https://api.the-odds-api.com/v4
ODDS_API_REGIONS       eu,uk
ODDS_API_MARKETS       h2h,totals,spreads
ODDS_API_MAX_SPORT_KEYS 8
ODDS_REDIRECT_URL      https://cryptobet545.com
```

When odds are available, clicking any odds tile opens `ODDS_REDIRECT_URL` in a new tab.

## Optional standings variables

This build no longer includes a built-in football data provider for standings. Add your own official/legal endpoint if you want the standings card to show real data:

```txt
STANDINGS_API_URL      https://your-official-standings-endpoint.example/table
STANDINGS_API_KEY      Secret, optional
```

The endpoint should return rows in one of these containers: `rows`, `standings`, `table`, or `data`.
Rows may contain fields such as `position`, `team`, `logo`, `played`, `wins`, `draws`, `losses`, `gd`, and `points`.

## Local development

```bash
npm install
npm run build
npm run dev
```

Never commit real API keys or secrets to GitHub.
