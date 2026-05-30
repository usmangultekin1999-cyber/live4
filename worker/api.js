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
  { type: 151, gameId: 1, category: 'eSports' },
  { type: 151, gameId: 2, category: 'eSports' },
  { type: 151, gameId: 3, category: 'eSports' },
  { type: 151, gameId: 4, category: 'eSports' }
];

const SLA_TYPE_CATEGORIES = new Map(SLA_TYPE_CONFIGS.map((item) => [String(item.type), item.category]));

const CATEGORY_TRANSLATIONS = new Map([
  ['tumu', 'All'], ['tum', 'All'], ['all', 'All'],
  ['diger', 'Other'], ['other', 'Other'],
  ['channels', 'Channels'], ['kanallar', 'Channels'], ['canli tv', 'Channels'], ['live tv', 'Channels'], ['tv channels', 'Channels'],
  ['futbol', 'Football'], ['football', 'Football'], ['soccer', 'Football'], ['beach football', 'Beach Football'], ['plaj futbolu', 'Beach Football'], ['mermer futbolu', 'Football'],
  ['basketbol', 'Basketball'], ['basketball', 'Basketball'], ['table basketball', 'Basketball'], ['table basketball league', 'Basketball'],
  ['tenis', 'Tennis'], ['tennis', 'Tennis'],
  ['voleybol', 'Volleyball'], ['volleyball', 'Volleyball'], ['beach volleyball', 'Beach Volleyball'], ['plaj voleybolu', 'Beach Volleyball'],
  ['badminton', 'Badminton'], ['bowling', 'Bowling'], ['cricket', 'Cricket'], ['kriket', 'Cricket'],
  ['fifa', 'FIFA'], ['futsal', 'Futsal'], ['hentbol', 'Handball'], ['handball', 'Handball'],
  ['ice hockey', 'Ice Hockey'], ['buz hokeyi', 'Ice Hockey'], ['baseball', 'Baseball'], ['beyzbol', 'Baseball'],
  ['table tennis', 'Table Tennis'], ['masa tenisi', 'Table Tennis'], ['esports', 'Esports'], ['espor', 'Esports'], ['e-spor', 'Esports'],
  ['dota', 'Dota'], ['formula 1', 'Formula 1'], ['motorsport', 'Motorsport'], ['motor sports', 'Motorsport'], ['rugby', 'Rugby'],
  ['boxing', 'Boxing'], ['boks', 'Boxing'], ['mma', 'MMA'], ['snooker', 'Snooker'], ['darts', 'Darts'], ['golf', 'Golf'], ['cycling', 'Cycling']
]);

const ENTITY_MAP = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

function cleanString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

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

function cleanDisplayText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  let text = decodeHtmlEntities(String(value));
  text = text
    .replace(/<!--([\s\S]*?)-->/g, ' ')
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
    .replace(/[^a-z0-9]+/g, ' ')
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

function pick(obj, keys, fallback = '') {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return fallback;
}

function compactObject(value = {}) {
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined || item === null) continue;
    if (typeof item === 'string' && item.trim() === '') continue;
    output[key] = item;
  }
  return output;
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
  const key = normalizeLookup(value);
  if (/football|soccer|futbol|futsal/.test(key)) return 'football';
  if (/basket/.test(key)) return 'basketball';
  if (/volley/.test(key)) return 'volleyball';
  if (/badminton/.test(key)) return 'badminton';
  if (/baseball|beyzbol/.test(key)) return 'baseball';
  if (/tennis|tenis/.test(key)) return 'tennis';
  if (/cricket|kriket/.test(key)) return 'cricket';
  if (/hockey|hokeyi/.test(key)) return 'ice hockey';
  if (/table tennis|masa tenisi/.test(key)) return 'table tennis';
  if (/esport|espor|fifa|dota|pes|nba2k/.test(key)) return 'esports';
  return key;
}

function normalizeTeamName(value = '') {
  return normalizeLookup(value)
    .replace(/\b(?:fc|cf|sc|afc|u\d{2}|women|woman|bay[ao]nlar|club|team)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenScore(a = '', b = '') {
  const left = normalizeTeamName(a);
  const right = normalizeTeamName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  const leftTokens = new Set(left.split(/\s+/).filter((token) => token.length > 1));
  const rightTokens = new Set(right.split(/\s+/).filter((token) => token.length > 1));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let overlap = 0;
  for (const token of leftTokens) if (rightTokens.has(token)) overlap += 1;
  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

function isVirtualStreamMatch(match = {}) {
  const haystack = normalizeLookup(`${match.category || ''} ${match.league || ''} ${match.home || ''} ${match.away || ''}`);
  return /\b(?:fifa|pes|efootball|fc\s*\d{2}|nba\s*2k|nba2k|espor|e spor|esports|dota|lol|cs go|mortal kombat|imagic)\b/.test(haystack);
}

function parseLeagueTime(league = '') {
  const match = cleanDisplayText(league).match(/\b(\d{1,2}:\d{2})\b/);
  return match ? { value: match[1] } : null;
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
  const url = cleanString(line?.url || line?.playUrl || line?.play_url || line?.stream_url || line?.streamUrl || line?.m3u8 || line?.flv || line?.rtmp);
  const name = cleanDisplayText(line?.nameEn || line?.name_en || line?.label || line?.name || line?.title || `Line ${index + 1}`, `Line ${index + 1}`);
  const type = normalizeStreamType(line?.type || line?.format, url);
  const streamInfo = line?.streamInfo || line?.stream_info || {};
  return {
    id: cleanString(line?.id || line?.lineId || line?.line_id || `${index}-${type}-${name}`),
    name,
    type,
    url,
    isPlayed: line?.isPlayed !== false && line?.is_played !== false && line?.played !== false && line?.playable !== false,
    height: numberOrNull(streamInfo?.Height ?? streamInfo?.height),
    width: numberOrNull(streamInfo?.Width ?? streamInfo?.width),
    frameRate: cleanDisplayText(streamInfo?.FrameRate ?? streamInfo?.frameRate ?? streamInfo?.fps ?? '')
  };
}

function normalizeMatch(match) {
  const videoid = cleanString(match?.videoid || match?.url || match?.stream || match?.streamUrl || match?.stream_url);
  const streams = Array.isArray(match?.streams)
    ? match.streams.map((line, index) => normalizeStreamLine(line, index)).filter((line) => line.url)
    : [];
  return compactObject({
    id: cleanString(match?.id || match?.matchId || match?.match_id || fallbackIdFromText(`${match?.category}|${match?.league}|${match?.home}|${match?.away}`)),
    source: cleanString(match?.source, 'primary'),
    provider: cleanString(match?.provider, 'ErosMacTV'),
    category: toEnglishCategory(match?.category),
    league: cleanLeague(match?.league),
    home: cleanDisplayText(match?.home, 'Home'),
    away: cleanDisplayText(match?.away, 'Away'),
    home_icon: cleanString(match?.home_icon || match?.homeLogo || match?.home_logo),
    away_icon: cleanString(match?.away_icon || match?.awayLogo || match?.away_logo),
    league_icon: cleanString(match?.league_icon || match?.leagueLogo || match?.league_logo),
    screenshot: cleanString(match?.screenshot || match?.cover || match?.preview),
    progress: cleanDisplayText(match?.progress || match?.progressEn || ''),
    home_score: numberOrNull(match?.home_score ?? match?.homeScore),
    away_score: numberOrNull(match?.away_score ?? match?.awayScore),
    videoid,
    streams: streams.length ? streams : (videoid ? [normalizeStreamLine({ name: 'Main Stream', nameEn: 'Main Stream', url: videoid }, 0)] : [])
  });
}

async function fetchJson(url, options = {}) {
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
  let response;

  try {
    response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': options.userAgent || 'ErosMacTV-cloudflare-worker/3.3',
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
  }

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
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
    const err = new Error('MATCH_API_KEY is not defined as a Cloudflare environment variable.');
    err.status = 500;
    throw err;
  }
  const upstreamUrl = new URL(apiUrl);
  upstreamUrl.searchParams.set('api_key', apiKey);
  const upstreamJson = await fetchJson(upstreamUrl, { cacheTtl: 60 });
  const data = Array.isArray(upstreamJson.data) ? upstreamJson.data.map(normalizeMatch).filter((match) => match.videoid) : [];
  return {
    success: true,
    count: data.length,
    generated_at: cleanDisplayText(upstreamJson.generated_at || ''),
    expires_in: cleanDisplayText(upstreamJson.expires_in || ''),
    data
  };
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
  const url = new URL(rawUrl);
  url.searchParams.set('api_key', apiKey);
  return url;
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

function unwrapRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.channels)) return payload.channels;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  return [];
}

async function loadChannels(env) {
  const upstreamJson = await fetchJson(channelApiUrlFromEnv(env), { cacheTtl: 60, timeoutMs: 8000 });
  const seen = new Set();
  const data = [];
  unwrapRows(upstreamJson).forEach((row, index) => {
    const channel = normalizeChannel(row, index);
    if (!channel.id || !channel.videoid || seen.has(channel.id)) return;
    seen.add(channel.id);
    data.push(channel);
  });
  return {
    success: true,
    count: data.length,
    generated_at: cleanDisplayText(upstreamJson.generated_at || ''),
    expires_in: cleanDisplayText(upstreamJson.expires_in || '2 hours'),
    data
  };
}

export async function handleChannels(env) {
  try {
    return jsonResponse(await loadChannels(env), 200, { 'Cache-Control': 'public, max-age=30, s-maxage=90' });
  } catch (error) {
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : 'Could not load the channel list.' }, error?.status || 502, { 'Cache-Control': 'no-store' });
  }
}

function hasSlaConfig(env = {}) {
  if (String(env.SLA_API_ENABLED || '').trim() === '0') return false;
  if (cleanString(env.SLA_API_AUTH || env.SLA_AUTH)) return true;
  for (const key of ['SLA_API_URL', 'SLA_STREAM_API_URL', 'SLA_API_PAGE_URL', 'SLA_PAGE_URL']) {
    const raw = cleanString(env[key]);
    if (!raw) continue;
    try {
      if (new URL(raw).searchParams.get('auth')) return true;
    } catch (error) {}
  }
  return false;
}

function extractSlaUrlConfig(rawUrl, fallbackUrl, auth) {
  const url = new URL(cleanString(rawUrl, fallbackUrl));
  let extractedAuth = auth || cleanString(url.searchParams.get('auth'));
  url.searchParams.delete('auth');
  return { url, auth: extractedAuth };
}

function getSlaConfig(env = {}) {
  let auth = cleanString(env.SLA_API_AUTH || env.SLA_AUTH);
  const rawApiUrl = cleanString(env.SLA_API_URL || env.SLA_STREAM_API_URL, DEFAULT_SLA_API_URL);
  const rawPageUrl = cleanString(env.SLA_API_PAGE_URL || env.SLA_PAGE_URL);
  const stream = extractSlaUrlConfig(rawApiUrl, DEFAULT_SLA_API_URL, auth);
  auth = stream.auth;
  let page = null;
  if (rawPageUrl || /\/lives\/page\/?$/i.test(stream.url.pathname)) {
    page = extractSlaUrlConfig(rawPageUrl || stream.url.toString(), DEFAULT_SLA_PAGE_URL, auth);
    auth = page.auth;
  }
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
  const output = [];
  for (const token of raw.split(/[\s,;|]+/).map((item) => item.trim()).filter(Boolean)) {
    const match = token.match(/^(\d+)(?::(\d+))?$/);
    if (!match) continue;
    const type = Number.parseInt(match[1], 10);
    const gameId = match[2] ? Number.parseInt(match[2], 10) : undefined;
    if (!Number.isFinite(type)) continue;
    output.push({ type, gameId: Number.isFinite(gameId) ? gameId : undefined, category: SLA_TYPE_CATEGORIES.get(String(type)) || `Sport ${type}` });
  }
  return output.length ? output : SLA_TYPE_CONFIGS;
}

function slaRequestUrl(baseUrl, config, typeConfig = null) {
  const url = new URL(baseUrl.toString());
  url.searchParams.set('auth', config.auth);
  if (typeConfig?.type) url.searchParams.set('type', String(typeConfig.type));
  if (typeConfig?.gameId) url.searchParams.set('gameId', String(typeConfig.gameId));
  if (config.isPlayed !== '') url.searchParams.set('isPlayed', String(config.isPlayed));
  return url;
}

async function fetchSlaJson(url, options = {}) {
  const payload = await fetchJson(url, { cacheTtl: 30, timeoutMs: 9000, userAgent: 'ErosMacTV-SLA-integration/1.0', ...options });
  const errCode = payload?.errCode;
  if (errCode !== undefined && errCode !== null && Number(errCode) !== 0) {
    const err = new Error(cleanDisplayText(payload?.errMsg || payload?.message || `SLA API returned errCode ${errCode}.`));
    err.status = Number(errCode) === 99 ? 429 : 502;
    throw err;
  }
  return payload;
}

function inferStreamType(url = '', explicit = '') {
  const cleanType = cleanDisplayText(explicit).toLowerCase();
  if (cleanType) return cleanType;
  const cleanUrl = cleanString(url).toLowerCase();
  if (/\.mpd(?:$|[?#])/.test(cleanUrl)) return 'mpd';
  if (/\.flv(?:$|[?#])/.test(cleanUrl)) return 'flv';
  if (/\.mp4(?:$|[?#])/.test(cleanUrl)) return 'mp4';
  if (/\.m3u8(?:$|[?#])/.test(cleanUrl)) return 'm3u8';
  return 'm3u8';
}

function normalizeSlaStream(line = {}, index = 0) {
  const url = cleanString(pick(line, ['url', 'playUrl', 'play_url', 'streamUrl', 'stream_url', 'm3u8', 'flv', 'rtmp']));
  if (!/^https?:\/\//i.test(url)) return null;
  const streamInfo = line?.streamInfo || line?.stream_info || {};
  const type = inferStreamType(url, pick(line, ['type', 'format']));
  const rawName = pick(line, ['nameEn', 'name_en', 'lineNameEn', 'line_name_en', 'name', 'lineName', 'label'], '');
  return compactObject({
    id: cleanString(pick(line, ['id', 'lineId', 'line_id']), `line-${index + 1}`),
    name: cleanDisplayText(rawName, type ? type.toUpperCase() : `Line ${index + 1}`),
    url,
    type,
    isPlayed: line?.isPlayed === false || line?.played === false || line?.playable === false ? false : true,
    height: numberOrNull(streamInfo?.Height ?? streamInfo?.height),
    width: numberOrNull(streamInfo?.Width ?? streamInfo?.width),
    frameRate: cleanDisplayText(streamInfo?.FrameRate ?? streamInfo?.frameRate ?? streamInfo?.fps ?? '')
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
    home_score: numberOrNull(pick(row, ['homeScore', 'home_score'], undefined)),
    away_score: numberOrNull(pick(row, ['awayScore', 'away_score'], undefined)),
    progress: cleanDisplayText(pick(row, ['progressEn', 'progress_en', 'progress', 'statusText'])),
    is_played: row?.isPlayed === false ? false : true,
    streams: uniqueStreams,
    videoid: bestStream?.url || ''
  });
}

async function loadSlaPageMatches(config) {
  if (!config.pageUrl) return [];
  const payload = await fetchSlaJson(slaRequestUrl(config.pageUrl, config, null), { cacheTtl: 30, timeoutMs: 9000 });
  return unwrapRows(payload).map((row) => normalizeSlaMatch(row)).filter((match) => match.id && match.videoid);
}

async function loadSlaTypedMatches(config, env = {}) {
  const requests = getSlaTypeConfigs(env).map(async (typeConfig) => {
    const payload = await fetchSlaJson(slaRequestUrl(config.streamUrl, config, typeConfig), { cacheTtl: 30, timeoutMs: 9000 });
    return unwrapRows(payload).map((row) => normalizeSlaMatch(row, typeConfig));
  });
  const settled = await Promise.allSettled(requests);
  const matches = [];
  const failures = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') matches.push(...result.value);
    else failures.push(result.reason);
  }
  if (!matches.length && failures.length === settled.length && failures[0]) throw failures[0];
  return matches.filter((match) => match.id && match.videoid);
}

async function loadSlaMatches(env) {
  if (!hasSlaConfig(env)) return { success: true, configured: false, count: 0, data: [] };
  const config = getSlaConfig(env);
  let data = [];
  if (config.pageUrl) {
    try { data = await loadSlaPageMatches(config); } catch (error) { data = []; }
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
    const useLegacy = !['sla', 'sla only', 'sla only'].includes(sourceMode);
    const useSla = !['legacy', 'legacy only', 'match', 'match only'].includes(sourceMode);
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
    return jsonResponse({ success: true, count: data.length, generated_at: new Date().toISOString(), expires_in: hasSlaConfig(env) ? '30 seconds' : '2 minutes', source_errors: errors.length ? errors : undefined, data }, 200, {
      'Cache-Control': hasSlaConfig(env) ? 'public, max-age=20, s-maxage=30' : 'public, max-age=30, s-maxage=90'
    });
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
    maxSportKeys: Math.max(1, Math.min(20, Number.parseInt(cleanString(env.ODDS_API_MAX_SPORT_KEYS, '8'), 10) || 8)),
    redirectUrl: cleanString(env.ODDS_REDIRECT_URL || env.CRYPTOBET_URL, DEFAULT_ODDS_REDIRECT_URL)
  };
}

function officialOddsSportHints(match = {}) {
  const haystack = normalizeLookup(`${match.category || ''} ${match.league || ''}`);
  if (/fifa|pes|efootball|esports?|e spor|dota|lol|cs go|nba2k/.test(haystack)) return ['Esports'];
  if (/basket/.test(haystack)) return ['Basketball'];
  if (/volley/.test(haystack)) return ['Volleyball'];
  if (/badminton/.test(haystack)) return ['Badminton'];
  if (/baseball|beyzbol/.test(haystack)) return ['Baseball'];
  if (/ice hockey|hockey|buz hokeyi/.test(haystack)) return ['Ice Hockey'];
  if (/tennis|tenis/.test(haystack)) return ['Tennis'];
  if (/cricket|kriket/.test(haystack)) return ['Cricket'];
  if (/rugby/.test(haystack)) return ['Rugby'];
  if (/mma|boxing|boks/.test(haystack)) return ['MMA', 'Boxing'];
  if (/football|soccer|futbol|futsal|beach football|mermer futbolu/.test(haystack)) return ['Soccer'];
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
  if (!config.enabled || match?.is_channel || isVirtualStreamMatch(match)) return null;
  const sportsPayload = await fetchOptionalOfficialOddsJson(config, '/sports', {}, { cacheTtl: 3600, timeoutMs: 4500 });
  const sports = Array.isArray(sportsPayload) ? sportsPayload : [];
  const hints = officialOddsSportHints(match).map((item) => normalizeLookup(item));
  const candidates = sports
    .filter((sport) => sport?.active !== false)
    .map((sport) => ({ key: cleanString(sport.key), group: cleanDisplayText(sport.group || sport.title), title: cleanDisplayText(sport.title || sport.description || sport.key) }))
    .filter((sport) => sport.key && hints.some((hint) => normalizeLookup(`${sport.group} ${sport.title} ${sport.key}`).includes(hint)))
    .slice(0, config.maxSportKeys);
  const checkedSports = [];
  let best = null;
  for (const sport of candidates) {
    checkedSports.push(sport.key);
    const events = await fetchOptionalOfficialOddsJson(config, `/sports/${encodeURIComponent(sport.key)}/odds`, { regions: config.regions, markets: config.markets, oddsFormat: 'decimal', dateFormat: 'iso' }, { cacheTtl: 60, timeoutMs: 5000 });
    for (const event of Array.isArray(events) ? events : []) {
      const score = officialOddsEventScore(match, event);
      if (!best || score > best.score) best = { event, score, sport };
    }
    if (best?.score >= 1.22) break;
  }
  if (!best || best.score < 1.08) return { source: 'official-odds', matched: false, markets: [], checked_sports: checkedSports, redirect_url: config.redirectUrl };
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
    markets
  };
}

function standingsConfig(env = {}) {
  const url = cleanString(env.STANDINGS_API_URL || env.LEAGUE_TABLE_API_URL || env.OFFICIAL_STANDINGS_API_URL);
  const key = cleanString(env.STANDINGS_API_KEY || env.LEAGUE_TABLE_API_KEY || env.OFFICIAL_STANDINGS_API_KEY);
  return { url, key, enabled: Boolean(url) };
}

function normalizeStandingRow(row = {}, index = 0, match = {}) {
  const team = cleanDisplayText(pick(row, ['team', 'name', 'team_name', 'teamName', 'club', 'participant', 'participant_name']), '');
  if (!team) return null;
  const played = numberOrNull(pick(row, ['played', 'matches', 'games', 'p', 'mp', 'played_total']));
  const wins = numberOrNull(pick(row, ['wins', 'won', 'w']));
  const draws = numberOrNull(pick(row, ['draws', 'draw', 'd']));
  const losses = numberOrNull(pick(row, ['losses', 'lost', 'l']));
  const gf = numberOrNull(pick(row, ['goals_for', 'gf', 'for']));
  const ga = numberOrNull(pick(row, ['goals_against', 'ga', 'against']));
  const gd = numberOrNull(pick(row, ['gd', 'goalDiff', 'goal_difference', 'goaldifference'], gf !== null && ga !== null ? gf - ga : null));
  const points = numberOrNull(pick(row, ['points', 'pts', 'point']));
  const side = tokenScore(team, match.home) > 0.72 ? 'home' : tokenScore(team, match.away) > 0.72 ? 'away' : '';
  return compactObject({
    position: numberOrNull(pick(row, ['position', 'rank', 'pos', '#'], index + 1)) ?? index + 1,
    team,
    logo: cleanString(pick(row, ['logo', 'image', 'icon', 'team_logo', 'teamLogo'])),
    played,
    wins,
    draws,
    losses,
    gd,
    points,
    side
  });
}

function unwrapStandingsRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.standings)) return payload.standings;
  if (Array.isArray(payload.table)) return payload.table;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.data?.standings)) return payload.data.standings;
  if (Array.isArray(payload?.data?.table)) return payload.data.table;
  return [];
}

async function loadOfficialStandings(env, match = {}) {
  const config = standingsConfig(env);
  if (!config.enabled || match?.is_channel) return null;
  try {
    const url = new URL(config.url);
    if (config.key) url.searchParams.set('api_key', config.key);
    url.searchParams.set('home', cleanDisplayText(match.home));
    url.searchParams.set('away', cleanDisplayText(match.away));
    url.searchParams.set('league', cleanDisplayText(match.league));
    url.searchParams.set('category', cleanDisplayText(match.category));
    const payload = await fetchJson(url, { cacheTtl: 120, timeoutMs: 5000, userAgent: 'ErosMacTV-standings/1.0' });
    const rows = unwrapStandingsRows(payload).map((row, index) => normalizeStandingRow(row, index, match)).filter(Boolean).slice(0, 16);
    if (!rows.length) return null;
    return {
      source: cleanDisplayText(payload?.source || payload?.provider || 'official-standings'),
      league: cleanDisplayText(payload?.league || payload?.competition || match.league),
      season: cleanDisplayText(payload?.season || payload?.year || ''),
      rows
    };
  } catch (error) {
    return null;
  }
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

  const [officialOdds, standings] = await Promise.all([
    loadOfficialOdds(env, match).catch(() => null),
    loadOfficialStandings(env, match).catch(() => null)
  ]);

  return jsonResponse({
    success: true,
    matched: false,
    event: null,
    stats: [],
    odds: [],
    official_odds: officialOdds,
    timeline: [],
    lineups: null,
    related: [],
    standings
  }, 200, { 'Cache-Control': 'public, max-age=25, s-maxage=60' });
}
