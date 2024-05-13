import { writable } from 'svelte/store';

type MusicTrack = {
    title: string;
    artist: string;
    status: string; 
};
export const accessToken = writable<MusicTrack | null>(null) ;

export const musicData = writable<MusicTrack[] | null>(null);

export function setAccessToken(token: MusicTrack | null) {
  console.log('setting access token:', token);
  accessToken.set(token);
}
