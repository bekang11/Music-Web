<script>
  let username = '';
  let password = '';

  async function signUp() {
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      console.log('Dang Ky Thanh Cong');
    } else {
      console.error('Da Co Tai Khoan Ton Tai');
    }
  }
</script>

<form on:submit|preventDefault={signUp}>
  <label>
    Email:
    <input type="username" bind:value={username} required />
  </label>
  <label>
    Password:
    <input type="password" bind:value={password} required />
  </label>
  <button type="submit">Dang Ky</button>
</form>
  