import { writable, type Writable } from 'svelte/store';

type MusicTrack = {
    title: string;
    artist: string;
    status: any; 
};

export const accessToken: Writable<MusicTrack | null> = writable(null);
