import { writable } from 'svelte/store';

export interface MusicTrack   {
    id: string;
    title: string;
    artist: string;
    status: string; 
    updateTitle: string;
    updateArtist: string;
};
export const musicData = writable<MusicTrack[]>([]);