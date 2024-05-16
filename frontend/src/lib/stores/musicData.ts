import { writable } from 'svelte/store';

export interface MusicTrack  {
    id?: number;
    title: string;
    artist: string;
    status: string; 
};

export const musicData = writable<MusicTrack[] | null>(null);