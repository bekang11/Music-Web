<script lang="ts" src="https://www.google.com/recaptcha/api.js?render=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI">

  import { accessToken } from '$lib/components/accessToken'
  let username = '';
  let password = '';
  let recaptchaWidgetId: number | null = null;


  async function SignIn() {
    if (!recaptchaWidgetId) {
      alert('Please complete the reCAPTCHA verification.');
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
        accessToken.set(token);
        window.location.href = '/music';
        alert('Sign-in successful!');
      } else {
        throw new Error('Sign-in failed');
      }
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert('Sign-in failed. Please try again.');
    }
  }
  function recaptchaLoaded() {
    if (typeof grecaptcha !== 'undefined') {
      recaptchaWidgetId = grecaptcha.render('recaptcha', {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        callback: () => {
          const loginButton = document.getElementById('loginButton');
          loginButton?.removeAttribute('disabled');
        }
      });
    }
  }
</script>
<div class="signin-container">
  <div class="container">Sign in</div>
  <form on:submit|preventDefault={SignIn}>
    <div class="form-group">
      <label for="username">Username:</label>
      <input type="text" id="username" required bind:value={username}>
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" required bind:value={password}>
    </div>
    <div class="form-group">
      <div id="recaptcha"></div>
    </div>
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