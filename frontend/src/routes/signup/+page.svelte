<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let username = '';
  let password = '';
  let repeatPassword = '';
  let passwordStrength = writable('');
  let userInput = '';
  let captchaCode = writable('');

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  onMount(() => {
    captchaCode.set(generateCaptcha());
  });
  const handleSubmit = async () => {
    if (userInput !== $captchaCode) {
      alert('CAPTCHA validation failed. Please try again.');
      return;
    } 
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
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing up:', error.message);
      alert('Sign-up failed. Please try again.');
    }
  };
  const refreshCaptcha = () => {
    captchaCode.set(generateCaptcha());
    userInput = '';
  };

  const strongPasswordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;

$:{
  checkPasswordStrength();
}

function checkPasswordStrength() {
  if (strongPasswordRegex.test(password)) {
    passwordStrength.set('Strong');
  } else {
    passwordStrength.set('Weak');
  }
}

</script>

<div class="signup-container">
  <div class="container">Register</div>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="username">Username:</label>
      <input type="text" id="username" bind:value={username} required>
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} required>
    </div>
    {#if $passwordStrength === 'Weak'}
      <p>Password must be at least 8 characters long and contain at least one digit, one special character, and one uppercase letter.</p>
    {/if}
    <div class="form-group">
      <label for="repeatPassword">Repeat Password:</label>
      <input type="password" id="repeatPassword" bind:value={repeatPassword} required>
    </div>
    {#if password !== repeatPassword}
      <p>Passwords do not match. Please try again.</p>
    {/if}
    <div class="form-group">
      <label for="captcha">CAPTCHA:</label>
      <input type="text" id="captcha" bind:value={userInput} required>
      <span>{$captchaCode}</span>
      <button type="button" on:click={refreshCaptcha}>Refresh</button>
    {#if userInput !== $captchaCode}
      <p>CAPTCHA validation failed. Please try again.</p>
    {/if}
    <button type="submit">Register</button>
  </form>
  <div class="back-to-signin">
    <button on:click={() => window.location.href = '/signin'}>Back to Sign In</button>
  </div>
</div>

<style lang="css">
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 100px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.container {
  font-size: 30px;
  text-transform: uppercase;
  text-align: center;

}

.form-group {
  margin-bottom: 15px;
}

.back-to-signin {
    margin-top: 20px;
    text-align: center;
}

label {
  font-weight: bold;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button[type="submit"] {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

p {
  color: red;
}
</style>