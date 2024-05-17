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
      const response = await fetch(`http://localhost:3000/auth/signup`, {
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
      const errorMessage = (error as Error).message;
      console.error('Error signing up:', errorMessage);
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
      <input type="text" id="username" bind:value={username} required placeholder="Enter your username">
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" bind:value={password} required placeholder="Enter your password">
      {#if $passwordStrength === 'Weak'}
        <p>Password must be at least 8 characters long and contain at least one digit, one special character, and one uppercase letter.</p>
      {/if}
    </div>
    <div class="form-group">
      <label for="repeatPassword">Repeat Password:</label>
      <input type="password" id="repeatPassword" bind:value={repeatPassword} required placeholder="Repeat your password">
      {#if password !== repeatPassword}
        <p>Passwords do not match. Please try again.</p>
      {/if}
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
    <button type="submit">Register</button>
  </form>
  <div class="back-to-signin">
    <button on:click={() => window.location.href = '/signin'}>Back to Sign In</button>
  </div>
</div>

<style>
  .signup-container {
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

  .back-to-signin {
    text-align: center;
    margin-top: 20px;
  }

  .back-to-signin button {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    font-size: 16px;
    transition: color 0.3s;
  }

  .back-to-signin button:hover {
    color: #0056b3;
  }

  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }
</style>
