import { cleanDisplayText } from './helpers.js';

function cleanUrl(value = '') {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalizeClientMatch(match = {}) {
  return {
    id: cleanDisplayText(match.id),
    category: cleanDisplayText(match.category, 'Other'),
    league: cleanDisplayText(match.league),
    home: cleanDisplayText(match.home, 'Home'),
    away: cleanDisplayText(match.away, 'Away'),
    home_icon: cleanUrl(match.home_icon),
    away_icon: cleanUrl(match.away_icon),
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
    cache: 'no-store',
    signal
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || 'Could not load match data.');
  }

  return normalizeDetailsPayload(payload);
}
