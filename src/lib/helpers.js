export const ALL_CATEGORY = 'Tümü';

export function parseLeague(rawLeague = '') {
  const raw = String(rawLeague || '').trim();
  const match = raw.match(/^(\d{1,2}:\d{2})\s*\|\s*(.+)$/);

  if (!match) {
    return {
      time: '',
      league: raw || 'Lig bilgisi yok'
    };
  }

  return {
    time: match[1],
    league: match[2]
  };
}

export function getInitials(value = '') {
  const words = String(value)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'TV';
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase('tr-TR');

  return `${words[0][0] || ''}${words[1][0] || ''}`.toLocaleUpperCase('tr-TR');
}

export function normalizeText(value = '') {
  return String(value)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isMatchSearchHit(match, query) {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = normalizeText(
    [match.category, match.league, match.home, match.away].filter(Boolean).join(' ')
  );

  return haystack.includes(q);
}

export function sortCategories(a, b) {
  if (a.name === ALL_CATEGORY) return -1;
  if (b.name === ALL_CATEGORY) return 1;
  return a.name.localeCompare(b.name, 'tr-TR', { sensitivity: 'base' });
}

export function groupByCategory(matches) {
  const groups = new Map();

  for (const match of matches) {
    const category = match.category || 'Diğer';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(match);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'tr-TR'));
}

export function formatMetaTime(value) {
  if (!value) return '';

  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date);
}

export function getMatchFromUrl() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('match');
}

export function setMatchUrl(matchId) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (matchId) {
    url.searchParams.set('match', matchId);
  } else {
    url.searchParams.delete('match');
  }

  window.history.pushState({ matchId }, '', url);
}
