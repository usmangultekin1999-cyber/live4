const DEFAULT_STREAM_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';
const DEFAULT_CHANNEL_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/channels.php';
const DEFAULT_SPORTS_API_BASE_URL = 'https://sports-api.net/api';
const DEFAULT_SPORTS_EVENTS_PATH = '/events';
const DEFAULT_SLA_API_URL = 'https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/streams';
const DEFAULT_SLA_PAGE_URL = 'https://env-00jxh1c541d5.dev-hz.cloudbasefunction.cn/lives/page';

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
  ['tumu', 'All'],
  ['tum', 'All'],
  ['all', 'All'],
  ['diger', 'Other'],
  ['other', 'Other'],
  ['channels', 'Channels'],
  ['kanallar', 'Channels'],
  ['canli tv', 'Channels'],
  ['live tv', 'Channels'],
  ['tv channels', 'Channels'],
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


const SPORTS_API_SPORTS = new Map([
  ['football', 'FOOTBALL'],
  ['soccer', 'FOOTBALL'],
  ['futbol', 'FOOTBALL'],
  ['basketball', 'BASKETBALL'],
  ['basketbol', 'BASKETBALL'],
  ['tennis', 'TENNIS'],
  ['tenis', 'TENNIS'],
  ['badminton', 'BADMINTON'],
  ['volleyball', 'VOLLEYBALL'],
  ['beach volleyball', 'VOLLEYBALL'],
  ['handball', 'HANDBALL'],
  ['ice hockey', 'ICE_HOCKEY'],
  ['hockey', 'ICE_HOCKEY'],
  ['baseball', 'BASEBALL'],
  ['cricket', 'CRICKET'],
  ['futsal', 'FUTSAL'],
  ['rugby', 'RUGBY'],
  ['boxing', 'BOXING'],
  ['mma', 'MMA'],
  ['darts', 'DARTS'],
  ['golf', 'GOLF'],
  ['table tennis', 'TABLE_TENNIS']
]);

const VIRTUAL_SPORT_HINTS = /\b(?:fifa|pes|efootball|fc\s*\d{2}|nba\s*2k|nba2k|espor|e-spor|esports|mortal\s+kombat|guilty\s+gear|king\s+of\s+fighters|street\s+fighter|ufc\s*\d|nhl\s*\d{2}|vca\s*\d{2}|imagic|subway\s+surfer|power\s+of\s+power)\b/i;

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

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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
  const name = cleanDisplayText(line?.nameEn || line?.name_en || line?.label || line?.name || line?.title || `Line ${index + 1}`, `Line ${index + 1}`);
  const type = normalizeStreamType(line?.type || line?.format, url);
  const streamInfo = isPlainObject(line?.streamInfo) ? line.streamInfo : (isPlainObject(line?.stream_info) ? line.stream_info : null);

  return {
    id: cleanString(line?.id || line?.lineId || line?.line_id || `${index}-${type}-${name}`),
    name,
    type,
    url,
    isPlayed: line?.isPlayed !== false && line?.is_played !== false,
    height: numberOrNull(streamInfo?.Height ?? streamInfo?.height),
    width: numberOrNull(streamInfo?.Width ?? streamInfo?.width),
    frameRate: numberOrNull(streamInfo?.FrameRate ?? streamInfo?.frameRate ?? streamInfo?.fps)
  };
}


function normalizeMatch(match) {
  const videoid = cleanString(match?.videoid);
  const streams = Array.isArray(match?.streams)
    ? match.streams
        .map((line, index) => normalizeStreamLine(line, index))
        .filter((line) => line.url)
    : [];

  return {
    id: cleanString(match?.id),
    source: cleanString(match?.source, 'primary'),
    provider: cleanString(match?.provider, 'ErosMacTV'),
    category: toEnglishCategory(match?.category),
    league: cleanLeague(match?.league),
    home: cleanDisplayText(match?.home, 'Home'),
    away: cleanDisplayText(match?.away, 'Away'),
    home_icon: cleanString(match?.home_icon),
    away_icon: cleanString(match?.away_icon),
    videoid,
    streams: streams.length ? streams : (videoid ? [normalizeStreamLine({ name: 'Main Stream', nameEn: 'Main Stream', url: videoid }, 0)] : []),
    screenshot: cleanString(match?.screenshot),
    progress: cleanDisplayText(match?.progress || match?.progressEn || ''),
    home_score: numberOrNull(match?.home_score ?? match?.homeScore),
    away_score: numberOrNull(match?.away_score ?? match?.awayScore)
  };
}

async function fetchJson(url, options = {}) {
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 8000;
  const controller = new AbortController();
  let abortListener = null;

  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
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
        'User-Agent': options.userAgent || 'ErosMacTV-cloudflare-worker/2.0',
        ...(options.headers || {})
      },
      cf: options.cacheTtl
        ? { cacheTtl: options.cacheTtl, cacheEverything: true }
        : undefined
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

async function loadLegacyStreamMatches(env) {
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
  } catch (error) {
    // Fall through to a manual decode attempt below.
  }

  const idMatch = raw.match(/[?&]id=([^&]+)/i) || raw.match(/^id=([^&]+)/i);
  if (idMatch) {
    try {
      const decoded = decodeURIComponent(idMatch[1]);
      if (/^https?:\/\//i.test(decoded)) return decoded;
    } catch (error) {
      // Ignore malformed encoded values.
    }
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
    const payload = await loadChannels(env);
    return jsonResponse(payload, 200, {
      'Cache-Control': 'public, max-age=30, s-maxage=90'
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Could not load the channel list.',
        detail: error?.detail || undefined
      },
      error?.status || 502,
      { 'Cache-Control': 'no-store' }
    );
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
    } catch (error) {
      // Ignore invalid optional URLs; the request path will surface errors if enabled explicitly.
    }
  }

  return false;
}

function extractSlaUrlConfig(rawUrl, fallbackUrl, auth) {
  let url;
  let extractedAuth = auth;

  try {
    url = new URL(cleanString(rawUrl, fallbackUrl));
    extractedAuth ||= cleanString(url.searchParams.get('auth'));
    url.searchParams.delete('auth');
  } catch (error) {
    const err = new Error('SLA_API_URL is not a valid URL.');
    err.status = 500;
    throw err;
  }

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

  return {
    auth,
    streamUrl: stream.url,
    pageUrl: page?.url || null,
    isPlayed: cleanString(env.SLA_API_IS_PLAYED, '1')
  };
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
    output.push({
      type,
      gameId: Number.isFinite(gameId) ? gameId : undefined,
      category: SLA_TYPE_CATEGORIES.get(String(type)) || `Sport ${type}`
    });
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
  const payload = await fetchJson(url, {
    cacheTtl: 30,
    timeoutMs: 9000,
    userAgent: 'ErosMacTV-SLA-integration/1.0',
    ...options
  });

  const errCode = payload?.errCode;
  if (errCode !== undefined && errCode !== null && Number(errCode) !== 0) {
    const err = new Error(cleanDisplayText(payload?.errMsg || payload?.message || `SLA API returned errCode ${errCode}.`));
    err.status = Number(errCode) === 99 ? 429 : 502;
    err.payload = payload;
    throw err;
  }

  return payload;
}

function unwrapSlaEvents(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.events)) return payload.events;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.events)) return payload.data.events;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.page?.list)) return payload.page.list;
  if (Array.isArray(payload?.payload?.data)) return payload.payload.data;
  if (Array.isArray(payload?.payload?.list)) return payload.payload.list;
  return [];
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
  const height = Number.parseInt(cleanString(pick(streamInfo, ['Height', 'height', 'h'])), 10);
  const width = Number.parseInt(cleanString(pick(streamInfo, ['Width', 'width', 'w'])), 10);
  const frameRate = cleanString(pick(streamInfo, ['FrameRate', 'frameRate', 'fps']));
  const rawName = pick(line, ['nameEn', 'name_en', 'lineNameEn', 'line_name_en', 'name', 'lineName', 'label'], '');
  const fallbackName = type ? type.toUpperCase() : `Line ${index + 1}`;

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
  return [...streams]
    .filter((stream) => stream?.url && stream.isPlayed !== false)
    .sort((a, b) => streamRank(b) - streamRank(a))[0] ||
    streams.find((stream) => stream?.url) ||
    null;
}

function formatSlaStartTime(row = {}) {
  const dateStr = cleanString(pick(row, ['dateStr', 'date_str', 'startTimeText', 'start_time_text']));
  const dateStrMatch = dateStr.match(/(?:^|\s|T)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (dateStrMatch) return `${String(Number.parseInt(dateStrMatch[1], 10)).padStart(2, '0')}:${dateStrMatch[2]}`;

  const rawSeconds = pick(row, ['date', 'startTime', 'start_time', 'timestamp'], '');
  const seconds = Number(rawSeconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    const date = new Date(seconds > 10_000_000_000 ? seconds : seconds * 1000);
    if (!Number.isNaN(date.getTime())) {
      return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    }
  }

  return '';
}

function slaCategory(row = {}, context = {}) {
  const explicit = cleanDisplayText(pick(row, ['sportName', 'sportNameEn', 'sport', 'category']));
  if (explicit) return toEnglishCategory(explicit);
  const type = cleanString(pick(row, ['type'], context.type));
  return SLA_TYPE_CATEGORIES.get(String(type)) || context.category || 'Other';
}

function fallbackIdFromText(value = '') {
  let hash = 0;
  const text = cleanString(value);
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function normalizeSlaMatch(row = {}, context = {}) {
  const category = slaCategory(row, context);
  const leagueName = cleanDisplayText(pick(row, ['leagueNameEn', 'league_name_en', 'leagueEn', 'competitionNameEn', 'leagueName', 'league_name', 'competition', 'league']), 'Live Event');
  const time = formatSlaStartTime(row);
  const home = cleanDisplayText(pick(row, ['homeEn', 'home_en', 'homeNameEn', 'homeName', 'home', 'team1']), 'Home');
  const away = cleanDisplayText(pick(row, ['awayEn', 'away_en', 'awayNameEn', 'awayName', 'away', 'team2']), 'Away');
  const rawId = cleanString(pick(row, ['matchId', 'match_id', 'id', 'eventId', 'event_id']));
  const liveRows = Array.isArray(row?.liveList) ? row.liveList
    : Array.isArray(row?.live_list) ? row.live_list
    : Array.isArray(row?.streams) ? row.streams
    : Array.isArray(row?.urls) ? row.urls
    : [];

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
    if (result.status !== 'fulfilled') {
      failures.push(result.reason);
      continue;
    }
    matches.push(...result.value);
  }

  if (!matches.length && failures.length === settled.length && failures[0]) {
    throw failures[0];
  }

  return matches.filter((match) => match.id && match.videoid);
}

async function loadSlaMatches(env) {
  if (!hasSlaConfig(env)) {
    return {
      success: true,
      configured: false,
      count: 0,
      data: []
    };
  }

  const config = getSlaConfig(env);
  let data = [];

  if (config.pageUrl) {
    try {
      data = await loadSlaPageMatches(config);
    } catch (error) {
      // If the user pasted the undocumented /lives/page URL and it does not return
      // the playable schema, fall back to the documented /lives/streams endpoint on
      // the same origin.
      data = [];
    }
  }

  if (!data.length) {
    const streamUrl = new URL(config.streamUrl.toString());
    if (/\/lives\/page\/?$/i.test(streamUrl.pathname)) {
      streamUrl.pathname = streamUrl.pathname.replace(/\/lives\/page\/?$/i, '/lives/streams');
      config.streamUrl = streamUrl;
    }
    data = await loadSlaTypedMatches(config, env);
  }

  return {
    success: true,
    configured: true,
    count: data.length,
    generated_at: new Date().toISOString(),
    expires_in: '30 seconds',
    data
  };
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
    const key = [normalizeSport(match.category), normalizeTeamName(match.home), normalizeTeamName(match.away), time]
      .filter(Boolean)
      .join('|');

    if (key && seenKeys.has(key)) {
      const existingIndex = seenKeys.get(key);
      const existing = output[existingIndex];
      // Prefer SLA playback links if they cover the same event, but keep missing icons
      // from the legacy list when the SLA row has no image.
      if (match.source === 'sla' && existing?.source !== 'sla') {
        output[existingIndex] = {
          ...existing,
          ...match,
          home_icon: match.home_icon || existing.home_icon,
          away_icon: match.away_icon || existing.away_icon
        };
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

    if (useSla && hasSlaConfig(env)) {
      sources.push(loadSlaMatches(env).catch((error) => ({ success: false, source: 'sla', error })));
    }

    if (useLegacy && cleanString(env.MATCH_API_KEY)) {
      sources.push(loadLegacyStreamMatches(env).catch((error) => ({ success: false, source: 'legacy', error })));
    }

    if (!sources.length) {
      const err = new Error('No match source is configured. Add SLA_API_AUTH and/or MATCH_API_KEY as Cloudflare secrets.');
      err.status = 500;
      throw err;
    }

    const results = await Promise.all(sources);
    const errors = [];
    const allMatches = [];

    for (const result of results) {
      if (result?.success && Array.isArray(result.data)) {
        allMatches.push(...result.data);
      } else if (result?.error) {
        errors.push(cleanDisplayText(result.error?.message || result.error));
      }
    }

    const data = dedupeMergedMatches(allMatches);

    if (!data.length && errors.length) {
      const err = new Error(errors[0] || 'Could not load the match list.');
      err.status = 502;
      throw err;
    }

    return jsonResponse({
      success: true,
      count: data.length,
      generated_at: new Date().toISOString(),
      expires_in: hasSlaConfig(env) ? '30 seconds' : '2 minutes',
      source_errors: errors.length ? errors : undefined,
      data
    }, 200, {
      'Cache-Control': hasSlaConfig(env) ? 'public, max-age=20, s-maxage=30' : 'public, max-age=30, s-maxage=90'
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



const DEFAULT_SPORTMONKS_BASE_URL = 'https://api.sportmonks.com/v3/football';

function getSportmonksConfig(env = {}) {
  const token = cleanString(env.SPORTMONKS_API_TOKEN || env.SPORTMONKS_TOKEN || env.SPORTMONKS_KEY);
  const baseUrl = cleanString(env.SPORTMONKS_BASE_URL, DEFAULT_SPORTMONKS_BASE_URL).replace(/\/+$/g, '');
  const enabledFlag = cleanString(env.SPORTMONKS_ENABLED, token ? '1' : '0');
  return { token, baseUrl, enabled: !/^(?:0|false|no|off)$/i.test(enabledFlag) && Boolean(token) };
}


const DEFAULT_ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const DEFAULT_ODDS_REDIRECT_URL = 'https://cryptobet545.com';

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
  const category = normalizeLookup(match.category || '');
  const league = normalizeLookup(match.league || '');
  const haystack = `${category} ${league}`;

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
    return await fetchJson(officialOddsUrl(config, path, params), {
      cacheTtl: options.cacheTtl ?? 90,
      timeoutMs: options.timeoutMs ?? 4500,
      userAgent: 'ErosMacTV-official-odds/1.0'
    });
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

  return compactObject({
    name: displayName,
    odds: price,
    side,
    sourceName: cleanDisplayText(outcome.name),
    point: point ?? undefined
  });
}

function normalizeOfficialMarketKey(key = '') {
  const clean = cleanDisplayText(key, 'Market').toLowerCase();
  if (clean === 'h2h') return 'Match Winner';
  if (clean === 'totals') return 'Over / Under';
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
      const outcomes = (Array.isArray(market.outcomes) ? market.outcomes : [])
        .map((outcome) => normalizeOfficialOddsOutcome(outcome, match))
        .filter(Boolean)
        .slice(0, 6);
      if (!outcomes.length) continue;

      const normalizedName = normalizeOfficialMarketKey(marketKey);
      const key = `${normalizedName}-${outcomes.map((outcome) => `${outcome.name}:${outcome.odds}`).join('|')}`;
      if (seen.has(key)) continue;
      seen.add(key);

      markets.push({
        name: normalizedName,
        bookmaker: bookmakerTitle,
        outcomes,
        redirect_url: redirectUrl
      });

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
    .map((sport) => ({
      key: cleanString(sport.key),
      group: cleanDisplayText(sport.group || sport.title),
      title: cleanDisplayText(sport.title || sport.description || sport.key)
    }))
    .filter((sport) => sport.key && hints.some((hint) => normalizeLookup(`${sport.group} ${sport.title} ${sport.key}`).includes(hint)))
    .slice(0, config.maxSportKeys);

  const checkedSports = [];
  let best = null;

  for (const sport of candidates) {
    checkedSports.push(sport.key);
    const events = await fetchOptionalOfficialOddsJson(config, `/sports/${encodeURIComponent(sport.key)}/odds`, {
      regions: config.regions,
      markets: config.markets,
      oddsFormat: 'decimal',
      dateFormat: 'iso'
    }, { cacheTtl: 60, timeoutMs: 5000 });

    for (const event of Array.isArray(events) ? events : []) {
      const score = officialOddsEventScore(match, event);
      if (!best || score > best.score) best = { event, score, sport };
    }

    if (best?.score >= 1.22) break;
  }

  if (!best || best.score < 1.08) {
    return {
      source: 'the-odds-api.com',
      matched: false,
      markets: [],
      checked_sports: checkedSports,
      redirect_url: config.redirectUrl
    };
  }

  const markets = normalizeOfficialOddsMarkets(best.event, match, config.redirectUrl);
  return {
    source: 'the-odds-api.com',
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

function isSportmonksEligible(match = {}) {
  if (!match || isVirtualStreamMatch(match)) return false;
  const sport = normalizeSport(match.category || '');
  const haystack = normalizeLookup(`${match.category || ''} ${match.league || ''}`);
  if (/\b(?:fifa|pes|efootball|esports?|e-spor|nba2k|dota|lol|cs:?go)\b/.test(haystack)) return false;
  return ['football', 'soccer'].includes(sport) || /\b(?:football|soccer|futbol)\b/.test(haystack);
}

function sportmonksUrl(env, path, params = {}) {
  const config = getSportmonksConfig(env);
  if (!config.enabled) return null;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${config.baseUrl}${cleanPath}`);
  url.searchParams.set('api_token', config.token);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchOptionalSportmonksJson(env, path, params = {}, options = {}) {
  const url = sportmonksUrl(env, path, params);
  if (!url) return null;
  try {
    return await fetchJson(url, {
      cacheTtl: options.cacheTtl ?? 45,
      timeoutMs: options.timeoutMs ?? 5000,
      userAgent: 'ErosMacTV-SportMonks-enrichment/1.0'
    });
  } catch (error) {
    return null;
  }
}

function unwrapSportmonksRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload.fixtures)) return payload.fixtures;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function sportmonksCollection(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function sportmonksParticipantSide(participant = {}) {
  const metaLocation = cleanString(participant?.meta?.location || participant?.meta?.side || participant?.location || participant?.side).toLowerCase();
  if (metaLocation.includes('home') || metaLocation === 'localteam') return 'home';
  if (metaLocation.includes('away') || metaLocation === 'visitorteam') return 'away';
  return '';
}

function sportmonksParticipants(fixture = {}) {
  return sportmonksCollection(fixture.participants).map((participant, index) => ({
    id: cleanString(participant.id ?? participant.participant_id),
    name: cleanDisplayText(participant.name || participant.short_code || participant.code, index === 0 ? 'Home' : 'Away'),
    logo: cleanString(participant.image_path || participant.logo_path || participant.image || participant.logo),
    side: sportmonksParticipantSide(participant) || (index === 0 ? 'home' : index === 1 ? 'away' : '')
  }));
}

function sportmonksHomeAway(fixture = {}) {
  const participants = sportmonksParticipants(fixture);
  const home = participants.find((item) => item.side === 'home') || participants[0] || {};
  const away = participants.find((item) => item.side === 'away') || participants.find((item) => item.id !== home.id) || participants[1] || {};
  return { home, away, participants };
}

function sportmonksEventAdapter(fixture = {}) {
  const { home, away } = sportmonksHomeAway(fixture);
  return {
    id: cleanString(fixture.id),
    homeName: home.name,
    awayName: away.name,
    homeLogo: home.logo,
    awayLogo: away.logo,
    start: cleanString(fixture.starting_at || fixture.starting_at_timestamp || fixture.date),
    league: cleanDisplayText(fixture.league?.name || fixture.league_name || fixture.name),
    competitionName: cleanDisplayText(fixture.league?.name || fixture.league_name),
    sport: 'Football',
    country: cleanDisplayText(fixture.league?.country?.name || fixture.country?.name || fixture.country_name),
    state: cleanDisplayText(fixture.state?.name || fixture.state?.short_name || fixture.status || fixture.result_info),
    fixture
  };
}

function findBestSportmonksFixture(match, fixtures = []) {
  let best = null;
  for (const fixture of fixtures) {
    const event = sportmonksEventAdapter(fixture);
    if (!event.id) continue;
    const scored = eventScore(match, event);
    // SportMonks candidates are all football, so a solid team-name match is enough.
    const direct = tokenScore(match.home, event.homeName) + tokenScore(match.away, event.awayName);
    const reverse = tokenScore(match.home, event.awayName) + tokenScore(match.away, event.homeName) - 0.14;
    const score = Math.max(scored.score, direct, reverse);
    const reversed = reverse > direct;
    if (!best || score > best.score) best = { fixture, event, score, reversed };
  }
  if (!best || best.score < 1.12) return null;
  return best;
}

function datePartsForSportmonks() {
  const now = new Date();
  const days = [-1, 0, 1].map((offset) => {
    const date = new Date(now.getTime() + offset * 86400000);
    return date.toISOString().slice(0, 10);
  });
  return days;
}

async function loadSportmonksCandidates(env, match) {
  if (!getSportmonksConfig(env).enabled || !isSportmonksEligible(match)) {
    return { matched: null, fixtures: [], sources: [] };
  }

  const include = cleanString(
    env.SPORTMONKS_INCLUDES,
    'participants;scores;events;statistics;lineups;state;league;venue'
  );

  const requests = [
    { path: '/livescores/inplay', params: { include }, source: '/livescores/inplay', cacheTtl: 25 },
    { path: '/livescores', params: { include }, source: '/livescores', cacheTtl: 45 },
    ...datePartsForSportmonks().map((day) => ({ path: `/fixtures/date/${day}`, params: { include }, source: `/fixtures/date/${day}`, cacheTtl: 180 }))
  ];

  const fixtures = [];
  const sources = [];
  const seen = new Set();

  for (const requestConfig of requests) {
    const payload = await fetchOptionalSportmonksJson(env, requestConfig.path, requestConfig.params, {
      cacheTtl: requestConfig.cacheTtl,
      timeoutMs: 5500
    });
    if (!payload) continue;
    sources.push(requestConfig.source);
    for (const row of unwrapSportmonksRows(payload)) {
      const id = cleanString(row?.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      fixtures.push(row);
    }
    const matched = findBestSportmonksFixture(match, fixtures);
    if (matched) return { matched, fixtures, sources };
  }

  return { matched: findBestSportmonksFixture(match, fixtures), fixtures, sources };
}

function sportmonksScoreValue(fixture = {}, side = 'home') {
  const { home, away } = sportmonksHomeAway(fixture);
  const participantId = side === 'home' ? home.id : away.id;
  const scores = sportmonksCollection(fixture.scores);
  const candidates = scores.filter((score) => String(score.participant_id || score.participantId || score.team_id || '') === String(participantId));
  const preferred = candidates.find((score) => /current|regular|fulltime|2nd-half|2nd/i.test(cleanString(score.description || score.type?.name || score.type))) || candidates[candidates.length - 1];
  const value = preferred?.score?.goals ?? preferred?.score?.total ?? preferred?.score?.score ?? preferred?.goals ?? preferred?.score;
  return numberOrNull(value);
}

function normalizeSportmonksEvent(fixture = {}) {
  const { home, away } = sportmonksHomeAway(fixture);
  return compactObject({
    id: cleanString(fixture.id),
    name: cleanDisplayText(fixture.name, `${home.name} - ${away.name}`),
    home: home.name,
    away: away.name,
    home_logo: home.logo,
    away_logo: away.logo,
    start: cleanString(fixture.starting_at || (fixture.starting_at_timestamp ? new Date(Number(fixture.starting_at_timestamp) * 1000).toISOString() : '')),
    group: cleanDisplayText(fixture.league?.name || fixture.league_name),
    groupId: cleanString(fixture.league_id || fixture.league?.id),
    sport: 'Football',
    state: cleanDisplayText(fixture.state?.name || fixture.state?.short_name || fixture.result_info || fixture.status),
    country: cleanDisplayText(fixture.league?.country?.name || fixture.country?.name || fixture.country_name),
    venue: cleanDisplayText(fixture.venue?.name),
    home_score: sportmonksScoreValue(fixture, 'home'),
    away_score: sportmonksScoreValue(fixture, 'away')
  });
}

function sportmonksParticipantNameMap(fixture = {}) {
  const map = new Map();
  for (const participant of sportmonksParticipants(fixture)) {
    if (participant.id) map.set(String(participant.id), participant);
  }
  return map;
}

function sportmonksStatTypeName(stat = {}) {
  return cleanDisplayText(stat?.type?.name || stat?.type?.display_name || stat?.name || stat?.type_name || stat?.code || stat?.type);
}

function sportmonksStatValue(stat = {}) {
  const raw = stat?.data?.value ?? stat?.data?.total ?? stat?.value ?? stat?.total ?? stat?.statistic ?? stat?.data;
  if (isPlainObject(raw)) return raw.value ?? raw.total ?? raw.count ?? '';
  return raw;
}

function normalizeSportmonksStats(fixture = {}) {
  const participantMap = sportmonksParticipantNameMap(fixture);
  const pairs = new Map();

  for (const stat of sportmonksCollection(fixture.statistics)) {
    const label = sportmonksStatTypeName(stat);
    const value = sportmonksStatValue(stat);
    const participant = participantMap.get(String(stat.participant_id || stat.participantId || stat.team_id || ''));
    if (!label || !participant || !isStatishValue(value)) continue;
    const key = normalizeLookup(label);
    if (!pairs.has(key)) pairs.set(key, { label, home: '', away: '' });
    pairs.get(key)[participant.side === 'away' ? 'away' : 'home'] = displayValue(value);
  }

  return [...pairs.values()].filter((row) => row.home !== '' && row.away !== '').slice(0, 12);
}

function isStatishValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  if (value === null || value === undefined || typeof value === 'object') return false;
  return /^-?\d+(?:[.,]\d+)?%?$/.test(cleanDisplayText(value, ''));
}

function normalizeSportmonksTimeline(fixture = {}) {
  const participantMap = sportmonksParticipantNameMap(fixture);
  return sportmonksCollection(fixture.events)
    .map((event) => {
      const minute = cleanDisplayText(event.minute ?? event.extra_minute ?? event.result ?? '');
      const type = cleanDisplayText(event.type?.name || event.type?.code || event.type || event.addition || 'Event');
      const participant = participantMap.get(String(event.participant_id || event.participantId || event.team_id || ''));
      const player = cleanDisplayText(event.player_name || event.player?.name || event.related_player_name || event.related_player?.name || '');
      const result = cleanDisplayText(event.result || event.info || event.details || '');
      const text = [player, result].filter(Boolean).join(' · ');
      if (!minute && !text) return null;
      return { minute: minute ? `${minute}'` : '', type, team: participant?.name || '', text };
    })
    .filter(Boolean)
    .slice(0, 12);
}


function sportmonksStandingParticipant(row = {}) {
  const participant = row.participant || row.team || row.club || {};
  return {
    id: cleanString(row.participant_id || row.participantId || row.team_id || participant.id),
    name: cleanDisplayText(participant.name || row.participant_name || row.team_name || row.name, 'Team'),
    logo: cleanString(participant.image_path || participant.logo_path || participant.image || participant.logo)
  };
}

function standingDetailEntries(row = {}) {
  const details = [];
  const add = (label, value) => {
    const key = normalizeLookup(label);
    if (!key || value === null || value === undefined || value === '') return;
    details.push([key, value]);
  };

  const collections = [row.details, row.statistics, row.stats];
  for (const collection of collections) {
    for (const detail of sportmonksCollection(collection)) {
      const label = cleanDisplayText(
        detail?.type?.name || detail?.type?.display_name || detail?.type?.code || detail?.name || detail?.code || detail?.type_name || detail?.type,
        ''
      );
      const value = detail?.value ?? detail?.data?.value ?? detail?.data?.total ?? detail?.total ?? detail?.count ?? detail?.data;
      add(label, value);
    }
  }

  for (const [key, value] of Object.entries(row)) {
    if (['position', 'points', 'participant_id', 'participantId', 'participant', 'team', 'league', 'season', 'stage', 'group', 'round', 'form'].includes(key)) continue;
    if (typeof value !== 'object') add(key, value);
  }

  return details;
}

function pickStandingValue(row = {}, patterns = []) {
  const entries = standingDetailEntries(row);
  for (const pattern of patterns) {
    const found = entries.find(([key]) => pattern.test(key));
    if (found) return numberOrNull(found[1]);
  }
  return null;
}

function normalizeSportmonksStandingsRows(rows = [], fixture = {}) {
  const { home, away } = sportmonksHomeAway(fixture);
  const normalized = rows
    .map((row) => {
      const participant = sportmonksStandingParticipant(row);
      const played = pickStandingValue(row, [/\bplayed\b/, /matches played/, /overall.*match/]) ?? numberOrNull(row.played || row.matches_played || row.overall?.played);
      const won = pickStandingValue(row, [/\bwon\b/, /\bwins?\b/]) ?? numberOrNull(row.won || row.win || row.wins || row.overall?.won);
      const drawn = pickStandingValue(row, [/\bdraws?\b/, /\btie\b/]) ?? numberOrNull(row.drawn || row.draw || row.draws || row.overall?.draw);
      const lost = pickStandingValue(row, [/\blost\b/, /\bloss?es\b/]) ?? numberOrNull(row.lost || row.loss || row.losses || row.overall?.lost);
      const gf = pickStandingValue(row, [/goals? for/, /goals? scored/, /\bfor\b/]) ?? numberOrNull(row.goals_for || row.gf || row.overall?.goals_for);
      const ga = pickStandingValue(row, [/goals? against/, /goals? conceded/, /\bagainst\b/]) ?? numberOrNull(row.goals_against || row.ga || row.overall?.goals_against);
      const gd = pickStandingValue(row, [/goal difference/, /\bgd\b/, /difference/]) ?? numberOrNull(row.goal_difference || row.gd || (gf !== null && ga !== null ? gf - ga : null));
      const points = numberOrNull(row.points || row.point || pickStandingValue(row, [/\bpoints?\b/]));
      const position = numberOrNull(row.position || row.rank || row.ranking) ?? 0;
      const side = String(participant.id) === String(home.id) ? 'home' : String(participant.id) === String(away.id) ? 'away' : '';

      if (!participant.name || !position) return null;
      return compactObject({
        position,
        team: participant.name,
        logo: participant.logo,
        played,
        won,
        drawn,
        lost,
        gf,
        ga,
        gd,
        points,
        side
      });
    })
    .filter(Boolean)
    .sort((a, b) => (a.position || 999) - (b.position || 999));

  return normalized.slice(0, 18);
}

async function loadSportmonksStandings(env, fixture = {}) {
  const leagueId = cleanString(fixture.league_id || fixture.league?.id);
  const seasonId = cleanString(fixture.season_id || fixture.season?.id);
  const include = cleanString(env.SPORTMONKS_STANDINGS_INCLUDES, 'participant;details;league;season');

  const attempts = [];
  if (leagueId) attempts.push({ path: `/standings/live/leagues/${encodeURIComponent(leagueId)}`, params: { include }, source: 'live-league' });
  if (seasonId) attempts.push({ path: `/standings/seasons/${encodeURIComponent(seasonId)}`, params: { include }, source: 'season' });

  for (const attempt of attempts) {
    const payload = await fetchOptionalSportmonksJson(env, attempt.path, attempt.params, { cacheTtl: 600, timeoutMs: 5200 });
    const rows = unwrapSportmonksRows(payload);
    const standings = normalizeSportmonksStandingsRows(rows, fixture);
    if (standings.length) {
      return {
        source: 'sportmonks.com',
        mode: attempt.source,
        leagueId,
        seasonId,
        rows: standings
      };
    }
  }

  return null;
}

function normalizeSportmonksLineups(fixture = {}) {
  const participantMap = sportmonksParticipantNameMap(fixture);
  const output = { homeFormation: '', awayFormation: '', homePlayers: [], awayPlayers: [] };

  for (const lineup of sportmonksCollection(fixture.lineups)) {
    const participant = participantMap.get(String(lineup.participant_id || lineup.participantId || lineup.team_id || ''));
    const side = participant?.side === 'away' ? 'away' : 'home';
    const formation = cleanString(lineup.formation || lineup.formation_field || lineup.team_formation);
    if (formation) output[`${side}Formation`] = formation;

    const playerName = cleanDisplayText(lineup.player_name || lineup.player?.name || lineup.name || lineup.display_name || '');
    const isStarting = lineup.type_id === 11 || /^starting|lineup|starter/i.test(cleanString(lineup.type?.name || lineup.type || lineup.position));
    if (playerName && (isStarting || output[`${side}Players`].length < 11)) output[`${side}Players`].push(playerName);
  }

  output.homePlayers = [...new Set(output.homePlayers)].slice(0, 11);
  output.awayPlayers = [...new Set(output.awayPlayers)].slice(0, 11);
  return output.homeFormation || output.awayFormation || output.homePlayers.length || output.awayPlayers.length ? output : null;
}

async function loadSportmonksDetails(env, match) {
  const candidates = await loadSportmonksCandidates(env, match);
  if (!candidates.matched) return null;

  let fixture = candidates.matched.fixture;
  const fixtureId = cleanString(fixture.id);
  const include = cleanString(
    env.SPORTMONKS_DETAIL_INCLUDES || env.SPORTMONKS_INCLUDES,
    'participants;scores;events;statistics;lineups;state;league;venue'
  );

  if (fixtureId) {
    const detail = await fetchOptionalSportmonksJson(env, `/fixtures/${encodeURIComponent(fixtureId)}`, { include }, { cacheTtl: 35, timeoutMs: 5500 });
    const detailRows = unwrapSportmonksRows(detail);
    if (detailRows[0]) fixture = { ...fixture, ...detailRows[0] };
    else if (isPlainObject(detail?.data)) fixture = { ...fixture, ...detail.data };
  }

  const standings = await loadSportmonksStandings(env, fixture);

  return {
    success: true,
    matched: true,
    confidence: Number(candidates.matched.score.toFixed(2)),
    source: 'sportmonks.com',
    event: normalizeSportmonksEvent(fixture),
    stats: normalizeSportmonksStats(fixture),
    odds: [],
    timeline: normalizeSportmonksTimeline(fixture),
    lineups: normalizeSportmonksLineups(fixture),
    standings,
    related: unwrapSportmonksRows({ data: candidates.fixtures })
      .filter((item) => String(item.id) !== String(fixtureId))
      .map((item) => normalizeSportmonksEvent(item))
      .slice(0, 8),
    coverage: {
      source: 'sportmonks.com',
      checked_sources: candidates.sources,
      checked_events: candidates.fixtures.length,
      sport: 'Football'
    }
  };
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

function sportsRequest(env, path = DEFAULT_SPORTS_EVENTS_PATH) {
  const config = getSportsConfig(env);
  if (!config.key) {
    const err = new Error('SPORTS_API_KEY is not defined as a Cloudflare environment variable.');
    err.status = 500;
    throw err;
  }

  let url;
  if (path === DEFAULT_SPORTS_EVENTS_PATH && config.eventsUrl) {
    url = new URL(config.eventsUrl);
  } else {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    url = new URL(`${config.baseUrl}${cleanPath}`);
  }

  // Keep the key out of logs, cache keys and browser-visible URLs. SportsAPI accepts X-API-Key.
  url.searchParams.delete('api_key');
  return { url, key: config.key };
}

async function fetchSportsJson(env, path, { cacheTtl = 120, timeoutMs = 5000 } = {}) {
  const { url, key } = sportsRequest(env, path);
  return fetchJson(url, {
    cacheTtl,
    timeoutMs,
    userAgent: 'ErosMacTV-sports-enrichment/4.0',
    headers: {
      'X-API-Key': key
    }
  });
}

async function fetchOptionalSportsJson(env, path, options = {}) {
  try {
    return await fetchSportsJson(env, path, options);
  } catch (error) {
    // Sports data is enrichment only. It must never break the player or return
    // Cloudflare 5xx responses when SportsAPI is slow, over quota or missing data.
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
  if (Array.isArray(payload?.data?.events)) return payload.data.events;
  if (Array.isArray(payload?.payload?.events)) return payload.payload.events;
  if (Array.isArray(payload?.sportsbook?.events)) return payload.sportsbook.events;
  if (Array.isArray(payload?.snapshot?.events)) return payload.snapshot.events;
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

function sportsApiSport(value = '') {
  const normalized = normalizeSport(value);
  return SPORTS_API_SPORTS.get(normalized) || SPORTS_API_SPORTS.get(normalizeLookup(value)) || '';
}

function isVirtualStreamMatch(match = {}) {
  const haystack = `${match?.category || ''} ${match?.league || ''}`;
  return VIRTUAL_SPORT_HINTS.test(haystack);
}

function sportsPath(path, params = {}) {
  const url = new URL(`https://erosmactv.invalid${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') url.searchParams.set(key, String(value));
  }
  return `${url.pathname}${url.search}`;
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
  const streamLooksVirtual = isVirtualStreamMatch(match);

  if (streamLooksVirtual && !['esports', 'fifa', 'pes', 'nba2k'].includes(eventSport)) {
    return { score: 0, reversed: false };
  }

  if (matchSport && eventSport) {
    if (matchSport === eventSport || matchSport.includes(eventSport) || eventSport.includes(matchSport)) {
      score += 0.28;
    } else if (!streamLooksVirtual) {
      // Real football/basketball/etc. should not be matched to a different sport just because names overlap.
      score -= 0.32;
    }
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

function titleCaseText(value = '') {
  return cleanDisplayText(value, '')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


function normalizeOutcomeName(value = '') {
  const text = cleanDisplayText(value, '');
  if (!text) return '';

  const code = text.toUpperCase().replace(/[\s-]+/g, '_');
  const codeMap = new Map([
    ['OT_ONE', '1'],
    ['OT_1', '1'],
    ['ONE', '1'],
    ['HOME', '1'],
    ['OT_CROSS', 'X'],
    ['OT_X', 'X'],
    ['CROSS', 'X'],
    ['DRAW', 'X'],
    ['OT_DRAW', 'X'],
    ['OT_TWO', '2'],
    ['OT_2', '2'],
    ['TWO', '2'],
    ['AWAY', '2'],
    ['YES', 'Yes'],
    ['NO', 'No'],
    ['OVER', 'Over'],
    ['UNDER', 'Under']
  ]);

  if (codeMap.has(code)) return codeMap.get(code);
  if (/^OT_(OVER|UNDER)_?\d*(?:_\d+)?$/i.test(code)) {
    return code.replace(/^OT_/, '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Raw sportsbook enum values should not leak into the UI.
  if (/^[A-Z]{2,}_[A-Z0-9_]+$/.test(code)) return '';

  return text;
}

function getOutcomeName(outcome = {}) {
  const participant = outcome.participant || outcome.team || outcome.selection || outcome.player;
  if (isPlainObject(participant)) {
    const participantName = normalizeOutcomeName(pick(participant, ['name', 'english_name', 'label', 'title']));
    if (participantName) return participantName;
  }

  return normalizeOutcomeName(pick(outcome, ['name', 'label', 'title', 'selectionName', 'outcomeName', 'description', 'type'])) || 'Selection';
}

function rawNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const text = value.trim();
  if (!text || /[a-z]/i.test(text.replace(/[eE][+-]?\d+$/, ''))) return null;
  const match = text.replace(/\s+/g, '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : null;
}

function formatDecimalOdds(value) {
  let number = rawNumber(value);
  if (number === null || !Number.isFinite(number)) return '';

  // SportsAPI returns many bookmaker prices as milliodds: 4900 = 4.90, 1360 = 1.36.
  // Convert those to normal decimal odds before they reach the UI.
  const valueText = String(value ?? '').trim();
  const integerLike = /^-?\d+$/.test(valueText) || Number.isInteger(number);
  if (integerLike && Math.abs(number) >= 1000) number /= 1000;
  else if (integerLike && Math.abs(number) > 100) number /= 100;

  if (number <= 1 || number > 500) return '';
  return number.toFixed(2);
}

function getOddsValue(outcome = {}) {
  const candidates = [];
  const keys = ['decimalOdds', 'decimal_odds', 'oddsDecimal', 'coefficient', 'coef', 'odds'];

  for (const key of keys) candidates.push(outcome[key]);

  if (isPlainObject(outcome.price)) {
    candidates.push(outcome.price.decimal, outcome.price.decimalOdds, outcome.price.odds, outcome.price.value);
  } else {
    candidates.push(outcome.price);
  }

  // Some APIs use `value` for the odds price, while others use it for enum codes such as OT_ONE.
  // Only accept it when it is actually numeric.
  if (rawNumber(outcome.value) !== null) candidates.push(outcome.value);

  for (const candidate of candidates) {
    const formatted = formatDecimalOdds(candidate);
    if (formatted) return formatted;
  }

  return '';
}

function isMarketCandidate(candidate) {
  if (!isPlainObject(candidate)) return false;
  return Boolean(
    Array.isArray(candidate.outcomes) ||
    Array.isArray(candidate.selections) ||
    Array.isArray(candidate.options) ||
    Array.isArray(candidate.prices) ||
    Array.isArray(candidate.lines)
  );
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
    if (Array.isArray(payload)) directCandidates.push(...payload.filter(isMarketCandidate));
    if (Array.isArray(payload.offers)) directCandidates.push(...payload.offers.filter(isMarketCandidate));
    if (Array.isArray(payload.betOffers)) directCandidates.push(...payload.betOffers.filter(isMarketCandidate));
    if (Array.isArray(payload.markets)) directCandidates.push(...payload.markets.filter(isMarketCandidate));
    if (Array.isArray(payload.data)) directCandidates.push(...payload.data.filter(isMarketCandidate));
    if (isMarketCandidate(payload.mainBetOffer)) directCandidates.push(payload.mainBetOffer);
    if (isMarketCandidate(payload.offer)) directCandidates.push(payload.offer);

    for (const candidate of directCandidates) {
      const market = normalizeMarket(candidate);
      if (market) markets.push(market);
    }

    if (!markets.length) {
      const arrays = collectArrays(payload, (item) => isMarketCandidate(item));
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

function normalizedKeyText(value = '') {
  return normalizeLookup(cleanDisplayText(value, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' '));
}

function normalizeStatName(name = '') {
  const key = normalizedKeyText(name);
  if (!key) return '';

  // Do not show team profile / standings fields as live match statistics.
  if (/\b(?:team id|teamid|team name|teamname|participant id|participant name|wins?|draws?|losses?|played|form|rank|ranking|position|standing|standings|season|league id|group id|country|code|slug|logo|image|name|id)\b/.test(key)) {
    return '';
  }

  if (key.includes('possess') || key.includes('ball possession')) return 'Possession';
  if (key.includes('shot') && (key.includes('target') || key.includes('on goal'))) return 'Shots on target';
  if (key.includes('shot')) return 'Shots';
  if (key.includes('corner')) return 'Corners';
  if (key.includes('yellow') && key.includes('card')) return 'Yellow cards';
  if (key.includes('red') && key.includes('card')) return 'Red cards';
  if (key.includes('card')) return 'Cards';
  if (key.includes('foul')) return 'Fouls';
  if (key.includes('offside')) return 'Offsides';
  if (key.includes('save')) return 'Saves';
  if (key.includes('dangerous') && key.includes('attack')) return 'Dangerous attacks';
  if (key === 'attacks' || key.includes('attack')) return 'Attacks';
  if (key.includes('penalt')) return 'Penalties';
  if (key.includes('xg') || key.includes('expected goal')) return 'Expected goals';
  if (key.includes('ace')) return 'Aces';
  if (key.includes('double fault')) return 'Double faults';
  if (key.includes('first serve')) return 'First serve';
  if (key.includes('second serve')) return 'Second serve';
  if (key.includes('break point')) return 'Break points';
  if (key.includes('field goal')) return 'Field goals';
  if (key.includes('three point') || key.includes('3 point')) return '3 pointers';
  if (key.includes('free throw')) return 'Free throws';
  if (key.includes('rebound')) return 'Rebounds';
  if (key.includes('assist')) return 'Assists';
  if (key.includes('turnover')) return 'Turnovers';
  if (key.includes('steal')) return 'Steals';
  if (key.includes('block')) return 'Blocks';

  return '';
}

function isStatValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  if (value === null || value === undefined) return false;
  if (typeof value === 'object') return false;
  const text = cleanDisplayText(value, '');
  if (!text || text === '—') return false;
  return /^-?\d+(?:[.,]\d+)?%?$/.test(text);
}

function statFromObject(item = {}) {
  const label = normalizeStatName(pick(item, ['name', 'label', 'title', 'type', 'stat', 'key']));
  const home = pick(item, ['home', 'homeValue', 'home_value', 'homeTeam', 'local', 'team1', 'home_total']);
  const away = pick(item, ['away', 'awayValue', 'away_value', 'awayTeam', 'visitor', 'team2', 'away_total']);

  if (!label || home === '' || away === '' || !isStatValue(home) || !isStatValue(away)) return null;
  return { label, home: displayValue(home), away: displayValue(away) };
}

function objectStatRows(value) {
  const rows = [];
  const home = value?.home || value?.homeTeam || value?.localteam || value?.team1;
  const away = value?.away || value?.awayTeam || value?.visitorteam || value?.team2;

  if (isPlainObject(home) && isPlainObject(away)) {
    const keys = new Set([...Object.keys(home), ...Object.keys(away)]);
    for (const key of keys) {
      const label = normalizeStatName(key);
      if (!label) continue;

      const left = home[key];
      const right = away[key];
      if (left === undefined || right === undefined) continue;
      if (!isStatValue(left) || !isStatValue(right)) continue;
      rows.push({ label, home: displayValue(left), away: displayValue(right) });
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
      const label = normalizeStatName(pick(item, ['name', 'label', 'title', 'type', 'stat', 'key']));
      return Boolean(label) && (
        isStatValue(pick(item, ['home', 'homeValue', 'home_value', 'homeTeam', 'local', 'team1', 'home_total'])) ||
        isStatValue(pick(item, ['away', 'awayValue', 'away_value', 'awayTeam', 'visitor', 'team2', 'away_total']))
      );
    });

    for (const array of arrays.slice(0, 5)) {
      for (const item of array.slice(0, 20)) {
        const row = statFromObject(item);
        if (row) rows.push(row);
      }
    }
  }

  const preferred = [
    'Possession', 'Shots', 'Shots on target', 'Corners', 'Yellow cards', 'Red cards', 'Cards',
    'Fouls', 'Offsides', 'Saves', 'Dangerous attacks', 'Attacks', 'Penalties', 'Expected goals',
    'Aces', 'Double faults', 'First serve', 'Second serve', 'Break points',
    'Field goals', '3 pointers', 'Free throws', 'Rebounds', 'Assists', 'Turnovers', 'Steals', 'Blocks'
  ];
  const seen = new Set();
  const cleanRows = rows.filter((row) => {
    const key = row.label.toLowerCase();
    if (!row.label || seen.has(key)) return false;
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
  const raw = pick(item, ['minute', 'min', 'matchMinute', 'elapsed', 'clock', 'matchTime', 'time']);
  if (raw === '' || raw === null || raw === undefined || typeof raw === 'object') return '';
  const text = cleanDisplayText(raw);

  // Avoid converting dates or sportsbook codes into fake minutes.
  if (/^\d{4}-\d{2}-\d{2}/.test(text) || /^[A-Z]{2,}_[A-Z0-9_]+$/.test(text)) return '';
  const number = text.match(/\d+/)?.[0];
  if (!number) return text.length <= 6 ? text : '';
  const minute = Number.parseInt(number, 10);
  if (!Number.isFinite(minute) || minute > 240) return '';
  return `${minute}'`;
}

function normalizeTimelineType(value = '') {
  const text = cleanDisplayText(value, '');
  if (!text) return '';
  const code = text.toUpperCase().replace(/[\s-]+/g, '_');
  if (/^[A-Z]{2,}_[A-Z0-9_]+$/.test(code)) return '';

  const key = normalizedKeyText(text);
  if (!key) return '';
  if (key.includes('goal')) return 'Goal';
  if (key.includes('yellow') && key.includes('card')) return 'Yellow card';
  if (key.includes('red') && key.includes('card')) return 'Red card';
  if (key.includes('substitution') || key.includes('substitute')) return 'Substitution';
  if (key.includes('corner')) return 'Corner';
  if (key.includes('shot')) return 'Shot';
  if (key.includes('foul')) return 'Foul';
  if (key.includes('penalty')) return 'Penalty';
  if (key.includes('attack')) return 'Attack';
  if (key.includes('chance')) return 'Chance';
  if (key.includes('kick off') || key.includes('kickoff')) return 'Kick-off';
  if (key.includes('half')) return 'Half-time';
  if (key.includes('period')) return 'Period';
  if (key.includes('set')) return 'Set';
  if (key.includes('game')) return 'Game';
  if (key.includes('point')) return 'Point';

  // Keep short human-readable labels, drop enum-looking values.
  return text.length <= 40 ? titleCaseText(text) : '';
}

function collectTimelineArrays(payload) {
  const arrays = [];
  const seen = new Set();

  function addArray(array) {
    if (!Array.isArray(array) || seen.has(array)) return;
    if (!array.some((item) => isPlainObject(item))) return;
    seen.add(array);
    arrays.push(array);
  }

  function walk(value, keyName = '', depth = 0) {
    if (depth > 5 || value === null || value === undefined) return;

    if (Array.isArray(value)) {
      const key = normalizedKeyText(keyName);
      const namedLikeTimeline = /\b(?:timeline|incident|incidents|commentary|match events|match event|events)\b/.test(key);
      const hasMinuteItems = value.some((item) => isPlainObject(item) && minuteFromItem(item));
      if (namedLikeTimeline || hasMinuteItems) addArray(value);
      for (const item of value.slice(0, 40)) walk(item, '', depth + 1);
      return;
    }

    if (isPlainObject(value)) {
      for (const [key, item] of Object.entries(value)) walk(item, key, depth + 1);
    }
  }

  walk(payload);
  return arrays;
}

function normalizeTimeline(...payloads) {
  const rows = [];
  for (const payload of payloads) {
    if (!payload) continue;
    const arrays = collectTimelineArrays(payload);

    for (const array of arrays.slice(0, 4)) {
      for (const item of array.slice(0, 30)) {
        if (!isPlainObject(item)) continue;
        const minute = minuteFromItem(item);
        if (!minute) continue;

        const rawType = pick(item, ['eventType', 'incidentType', 'type', 'name', 'title']);
        const type = normalizeTimelineType(rawType) || 'Event';
        const team = cleanDisplayText(pick(item, ['team', 'teamName', 'participantName', 'side']));
        const text = cleanDisplayText(pick(item, ['description', 'text', 'comment', 'detail', 'playerName', 'player']));
        if (!type && !text) continue;
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


function eventSignature(event = {}) {
  const id = extractEventId(event);
  if (id) return `id:${id}`;
  return `teams:${normalizeTeamName(eventHome(event))}:${normalizeTeamName(eventAway(event))}:${cleanString(pick(event, ['start', 'startTime', 'start_at', 'date']))}`;
}

function dedupeSportsEvents(events = []) {
  const seen = new Set();
  const output = [];
  for (const event of events) {
    const key = eventSignature(event);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(event);
  }
  return output;
}

function enabled(value) {
  return /^(?:1|true|yes|on)$/i.test(cleanString(value));
}

async function loadSportsCandidates(env, match) {
  // Keep the default SportsAPI lane light. The old rich scan hit /sportsbook first,
  // which can return very large payloads and make the Worker spend too much time
  // before the player has even started. Rich sportsbook discovery can still be
  // enabled with SPORTS_API_RICH_MODE=1, but it is off by default.
  const sport = sportsApiSport(match?.category);
  const richMode = enabled(env.SPORTS_API_RICH_MODE);
  const paths = richMode
    ? [
        sportsPath('/events/filter', sport ? { sport } : {}),
        '/events/live',
        sportsPath('/sportsbook', sport ? { sport } : {})
      ]
    : [
        sportsPath('/events/filter', sport ? { sport } : {}),
        '/events/live'
      ];

  const payloads = [];
  const events = [];
  const sources = [];

  async function addPath(path, cacheTtl = 120, timeoutMs = 4500) {
    if (!path || sources.includes(path)) return;
    const payload = await fetchOptionalSportsJson(env, path, { cacheTtl, timeoutMs });
    if (!payload) return;
    payloads.push(payload);
    sources.push(path);
    events.push(...unwrapEvents(payload));
  }

  for (const path of paths) {
    await addPath(path, path.includes('/live') ? 30 : 180, path.includes('/sportsbook') ? 5500 : 4500);
    const uniqueEvents = dedupeSportsEvents(events);
    const matched = findBestSportsEvent(match, uniqueEvents);
    if (matched) {
      return { payloads, events: uniqueEvents, matched, sources, sport, richMode };
    }
  }

  const uniqueEvents = dedupeSportsEvents(events);
  return {
    payloads,
    events: uniqueEvents,
    matched: null,
    sources,
    sport,
    richMode
  };
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
    const officialOdds = await loadOfficialOdds(env, match);
    const sportmonksDetails = await loadSportmonksDetails(env, match);
    if (sportmonksDetails) {
      return jsonResponse({ ...sportmonksDetails, official_odds: officialOdds }, 200, {
        'Cache-Control': 'public, max-age=25, s-maxage=60'
      });
    }

    const candidates = await loadSportsCandidates(env, match);
    const matched = candidates.matched;

    if (!matched) {
      return jsonResponse(
        {
          success: true,
          matched: false,
          event: null,
          stats: [],
          odds: [],
          official_odds: officialOdds,
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
        stats: normalizeStats(liveStats, fullStats, detailRoot, matched.event),
        odds: [],
        official_odds: officialOdds,
        timeline: normalizeTimeline(liveStats, fullStats, detailRoot, matched.event),
        lineups: normalizeLineups(lineupsPayload, fullStats, detailRoot, matched.event),
        related: related.length ? related : buildFallbackRelated(candidates.events, matched.event),
        coverage: {
          source: 'sports-api.net',
          checked_sources: candidates.sources,
          checked_events: candidates.events.length,
          sport: candidates.sport || null
        }
      },
      200,
      { 'Cache-Control': 'public, max-age=30, s-maxage=90' }
    );
  } catch (error) {
    return jsonResponse(
      {
        success: true,
        matched: false,
        event: null,
        stats: [],
        odds: [],
        official_odds: null,
        timeline: [],
        lineups: null,
        related: [],
        silent: true
      },
      200,
      { 'Cache-Control': 'public, max-age=20, s-maxage=60' }
    );
  }
}


export async function handleSportsStatus(request, env) {
  const url = new URL(request.url);
  const q = cleanDisplayText(url.searchParams.get('q') || url.searchParams.get('query'));
  const match = {
    id: cleanDisplayText(url.searchParams.get('match_id') || url.searchParams.get('id')),
    home: cleanDisplayText(url.searchParams.get('home') || q, 'Home'),
    away: cleanDisplayText(url.searchParams.get('away')),
    category: cleanDisplayText(url.searchParams.get('category')),
    league: cleanDisplayText(url.searchParams.get('league'))
  };

  try {
    const candidates = await loadSportsCandidates(env, match);
    const normalized = candidates.events.map(normalizeEvent).filter((event) => event.id);
    const hasSpecificMatch = Boolean(url.searchParams.get('home') && url.searchParams.get('away'));

    let results = normalized;
    if (q && !hasSpecificMatch) {
      results = normalized
        .map((event) => {
          const haystack = `${event.home} ${event.away} ${event.name || ''} ${event.group || ''} ${event.sport || ''}`;
          const score = Math.max(tokenScore(q, haystack), normalizeLookup(haystack).includes(normalizeLookup(q)) ? 1 : 0);
          return { ...event, score: Number(score.toFixed(2)) };
        })
        .filter((event) => event.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    return jsonResponse(
      {
        success: true,
        source: 'sports-api.net',
        count: normalized.length,
        checked_sources: candidates.sources,
        matched: hasSpecificMatch ? Boolean(candidates.matched) : undefined,
        match: hasSpecificMatch ? match : undefined,
        best: hasSpecificMatch && candidates.matched
          ? { score: Number(candidates.matched.score.toFixed(2)), event: normalizeEvent(candidates.matched.event) }
          : undefined,
        query: q || undefined,
        data: results.slice(0, 40)
      },
      200,
      { 'Cache-Control': 'public, max-age=30, s-maxage=60' }
    );
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Could not load Sports API status.'
      },
      error?.status || 502,
      { 'Cache-Control': 'no-store' }
    );
  }
}
