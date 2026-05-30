import { handleChannels } from '../../worker/api.js';

export async function onRequestGet({ env }) {
  return handleChannels(env);
}
