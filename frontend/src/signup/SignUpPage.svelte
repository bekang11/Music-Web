<script>
  let formData = {};

  async function SignUpPage() {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      mode: 'cors', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      console.log('Sign up successful');
    
    } else {
      console.error('Sign up failed');
     
    }
  }
</script>

<h1>Sign Up</h1>

<form on:submit|preventDefault={SignUpPage}>
  <label>
    Username:
    <input type="username" bind:value={formData.username} />
  </label>
  <label>
    Password:
    <input type="password" bind:value={formData.password} />
  </label>
  <button type="submit">Sign Up</button>
</form>
