const DEFAULT_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';

const CATEGORY_TRANSLATIONS = new Map([
  ['tumu', 'All'],
  ['tum', 'All'],
  ['all', 'All'],
  ['diger', 'Other'],
  ['other', 'Other'],
  ['futbol', 'Football'],
  ['football', 'Football'],
  ['basketbol', 'Basketball'],
  ['basketball', 'Basketball'],
  ['tenis', 'Tennis'],
  ['tennis', 'Tennis'],
  ['voleybol', 'Volleyball'],
  ['volleyball', 'Volleyball'],
  ['beach volleyball', 'Beach Volleyball'],
  ['plaj voleybolu', 'Beach Volleyball'],
  ['badminton', 'Badminton'],
  ['bowling', 'Bowling'],
  ['cricket', 'Cricket'],
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
  ['motorsport', 'Motorsport']
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

function cleanString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function normalizeLookup(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toEnglishCategory(value) {
  const clean = cleanString(value, 'Other');
  const key = normalizeLookup(clean);
  return CATEGORY_TRANSLATIONS.get(key) || clean;
}

function normalizeMatch(match) {
  return {
    id: cleanString(match?.id),
    category: toEnglishCategory(match?.category),
    league: cleanString(match?.league),
    home: cleanString(match?.home, 'Home'),
    away: cleanString(match?.away, 'Away'),
    home_icon: cleanString(match?.home_icon),
    away_icon: cleanString(match?.away_icon),
    videoid: cleanString(match?.videoid)
  };
}

export async function onRequestGet({ env }) {
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
        'User-Agent': 'ErosMatch-Cloudflare-Pages/1.0'
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
          preview: text.slice(0, 300)
        },
        502,
        { 'Cache-Control': 'no-store' }
      );
    }

    if (!upstreamResponse.ok || upstreamJson.success === false) {
      return jsonResponse(
        {
          success: false,
          error: upstreamJson.error || upstreamJson.message || 'The upstream match API request failed.',
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
        generated_at: upstreamJson.generated_at || null,
        expires_in: upstreamJson.expires_in || null,
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
