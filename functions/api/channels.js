import { handleChannels } from '../../worker/api.js';

export async function onRequestGet({ request, env }) {
  return handleChannels(request, env);
}
