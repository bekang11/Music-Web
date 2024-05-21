<script lang="ts">
  import { onMount } from 'svelte';
  import {accessToken} from '$lib/stores/accessToken';
  import { musicData, type MusicTrack } from '$lib/stores/musicData';
  import { writable, get } from 'svelte/store';
  let newTitle = '';
  let newArtist = '';
  let editingTrackId: number | null = null;
  const updateTitle = writable('');
  const updateArtist = writable('');
  const isLoading = writable(true);

  const logout = () => {
    accessToken.set(null);
    window.location.href = '/signin';
  };

  const addMusicTrack = async () => {
    if (newTitle.trim() !== '' && newArtist.trim() !== '') {
      const newTrack = {
        title: newTitle.trim(),
        artist: newArtist.trim(),
        status: 'PLAYING',
      };
      try {
        const response = await fetch(`http://localhost:3000/music`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${get(accessToken)}`,
          },
          body: JSON.stringify(newTrack),
        });
        if (response.ok) {
          const data = await response.json();
          musicData.update((tracks) => [...tracks, data]);
          newTitle = '';
          newArtist = '';
          alert('Music added successfully');
        } else {
          throw new Error('Failed to add Music Track');
        }
      } catch (error) {
        console.log('Error adding Music Track', error);
        alert('Failed to add Music Track. Please try again');
      }
    } else {
      alert('Please enter both title and artist');
    }
  };

  const deleteMusicTrack = async (id: number) => {
    try {
      if (typeof id !== 'undefined') {
        const response = await fetch(`http://localhost:3000/music/${id}`, {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            Authorization: `Bearer ${get(accessToken)}`,
          },
        });
        if (response.ok) {
          musicData.update((tracks) => tracks.filter((track) => track.id !== id));
        } else {
          throw new Error('Failed to delete music track');
        }
      }
    } catch (error) {
      console.log('Error deleting music track:', error);
    }
  };

  const updateMusicTrack = async (track: MusicTrack) => {
    const title = get(updateTitle).trim();
    const artist = get(updateArtist).trim();
    try {
      let titleUpdated = false;
      let artistUpdated = false;
      if (title !== '') {
        const response = await fetch(`http://localhost:3000/music/${track.id}/title`, {
          method: 'PATCH',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${get(accessToken)}`,
          },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) {
          throw new Error('Failed to update music track title');
        }
        titleUpdated = true;
      }

      if (artist !== '') {
        const response = await fetch(`http://localhost:3000/music/${track.id}/artist`, {
          method: 'PATCH',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${get(accessToken)}`,
          },
          body: JSON.stringify({ artist }),
        });
        if (!response.ok) {
          throw new Error('Failed to update music track artist');
        }
        artistUpdated = true;
      }

      if (titleUpdated || artistUpdated) {
        musicData.update((tracks) =>
          tracks.map((t) =>
            t.id === track.id ? { ...t, title: titleUpdated ? title : t.title, artist: artistUpdated ? artist : t.artist } : t
          )
        );
        editingTrackId = null;
      }
    } catch (error) {
      console.error('Error updating music track', error);
    }
  };

  onMount(() => {
    accessToken.subscribe((token) => {
      console.log('AccessToken Update:', token);
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Music data request successful');
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

<div class="logout-container">
  <button on:click={logout}>Logout</button>
</div>

<div class="form-container">
  <input type="text" bind:value={newTitle} placeholder="Title" class="form-input" />
  <input type="text" bind:value={newArtist} placeholder="Artist" class="form-input" />
  <button on:click={addMusicTrack} class="form-button">Add Music</button>
</div>

{#if $isLoading}
  <p>Loading music data...</p>
{:else}
  {#each $musicData as track (track.id)}
    <div class="music-track">
      <div class="music-info">
        <div class="music-title">{track.title}</div>
        <div class="music-artist">by {track.artist}</div>
      </div>
      {#if editingTrackId === track.id}
        <div class="music-actions">
          <input type="text" bind:value={$updateTitle} placeholder="Update Title" class="form-input" />
          <input type="text" bind:value={$updateArtist} placeholder="Update Artist" class="form-input" />
          <button on:click={() => updateMusicTrack(track)} class="action-button">Update</button>
        </div>
      {:else}
        <button on:click={() => { editingTrackId = track.id; updateTitle.set(track.title); updateArtist.set(track.artist); }} class="action-button">Edit</button>
        <button on:click={() => deleteMusicTrack(track.id)} class="action-button">Delete</button>
      {/if}
    </div>
  {/each}
{/if}


<style>
  .logout-container {
    text-align: center;
    margin-top: 20px;
  }

  .logout-container button {
    background: none;
    border: 2px solid #007bff;
    color: #007bff;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
  }

  .logout-container button:hover {
    background-color: #007bff;
    color: #fff;
  }

   .form-container {
    margin-bottom: 20px;
  }

  .form-input {
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 200px;
    box-sizing: border-box;
  }

  .form-button {
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .form-button:hover {
    background-color: #0056b3;
  }

  /* Music track styles */
  .music-track {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .music-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .music-actions {
    display: flex;
    align-items: center;
  }

  .action-button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #dc3545;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .action-button:hover {
    background-color: #bb2d3b;
  }
</style>
