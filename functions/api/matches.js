import { handleMatches } from '../../worker/api.js';

export async function onRequestGet({ request, env }) {
  return handleMatches(env, request);
}
