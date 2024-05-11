<script lang="ts">
  import { onMount } from 'svelte';
  import { accessToken } from '$lib/components/accessToken';

  interface MusicTrack {
    title: string;
    artist: string;
    status: any; 
  }

  type MusicData = MusicTrack[];
  let musicData: MusicData | null = null;
  let isLoading = false;
  
  onMount(() => {
    const unsubscribe = accessToken.subscribe(token => {
      if (token) {
        fetchMusicData(token);
      }
    });
    return unsubscribe;
  });

  async function fetchMusicData(token: string) {
    isLoading = true;
    try {
      const response = await fetch('http://localhost:3000/music', {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        musicData = await response.json() as MusicData;
      } else {
        throw new Error('Failed to fetch music data');
      }
    } catch (error) {
      console.error('Error fetching music data:', error.message);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isLoading}
<p>Loading music data...</p>
{:else if musicData}
<ul>
  {#each musicData as track}
    <li>
      <div class="title">{track.title}</div>
      <div class="artist">by {track.artist}</div>
      <div class="status">Status: {track.status}</div>
    </li>
  {/each}
</ul>
{:else}
<p>No music data available</p>
{/if}

<style>
  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .title {
    font-weight: bold;
  }

  .artist {
    color: #555;
  }

  .status {
    font-style: italic;
    color: #777;
  }
</style>