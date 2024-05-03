<script>
  let formData = {};

  async function SignInPage() {
    const response = await fetch('http://localhost:3000/auth/signin', {
      method: 'POST',
      mode: 'cors', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      console.log('Sign in successful');
    } else {
      console.error('Sign in failed');
    }
  }
</script>

<h1>Sign In</h1>

<form on:submit|preventDefault={SignInPage}>
  <label>
    Username:
    <input type="username" bind:value={formData.username} />
  </label>
  <label>
    Password:
    <input type="password" bind:value={formData.password} />
  </label>
  <button type="submit">Sign In</button>
</form>
