const DEFAULT_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';

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

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
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

function cleanString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function cleanDisplayText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;

  let text = decodeHtmlEntities(String(value));

  text = text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/@keyframes\s+[^{]+\{[\s\S]*?\}\s*\}/gi, ' ')
    .replace(/\b(?:transform|box-shadow|background|background-image|linear-gradient|animation|font-size|font-weight|color|border-radius|margin|padding|display)\s*:\s*[^;]+;?/gi, ' ')
    .replace(/[{}<>]/g, ' ')
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

async function handleMatches(env) {
  const apiKey = cleanString(env.MATCH_API_KEY);
  const apiUrl = cleanString(env.MATCH_API_URL, DEFAULT_API_URL);

  if (!apiKey) {
    return jsonResponse(
      {
        success: false,
        error: 'MATCH_API_KEY is not defined as a Cloudflare environment variable.'
      },
      500,
      { 'Cache-Control': 'no-store' }
    );
  }

  let upstreamUrl;
  try {
    upstreamUrl = new URL(apiUrl);
    upstreamUrl.searchParams.set('api_key', apiKey);
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: 'MATCH_API_URL is not a valid URL.'
      },
      500,
      { 'Cache-Control': 'no-store' }
    );
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'erosmactv-cloudflare-worker/1.2'
      },
      cf: {
        cacheTtl: 60,
        cacheEverything: true
      }
    });

    const text = await upstreamResponse.text();
    let upstreamJson;

    try {
      upstreamJson = JSON.parse(text);
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          error: 'The upstream match API did not return JSON.',
          status: upstreamResponse.status,
          preview: cleanDisplayText(text.slice(0, 300))
        },
        502,
        { 'Cache-Control': 'no-store' }
      );
    }

    if (!upstreamResponse.ok || upstreamJson.success === false) {
      return jsonResponse(
        {
          success: false,
          error: cleanDisplayText(upstreamJson.error || upstreamJson.message || 'The upstream match API request failed.'),
          status: upstreamResponse.status
        },
        502,
        { 'Cache-Control': 'no-store' }
      );
    }

    const data = Array.isArray(upstreamJson.data) ? upstreamJson.data.map(normalizeMatch) : [];

    return jsonResponse(
      {
        success: true,
        count: data.length,
        generated_at: cleanDisplayText(upstreamJson.generated_at || ''),
        expires_in: cleanDisplayText(upstreamJson.expires_in || ''),
        data
      },
      200,
      {
        'Cache-Control': 'public, max-age=30, s-maxage=90'
      }
    );
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: 'Could not connect to the upstream match API.',
        detail: error instanceof Error ? error.message : String(error)
      },
      502,
      { 'Cache-Control': 'no-store' }
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/matches' && request.method === 'GET') {
      return handleMatches(env);
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse({ success: false, error: 'API endpoint not found.' }, 404, {
        'Cache-Control': 'no-store'
      });
    }

    return env.ASSETS.fetch(request);
  }
};
