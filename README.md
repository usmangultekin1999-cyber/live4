# ErosMacTV Cloudflare Worker Site

Live sports streaming interface for Cloudflare Workers. The site loads matches from the ErosMacTV match API, shows channels from the channels endpoint, and plays stream URLs directly from the original provider domain without proxying live media through Cloudflare.

## What changed in v38

- External odds provider integration was removed completely.
- The odds board still remains in the player popup.
- Odds buttons are local link buttons and open `ODDS_REDIRECT_URL`.
- Event info remains visible in the player details area.
- `/api/match-details` no longer calls any sports data or odds data provider.

## Cloudflare build settings

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Path: /
```

## Required runtime variables

```text
MATCH_API_KEY = your match API key
MATCH_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php
```

## Optional channels variables

```text
CHANNELS_API_URL = https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/channels.php
CHANNELS_API_KEY = optional key if different from MATCH_API_KEY
```

## Optional odds redirect variable

```text
ODDS_REDIRECT_URL = https://cryptobet545.com
```

The odds section is not connected to an external odds API. It only displays market buttons that redirect users to the configured URL.

## API endpoints

```text
/api/matches         Live match list from the match API
/api/channels        Channel list
/api/match-details   Local event info + local odds redirect board
```

## Notes

The event info and odds sections are intentionally local now. This avoids extra rate limits, third-party failures, and unnecessary API traffic while keeping the player popup layout intact.
