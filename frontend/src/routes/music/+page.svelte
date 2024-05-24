<script lang="ts">
  import { onMount } from 'svelte';
  import { accessToken } from '$lib/stores/accessToken';
  import { musicData, type MusicTrack} from '$lib/stores/musicData';
  import { writable, get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { currentPage, totalTracks, tracksPerPage} from '$lib/stores/pagination';

  let newTitle = '';
  let newArtist = '';
  let editingTrackId: string | null = null;
  const updateTitle = writable('');
  const updateArtist = writable('');
  const isLoading = writable(true);
  let searchQuery = writable('');
  

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

  const deleteMusicTrack = async (id: string) => {
  try {
    if (id !== undefined) { 
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
    } else {
      throw new Error('Invalid music track ID');
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

  async function fetchMusicData(page = 1, query = '') {
    isLoading.set(true);
    try {
      const response = await fetch(`http://localhost:3000/music?page=${page}&limit=${get(tracksPerPage)}&search=${query}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${get(accessToken)}`,
        },
      });

      if (response.ok) {
        const { tracks, total } = await response.json();
        musicData.set(tracks);
        totalTracks.set(total);
        currentPage.set(page);

        console.log('Retrieved music tracks:', tracks);
        console.log('Total tracks:', total);
        console.log('Current page:', page);
      } else {
        throw new Error('Failed to fetch music data');
      }
    } catch (error) {
      console.error('Error fetching music data:', error);
    } finally {
      isLoading.set(false);
    }
  }

  function handlePagination(page: number) {
    currentPage.set(page);
    fetchMusicData(page, get(searchQuery));
  }

  function handleSearch() {
    fetchMusicData(1, get(searchQuery));
  }

  onMount(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      goto('/signin');
    } else {
      accessToken.set(token);
      fetchMusicData(get(currentPage), get(searchQuery));
    }
  });
</script>

<div class="logout-container">
  <button on:click={logout}>Logout</button>
</div>

<div class="form-container">
  <input type="text" bind:value={newTitle} placeholder="Title" class="form-input" />
  <input type="text" bind:value={newArtist} placeholder="Artist" class="form-input" />
  <button on:click={addMusicTrack} class="form-button">Add Music</button>
</div>

<div class="search-container">
  <input type="text" bind:value={$searchQuery} placeholder="Search by title or artist" class="form-input" />
  <button on:click={handleSearch} class="form-button">Search</button>
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
<div class="pagination">
  <button on:click={() => handlePagination(1)} disabled={$currentPage === 1}>First</button>
  <button on:click={() => handlePagination($currentPage - 1)} disabled={$currentPage === 1}>Previous</button>
  {#each Array.from({ length: Math.ceil($totalTracks / tracksPerPage) }, (_, i) => i + 1) as page}
    {#if Math.abs(page - $currentPage) <= 2 || page === 1 || page === Math.ceil($totalTracks / tracksPerPage)}
      <button on:click={() => handlePagination(page)} class:active={$currentPage === page}>{page}</button>
    {:else if page === $currentPage - 3 || page === $currentPage + 3}
      <span>...</span>
    {/if}
  {/each}
  <button on:click={() => handlePagination($currentPage + 1)} disabled={$currentPage === Math.ceil($totalTracks / tracksPerPage)}>Next</button>
  <button on:click={() => handlePagination(Math.ceil($totalTracks / tracksPerPage))} disabled={$currentPage === Math.ceil($totalTracks / tracksPerPage)}>Last</button>
</div>


<style>

.search-container {
    margin-bottom: 20px;
  }

  .search-container .form-input {
    margin-right: 10px;
  }

 .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .pagination button {
    margin: 0 5px;
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .pagination button:hover {
    background-color: #0056b3;
  }

  .pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .pagination button.active {
    background-color: #0056b3;
  }

  .pagination span {
    margin: 0 5px;
    padding: 5px 10px;
  }

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