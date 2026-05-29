import { handleIptvStream } from '../../../worker/api.js';

export async function onRequestGet({ request, env }) {
  return handleIptvStream(request, env);
}
