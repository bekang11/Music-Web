<script lang="ts">
  import { onMount } from 'svelte';
  import { accessToken } from '$lib/stores/accessToken';
  import { musicData, type MusicTrack } from '$lib/stores/musicData';
  import { writable } from 'svelte/store';

  let newTitle = '';
  let newArtist = '';
  let updateTitle = '';
  let updateArtist = '';
 

  const isLoading = writable(true);

  const addMusicTrack = async () => {
    if (newTitle.trim() !== '' && newArtist.trim() !== '') {
      const newTrack: MusicTrack = {
        title: newTitle.trim(),
        artist: newArtist.trim(),
        status: 'PLAYING',
      };
      try {
        const response = await fetch('http://localhost:3000/music', {
         method: 'POST',
         mode: 'cors',
         headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,          
         },
         body: JSON.stringify(newTrack),
        });
        if (response.ok) {
          const data = await response.json();
          let $musicData: MusicTrack[] = []
          $musicData = [...$musicData,data]
        } else {
          throw new Error('Failed to add Music Track')
        }
      } catch (error) {
        console.log('Error adding Music Track', error)
      }
    }
  }

  const deleteMusicTrack = async (id: number) => {
    try{
      if (typeof id !== 'undefined') {
      const response = await fetch('http://localhost:3000/music/${id}', {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${$accessToken}`,
        },
      });
      if (response.ok) {
        let $musicData: MusicTrack[] = []
        $musicData = $musicData.filter((track) => track.id !== id);
      } else {
        throw new Error('Failed to delete music track');
            }
      } 
    } catch (error) {
      console.log('Error deleting music track:', error);
    }
  };

  const updateMusicTrack = async (track: MusicTrack) => {
    if (updateTitle.trim() !== '' && updateArtist.trim() !== '') {
      const updateTrack: MusicTrack = {
        ...track,
        title: updateTitle.trim(),
        artist: updateArtist.trim(),
        status: 'PLAYING',
      };
      try {
        const response = await fetch('http://localhost:3000/music/${track.id}', {
          method: 'PATCH',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${$accessToken}`,
          },
          body: JSON.stringify(updateTrack),
        });
        if (response.ok) {
          let $musicData: MusicTrack[] = []
          $musicData = $musicData.map((t) => (t.id === track.id ? updateTrack : t));
        } else {
          throw new Error('Failed to update music track');
        }
      } catch (error) {
        console.error('Error updating music track', error);
      }
    }
  }

  onMount(() => {
     accessToken.subscribe(token => {
      console.log('AccessToken Update:', token)
      if (token !== null) {
        fetchMusicData(token);
      } 
    });
  });

  async function fetchMusicData(token: string) {
    isLoading.set(true);
    try {
      const response = await fetch('http://localhost:3000/music', {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Music data request successful')
        musicData.set(data);
      } else {
        throw new Error('Failed to fetch music data');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching music data:', errorMessage);
    } finally {
      isLoading.set(false);
    }
  }
  
</script>

<input type="text" bind:value={newTitle} placeholder="Title" />
<input type="text" bind:value={newArtist} placeholder="Artist" />
<button on:click={addMusicTrack}>Add Music</button>


{#if $musicData === null || $isLoading}
  <p>Loading music data...</p>
{:else}
  <ul>
    {#each $musicData as track (track.id)}
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
        <input type="text" bind:value={updateTitle} />
        <input type="text" bind:value={updateArtist} />
        <button on:click={() => updateMusicTrack(track)}>Update</button>
        <button on:click={() => deleteMusicTrack(track.id)}>DeleTe</button>
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
