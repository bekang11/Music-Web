<script>
	let musicList = [];
  
	async function fetchMusic() {
	  const response = await fetch('http://localhost:3000/music');
	  const data = await response.json();
	  musicList = data;
	}
  
	fetchMusic();
  </script>
  
  <ul>
	{#each musicList as music}
	  <li>{music.title} by {music.artist}</li>
	{/each}
  </ul>
  