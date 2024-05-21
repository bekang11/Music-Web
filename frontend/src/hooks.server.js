import { get } from 'svelte/store';
import { accessToken } from '$lib/stores/accessToken';

export async function handle({ event, resolve }) {
  const token = get(accessToken);

  if (!token && event.url.pathname !== '/signin' && event.url.pathname !== '/music') {
    return new Response(null, { status: 401, headers: { Location: '/signin' } });
  }
  return resolve(event);
}
