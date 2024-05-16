<script lang="ts">

  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { setAccessToken } from '$lib/stores/accessToken';


  let username = '';
  let password = '';
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
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;
        console.log('Received token:' , token);
        localStorage.setItem('accessToken', token);
        window.location.href = '/music';
        alert('Sign-in successful!');
      } else {
        throw new Error('Sign-in failed');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error signing in:', errorMessage);
      alert('Sign-in failed. Please try again.');
    }
  }
  const refreshCaptcha = () => {
    captchaCode.set(generateCaptcha());
    userInput = '';
  };
</script>


<div class="signin-container">
  <div class="container">Sign in</div>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="username">Username:</label>
      <input type="text" id="username" required bind:value={username} autocomplete="username">
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" required bind:value={password} autocomplete="current-password">
    </div>
    <div class="form-group">
      <label for="captcha">CAPTCHA:</label>
      <input type="text" id="captcha" bind:value={userInput} required>
      <span>{$captchaCode}</span>
      <button type="button" on:click={refreshCaptcha}>Refresh</button>
    {#if userInput !== $captchaCode}
      <p>CAPTCHA validation failed. Please try again.</p>
    {/if}
    <button id="loginButton" type="submit" >Sign In</button>
  </form>
  <div class="signup-link">
    <button on:click={() => window.location.href = '/signup'}>Don't have an account?</button>
  </div>
</div>

<style>

  .signin-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 50px;
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

  .signup-link {
    text-align: center;
    margin-top: 15px;
    text-decoration: underline;
    color: #007bff;
    text-decoration: none;
  }
</style>