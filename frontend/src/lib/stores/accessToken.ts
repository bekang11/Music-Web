import { writable } from 'svelte/store';

type AccessToken = string | null;

export const accessToken = writable<AccessToken>(getInitialAccessToken());

function getInitialAccessToken(): AccessToken {
  if (typeof localStorage !== 'undefined') {
    const storedToken = localStorage.getItem('accessToken');
    return storedToken !== null ? storedToken : null;
  } else {
    return null;
  }
}

export function setAccessToken(token: AccessToken) {
  accessToken.set(token);
  if (typeof localStorage !== 'undefined') {
    if (token === null) {
      localStorage.removeItem('accessToken');
    } else {
      localStorage.setItem('accessToken', token);
    }
  }
}
