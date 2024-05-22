import type { Handle } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { accessToken } from '$lib/stores/accessToken';

export const handle: Handle = async ({ event, resolve }) => {
  const token = get(accessToken);
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const publicPaths = ['/signin', '/signup'];
  const isPublicPath = publicPaths.includes(pathname);

  if (!token && !isPublicPath) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/signin' },
    });
  }

  if (token) {
    event.request.headers.set('Authorization', `Bearer ${token}`);
  }

  return resolve(event);
};
