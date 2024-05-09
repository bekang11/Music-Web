<script>
  let username = '';
  let password = '';

  async function SignUp() {
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Sign-up failed');
      }

      alert('Sign-up successful!');
      // Redirect or navigate to another page
    } catch (error) {
      console.error('Error signing up:', error.message);
      alert('Sign-up failed. Please try again.');
    }
  }
</script>

<div>
  <h1>Register</h1>
  <form on:submit|preventDefault={SignUp}>
    <div>
      <label for="username">Username:</label>
      <input type="text" id="username" bind:value={username} required>
    </div>
    <div>
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} required>
    </div>
    <button type="submit">Register</button>
  </form>
</div>
