<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { accessToken } from '$lib/stores/accessToken';
  import { musicData, type MusicTrack } from '$lib/stores/musicData';
  import { writable, get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { currentPage, totalTracks, tracksPerPage } from '$lib/stores/pagination';
  import {selectedMusicId} from '$lib/stores/selectedMusicId';

  let newTitle = writable('');
  let newArtist = writable('');
  let currentTrackIndex = -1;
  const filePath = writable('');
  let audioElements: HTMLAudioElement[] = [];
  let isPlaying = false;
  let editingTrackId: string | null = null;
  const updateTitle = writable('');
  const updateArtist = writable('');
  const isLoading = writable(true);
  let searchQuery = writable('');
  let selectedFile = writable<File | null>(null);
  let musicId: string | null = null;
  const audioSrc = writable<string | null>(null);
  let audioUrl: string | null = null;
  let volume = 0.5;


  

  const logout = () => {
    accessToken.set(null);
    window.location.href = '/signin';
  };

  const createMusicTrack = async () => {
    const response = await fetch('http://localhost:3000/music', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${get(accessToken)}`,
      },
      body: JSON.stringify({ title: newTitle, artist: newArtist }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Music Track');
    }

    return response.json();
  };

  const uploadMusicFile = async (musicId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', get(newTitle).trim());
    formData.append('artist', get(newArtist).trim());

    const response = await fetch(`http://localhost:3000/music/${musicId}/upload`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${get(accessToken)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.message || 'Failed to upload music file');
    }

    return response.json();
  };



  const addMusicTrack = async () => {
    const file = get(selectedFile);

    if (!file || !get(newTitle).trim() || !get(newArtist).trim()) {
      alert('Please select a music track first and enter both title and artist');
      return;
    }

    try {
      const musicTrack = await createMusicTrack();
      await uploadMusicFile(musicTrack.id, file);
      newTitle.set('');
      newArtist.set('');
      selectedFile.set(null);
      fetchMusicData();
      alert('Music added successfully');
    } catch (error) {
      console.error('Error adding Music Track:', error);
      alert('Failed to upload music file');
    }
  };

  const playAndTogglePlayback = async (musicId: string, index: number) => {
    try {
      const response = await fetch(`http://localhost:3000/music/${musicId}/file`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${get(accessToken)}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch music file');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      audioSrc.set(audioUrl);

      const audioElement = audioElements[index];
      if (!audioElement) {
        console.error('Audio element not found for track index:', index);
        return;
      }
      audioElement.src = audioUrl;
      await audioElement.load();
      if (audioElement.paused) {
        if (isPlaying && currentTrackIndex !== index && currentTrackIndex !== -1) {
          const currentAudioElement = audioElements[currentTrackIndex];
          if (currentAudioElement) {
            currentAudioElement.pause();
          }
        }

        await audioElement.play();
        isPlaying = true;
        currentTrackIndex = index;
      } else {
        audioElement.pause();
        isPlaying = false;
      }
    } catch (error) {
      console.error('Error fetching and playing music file:', error);
      alert('Failed to fetch and play music file');
    }
  };

const adjustVolume = (change: number) => {
    volume += change;
    if (volume > 1) {
      volume = 1;
    } else if (volume < 0) {
      volume = 0;
    }
    // Set the volume of all audio elements
    audioElements.forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });
  };


  onDestroy(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  });

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      selectedFile.set(file);
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
            t.id === track.id
              ? { ...t, title: titleUpdated ? title : t.title, artist: artistUpdated ? artist : t.artist }
              : t
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

  const totalPages = () => Math.ceil(get(totalTracks) / get(tracksPerPage));

const generatePages = () => {
  const pages = [];
  const totalPagesCount = totalPages();
  const currentPageNum = get(currentPage);
  const maxPagesToShow = 10;
  let startPage = Math.max(1, currentPageNum - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPagesCount, startPage + maxPagesToShow - 1);
  if (endPage === totalPagesCount) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  if (startPage === 1) {
    endPage = Math.min(totalPagesCount, startPage + maxPagesToShow - 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
};

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

  const fetchFilePath = async () => {
    try {
      isLoading.set(true);
      const response = await fetch('http://localhost:3000/getFilePath', {
        headers: {
          Authorization: `Bearer ${get(accessToken)}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        filePath.set(data.filePath);
      } else {
        throw new Error('Failed to fetch file path');
      }
    } catch (error) {
      console.error('Error fetching file path:', error);
    } finally {
      isLoading.set(false);
    }
  };

  onMount(() => {
    fetchFilePath();
  });

  const bindAudioElement = (index: number) => {
    return (el: HTMLAudioElement) => {
      audioElements[index] = el;
    };
  };

</script>

<div class="logout-container">
  <button on:click={logout}>Logout</button>
</div>

<div class="form-container">
  <input type="text" bind:value={$newTitle} placeholder="Title" class="form-input" />
  <input type="text" bind:value={$newArtist} placeholder="Artist" class="form-input" />
  <input type="file" accept=".mp3,.mp4" on:change={handleFileInput} class="form-input" />
  <button on:click={addMusicTrack} class="form-button">Add Music</button>
</div>

<div class="search-container">
  <input type="text" bind:value={$searchQuery} placeholder="Search by title or artist" class="form-input" />
  <button on:click={handleSearch} class="form-button">Search</button>
</div>

{#if $isLoading}
<p>Loading music data...</p>
{:else}
  <!-- Iterate over each music track -->
  {#each $musicData as track, index (track.id)}
    <div class="music-track">
      <div class="music-info">
        <div class="music-title">{track.title}</div>
        <div class="music-artist">by {track.artist}</div>
      </div>
      <div class="audio-container">
        <link rel="stylesheet" href="/node_modules/@fortawesome/fontawesome-free/css/all.min.css">
        <button class="play-pause-button" on:click={() => playAndTogglePlayback(track.id, index)}>
            {#if isPlaying && currentTrackIndex === index}
                <i class="fas fa-pause"></i>
            {:else}
                <i class="fas fa-play"></i>
            {/if}
        </button>
        <audio controls bind:this={audioElements[index]} on:click={() => playAndTogglePlayback(track.id, index)}>
            <source src={track.filePath} type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        <button class="volume-button" on:click={() => adjustVolume(-0.1)}>-</button>
        <button class="volume-button" on:click={() => adjustVolume(0.1)}>+</button>
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

<!-- Pagination section -->
<div class="pagination">
  <button on:click={() => handlePagination(1)} disabled={$currentPage === 1}>First</button>
  <button on:click={() => handlePagination($currentPage - 1)} disabled={$currentPage === 1}>Previous</button>
  <!-- Iterate over pagination buttons -->
  {#each Array.from({ length: Math.ceil($totalTracks / get(tracksPerPage)) }, (_, i) => i + 1) as page}
    {#if Math.abs(page - $currentPage) <= 2 || page === 1 || page === Math.ceil($totalTracks / get(tracksPerPage))}
      <button on:click={() => handlePagination(page)} class:active={$currentPage === page}>{page}</button>
    {:else if page === $currentPage - 3 || page === $currentPage + 3}
      <span>...</span>
    {/if}
  {/each}
  <button on:click={() => handlePagination($currentPage + 1)} disabled={$currentPage === Math.ceil($totalTracks / get(tracksPerPage))}>Next</button>
  <button on:click={() => handlePagination(Math.ceil($totalTracks / get(tracksPerPage)))} disabled={$currentPage === Math.ceil($totalTracks / get(tracksPerPage))}>Last</button>
</div>
<style>

.play-pause-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 24px;
    margin-right: 10px;
    color: #007bff;
    transition: color 0.3s;
  }

  .play-pause-button:hover {
    color: #0056b3;
  }

.audio-container {
    display: flex;
    align-items: center;
  }

  .volume-button {
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 8px;
    margin: 0 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .volume-button:hover {
    background-color: #0056b3;
  } 

.music-track {
  position: relative;
}

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
