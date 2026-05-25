import { handleMatches, handleMatchDetails, jsonResponse } from './api.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/matches' && request.method === 'GET') {
      return handleMatches(env);
    }

    if (url.pathname === '/api/match-details' && request.method === 'GET') {
      return handleMatchDetails(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse({ success: false, error: 'API endpoint not found.' }, 404, {
        'Cache-Control': 'no-store'
      });
    }

    return env.ASSETS.fetch(request);
  }
};
