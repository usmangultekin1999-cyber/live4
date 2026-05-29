import { localeForLanguage, t } from './i18n.js';

export const ALL_CATEGORY = '__all__';
export const OTHER_CATEGORY = '__other__';

const ENTITY_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' '
};

export function decodeEntities(value = '') {
  let text = String(value || '');

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
  } else {
    text = text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/gi, (entity) => ENTITY_MAP[entity.toLowerCase()] || entity);
  }

  return text;
}

export function cleanDisplayText(value = '', fallback = '') {
  if (value === null || value === undefined) return fallback;

  let text = decodeEntities(String(value));

  // Some upstream league titles include decorative HTML/CSS such as
  // <style>...</style><span>GÜNÜN MAÇI</span>. Remove it before React renders it as text.
  text = text
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  // Defensive cleanup for malformed CSS that may arrive without valid tags.
  text = text
    .replace(/@keyframes\s+[\s\S]*?(?:}\s*}|$)/gi, ' ')
    .replace(/\b(?:animation|background|box-shadow|border|color|display|font-size|font-weight|linear-gradient|margin|padding|transform)\s*:[^|<>]+/gi, ' ')
    .replace(/[{};]/g, ' ')
    .replace(/\s*\|\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text || fallback;
}

function translateLeaguePhrase(value = '', language = 'en') {
  const phrase = t(language, 'matchOfTheDay');

  return String(value || '')
    .replace(/g[üu]n[üu]n\s+ma[çc](?:[iı])?/giu, phrase)
    .replace(/today'?s?\s+match/giu, phrase)
    .replace(/match\s+of\s+the\s+day/giu, phrase)
    .replace(/featured\s+match/giu, phrase)
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseLeague(rawLeague = '', language = 'en') {
  const raw = cleanDisplayText(rawLeague);

  if (!raw) {
    return {
      time: '',
      league: t(language, 'noLeagueInfo')
    };
  }

  const leadingTime = raw.match(/^(\d{1,2}:\d{2})\s*\|\s*(.*)$/);
  if (leadingTime) {
    return {
      time: leadingTime[1],
      league: translateLeaguePhrase(leadingTime[2] || t(language, 'noLeagueInfo'), language)
    };
  }

  const anyTime = raw.match(/\b(\d{1,2}:\d{2})\b/);
  if (anyTime) {
    const league = raw
      .replace(anyTime[0], ' ')
      .replace(/\|/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      time: anyTime[1],
      league: translateLeaguePhrase(league || t(language, 'noLeagueInfo'), language)
    };
  }

  return {
    time: '',
    league: translateLeaguePhrase(raw, language)
  };
}

export function getInitials(value = '') {
  const words = cleanDisplayText(value)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'TV';
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase('en-US');

  return `${words[0][0] || ''}${words[1][0] || ''}`.toLocaleUpperCase('en-US');
}

export function normalizeText(value = '') {
  return cleanDisplayText(value)
    .toLocaleLowerCase('en-US')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getCategoryId(match) {
  const category = cleanDisplayText(match?.category || '');
  return category || OTHER_CATEGORY;
}

export function isMatchSearchHit(match, query) {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = normalizeText(
    [match.category, match.league, match.home, match.away].filter(Boolean).join(' ')
  );

  return haystack.includes(q);
}


function categoryPriority(id = '') {
  const key = normalizeText(id)
    .replace(/\be-?spor(?:t)?\b/g, ' ')
    .replace(/\bespor(?:t)?\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (id === ALL_CATEGORY) return 0;
  if (!key || id === OTHER_CATEGORY) return 900;
  if (/^(iptv|tv|channels|kanal|kanallar)$/.test(key)) return 40;

  // Requested fixed order for primary sports across the sidebar,
  // top tabs and match sections: 1) Football, 2) Basketball, 3) Volleyball.
  if (/^(football|futbol|soccer)$/.test(key)) return 10;
  if (/\b(football|futbol|soccer)\b/.test(key)) return 11;

  if (/^(basketball|basketbol)$/.test(key)) return 20;
  if (/\b(basketball|basketbol)\b/.test(key)) return 21;

  if (/^(volleyball|voleybol)$/.test(key)) return 30;
  if (/\b(volleyball|voleybol|voleyball)\b/.test(key)) return 31;

  return 100;
}

function compareCategoryIds(a = '', b = '', language = 'en') {
  const priorityA = categoryPriority(a);
  const priorityB = categoryPriority(b);

  if (priorityA !== priorityB) return priorityA - priorityB;
  return cleanDisplayText(a).localeCompare(cleanDisplayText(b), localeForLanguage(language), { sensitivity: 'base' });
}

export function sortCategoryItems(a, b, language = 'en') {
  return compareCategoryIds(a.id, b.id, language) ||
    a.label.localeCompare(b.label, localeForLanguage(language), { sensitivity: 'base' });
}

export function groupByCategory(matches) {
  const groups = new Map();

  for (const match of matches) {
    const category = getCategoryId(match);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(match);
  }

  return [...groups.entries()].sort(([a], [b]) => compareCategoryIds(a, b, 'en'));
}

export function formatMetaTime(value, language = 'en') {
  if (!value) return '';

  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return cleanDisplayText(value);

  return new Intl.DateTimeFormat(localeForLanguage(language), {
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
