import { writable } from 'svelte/store';


export const totalTracks = writable(0);
export const currentPage = writable(1);
export const tracksPerPage = writable<number>(10);
export const isLoading = writable(true);
export const searchQuery = writable('');