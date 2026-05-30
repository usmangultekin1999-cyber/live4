import { handleMatches, handleChannels, handleMatchDetails, handleSportsStatus, jsonResponse } from './api.js';

function looksLikeStreamRequest(pathname = '') {
  const cleanPath = pathname.toLowerCase();

  return (
    cleanPath.startsWith('/v/') ||
    cleanPath.startsWith('/live/') ||
    cleanPath.startsWith('/stream/') ||
    cleanPath.startsWith('/hls/') ||
    /\.(?:m3u8|mpd|ts|m4s|mp4|webm|ogv|ogg|aac|m4a)(?:$|[?#])/.test(cleanPath)
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/matches' && request.method === 'GET') {
      return handleMatches(env);
    }

    if (url.pathname === '/api/channels' && request.method === 'GET') {
      return handleChannels(env);
    }

    if (url.pathname === '/api/match-details' && request.method === 'GET') {
      return handleMatchDetails(request, env);
    }

    if (url.pathname === '/api/sports-status' && request.method === 'GET') {
      return handleSportsStatus(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse({ success: false, error: 'API endpoint not found.' }, 404, {
        'Cache-Control': 'no-store'
      });
    }

    // Important: ErosMacTV must never proxy live stream manifests or media segments
    // through this Worker. The player uses the upstream videoid URL directly in the
    // visitor's browser. If a stream URL is accidentally relative and reaches this
    // Worker, fail fast instead of pulling the stream into Cloudflare.
    if (looksLikeStreamRequest(url.pathname)) {
      return jsonResponse(
        {
          success: false,
          error: 'Stream proxying is disabled. Use the original absolute stream URL from the provider.'
        },
        410,
        { 'Cache-Control': 'no-store' }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
