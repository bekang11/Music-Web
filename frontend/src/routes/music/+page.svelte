<script lang="ts">
  import { onMount } from 'svelte';
  import { accessToken } from '$lib/components/accessToken';


  interface MusicTrack {
    title: string;
    artist: string;
    status: string;
  }

  type MusicData = MusicTrack[];
  let musicData: MusicData | null = null;

  onMount(() => {
    const unsubscribe = accessToken.subscribe(token => {
      console.log('AccesToken:', token)
      if (token !== null) {
        fetchMusicData(token as unknown as string);
      }
    });
    return unsubscribe;
  });

  async function fetchMusicData(token: string) {
    try {
      console.log('data')
      const response = await fetch('http://localhost:3000/music', {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('datasuccessf')
        musicData = await response.json() as MusicData;
      } else {
        throw new Error('Failed to fetch music data');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching music data:', errorMessage);
    }
  }
  
</script>



{#if musicData === null}
  <p>Loading music data...</p>
{:else}
  <ul>
    {#each musicData as track}
      <li>
        <div class="box">
          <div class="title">{track.title}</div>
        </div>
        <div class="box">
          <div class="artist">by {track.artist}</div>
        </div>
        <div class="box">
          <div class="status">Status: {track.status}</div>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .box {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .title, .artist, .status {
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
