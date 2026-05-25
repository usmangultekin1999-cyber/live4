import { handleSportsStatus } from '../../worker/api.js';

export async function onRequestGet({ request, env }) {
  return handleSportsStatus(request, env);
}
