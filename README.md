# ErosMacTV Cloudflare Worker Site

Live sports streaming interface for Cloudflare Workers. The site loads matches from the legacy match API and/or SLA SportLiveAPI, shows channels from the channels endpoint, and plays stream URLs directly from the original provider domain without proxying live media through Cloudflare.

## What changed in v34

- Official odds matching was widened. Default `ODDS_API_MAX_SPORT_KEYS` is now 35 so more sport/league keys are checked.
- The odds section now remains usable on every match popup. If official prices are not available for the exact broadcast match, it shows link-only Cryptobet market buttons instead of an empty odds panel.
- No fake decimal odds are generated. Numeric odds are shown only when the official odds provider returns a real matching market.

- Odds panel now appears for every non-channel match.
- If the official odds provider has a matching event, real decimal odds are shown.
- If no matching official market exists, the panel shows clean Cryptobet action buttons instead of staying empty.
- No fake odds are generated. Link-only fallback selections display an open action, not fabricated prices.
- external football data integration remains removed.
- external data provider integration remains removed.
- Stream URLs are still not proxied through the Worker.

## Cloudflare build settings

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Path: /
```

## Required runtime variables

```text
MATCH_API_KEY = your legacy match API key
MATCH_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php
MATCH_SOURCE_MODE = merge
```

## Optional SLA variables

```text
SLA_API_AUTH = your SLA auth key
SLA_API_URL = https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams
SLA_API_PAGE_URL = https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/page
```

## Optional channels variables

```text
CHANNELS_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/channels.php
CHANNELS_API_KEY = optional key if different from MATCH_API_KEY
```

## Optional official odds variables

```text
ODDS_API_ENABLED = 1
ODDS_API_KEY = your official odds provider key
ODDS_API_BASE_URL = https://api.the-odds-api.com/v4
ODDS_API_REGIONS = eu,uk
ODDS_API_MARKETS = h2h,totals,spreads
ODDS_API_MAX_SPORT_KEYS = 35
ODDS_REDIRECT_URL = https://cryptobet545.com
```

`MATCH_API_KEY`, `SLA_API_AUTH`, `CHANNELS_API_KEY` and `ODDS_API_KEY` should be configured as Cloudflare Secrets. Do not upload real keys to GitHub.

## API endpoints

```text
/api/matches         Live match list from legacy API and/or SLA
/api/channels        Channel list
/api/match-details   Local match board + optional official odds
```

## Notes

The score/table panel no longer depends on external sports-data providers. It is built from the broadcast match itself, so playback is not affected by third-party statistics failures. The odds panel can work with an official odds provider, but it falls back to Cryptobet link buttons when the provider does not cover a specific broadcast match.
