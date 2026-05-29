import { cleanDisplayText } from './helpers.js';

function cleanUrl(value = '') {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalizeClientStream(stream = {}, index = 0) {
  return {
    id: cleanDisplayText(stream.id, `line-${index + 1}`),
    name: cleanDisplayText(stream.name, `Line ${index + 1}`),
    url: cleanUrl(stream.url),
    type: cleanDisplayText(stream.type),
    isPlayed: stream.isPlayed !== false,
    height: Number.isFinite(Number(stream.height)) ? Number(stream.height) : undefined,
    width: Number.isFinite(Number(stream.width)) ? Number(stream.width) : undefined,
    frameRate: cleanDisplayText(stream.frameRate)
  };
}

function normalizeClientMatch(match = {}) {
  return {
    id: cleanDisplayText(match.id),
    source: cleanDisplayText(match.source),
    upstream_id: cleanDisplayText(match.upstream_id),
    category: cleanDisplayText(match.category, 'Other'),
    league: cleanDisplayText(match.league),
    home: cleanDisplayText(match.home, 'Home'),
    away: match.is_channel ? '' : cleanDisplayText(match.away, 'Away'),
    home_icon: cleanUrl(match.home_icon),
    away_icon: cleanUrl(match.away_icon),
    league_icon: cleanUrl(match.league_icon),
    screenshot: cleanUrl(match.screenshot),
    home_score: match.home_score,
    away_score: match.away_score,
    progress: cleanDisplayText(match.progress),
    is_channel: Boolean(match.is_channel),
    channel_group: cleanDisplayText(match.channel_group),
    is_played: match.is_played !== false,
    streams: Array.isArray(match.streams) ? match.streams.map(normalizeClientStream).filter((stream) => stream.url) : [],
    videoid: cleanUrl(match.videoid)
  };
}

export async function fetchMatches({ signal } = {}) {
  const response = await fetch('/api/matches', {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store',
    signal
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || 'Could not load the match list.');
  }

  return {
    ...payload,
    data: Array.isArray(payload.data) ? payload.data.map(normalizeClientMatch) : []
  };
}

function normalizeDetailsPayload(payload = {}) {
  return {
    ...payload,
    event: payload.event || null,
    stats: Array.isArray(payload.stats) ? payload.stats : [],
    odds: Array.isArray(payload.odds) ? payload.odds : [],
    timeline: Array.isArray(payload.timeline) ? payload.timeline : [],
    lineups: payload.lineups || null,
    related: Array.isArray(payload.related) ? payload.related : []
  };
}

export async function fetchMatchDetails(match, { signal } = {}) {
  const params = new URLSearchParams({
    match_id: cleanDisplayText(match?.id),
    home: cleanDisplayText(match?.home, 'Home'),
    away: cleanDisplayText(match?.away, 'Away'),
    category: cleanDisplayText(match?.category),
    league: cleanDisplayText(match?.league)
  });

  const response = await fetch(`/api/match-details?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'default',
    signal
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    return normalizeDetailsPayload({ success: true, matched: false });
  }

  return normalizeDetailsPayload(payload);
}
