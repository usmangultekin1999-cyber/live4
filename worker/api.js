const DEFAULT_STREAM_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';
const DEFAULT_CHANNEL_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/channels.php';
const DEFAULT_SLA_API_URL = 'https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams';
const DEFAULT_SLA_PAGE_URL = 'https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/page';
const DEFAULT_ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const DEFAULT_ODDS_REDIRECT_URL = 'https://cryptobet545.com';

const SLA_TYPE_CONFIGS = [
  { type: 1, category: 'Football' },
  { type: 18, category: 'Basketball' },
  { type: 91, category: 'Volleyball' },
  { type: 94, category: 'Badminton' },
  { type: 16, category: 'Baseball' },
  { type: 3, category: 'Cricket' },
  { type: 13, category: 'Tennis' },
  { type: 17, category: 'Ice Hockey' },
  { type: 92, category: 'Table Tennis' },
  { type: 14, category: 'Snooker' },
  { type: 12, category: 'American Football' },
  { type: 151, gameId: 1, category: 'Esports' },
  { type: 151, gameId: 2, category: 'Esports' },
  { type: 151, gameId: 3, category: 'Esports' },
  { type: 151, gameId: 4, category: 'Esports' }
];

const SLA_TYPE_CATEGORIES = new Map(SLA_TYPE_CONFIGS.map((item) => [String(item.type), item.category]));

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
  const upstreamJson = await fetchJson(upstreamUrl, { cacheTtl: 60 });
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

function hasSlaConfig(env = {}) {
  if (String(env.SLA_API_ENABLED || '').trim() === '0') return false;
  if (cleanString(env.SLA_API_AUTH || env.SLA_AUTH)) return true;
  for (const key of ['SLA_API_URL', 'SLA_STREAM_API_URL', 'SLA_API_PAGE_URL', 'SLA_PAGE_URL']) {
    const raw = cleanString(env[key]);
    if (!raw) continue;
    try {
      const parsed = new URL(raw);
      if (parsed.searchParams.get('auth')) return true;
    } catch (error) {}
  }
  return false;
}

function extractSlaUrlConfig(rawValue, fallback, auth = '') {
  const raw = cleanString(rawValue, fallback);
  const url = new URL(raw);
  const urlAuth = cleanString(url.searchParams.get('auth'));
  url.searchParams.delete('auth');
  return { url, auth: cleanString(auth || urlAuth) };
}

function getSlaConfig(env = {}) {
  let auth = cleanString(env.SLA_API_AUTH || env.SLA_AUTH);
  const rawApiUrl = cleanString(env.SLA_API_URL || env.SLA_STREAM_API_URL, DEFAULT_SLA_API_URL);
  const rawPageUrl = cleanString(env.SLA_API_PAGE_URL || env.SLA_PAGE_URL);
  const stream = extractSlaUrlConfig(rawApiUrl, DEFAULT_SLA_API_URL, auth);
  auth = stream.auth;
  let page = null;
  if (rawPageUrl) page = extractSlaUrlConfig(rawPageUrl, DEFAULT_SLA_PAGE_URL, auth);
  if (!auth) {
    const err = new Error('SLA_API_AUTH is not defined as a Cloudflare secret.');
    err.status = 500;
    throw err;
  }
  return { auth, streamUrl: stream.url, pageUrl: page?.url || null, isPlayed: cleanString(env.SLA_API_IS_PLAYED, '1') };
}

function getSlaTypeConfigs(env = {}) {
  const raw = cleanString(env.SLA_API_TYPES);
  if (!raw) return SLA_TYPE_CONFIGS;
  const output = raw.split(',').map((chunk) => {
    const [typePart, gamePart] = chunk.split(':').map((item) => cleanString(item));
    const type = Number.parseInt(typePart, 10);
    const gameId = Number.parseInt(gamePart, 10);
    if (!Number.isFinite(type)) return null;
    return compactObject({ type, gameId: Number.isFinite(gameId) ? gameId : undefined, category: SLA_TYPE_CATEGORIES.get(String(type)) || `Sport ${type}` });
  }).filter(Boolean);
  return output.length ? output : SLA_TYPE_CONFIGS;
}

function slaRequestUrl(baseUrl, config, typeConfig) {
  const url = new URL(baseUrl.toString());
  url.searchParams.set('auth', config.auth);
  if (typeConfig?.type) url.searchParams.set('type', String(typeConfig.type));
  if (typeConfig?.gameId) url.searchParams.set('gameId', String(typeConfig.gameId));
  if (config.isPlayed) url.searchParams.set('isPlayed', config.isPlayed);
  return url;
}

async function fetchSlaJson(url, options = {}) {
  const payload = await fetchJson(url, { ...options, userAgent: 'ErosMacTV-SLA-integration/2.0' });
  const errCode = Number(payload?.errCode ?? 0);
  if (errCode !== 0) {
    const err = new Error(cleanDisplayText(payload?.errMsg || payload?.message || `SLA API returned errCode ${errCode}.`));
    err.status = errCode === -1 ? 401 : errCode === 99 ? 429 : 502;
    throw err;
  }
  return payload;
}

function unwrapSlaEvents(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.events)) return payload.events;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  if (Array.isArray(payload?.data?.events)) return payload.data.events;
  return [];
}

function normalizeSlaStream(line = {}, index = 0) {
  const url = cleanString(pick(line, ['url', 'playUrl', 'play_url', 'streamUrl', 'stream_url', 'm3u8']));
  if (!url) return null;
  const rawName = pick(line, ['nameEn', 'name_en', 'name', 'title', 'label']);
  const fallbackName = index === 0 ? 'Main Stream' : `Line ${index + 1}`;
  const type = normalizeStreamType(pick(line, ['type', 'format', 'streamType']), url);
  const streamInfo = isPlainObject(line?.streamInfo) ? line.streamInfo : (isPlainObject(line?.stream_info) ? line.stream_info : null);
  const height = Number(streamInfo?.Height ?? streamInfo?.height);
  const width = Number(streamInfo?.Width ?? streamInfo?.width);
  const frameRate = cleanDisplayText(streamInfo?.FrameRate ?? streamInfo?.frameRate ?? streamInfo?.fps);
  return compactObject({
    id: cleanString(pick(line, ['id', 'lineId', 'line_id']), `line-${index + 1}`),
    name: cleanDisplayText(rawName, fallbackName),
    url,
    type,
    isPlayed: line?.isPlayed === false || line?.played === false || line?.playable === false ? false : true,
    height: Number.isFinite(height) ? height : undefined,
    width: Number.isFinite(width) ? width : undefined,
    frameRate
  });
}

function streamRank(stream = {}) {
  const name = normalizeLookup(`${stream.name || ''} ${stream.type || ''}`);
  let rank = 0;
  if (/fhd|full\s*hd|1080|original/.test(name)) rank += 120;
  if (/global\s*hd|hd|高清/.test(name)) rank += 90;
  if (/cn|tw|hk|channel/.test(name)) rank += 40;
  if (/web|聚合/.test(name)) rank += 30;
  if (stream.isPlayed) rank += 20;
  if (Number.isFinite(Number(stream.height))) rank += Math.min(Number(stream.height) / 20, 80);
  return rank;
}

function chooseBestStream(streams = []) {
  return [...streams].filter((stream) => stream?.url && stream.isPlayed !== false).sort((a, b) => streamRank(b) - streamRank(a))[0] || streams.find((stream) => stream?.url) || null;
}

function formatSlaStartTime(row = {}) {
  const dateStr = cleanString(pick(row, ['dateStr', 'date_str', 'startTimeText', 'start_time_text']));
  const dateStrMatch = dateStr.match(/(?:^|\s|T)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (dateStrMatch) return `${String(Number.parseInt(dateStrMatch[1], 10)).padStart(2, '0')}:${dateStrMatch[2]}`;
  const rawSeconds = pick(row, ['date', 'startTime', 'start_time', 'timestamp'], '');
  const seconds = Number(rawSeconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    const date = new Date(seconds > 10_000_000_000 ? seconds : seconds * 1000);
    if (!Number.isNaN(date.getTime())) return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
  }
  return '';
}

function slaCategory(row = {}, context = {}) {
  const explicit = cleanDisplayText(pick(row, ['sportName', 'sportNameEn', 'sport', 'category']));
  if (explicit) return toEnglishCategory(explicit);
  const type = cleanString(pick(row, ['type'], context.type));
  return SLA_TYPE_CATEGORIES.get(String(type)) || context.category || 'Other';
}

function normalizeSlaMatch(row = {}, context = {}) {
  const category = slaCategory(row, context);
  const leagueName = cleanDisplayText(pick(row, ['leagueNameEn', 'league_name_en', 'leagueEn', 'competitionNameEn', 'leagueName', 'league_name', 'competition', 'league']), 'Live Event');
  const time = formatSlaStartTime(row);
  const home = cleanDisplayText(pick(row, ['homeEn', 'home_en', 'homeNameEn', 'homeName', 'home', 'team1']), 'Home');
  const away = cleanDisplayText(pick(row, ['awayEn', 'away_en', 'awayNameEn', 'awayName', 'away', 'team2']), 'Away');
  const rawId = cleanString(pick(row, ['matchId', 'match_id', 'id', 'eventId', 'event_id']));
  const liveRows = Array.isArray(row?.liveList) ? row.liveList : Array.isArray(row?.live_list) ? row.live_list : Array.isArray(row?.streams) ? row.streams : Array.isArray(row?.urls) ? row.urls : [];
  const directUrl = cleanString(pick(row, ['url', 'playUrl', 'play_url', 'streamUrl', 'stream_url', 'm3u8']));
  const streams = liveRows.map((line, index) => normalizeSlaStream(line, index)).filter(Boolean);
  if (directUrl) {
    const directStream = normalizeSlaStream({ url: directUrl, type: pick(row, ['streamType', 'format', 'type']), nameEn: 'Main Stream', isPlayed: true }, streams.length);
    if (directStream) streams.push(directStream);
  }
  const uniqueStreams = [];
  const seenUrls = new Set();
  for (const stream of streams) {
    if (!stream?.url || seenUrls.has(stream.url)) continue;
    seenUrls.add(stream.url);
    uniqueStreams.push(stream);
  }
  const bestStream = chooseBestStream(uniqueStreams);
  const idBase = rawId || fallbackIdFromText(`${category}|${leagueName}|${home}|${away}|${time}`);
  return compactObject({
    id: `sla:${idBase}`,
    source: 'sla',
    upstream_id: rawId,
    category,
    league: time ? `${time} | ${leagueName}` : leagueName,
    home,
    away,
    home_icon: cleanString(pick(row, ['homeLogo', 'home_logo', 'homeImage', 'home_image'])),
    away_icon: cleanString(pick(row, ['awayLogo', 'away_logo', 'awayImage', 'away_image'])),
    league_icon: cleanString(pick(row, ['leagueLogo', 'league_logo'])),
    screenshot: cleanString(pick(row, ['screenshot', 'cover', 'preview'])),
    home_score: pick(row, ['homeScore', 'home_score'], undefined),
    away_score: pick(row, ['awayScore', 'away_score'], undefined),
    progress: cleanDisplayText(pick(row, ['progressEn', 'progress_en', 'progress', 'statusText'])),
    is_played: row?.isPlayed === false ? false : true,
    streams: uniqueStreams,
    videoid: bestStream?.url || ''
  });
}

async function loadSlaPageMatches(config) {
  if (!config.pageUrl) return [];
  const pageUrl = slaRequestUrl(config.pageUrl, config, null);
  const payload = await fetchSlaJson(pageUrl, { cacheTtl: 30, timeoutMs: 9000 });
  return unwrapSlaEvents(payload).map((row) => normalizeSlaMatch(row)).filter((match) => match.id && match.videoid);
}

async function loadSlaTypedMatches(config, env = {}) {
  const typeConfigs = getSlaTypeConfigs(env);
  const requests = typeConfigs.map(async (typeConfig) => {
    const url = slaRequestUrl(config.streamUrl, config, typeConfig);
    const payload = await fetchSlaJson(url, { cacheTtl: 30, timeoutMs: 9000 });
    return unwrapSlaEvents(payload).map((row) => normalizeSlaMatch(row, typeConfig));
  });
  const settled = await Promise.allSettled(requests);
  const matches = [];
  const failures = [];
  for (const result of settled) {
    if (result.status !== 'fulfilled') failures.push(result.reason);
    else matches.push(...result.value);
  }
  if (!matches.length && failures.length === settled.length && failures[0]) throw failures[0];
  return matches.filter((match) => match.id && match.videoid);
}

async function loadSlaMatches(env) {
  if (!hasSlaConfig(env)) return { success: true, configured: false, count: 0, data: [] };
  const config = getSlaConfig(env);
  let data = [];
  if (config.pageUrl) {
    try { data = await loadSlaPageMatches(config); }
    catch (error) { data = []; }
  }
  if (!data.length) {
    const streamUrl = new URL(config.streamUrl.toString());
    if (/\/lives\/page\/?$/i.test(streamUrl.pathname)) {
      streamUrl.pathname = streamUrl.pathname.replace(/\/lives\/page\/?$/i, '/lives/streams');
      config.streamUrl = streamUrl;
    }
    data = await loadSlaTypedMatches(config, env);
  }
  return { success: true, configured: true, count: data.length, generated_at: new Date().toISOString(), expires_in: '30 seconds', data };
}

function dedupeMergedMatches(matches = []) {
  const output = [];
  const seenIds = new Set();
  const seenKeys = new Map();
  for (const match of matches) {
    if (!match?.id) continue;
    const id = String(match.id);
    if (seenIds.has(id)) continue;
    const time = parseLeagueTime(match.league)?.value || '';
    const key = [normalizeSport(match.category), normalizeTeamName(match.home), normalizeTeamName(match.away), time].filter(Boolean).join('|');
    if (key && seenKeys.has(key)) {
      const existingIndex = seenKeys.get(key);
      const existing = output[existingIndex];
      if (match.source === 'sla' && existing?.source !== 'sla') {
        output[existingIndex] = { ...existing, ...match, home_icon: match.home_icon || existing.home_icon, away_icon: match.away_icon || existing.away_icon };
      }
      continue;
    }
    seenIds.add(id);
    if (key) seenKeys.set(key, output.length);
    output.push(match);
  }
  return output;
}

export async function handleMatches(env) {
  try {
    const sourceMode = normalizeLookup(env.MATCH_SOURCE_MODE || 'merge');
    const useLegacy = !['sla', 'sla only', 'sla-only'].includes(sourceMode);
    const useSla = !['legacy', 'legacy only', 'legacy-only', 'match', 'match only', 'match-only'].includes(sourceMode);
    const sources = [];
    if (useSla && hasSlaConfig(env)) sources.push(loadSlaMatches(env).catch((error) => ({ success: false, source: 'sla', error })));
    if (useLegacy && cleanString(env.MATCH_API_KEY)) sources.push(loadLegacyStreamMatches(env).catch((error) => ({ success: false, source: 'legacy', error })));
    if (!sources.length) {
      const err = new Error('No match source is configured. Add SLA_API_AUTH and/or MATCH_API_KEY as Cloudflare secrets.');
      err.status = 500;
      throw err;
    }
    const results = await Promise.all(sources);
    const errors = [];
    const allMatches = [];
    for (const result of results) {
      if (result?.success && Array.isArray(result.data)) allMatches.push(...result.data);
      else if (result?.error) errors.push(cleanDisplayText(result.error?.message || result.error));
    }
    const data = dedupeMergedMatches(allMatches);
    if (!data.length && errors.length) {
      const err = new Error(errors[0] || 'Could not load the match list.');
      err.status = 502;
      throw err;
    }
    return jsonResponse({ success: true, count: data.length, generated_at: new Date().toISOString(), expires_in: hasSlaConfig(env) ? '30 seconds' : '2 minutes', source_errors: errors.length ? errors : undefined, data }, 200, { 'Cache-Control': hasSlaConfig(env) ? 'public, max-age=20, s-maxage=30' : 'public, max-age=30, s-maxage=90' });
  } catch (error) {
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Could not connect to the upstream match API.', detail: error?.detail || undefined }, error?.status || 502, { 'Cache-Control': 'no-store' });
  }
}

function getOfficialOddsConfig(env = {}) {
  const key = cleanString(env.ODDS_API_KEY || env.THE_ODDS_API_KEY || env.OFFICIAL_ODDS_API_KEY);
  const baseUrl = cleanString(env.ODDS_API_BASE_URL || env.THE_ODDS_API_BASE_URL, DEFAULT_ODDS_API_BASE_URL).replace(/\/+$/g, '');
  const enabledFlag = cleanString(env.ODDS_API_ENABLED || env.OFFICIAL_ODDS_ENABLED, key ? '1' : '0');
  return {
    key,
    baseUrl,
    enabled: !/^(?:0|false|no|off)$/i.test(enabledFlag) && Boolean(key),
    regions: cleanString(env.ODDS_API_REGIONS, 'eu,uk'),
    markets: cleanString(env.ODDS_API_MARKETS, 'h2h,totals,spreads'),
    maxSportKeys: Math.max(1, Math.min(60, Number.parseInt(cleanString(env.ODDS_API_MAX_SPORT_KEYS, '35'), 10) || 35)),
    redirectUrl: cleanString(env.ODDS_REDIRECT_URL || env.CRYPTOBET_URL, DEFAULT_ODDS_REDIRECT_URL)
  };
}


function stripLeagueTime(value = '') {
  return cleanDisplayText(value).replace(/^\s*\d{1,2}:\d{2}\s*(?:\||-|•|·)?\s*/g, '').trim();
}

function officialOddsLeagueScore(match = {}, sport = {}) {
  const league = normalizeLookup(stripLeagueTime(match.league || ''));
  const sportText = normalizeLookup(`${sport.group || ''} ${sport.title || ''} ${sport.key || ''}`);
  if (!league || !sportText) return 0;
  if (sportText.includes(league) || league.includes(sportText)) return 1;
  const leagueTokens = league.split(/\s+/).filter((token) => token.length > 2 && !/^\d+$/.test(token) && !/^(?:league|liga|lig|cup|women|men|live|stream)$/.test(token));
  if (!leagueTokens.length) return 0;
  let hits = 0;
  for (const token of leagueTokens) if (sportText.includes(token)) hits += 1;
  return hits / Math.max(leagueTokens.length, 1);
}

function officialOddsCandidatePriority(match = {}, sport = {}, hints = []) {
  const text = normalizeLookup(`${sport.group || ''} ${sport.title || ''} ${sport.key || ''}`);
  const hintScore = hints.some((hint) => text.includes(hint) || (hint === 'soccer' && /soccer|football/.test(text)) || (hint === 'football' && /soccer|football/.test(text))) ? 2 : 0;
  const leagueScore = officialOddsLeagueScore(match, sport);
  const activeScore = sport.active === false ? -2 : 0;
  return hintScore + leagueScore + activeScore;
}

function officialOddsSportHints(match = {}) {
  const haystack = normalizeLookup(`${match.category || ''} ${match.league || ''}`);
  if (/fifa|pes|efootball|esports?|e-spor|dota|lol|cs:?go|nba2k/.test(haystack)) return ['Esports'];
  if (/basket/.test(haystack)) return ['Basketball'];
  if (/volley/.test(haystack)) return ['Volleyball'];
  if (/badminton/.test(haystack)) return ['Badminton'];
  if (/baseball|beyzbol/.test(haystack)) return ['Baseball'];
  if (/ice hockey|hockey|buz hokeyi/.test(haystack)) return ['Ice Hockey'];
  if (/tennis|tenis/.test(haystack)) return ['Tennis'];
  if (/cricket|kriket/.test(haystack)) return ['Cricket'];
  if (/rugby/.test(haystack)) return ['Rugby'];
  if (/mma|boxing|boks/.test(haystack)) return ['MMA', 'Boxing'];
  if (/football|soccer|futbol|futsal|beach football|mermer futbolu/.test(haystack)) return ['Soccer', 'Football'];
  return ['Soccer', 'Basketball', 'Tennis'];
}

function officialOddsUrl(config, path, params = {}) {
  const url = new URL(`${config.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  url.searchParams.set('apiKey', config.key);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchOptionalOfficialOddsJson(config, path, params = {}, options = {}) {
  try {
    return await fetchJson(officialOddsUrl(config, path, params), { cacheTtl: options.cacheTtl ?? 90, timeoutMs: options.timeoutMs ?? 4500, userAgent: 'ErosMacTV-official-odds/1.0' });
  } catch (error) {
    return null;
  }
}

function normalizeOfficialOddsPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 1 || number > 1000) return '';
  return number.toFixed(2);
}

function normalizeOfficialOddsOutcome(outcome = {}, match = {}) {
  const name = cleanDisplayText(outcome.name || outcome.description || outcome.label, 'Selection');
  const point = outcome.point ?? outcome.handicap ?? outcome.total;
  const price = normalizeOfficialOddsPrice(outcome.price ?? outcome.odds ?? outcome.decimal);
  if (!name || !price) return null;
  let displayName = name;
  if (point !== undefined && point !== null && String(point).trim() !== '') {
    const pointNumber = Number(point);
    const pointText = Number.isFinite(pointNumber) ? (pointNumber > 0 ? `+${pointNumber}` : String(pointNumber)) : cleanDisplayText(point);
    if (!displayName.includes(pointText)) displayName = `${displayName} ${pointText}`;
  }
  const side = tokenScore(name, match.home) > 0.62 ? 'home' : tokenScore(name, match.away) > 0.62 ? 'away' : '';
  return compactObject({ name: displayName, odds: price, side, sourceName: cleanDisplayText(outcome.name), point: point ?? undefined });
}

function normalizeOfficialMarketKey(key = '') {
  const clean = cleanDisplayText(key, 'Market').toLowerCase();
  if (clean === 'h2h') return 'Match Winner';
  if (clean === 'totals') return 'Total Goals';
  if (clean === 'spreads') return 'Handicap';
  return cleanDisplayText(key, 'Market').replace(/[_-]+/g, ' ');
}

function normalizeOfficialOddsMarkets(event = {}, match = {}, redirectUrl = DEFAULT_ODDS_REDIRECT_URL) {
  const bookmakers = Array.isArray(event.bookmakers) ? event.bookmakers : [];
  const markets = [];
  const seen = new Set();
  for (const bookmaker of bookmakers.slice(0, 8)) {
    const bookmakerTitle = cleanDisplayText(bookmaker.title || bookmaker.key, 'Bookmaker');
    for (const market of Array.isArray(bookmaker.markets) ? bookmaker.markets : []) {
      const marketKey = cleanDisplayText(market.key || market.name, 'market');
      const outcomes = (Array.isArray(market.outcomes) ? market.outcomes : []).map((outcome) => normalizeOfficialOddsOutcome(outcome, match)).filter(Boolean).slice(0, 6);
      if (!outcomes.length) continue;
      const normalizedName = normalizeOfficialMarketKey(marketKey);
      const key = `${normalizedName}-${outcomes.map((outcome) => `${outcome.name}:${outcome.odds}`).join('|')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      markets.push({ name: normalizedName, bookmaker: bookmakerTitle, outcomes, redirect_url: redirectUrl });
      if (markets.length >= 6) return markets;
    }
  }
  return markets;
}

function officialOddsEventScore(match, event = {}) {
  const home = cleanDisplayText(event.home_team || event.home || '');
  const away = cleanDisplayText(event.away_team || event.away || '');
  if (!home || !away) return 0;
  const direct = tokenScore(match.home, home) + tokenScore(match.away, away);
  const reverse = tokenScore(match.home, away) + tokenScore(match.away, home) - 0.18;
  return Math.max(direct, reverse);
}

async function loadOfficialOdds(env, match = {}) {
  const config = getOfficialOddsConfig(env);
  if (match?.is_channel) return null;

  const fallback = {
    source: 'official-odds',
    matched: false,
    markets: [],
    redirect_url: config.redirectUrl,
    fallback: true
  };

  if (!config.enabled || isVirtualStreamMatch(match)) return { ...fallback, disabled: !config.enabled, reason: config.enabled ? 'virtual_or_esports_match' : 'odds_api_disabled' };

  const sportsPayload = await fetchOptionalOfficialOddsJson(config, '/sports', {}, { cacheTtl: 3600, timeoutMs: 4500 });
  const sports = Array.isArray(sportsPayload) ? sportsPayload : [];
  const hints = officialOddsSportHints(match).map((item) => normalizeLookup(item));
  const enriched = sports
    .filter((sport) => sport?.active !== false)
    .map((sport) => ({
      key: cleanString(sport.key),
      group: cleanDisplayText(sport.group || sport.title),
      title: cleanDisplayText(sport.title || sport.description || sport.key),
      active: sport.active,
      priority: officialOddsCandidatePriority(match, sport, hints)
    }))
    .filter((sport) => sport.key)
    .sort((a, b) => b.priority - a.priority || officialOddsLeagueScore(match, b) - officialOddsLeagueScore(match, a));

  const primaryCandidates = enriched.filter((sport) => sport.priority > 0).slice(0, config.maxSportKeys);
  const fallbackCandidates = enriched.filter((sport) => !primaryCandidates.some((candidate) => candidate.key === sport.key)).slice(0, Math.max(3, Math.min(10, Math.floor(config.maxSportKeys / 2))));
  const searchList = [...primaryCandidates, ...fallbackCandidates].slice(0, config.maxSportKeys);

  const checkedSports = [];
  let best = null;
  for (const sport of searchList) {
    checkedSports.push(sport.key);
    const events = await fetchOptionalOfficialOddsJson(config, `/sports/${encodeURIComponent(sport.key)}/odds`, { regions: config.regions, markets: config.markets, oddsFormat: 'decimal', dateFormat: 'iso' }, { cacheTtl: 60, timeoutMs: 5000 });
    for (const event of Array.isArray(events) ? events : []) {
      const teamScore = officialOddsEventScore(match, event);
      if (teamScore <= 0) continue;
      const score = teamScore + Math.min(0.16, officialOddsLeagueScore(match, sport) * 0.16);
      if (!best || score > best.score) best = { event, score, sport };
    }
    if (best?.score >= 1.24) break;
  }
  if (!best || best.score < 0.92) return { ...fallback, checked_sports: checkedSports, reason: 'no_matching_official_event' };
  const markets = normalizeOfficialOddsMarkets(best.event, match, config.redirectUrl);
  return {
    source: 'official-odds',
    matched: markets.length > 0,
    confidence: Number(best.score.toFixed(2)),
    sport_key: best.sport.key,
    event_id: cleanString(best.event.id),
    home: cleanDisplayText(best.event.home_team),
    away: cleanDisplayText(best.event.away_team),
    commence_time: cleanString(best.event.commence_time),
    checked_sports: checkedSports,
    redirect_url: config.redirectUrl,
    markets,
    reason: markets.length ? undefined : 'official_event_without_markets'
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
    const officialOdds = await loadOfficialOdds(env, match);
    return jsonResponse({
      success: true,
      matched: true,
      source: 'broadcast-local',
      event: normalizeEventFromMatch(match),
      stats: [],
      odds: [],
      official_odds: officialOdds,
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
      official_odds: null,
      timeline: [],
      lineups: null,
      related: [],
      standings: buildLocalScoreTable(match),
      silent: true
    }, 200, { 'Cache-Control': 'public, max-age=20, s-maxage=60' });
  }
}
