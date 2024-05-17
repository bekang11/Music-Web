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
      const response = await fetch(`http://localhost:3000/auth/signin`, {
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
      <input type="text" id="username" required bind:value={username} autocomplete="username" placeholder="Enter your username">
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" required bind:value={password} autocomplete="current-password" placeholder="Enter your password">
    </div>
    <div class="form-group">
      <label for="captcha">CAPTCHA:</label>
      <div class="captcha-input">
        <input type="text" id="captcha" bind:value={userInput} required placeholder="Enter the CAPTCHA code">
        <span class="captcha-code">{$captchaCode}</span>
        <button type="button" on:click={refreshCaptcha}>Refresh</button>
      </div>
      {#if userInput !== $captchaCode}
        <p class="error-message">CAPTCHA validation failed. Please try again.</p>
      {/if}
    </div>
    <button id="loginButton" type="submit">Sign In</button>
  </form>
  <div class="signup-link">
    <button on:click={() => window.location.href = '/signup'}>Don't have an account? Sign Up</button>
  </div>
</div>

<style>
  .signin-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 30px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .container {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    font-size: 16px;
    margin-bottom: 5px;
  }

  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  .captcha-input {
    display: flex;
    align-items: center;
  }

  .captcha-code {
    margin-left: 10px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  button[type="submit"] {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }

  .signup-link {
    text-align: center;
    margin-top: 20px;
    font-size: 16px;
  }

  .signup-link button {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    font-size: 16px;
    transition: color 0.3s;
  }

  .signup-link button:hover {
    color: #0056b3;
  }

  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }
</style>