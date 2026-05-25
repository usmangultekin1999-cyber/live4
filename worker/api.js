const DEFAULT_STREAM_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';
const DEFAULT_SPORTS_API_BASE_URL = 'https://sports-api.net/api';
const DEFAULT_SPORTS_EVENTS_PATH = '/events';

const CATEGORY_TRANSLATIONS = new Map([
  ['tumu', 'All'],
  ['tum', 'All'],
  ['all', 'All'],
  ['diger', 'Other'],
  ['other', 'Other'],
  ['futbol', 'Football'],
  ['football', 'Football'],
  ['soccer', 'Football'],
  ['basketbol', 'Basketball'],
  ['basketball', 'Basketball'],
  ['table basketball', 'Basketball'],
  ['table basketball league', 'Basketball'],
  ['tenis', 'Tennis'],
  ['tennis', 'Tennis'],
  ['voleybol', 'Volleyball'],
  ['volleyball', 'Volleyball'],
  ['beach volleyball', 'Beach Volleyball'],
  ['plaj voleybolu', 'Beach Volleyball'],
  ['badminton', 'Badminton'],
  ['bowling', 'Bowling'],
  ['cricket', 'Cricket'],
  ['kriket', 'Cricket'],
  ['fifa', 'FIFA'],
  ['futsal', 'Futsal'],
  ['hentbol', 'Handball'],
  ['handball', 'Handball'],
  ['ice hockey', 'Ice Hockey'],
  ['buz hokeyi', 'Ice Hockey'],
  ['baseball', 'Baseball'],
  ['beyzbol', 'Baseball'],
  ['table tennis', 'Table Tennis'],
  ['masa tenisi', 'Table Tennis'],
  ['esports', 'Esports'],
  ['e-spor', 'Esports'],
  ['formula 1', 'Formula 1'],
  ['motor sports', 'Motorsport'],
  ['motor sporlari', 'Motorsport'],
  ['motorsport', 'Motorsport'],
  ['rugby', 'Rugby'],
  ['boxing', 'Boxing'],
  ['boks', 'Boxing'],
  ['mma', 'MMA'],
  ['snooker', 'Snooker'],
  ['darts', 'Darts'],
  ['golf', 'Golf'],
  ['cycling', 'Cycling'],
  ['bisiklet', 'Cycling']
]);

const ENTITY_MAP = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
};

const SPORT_ALIASES = new Map([
  ['football', 'football'],
  ['soccer', 'football'],
  ['futbol', 'football'],
  ['basketball', 'basketball'],
  ['basketbol', 'basketball'],
  ['table basketball', 'basketball'],
  ['table basketball league', 'basketball'],
  ['tennis', 'tennis'],
  ['tenis', 'tennis'],
  ['badminton', 'badminton'],
  ['volleyball', 'volleyball'],
  ['beach volleyball', 'volleyball'],
  ['handball', 'handball'],
  ['hentbol', 'handball'],
  ['ice hockey', 'ice hockey'],
  ['hockey', 'ice hockey'],
  ['baseball', 'baseball'],
  ['table tennis', 'table tennis'],
  ['boxing', 'boxing'],
  ['mma', 'mma'],
  ['cricket', 'cricket'],
  ['futsal', 'futsal'],
  ['rugby', 'rugby']
]);

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

export { jsonResponse };

function decodeHtmlEntities(value = '') {
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    const normalized = code.toLowerCase();

    if (normalized[0] === '#') {
      const number = normalized[1] === 'x'
        ? Number.parseInt(normalized.slice(2), 16)
        : Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    }

    return ENTITY_MAP[normalized] ?? entity;
  });
}

function cleanString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function cleanDisplayText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;

  let text = decodeHtmlEntities(String(value));

  text = text
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/@keyframes\s+[^{]+\{[\s\S]*?\}\s*\}/gi, ' ')
    .replace(/\b(?:transform|box-shadow|background|background-image|linear-gradient|animation|font-size|font-weight|color|border-radius|margin|padding|display)\s*:\s*[^;|<>]+;?/gi, ' ')
    .replace(/[{}<>;]/g, ' ')
    .replace(/\s*\|\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text || fallback;
}

function normalizeLookup(value = '') {
  return cleanDisplayText(value)
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toEnglishCategory(value) {
  const clean = cleanDisplayText(value, 'Other');
  const key = normalizeLookup(clean);
  return CATEGORY_TRANSLATIONS.get(key) || clean;
}

function normalizeFeaturedLabel(value = '') {
  return cleanDisplayText(value)
    .replace(/G[ÜU]N[ÜU]N\s+MA[ÇC](?:[Iİiı])?/giu, 'Featured Match')
    .replace(/\bTODAY'?S?\s+MATCH\b/giu, 'Featured Match')
    .replace(/\bFEATURED\s+MATCH\b/giu, 'Featured Match')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanLeague(value) {
  const text = normalizeFeaturedLabel(value);
  if (!text) return '';

  const timeMatch = text.match(/\b(\d{1,2}:\d{2})\b/);
  if (!timeMatch) return text;

  const time = timeMatch[1];
  const timeIndex = timeMatch.index || 0;
  const before = text.slice(0, timeIndex).replace(/[|•·-]+$/g, '').trim();
  const after = text.slice(timeIndex + time.length).replace(/^[|•·-]+/g, '').replace(/[|•·-]+$/g, '').trim();
  const league = cleanDisplayText(after || before);

  return league ? `${time} | ${league}` : time;
}

function normalizeMatch(match) {
  return {
    id: cleanString(match?.id),
    category: toEnglishCategory(match?.category),
    league: cleanLeague(match?.league),
    home: cleanDisplayText(match?.home, 'Home'),
    away: cleanDisplayText(match?.away, 'Away'),
    home_icon: cleanString(match?.home_icon),
    away_icon: cleanString(match?.away_icon),
    videoid: cleanString(match?.videoid)
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': options.userAgent || 'ErosMacTV-cloudflare-worker/2.0',
      ...(options.headers || {})
    },
    cf: options.cacheTtl
      ? { cacheTtl: options.cacheTtl, cacheEverything: true }
      : undefined
  });

  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch (error) {
    const preview = cleanDisplayText(text.slice(0, 300));
    const message = preview || 'The API did not return JSON.';
    const err = new Error(message);
    err.status = response.status;
    err.preview = preview;
    throw err;
  }

  if (!response.ok || payload?.success === false) {
    const err = new Error(cleanDisplayText(payload?.error || payload?.message || payload?.detail || 'The API request failed.'));
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

async function loadStreamMatches(env) {
  const apiKey = cleanString(env.MATCH_API_KEY);
  const apiUrl = cleanString(env.MATCH_API_URL, DEFAULT_STREAM_API_URL);

  if (!apiKey) {
    const err = new Error('MATCH_API_KEY is not defined as a Cloudflare environment variable.');
    err.status = 500;
    throw err;
  }

  let upstreamUrl;
  try {
    upstreamUrl = new URL(apiUrl);
    upstreamUrl.searchParams.set('api_key', apiKey);
  } catch (error) {
    const err = new Error('MATCH_API_URL is not a valid URL.');
    err.status = 500;
    throw err;
  }

  const upstreamJson = await fetchJson(upstreamUrl, { cacheTtl: 60 });
  const data = Array.isArray(upstreamJson.data) ? upstreamJson.data.map(normalizeMatch) : [];

  return {
    success: true,
    count: data.length,
    generated_at: cleanDisplayText(upstreamJson.generated_at || ''),
    expires_in: cleanDisplayText(upstreamJson.expires_in || ''),
    data
  };
}

export async function handleMatches(env) {
  try {
    const payload = await loadStreamMatches(env);

    return jsonResponse(payload, 200, {
      'Cache-Control': 'public, max-age=30, s-maxage=90'
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Could not connect to the upstream match API.',
        detail: error?.detail || undefined
      },
      error?.status || 502,
      { 'Cache-Control': 'no-store' }
    );
  }
}

function getSportsConfig(env) {
  const fullEventsUrl = cleanString(env.SPORTS_API_EVENTS_URL);
  let key = cleanString(env.SPORTS_API_KEY);
  let baseUrl = cleanString(env.SPORTS_API_BASE_URL, DEFAULT_SPORTS_API_BASE_URL);
  let eventsUrl = '';

  if (fullEventsUrl) {
    try {
      const parsed = new URL(fullEventsUrl);
      key ||= cleanString(parsed.searchParams.get('api_key'));
      const apiIndex = parsed.pathname.lastIndexOf('/api/');
      if (apiIndex >= 0) {
        baseUrl = `${parsed.origin}${parsed.pathname.slice(0, apiIndex + 4)}`;
      } else {
        baseUrl = `${parsed.origin}/api`;
      }
      eventsUrl = parsed.toString();
    } catch (error) {
      // Keep the explicit base/key branch below.
    }
  }

  return { key, baseUrl: baseUrl.replace(/\/+$/g, ''), eventsUrl };
}

function sportsUrl(env, path = DEFAULT_SPORTS_EVENTS_PATH) {
  const config = getSportsConfig(env);
  if (!config.key) {
    const err = new Error('SPORTS_API_KEY is not defined as a Cloudflare environment variable.');
    err.status = 500;
    throw err;
  }

  if (path === DEFAULT_SPORTS_EVENTS_PATH && config.eventsUrl) {
    const url = new URL(config.eventsUrl);
    url.searchParams.set('api_key', config.key);
    return url;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${config.baseUrl}${cleanPath}`);
  url.searchParams.set('api_key', config.key);
  return url;
}

async function fetchSportsJson(env, path, { cacheTtl = 120 } = {}) {
  return fetchJson(sportsUrl(env, path), {
    cacheTtl,
    userAgent: 'ErosMacTV-sports-enrichment/2.0'
  });
}

async function fetchOptionalSportsJson(env, path, options = {}) {
  try {
    return await fetchSportsJson(env, path, options);
  } catch (error) {
    return null;
  }
}

function unwrapEvents(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.events)) return payload.events;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return fallback;
}

function extractEventId(event = {}) {
  return cleanString(pick(event, ['id', 'eventId', 'event_id', 'fixtureId', 'fixture_id', 'matchId', 'match_id']));
}

function eventHome(event = {}) {
  return cleanDisplayText(pick(event, ['homeName', 'home_name', 'home', 'localteam', 'team1', 'participant1Name', 'homeTeamName']), 'Home');
}

function eventAway(event = {}) {
  return cleanDisplayText(pick(event, ['awayName', 'away_name', 'away', 'visitorteam', 'team2', 'participant2Name', 'awayTeamName']), 'Away');
}

function eventLogo(event = {}, side = 'home') {
  const homeKeys = ['home_logo', 'homeLogo', 'home_image', 'homeImage', 'homeTeamLogo', 'home_logo_url'];
  const awayKeys = ['away_logo', 'awayLogo', 'away_image', 'awayImage', 'awayTeamLogo', 'away_logo_url'];
  return cleanString(pick(event, side === 'home' ? homeKeys : awayKeys));
}

function parseIsoOrTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeSport(value = '') {
  const lookup = normalizeLookup(value).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return SPORT_ALIASES.get(lookup) || lookup;
}

function parseLeagueTime(league = '') {
  const text = cleanDisplayText(league);
  const timeMatch = text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (!timeMatch) return null;
  const hours = Number.parseInt(timeMatch[1], 10);
  const minutes = Number.parseInt(timeMatch[2], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return { hours, minutes, value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` };
}

function minuteDistance(aTime, dateValue) {
  if (!aTime || !dateValue) return null;
  const date = parseIsoOrTimestamp(dateValue);
  if (!date) return null;
  const eventMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const matchMinutes = aTime.hours * 60 + aTime.minutes;
  let diff = Math.abs(eventMinutes - matchMinutes);
  diff = Math.min(diff, 1440 - diff);
  return diff;
}

function normalizeTeamName(value = '') {
  return normalizeLookup(value)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\b(?:bayanlar|women|woman|womens|ladies|female|erkekler|men|mens|u\d{1,2}|reserves|reserve|youth|tbl|tpe)\b/g, ' ')
    .replace(/\b(?:fc|cf|sc|fk|bk|bc|club|de|da|do|ac|afc|if|sk|sv|cd|sd|rc|as)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value = '') {
  return normalizeTeamName(value).split(/\s+/).filter((token) => token.length > 1);
}

function tokenScore(a = '', b = '') {
  const left = normalizeTeamName(a);
  const right = normalizeTeamName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.88;

  const aTokens = tokens(left);
  const bTokens = tokens(right);
  if (!aTokens.length || !bTokens.length) return 0;

  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }

  const union = new Set([...aSet, ...bSet]).size || 1;
  const jaccard = intersection / union;

  const partialHits = aTokens.reduce((count, token) => {
    return count + (bTokens.some((other) => other.includes(token) || token.includes(other)) ? 1 : 0);
  }, 0);

  return Math.max(jaccard, partialHits / Math.max(aTokens.length, bTokens.length) * 0.72);
}

function eventScore(match, event) {
  const home = cleanDisplayText(match?.home);
  const away = cleanDisplayText(match?.away);
  const eHome = eventHome(event);
  const eAway = eventAway(event);

  const direct = tokenScore(home, eHome) + tokenScore(away, eAway);
  const reverse = tokenScore(home, eAway) + tokenScore(away, eHome) - 0.14;
  let score = Math.max(direct, reverse);

  const matchSport = normalizeSport(match?.category);
  const eventSport = normalizeSport(pick(event, ['sport', 'sportName', 'category']));
  if (matchSport && eventSport && (matchSport === eventSport || matchSport.includes(eventSport) || eventSport.includes(matchSport))) {
    score += 0.24;
  }

  const league = normalizeLookup(match?.league);
  const group = normalizeLookup(pick(event, ['group', 'league', 'competition', 'competitionName', 'country']));
  if (league && group && (league.includes(group) || group.includes(league))) score += 0.14;

  const matchTime = parseLeagueTime(match?.league);
  const diff = minuteDistance(matchTime, pick(event, ['start', 'startTime', 'start_at', 'date']));
  if (diff !== null) {
    if (diff <= 10) score += 0.2;
    else if (diff <= 45) score += 0.1;
  }

  return { score, reversed: reverse > direct };
}

function findBestSportsEvent(match, events) {
  let best = null;

  for (const event of events) {
    const id = extractEventId(event);
    if (!id) continue;
    const scored = eventScore(match, event);
    if (!best || scored.score > best.score) {
      best = { event, score: scored.score, reversed: scored.reversed };
    }
  }

  if (!best || best.score < 1.24) return null;
  return best;
}

function compactObject(value) {
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined && item !== null && item !== '') output[key] = item;
  }
  return output;
}

function normalizeEvent(event = {}) {
  const id = extractEventId(event);
  return compactObject({
    id,
    name: cleanDisplayText(pick(event, ['english_name', 'name', 'title']), `${eventHome(event)} - ${eventAway(event)}`),
    home: eventHome(event),
    away: eventAway(event),
    home_logo: eventLogo(event, 'home'),
    away_logo: eventLogo(event, 'away'),
    start: cleanString(pick(event, ['start', 'startTime', 'start_at', 'date'])),
    group: cleanDisplayText(pick(event, ['group', 'league', 'competition', 'competitionName'])),
    groupId: cleanString(pick(event, ['groupId', 'group_id', 'competitionId', 'leagueId'])),
    sport: cleanDisplayText(pick(event, ['sport', 'sportName', 'category'])),
    state: cleanDisplayText(pick(event, ['state', 'status', 'statusName'])),
    is_live: Boolean(pick(event, ['is_live', 'isLive', 'live'], false)),
    country: cleanDisplayText(pick(event, ['country', 'countryName'])),
    country_code: cleanString(pick(event, ['country_code', 'countryCode'])),
    statsMapped: Boolean(pick(event, ['statsMapped', 'stats_mapped'], false))
  });
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function collectArrays(value, predicate, output = [], depth = 0) {
  if (depth > 7 || value === null || value === undefined) return output;

  if (Array.isArray(value)) {
    if (value.some((item) => isPlainObject(item) && predicate(item))) output.push(value);
    for (const item of value.slice(0, 60)) collectArrays(item, predicate, output, depth + 1);
    return output;
  }

  if (isPlainObject(value)) {
    for (const item of Object.values(value)) collectArrays(item, predicate, output, depth + 1);
  }

  return output;
}

function asNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const clean = value.replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return clean ? Number.parseFloat(clean[0]) : null;
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
  return cleanDisplayText(value, '—');
}

function getOutcomeName(outcome = {}) {
  const participant = outcome.participant || outcome.team || outcome.selection || outcome.player;
  if (isPlainObject(participant)) {
    return cleanDisplayText(pick(participant, ['name', 'english_name', 'label', 'title']));
  }
  return cleanDisplayText(pick(outcome, ['name', 'label', 'title', 'type', 'selectionName', 'outcomeName', 'description']), 'Selection');
}

function getOddsValue(outcome = {}) {
  const keys = ['decimalOdds', 'decimal_odds', 'odds', 'price', 'value', 'coefficient', 'coef', 'oddsDecimal'];
  for (const key of keys) {
    const value = outcome[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return displayValue(value);
  }

  if (outcome.price?.decimal) return displayValue(outcome.price.decimal);
  return '';
}

function normalizeMarket(rawMarket = {}) {
  const marketName = cleanDisplayText(
    pick(rawMarket, ['name', 'marketName', 'market_name', 'label', 'title', 'criterionName'], rawMarket?.criterion?.label || rawMarket?.criterion?.name),
    'Market'
  );

  const rawOutcomes = rawMarket.outcomes || rawMarket.selections || rawMarket.options || rawMarket.prices || rawMarket.lines || [];
  const outcomes = Array.isArray(rawOutcomes)
    ? rawOutcomes
        .map((outcome) => ({ name: getOutcomeName(outcome), odds: getOddsValue(outcome) }))
        .filter((outcome) => outcome.name && outcome.odds)
        .slice(0, 4)
    : [];

  if (!outcomes.length) return null;
  return { name: marketName, outcomes };
}

function normalizeOdds(...payloads) {
  const markets = [];

  for (const payload of payloads) {
    if (!payload) continue;

    const directCandidates = [];
    if (Array.isArray(payload)) directCandidates.push(...payload);
    if (Array.isArray(payload.offers)) directCandidates.push(...payload.offers);
    if (Array.isArray(payload.betOffers)) directCandidates.push(...payload.betOffers);
    if (Array.isArray(payload.markets)) directCandidates.push(...payload.markets);
    if (Array.isArray(payload.data)) directCandidates.push(...payload.data);
    if (payload.mainBetOffer) directCandidates.push(payload.mainBetOffer);
    if (payload.offer) directCandidates.push(payload.offer);

    for (const candidate of directCandidates) {
      const market = normalizeMarket(candidate);
      if (market) markets.push(market);
    }

    if (!markets.length) {
      const arrays = collectArrays(payload, (item) => Array.isArray(item.outcomes) || Array.isArray(item.selections));
      for (const array of arrays.slice(0, 3)) {
        for (const item of array.slice(0, 6)) {
          const market = normalizeMarket(item);
          if (market) markets.push(market);
        }
      }
    }
  }

  const seen = new Set();
  return markets.filter((market) => {
    const key = `${market.name}:${market.outcomes.map((outcome) => `${outcome.name}-${outcome.odds}`).join('|')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}

function normalizeStatName(name = '') {
  const label = cleanDisplayText(name, '').toLowerCase();
  if (!label) return '';
  if (label.includes('possess')) return 'Possession';
  if (label.includes('shot') && label.includes('target')) return 'Shots on target';
  if (label.includes('shot')) return 'Shots';
  if (label.includes('corner')) return 'Corners';
  if (label.includes('card')) return 'Cards';
  if (label.includes('foul')) return 'Fouls';
  if (label.includes('offside')) return 'Offsides';
  if (label.includes('save')) return 'Saves';
  return cleanDisplayText(name, 'Stat');
}

function statFromObject(item = {}) {
  const label = normalizeStatName(pick(item, ['name', 'label', 'title', 'type', 'stat', 'key']));
  const home = pick(item, ['home', 'homeValue', 'home_value', 'homeTeam', 'local', 'team1', 'home_total']);
  const away = pick(item, ['away', 'awayValue', 'away_value', 'awayTeam', 'visitor', 'team2', 'away_total']);

  if (!label || home === '' || away === '') return null;
  return { label, home: displayValue(home), away: displayValue(away) };
}

function objectStatRows(value) {
  const rows = [];
  const home = value?.home || value?.homeTeam || value?.localteam || value?.team1;
  const away = value?.away || value?.awayTeam || value?.visitorteam || value?.team2;

  if (isPlainObject(home) && isPlainObject(away)) {
    const keys = new Set([...Object.keys(home), ...Object.keys(away)]);
    for (const key of keys) {
      const left = home[key];
      const right = away[key];
      if (left === undefined || right === undefined) continue;
      if (typeof left === 'object' || typeof right === 'object') continue;
      rows.push({ label: normalizeStatName(key), home: displayValue(left), away: displayValue(right) });
    }
  }

  return rows;
}

function normalizeStats(...payloads) {
  const rows = [];

  for (const payload of payloads) {
    if (!payload) continue;

    for (const row of objectStatRows(payload)) rows.push(row);
    for (const row of objectStatRows(payload.statistics || payload.stats || payload.data || {})) rows.push(row);

    const arrays = collectArrays(payload, (item) => {
      return Boolean(pick(item, ['name', 'label', 'title', 'type', 'stat', 'key'])) && (
        pick(item, ['home', 'homeValue', 'home_value', 'homeTeam', 'local', 'team1', 'home_total']) !== '' ||
        pick(item, ['away', 'awayValue', 'away_value', 'awayTeam', 'visitor', 'team2', 'away_total']) !== ''
      );
    });

    for (const array of arrays.slice(0, 5)) {
      for (const item of array.slice(0, 20)) {
        const row = statFromObject(item);
        if (row) rows.push(row);
      }
    }
  }

  const preferred = ['Possession', 'Shots', 'Shots on target', 'Corners', 'Cards', 'Fouls', 'Offsides', 'Saves'];
  const seen = new Set();
  const cleanRows = rows.filter((row) => {
    const key = row.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return row.home !== '—' || row.away !== '—';
  });

  return cleanRows
    .sort((a, b) => {
      const ai = preferred.indexOf(a.label);
      const bi = preferred.indexOf(b.label);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    })
    .slice(0, 8);
}

function minuteFromItem(item = {}) {
  const raw = pick(item, ['minute', 'min', 'time', 'matchTime', 'elapsed', 'clock']);
  if (raw === '') return '';
  const text = cleanDisplayText(raw);
  const number = text.match(/\d+/)?.[0];
  return number ? `${number}'` : text;
}

function normalizeTimeline(...payloads) {
  const rows = [];
  for (const payload of payloads) {
    if (!payload) continue;
    const arrays = collectArrays(payload, (item) => {
      return pick(item, ['minute', 'min', 'time', 'matchTime', 'elapsed', 'clock']) !== '' || pick(item, ['type', 'eventType', 'incidentType', 'name']) !== '';
    });

    for (const array of arrays.slice(0, 4)) {
      for (const item of array.slice(0, 30)) {
        const minute = minuteFromItem(item);
        const type = cleanDisplayText(pick(item, ['type', 'eventType', 'incidentType', 'name', 'title']), 'Event');
        const team = cleanDisplayText(pick(item, ['team', 'teamName', 'participantName', 'side']));
        const text = cleanDisplayText(pick(item, ['description', 'text', 'comment', 'detail', 'playerName', 'player']));
        if (!minute && !type && !text) continue;
        rows.push(compactObject({ minute, type, team, text }));
      }
    }
  }

  const seen = new Set();
  return rows.filter((row) => {
    const key = `${row.minute}-${row.type}-${row.team}-${row.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function normalizeLineups(...payloads) {
  const output = {
    homeFormation: '',
    awayFormation: '',
    homePlayers: [],
    awayPlayers: []
  };

  function playerName(player) {
    if (typeof player === 'string') return cleanDisplayText(player);
    if (!isPlainObject(player)) return '';
    return cleanDisplayText(pick(player, ['name', 'playerName', 'fullName', 'shortName', 'displayName']));
  }

  for (const payload of payloads) {
    if (!payload) continue;
    const source = payload.data || payload.lineups || payload;

    output.homeFormation ||= cleanDisplayText(pick(source, ['homeFormation', 'home_formation'], source?.home?.formation || source?.homeTeam?.formation));
    output.awayFormation ||= cleanDisplayText(pick(source, ['awayFormation', 'away_formation'], source?.away?.formation || source?.awayTeam?.formation));

    const homeCandidates = source.home?.players || source.home?.lineup || source.homeTeam?.players || source.homeLineup || source.localteam?.players || [];
    const awayCandidates = source.away?.players || source.away?.lineup || source.awayTeam?.players || source.awayLineup || source.visitorteam?.players || [];

    if (Array.isArray(homeCandidates) && !output.homePlayers.length) {
      output.homePlayers = homeCandidates.map(playerName).filter(Boolean).slice(0, 11);
    }
    if (Array.isArray(awayCandidates) && !output.awayPlayers.length) {
      output.awayPlayers = awayCandidates.map(playerName).filter(Boolean).slice(0, 11);
    }
  }

  return output.homeFormation || output.awayFormation || output.homePlayers.length || output.awayPlayers.length ? output : null;
}

function extractStatsMatchIds(...sources) {
  const keys = [
    'statsMatchId', 'stats_match_id', 'statisticsMatchId', 'statistics_match_id',
    'matchId', 'match_id', 'fixtureId', 'fixture_id', 'statsId', 'statisticsId',
    'fcMatchId', 'fc_match_id', 'matchFcId', 'match_fc_id'
  ];
  const ids = [];

  function walk(value, depth = 0) {
    if (depth > 4 || !isPlainObject(value)) return;
    for (const key of keys) {
      const id = cleanString(value[key]);
      if (id && !ids.includes(id)) ids.push(id);
    }
    for (const item of Object.values(value)) {
      if (isPlainObject(item)) walk(item, depth + 1);
    }
  }

  for (const source of sources) walk(source);
  return ids.slice(0, 3);
}

function normalizeRelated(events, currentId) {
  return unwrapEvents(events)
    .filter((event) => extractEventId(event) && String(extractEventId(event)) !== String(currentId))
    .map(normalizeEvent)
    .slice(0, 8);
}

function buildFallbackRelated(allEvents, matchedEvent) {
  const current = normalizeEvent(matchedEvent);
  return unwrapEvents(allEvents)
    .filter((event) => {
      const normalized = normalizeEvent(event);
      if (!normalized.id || String(normalized.id) === String(current.id)) return false;
      if (current.groupId && normalized.groupId && String(current.groupId) === String(normalized.groupId)) return true;
      return normalizeSport(current.sport) && normalizeSport(current.sport) === normalizeSport(normalized.sport);
    })
    .map(normalizeEvent)
    .slice(0, 8);
}

export async function handleMatchDetails(request, env) {
  const url = new URL(request.url);
  const match = {
    id: cleanDisplayText(url.searchParams.get('match_id') || url.searchParams.get('id')),
    home: cleanDisplayText(url.searchParams.get('home'), 'Home'),
    away: cleanDisplayText(url.searchParams.get('away'), 'Away'),
    category: cleanDisplayText(url.searchParams.get('category')),
    league: cleanDisplayText(url.searchParams.get('league'))
  };

  try {
    const eventsPayload = await fetchSportsJson(env, DEFAULT_SPORTS_EVENTS_PATH, { cacheTtl: 120 });
    const events = unwrapEvents(eventsPayload);
    const matched = findBestSportsEvent(match, events);

    if (!matched) {
      return jsonResponse(
        {
          success: true,
          matched: false,
          message: 'No matching sports data event was found for this stream match.',
          event: null,
          stats: [],
          odds: [],
          timeline: [],
          lineups: null,
          related: []
        },
        200,
        { 'Cache-Control': 'public, max-age=30, s-maxage=90' }
      );
    }

    const eventId = extractEventId(matched.event);
    const baseEvent = normalizeEvent(matched.event);

    const [eventDetail, offers, groupEvents] = await Promise.all([
      fetchOptionalSportsJson(env, `/events/${encodeURIComponent(eventId)}`, { cacheTtl: 120 }),
      fetchOptionalSportsJson(env, `/offers/${encodeURIComponent(eventId)}`, { cacheTtl: 90 }),
      baseEvent.groupId ? fetchOptionalSportsJson(env, `/group/${encodeURIComponent(baseEvent.groupId)}`, { cacheTtl: 120 }) : Promise.resolve(null)
    ]);

    const detailRoot = eventDetail?.event || eventDetail?.data || eventDetail || null;
    const enrichedEvent = normalizeEvent({ ...matched.event, ...(isPlainObject(detailRoot) ? detailRoot : {}) });
    const statsIds = extractStatsMatchIds(matched.event, detailRoot);
    if (!statsIds.length && (matched.event?.statsMapped || detailRoot?.statsMapped)) statsIds.push(eventId);

    const statsId = statsIds[0] || '';
    const [liveStats, fullStats, lineupsPayload] = statsId
      ? await Promise.all([
          fetchOptionalSportsJson(env, `/stats/match-live/${encodeURIComponent(statsId)}`, { cacheTtl: 30 }),
          fetchOptionalSportsJson(env, `/stats/match/${encodeURIComponent(statsId)}`, { cacheTtl: 90 }),
          fetchOptionalSportsJson(env, `/stats/lineups/${encodeURIComponent(statsId)}`, { cacheTtl: 120 })
        ])
      : [null, null, null];

    const related = normalizeRelated(groupEvents, eventId);

    return jsonResponse(
      {
        success: true,
        matched: true,
        confidence: Number(matched.score.toFixed(2)),
        source: 'sports-api.net',
        event: enrichedEvent,
        stats: normalizeStats(liveStats, fullStats, detailRoot),
        odds: normalizeOdds(offers, detailRoot, matched.event),
        timeline: normalizeTimeline(liveStats, fullStats, detailRoot),
        lineups: normalizeLineups(lineupsPayload, fullStats, detailRoot),
        related: related.length ? related : buildFallbackRelated(events, matched.event)
      },
      200,
      { 'Cache-Control': 'public, max-age=30, s-maxage=90' }
    );
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Could not load sports data.',
        detail: error?.detail || undefined
      },
      error?.status || 502,
      { 'Cache-Control': 'no-store' }
    );
  }
}
