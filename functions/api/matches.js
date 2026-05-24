const DEFAULT_API_URL = 'https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php';

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

function normalizeMatch(match) {
  return {
    id: cleanString(match?.id),
    category: cleanString(match?.category, 'Diğer'),
    league: cleanString(match?.league),
    home: cleanString(match?.home, 'Ev Sahibi'),
    away: cleanString(match?.away, 'Deplasman'),
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
        error: 'MATCH_API_KEY Cloudflare environment variable olarak tanımlı değil.'
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
        error: 'MATCH_API_URL geçerli bir URL değil.'
      },
      500,
      { 'Cache-Control': 'no-store' }
    );
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ErosMac-Cloudflare-Pages/1.0'
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
          error: 'Yayın API JSON formatında cevap vermedi.',
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
          error: upstreamJson.error || upstreamJson.message || 'Yayın API isteği başarısız oldu.',
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
        error: 'Yayın API bağlantısı kurulamadı.',
        detail: error instanceof Error ? error.message : String(error)
      },
      502,
      { 'Cache-Control': 'no-store' }
    );
  }
}
