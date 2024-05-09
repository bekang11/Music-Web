<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';


  let username = '';
  let password = '';
  let repeatPassword = '';
  let passwordStrength = writable('');

  const strongPasswordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;

  $: {
    checkPasswordStrength();
  }

  function checkPasswordStrength() {
    if (strongPasswordRegex.test(password)) {
      passwordStrength.set('Strong');
    } else {
      passwordStrength.set('Weak');
    }
  }

  function handleSubmit() {
    if (password !== repeatPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    console.log('Password:', password);
    console.log('Repeat Password:', repeatPassword);

    // Additional logic for form submission
    SignUp();
  }

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
    {#if $passwordStrength === 'Weak'}
      <p>Password must be at least 8 characters long and contain at least one digit, one special character, and one uppercase letter.</p>
    {/if}
    <div>
      <label for="repeatPassword">Repeat Password:</label>
      <input type="password" id="repeatPassword" bind:value={repeatPassword} required>
    </div>
    {#if password !== repeatPassword}
      <p>Passwords do not match. Please try again.</p>
    {/if}
    // todo: CAPTCHA

    <button type="submit">Register</button>
  </form>
</div>
