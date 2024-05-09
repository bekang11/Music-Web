<script>
  let username = '';
  let password = '';

  async function SignIn() {
    try {
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Sign-in failed');
      }

      alert('Sign-in successful!');
      // Redirect or navigate to another page
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert('Sign-in failed. Please try again.');
    }
  }
</script>

<div>
  <h1>Sign In</h1>
  <form on:submit|preventDefault={SignIn}>
    <div>
      <label for="username">Username:</label>
      <input type="username" id="username" bind:value={username} required>
    </div>
    <div>
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} required>
    </div>
    <button type="submit">Sign In</button>
  </form>
</div>
