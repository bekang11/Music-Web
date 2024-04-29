<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import SignUpPage from './signup/SignUpPage.svelte';
  import SignInPage from './signin/SignInPage.svelte';

  let musicList = [];

  onMount(async () => {
    try {
      const response = await axios.get('http://localhost:3000/music');
      musicList = response.data;
    } catch (error) {
      console.error('Error fetching music list:', error);
    }
  });
</script>

<SignUpPage />
<SignInPage />


<h1>Music List</h1>

<ul>
  {#each musicList as music}
    <li>{music.title} by {music.artist}</li>
  {/each}
</ul>
  