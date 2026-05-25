import { handleMatchDetails } from '../../worker/api.js';

export async function onRequestGet({ request, env }) {
  return handleMatchDetails(request, env);
}
