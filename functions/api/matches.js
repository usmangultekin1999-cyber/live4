import { handleMatches } from '../../worker/api.js';

export async function onRequestGet({ env }) {
  return handleMatches(env);
}
