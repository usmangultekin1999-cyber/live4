import { normalizeText } from './helpers.js';

const BACKGROUNDS = {
  football: '/01-futbol-arka-plan.png',
  volleyball: '/02-voleybol-arka-plan.png',
  basketball: '/03-basketbol-arka-plan.png',
  badminton: '/04-badminton-arka-plan.png',
  baseball: '/05-baseball-arka-plan.png',
  esports: '/06-esports-arka-plan.png'
};

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

export function categoryVisualKey(match = {}) {
  const text = normalizeText([
    match.category,
    match.league,
    match.home,
    match.away,
    match.source,
    match.sport
  ].filter(Boolean).join(' '));

  // Esports should win before normal sport checks. Examples: FIFA, Dota, eSpor Basketbol.
  if (hasAny(text, [
    /\besports?\b/,
    /\bespor\b/,
    /\bfifa\b/,
    /\befootball\b/,
    /\bpes\b/,
    /\bdota\b/,
    /\bdota\s*2\b/,
    /\bcs\s*go\b/,
    /\bcounter\s*strike\b/,
    /\blol\b/,
    /\bleague\s+of\s+legends\b/,
    /\bvalorant\b/,
    /\bimagic\b/,
    /\bmortal\s+kombat\b/,
    /\bnba\s*2k\b/
  ])) return 'esports';

  if (hasAny(text, [/badminton/, /badmintonu/])) return 'badminton';
  if (hasAny(text, [/baseball/, /beyzbol/])) return 'baseball';
  if (hasAny(text, [/basketball/, /basketbol/, /table\s+basket/])) return 'basketball';
  if (hasAny(text, [/volleyball/, /voleybol/, /beach\s+volley/, /plaj\s+voley/])) return 'volleyball';

  // Football covers soccer, futsal, beach football, mini football and similar variants.
  if (hasAny(text, [
    /football/,
    /futbol/,
    /soccer/,
    /futsal/,
    /beach\s+soccer/,
    /beach\s+football/,
    /plaj\s+futbol/,
    /mini\s*football/,
    /minifootball/,
    /indoor\s+football/,
    /arena\s+football/
  ])) return 'football';

  return 'football';
}

export function categoryBackgroundUrl(match = {}) {
  return BACKGROUNDS[categoryVisualKey(match)] || BACKGROUNDS.football;
}
