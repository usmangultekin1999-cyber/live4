const DEFAULT_STREAM_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';
const DEFAULT_CHANNEL_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/channels.php';
const DEFAULT_ODDS_REDIRECT_URL = 'https://cryptobet545.com';

const CATEGORY_TRANSLATIONS = new Map([
  ['tumu', 'All'], ['tum', 'All'], ['all', 'All'], ['diger', 'Other'], ['other', 'Other'],
  ['channels', 'Channels'], ['kanallar', 'Channels'], ['canli tv', 'Channels'], ['live tv', 'Channels'], ['tv channels', 'Channels'],
  ['futbol', 'Football'], ['football', 'Football'], ['soccer', 'Football'], ['beach football', 'Beach Football'], ['plaj futbolu', 'Beach Football'], ['mermer futbolu', 'Football'],
  ['basketbol', 'Basketball'], ['basketball', 'Basketball'], ['table basketball', 'Basketball'], ['table basketball league', 'Basketball'],
  ['tenis', 'Tennis'], ['tennis', 'Tennis'], ['voleybol', 'Volleyball'], ['volleyball', 'Volleyball'], ['beach volleyball', 'Beach Volleyball'], ['plaj voleybolu', 'Beach Volleyball'],
  ['badminton', 'Badminton'], ['bowling', 'Bowling'], ['cricket', 'Cricket'], ['kriket', 'Cricket'],
  ['fifa', 'FIFA'], ['futsal', 'Futsal'], ['hentbol', 'Handball'], ['handball', 'Handball'],
  ['ice hockey', 'Ice Hockey'], ['buz hokeyi', 'Ice Hockey'], ['baseball', 'Baseball'], ['beyzbol', 'Baseball'],
  ['table tennis', 'Table Tennis'], ['masa tenisi', 'Table Tennis'], ['esports', 'Esports'], ['e-spor', 'Esports'], ['espor', 'Esports'],
  ['formula 1', 'Formula 1'], ['motorsport', 'Motorsport'], ['rugby', 'Rugby'], ['boxing', 'Boxing'], ['boks', 'Boxing'], ['mma', 'MMA'], ['snooker', 'Snooker'], ['darts', 'Darts'], ['golf', 'Golf'], ['cycling', 'Cycling'], ['bisiklet', 'Cycling']
]);

const SPORT_ALIASES = new Map([
  ['football', 'football'], ['soccer', 'football'], ['futbol', 'football'], ['beach football', 'football'], ['plaj futbolu', 'football'], ['mermer futbolu', 'football'],
  ['basketball', 'basketball'], ['basketbol', 'basketball'], ['table basketball', 'basketball'], ['table basketball league', 'basketball'],
  ['tennis', 'tennis'], ['tenis', 'tennis'], ['badminton', 'badminton'], ['volleyball', 'volleyball'], ['beach volleyball', 'volleyball'],
  ['handball', 'handball'], ['hentbol', 'handball'], ['ice hockey', 'ice hockey'], ['hockey', 'ice hockey'], ['baseball', 'baseball'],
  ['table tennis', 'table tennis'], ['boxing', 'boxing'], ['mma', 'mma'], ['cricket', 'cricket'], ['futsal', 'futsal'], ['rugby', 'rugby'], ['esports', 'esports'], ['fifa', 'esports']
]);

const VIRTUAL_SPORT_HINTS = /\b(?:fifa|pes|efootball|fc\s*\d{2}|nba\s*2k|nba2k|espor|e-spor|esports|mortal\s+kombat|guilty\s+gear|king\s+of\s+fighters|street\s+fighter|ufc\s*\d|nhl\s*\d{2}|vca\s*\d{2}|imagic|subway\s+surfer|power\s+of\s+power)\b/i;
const ENTITY_MAP = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

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
      const number = normalized[1] === 'x' ? Number.parseInt(normalized.slice(2), 16) : Number.parseInt(normalized.slice(1), 10);
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function compactObject(value) {
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined && item !== null && item !== '') output[key] = item;
  }
  return output;
}

function pick(obj, keys, fallback = '') {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return fallback;
}

function fallbackIdFromText(value = '') {
  let hash = 0;
  const text = cleanString(value);
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function normalizeSport(value = '') {
  const lookup = normalizeLookup(value);
  return SPORT_ALIASES.get(lookup) || lookup;
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
  for (const token of aSet) if (bSet.has(token)) intersection += 1;
  return intersection / Math.max(aSet.size, bSet.size);
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

function isVirtualStreamMatch(match = {}) {
  const haystack = `${match?.category || ''} ${match?.league || ''}`;
  return VIRTUAL_SPORT_HINTS.test(haystack);
}

function normalizeStreamType(value = '', url = '') {
  const explicit = normalizeLookup(value).replace(/[^a-z0-9]+/g, '');
  const lowerUrl = String(url || '').toLowerCase();
  if (explicit.includes('m3u8') || /\.m3u8(?:$|[?#])/.test(lowerUrl)) return 'm3u8';
  if (explicit.includes('flv') || /\.flv(?:$|[?#])/.test(lowerUrl)) return 'flv';
  if (explicit.includes('rtmp') || /^rtmp:/i.test(url)) return 'rtmp';
  if (explicit.includes('mpd') || /\.mpd(?:$|[?#])/.test(lowerUrl)) return 'mpd';
  if (/\.(?:mp4|webm|ogv|ogg)(?:$|[?#])/.test(lowerUrl)) return 'direct';
  return explicit || 'm3u8';
}

function normalizeStreamLine(line = {}, index = 0) {
  const url = cleanString(line?.url || line?.playUrl || line?.play_url || line?.stream_url || line?.streamUrl);
  if (!url) return null;
  const name = cleanDisplayText(line?.nameEn || line?.name_en || line?.label || line?.name || line?.title || `Line ${index + 1}`, `Line ${index + 1}`);
  const type = normalizeStreamType(line?.type || line?.format, url);
  const streamInfo = isPlainObject(line?.streamInfo) ? line.streamInfo : (isPlainObject(line?.stream_info) ? line.stream_info : null);
  return compactObject({
    id: cleanString(line?.id || line?.lineId || line?.line_id || `${index}-${type}-${name}`),
    name,
    type,
    url,
    isPlayed: line?.isPlayed !== false && line?.is_played !== false,
    height: numberOrNull(streamInfo?.Height ?? streamInfo?.height),
    width: numberOrNull(streamInfo?.Width ?? streamInfo?.width),
    frameRate: numberOrNull(streamInfo?.FrameRate ?? streamInfo?.frameRate ?? streamInfo?.fps)
  });
}

function normalizeMatch(match) {
  const videoid = cleanString(match?.videoid);
  const streams = Array.isArray(match?.streams)
    ? match.streams.map((line, index) => normalizeStreamLine(line, index)).filter(Boolean)
    : [];
  const mainStream = videoid ? normalizeStreamLine({ name: 'Main Stream', nameEn: 'Main Stream', url: videoid }, 0) : null;
  return compactObject({
    id: cleanString(match?.id) || fallbackIdFromText(`${match?.home}|${match?.away}|${match?.league}`),
    source: cleanString(match?.source, 'primary'),
    provider: cleanString(match?.provider, 'ErosMacTV'),
    category: toEnglishCategory(match?.category),
    league: cleanLeague(match?.league),
    home: cleanDisplayText(match?.home, 'Home'),
    away: cleanDisplayText(match?.away, 'Away'),
    home_icon: cleanString(match?.home_icon),
    away_icon: cleanString(match?.away_icon),
    videoid,
    streams: streams.length ? streams : (mainStream ? [mainStream] : []),
    screenshot: cleanString(match?.screenshot),
    progress: cleanDisplayText(match?.progress || match?.progressEn || ''),
    home_score: numberOrNull(match?.home_score ?? match?.homeScore),
    away_score: numberOrNull(match?.away_score ?? match?.awayScore)
  });
}

async function fetchJson(url, options = {}) {
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 8000;
  const controller = new AbortController();
  let abortListener = null;
  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else {
      abortListener = () => controller.abort();
      options.signal.addEventListener('abort', abortListener, { once: true });
    }
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': options.userAgent || 'ErosMacTV-cloudflare-worker/3.0',
        ...(options.headers || {})
      },
      cf: options.cacheTtl ? { cacheTtl: options.cacheTtl, cacheEverything: true } : undefined
    });
  } catch (error) {
    const err = new Error(error?.name === 'AbortError' ? 'The API request timed out.' : 'The API request failed before a response was returned.');
    err.status = error?.name === 'AbortError' ? 504 : 502;
    err.detail = error instanceof Error ? error.message : undefined;
    throw err;
  } finally {
    clearTimeout(timer);
    if (options.signal && abortListener) options.signal.removeEventListener('abort', abortListener);
  }

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); }
  catch (error) {
    const preview = cleanDisplayText(text.slice(0, 300));
    const err = new Error(preview || 'The API did not return JSON.');
    err.status = response.status;
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

async function loadLegacyStreamMatches(env) {
  const apiKey = cleanString(env.MATCH_API_KEY);
  const apiUrl = cleanString(env.MATCH_API_URL, DEFAULT_STREAM_API_URL);
  if (!apiKey) {
    const err = new Error('MATCH_API_KEY is not defined as a Cloudflare secret.');
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
  const upstreamJson = await fetchJson(upstreamUrl, { cacheTtl: 120, timeoutMs: 8000 });
  const data = Array.isArray(upstreamJson.data) ? upstreamJson.data.map(normalizeMatch).filter((match) => match.id && match.videoid) : [];
  return { success: true, count: data.length, generated_at: cleanDisplayText(upstreamJson.generated_at || ''), expires_in: cleanDisplayText(upstreamJson.expires_in || ''), data };
}

function channelApiUrlFromEnv(env = {}) {
  const explicitUrl = cleanString(env.CHANNELS_API_URL || env.CHANNEL_API_URL);
  const legacyUrl = cleanString(env.MATCH_API_URL);
  const apiKey = cleanString(env.CHANNELS_API_KEY || env.CHANNEL_API_KEY || env.MATCH_API_KEY);
  let rawUrl = explicitUrl;
  if (!rawUrl && legacyUrl) {
    try {
      const parsed = new URL(legacyUrl);
      parsed.pathname = parsed.pathname.replace(/api\.php$/i, 'channels.php');
      rawUrl = parsed.toString();
    } catch (error) {
      rawUrl = DEFAULT_CHANNEL_API_URL;
    }
  }
  if (!rawUrl) rawUrl = DEFAULT_CHANNEL_API_URL;
  if (!apiKey) {
    const err = new Error('CHANNELS_API_KEY or MATCH_API_KEY is not defined as a Cloudflare secret.');
    err.status = 500;
    throw err;
  }
  try {
    const url = new URL(rawUrl);
    url.searchParams.set('api_key', apiKey);
    return url;
  } catch (error) {
    const err = new Error('CHANNELS_API_URL is not a valid URL.');
    err.status = 500;
    throw err;
  }
}

function decodeChannelVideoUrl(value = '') {
  const raw = cleanString(value);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  try {
    const parsed = new URL(raw, 'https://erosmactv.local/');
    const id = cleanString(parsed.searchParams.get('id'));
    if (/^https?:\/\//i.test(id)) return id;
    const urlParam = cleanString(parsed.searchParams.get('url') || parsed.searchParams.get('video'));
    if (/^https?:\/\//i.test(urlParam)) return urlParam;
  } catch (error) {}
  const idMatch = raw.match(/[?&]id=([^&]+)/i) || raw.match(/^id=([^&]+)/i);
  if (idMatch) {
    try {
      const decoded = decodeURIComponent(idMatch[1]);
      if (/^https?:\/\//i.test(decoded)) return decoded;
    } catch (error) {}
  }
  return '';
}

function normalizeChannel(row = {}, index = 0) {
  const name = cleanDisplayText(pick(row, ['ad', 'name', 'title', 'channel', 'label']), `Channel ${index + 1}`);
  const seo = cleanString(pick(row, ['seo', 'slug', 'id']), fallbackIdFromText(name));
  const videoUrl = decodeChannelVideoUrl(pick(row, ['video', 'videoid', 'url', 'stream', 'stream_url', 'streamUrl']));
  const logo = cleanString(pick(row, ['logo', 'icon', 'image', 'img', 'poster']));
  const stream = videoUrl ? normalizeStreamLine({ name: 'Main Stream', nameEn: 'Main Stream', url: videoUrl, type: 'm3u8' }, 0) : null;
  return compactObject({
    id: `channel:${seo || fallbackIdFromText(`${name}|${index}`)}`,
    source: 'channels',
    provider: 'ErosMacTV',
    upstream_id: seo,
    is_channel: true,
    category: 'Channels',
    league: 'Live TV',
    home: name,
    away: '',
    home_icon: logo,
    away_icon: '',
    videoid: videoUrl,
    streams: stream ? [stream] : []
  });
}

function unwrapChannelRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.channels)) return payload.channels;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload?.data?.channels)) return payload.data.channels;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  return [];
}

async function loadChannels(env) {
  const upstreamUrl = channelApiUrlFromEnv(env);
  const upstreamJson = await fetchJson(upstreamUrl, { cacheTtl: 60, timeoutMs: 8000 });
  const rows = unwrapChannelRows(upstreamJson);
  const seen = new Set();
  const data = [];
  rows.forEach((row, index) => {
    const channel = normalizeChannel(row, index);
    if (!channel.id || !channel.videoid || seen.has(channel.id)) return;
    seen.add(channel.id);
    data.push(channel);
  });
  return { success: true, count: data.length, generated_at: cleanDisplayText(upstreamJson.generated_at || ''), expires_in: cleanDisplayText(upstreamJson.expires_in || '2 hours'), data };
}

export async function handleChannels(env) {
  try {
    const payload = await loadChannels(env);
    return jsonResponse(payload, 200, { 'Cache-Control': 'public, max-age=30, s-maxage=90' });
  } catch (error) {
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Could not load the channel list.', detail: error?.detail || undefined }, error?.status || 502, { 'Cache-Control': 'no-store' });
  }
}

export async function handleMatches(env) {
  try {
    if (!cleanString(env.MATCH_API_KEY)) {
      const err = new Error('MATCH_API_KEY is not defined as a Cloudflare secret.');
      err.status = 500;
      throw err;
    }

    const payload = await loadLegacyStreamMatches(env);
    return jsonResponse(
      {
        success: true,
        count: payload.data.length,
        generated_at: payload.generated_at || new Date().toISOString(),
        expires_in: payload.expires_in || '2 minutes',
        data: payload.data
      },
      200,
      { 'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=240' }
    );
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


function getOddsRedirectUrl(env = {}) {
  return cleanString(env.ODDS_REDIRECT_URL || env.CRYPTOBET_URL || env.BET_REDIRECT_URL, DEFAULT_ODDS_REDIRECT_URL);
}

function loadBetRedirectPayload(env, match = {}) {
  if (match?.is_channel) return null;

  return {
    source: 'cryptobet-links',
    matched: false,
    markets: [],
    redirect_url: getOddsRedirectUrl(env),
    fallback: true,
    external_provider: false,
    reason: 'external_odds_provider_removed'
  };
}

function parseMatchStartIso(league = '') {
  const parsed = parseLeagueTime(league);
  if (!parsed) return '';
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), parsed.hours, parsed.minutes, 0));
  return date.toISOString();
}

function buildLocalScoreTable(match = {}) {
  const home = cleanDisplayText(match.home, 'Home');
  const away = cleanDisplayText(match.away, 'Away');
  const homeScore = numberOrNull(match.home_score);
  const awayScore = numberOrNull(match.away_score);
  const progress = cleanDisplayText(match.progress || 'Live');
  const rows = [
    { position: 1, team: home, logo: '', played: 'Live', gd: homeScore ?? '—', points: progress, side: 'home' },
    { position: 2, team: away, logo: '', played: 'Live', gd: awayScore ?? '—', points: progress, side: 'away' }
  ];
  return { source: 'local-match', title: 'Match Board', rows };
}

function normalizeEventFromMatch(match = {}) {
  return compactObject({
    id: cleanDisplayText(match.id),
    home: cleanDisplayText(match.home, 'Home'),
    away: cleanDisplayText(match.away, 'Away'),
    start: parseMatchStartIso(match.league),
    group: cleanDisplayText(match.league).replace(/^\d{1,2}:\d{2}\s*\|\s*/, ''),
    sport: toEnglishCategory(match.category || 'Other'),
    state: cleanDisplayText(match.progress || 'Live'),
    country: '',
    home_logo: '',
    away_logo: ''
  });
}

export async function handleMatchDetails(request, env) {
  const url = new URL(request.url);
  const match = {
    id: cleanDisplayText(url.searchParams.get('match_id') || url.searchParams.get('id')),
    home: cleanDisplayText(url.searchParams.get('home'), 'Home'),
    away: cleanDisplayText(url.searchParams.get('away'), 'Away'),
    category: cleanDisplayText(url.searchParams.get('category')),
    league: cleanDisplayText(url.searchParams.get('league')),
    home_score: numberOrNull(url.searchParams.get('home_score')),
    away_score: numberOrNull(url.searchParams.get('away_score')),
    progress: cleanDisplayText(url.searchParams.get('progress'))
  };
  try {
    const betPayload = loadBetRedirectPayload(env, match);
    return jsonResponse({
      success: true,
      matched: true,
      source: 'broadcast-local',
      event: normalizeEventFromMatch(match),
      stats: [],
      odds: [],
      official_odds: betPayload,
      timeline: [],
      lineups: null,
      related: [],
      standings: buildLocalScoreTable(match)
    }, 200, { 'Cache-Control': 'public, max-age=25, s-maxage=60' });
  } catch (error) {
    return jsonResponse({
      success: true,
      matched: true,
      source: 'broadcast-local',
      event: normalizeEventFromMatch(match),
      stats: [],
      odds: [],
      official_odds: loadBetRedirectPayload(env, match),
      timeline: [],
      lineups: null,
      related: [],
      standings: buildLocalScoreTable(match),
      silent: true
    }, 200, { 'Cache-Control': 'public, max-age=20, s-maxage=60' });
  }
}
