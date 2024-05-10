<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
  
    let accessToken = writable('');
    let musicData = writable([]);
    async function fetchMusicData() {
      try {
        const token = $accessToken;
        const response = await fetch('http://localhost:3000/music', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch music data');
        }
  
        const data = await response.json();
  
        musicData.set(data);
      } catch (error) {
        console.error('Error fetching music data:', error.message);
        alert('Failed to fetch music data. Please try again.');
      }
    }
    onMount(fetchMusicData);
  </script>
  
  <div>
    <h1>Music List</h1>
    {#if $musicData.length > 0}
      <ul>
        {#each $musicData as { artist, title }}
          <li>{artist} - {title}</li>
        {/each}
      </ul>
    {:else}
      <p>No music data available</p>
    {/if}
  </div>
  