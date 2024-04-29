<script>
let username = '';
let password = '';

async function signIn() {
  const response = await fetch('/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (response.ok) {
    console.log('Dang Nhap Thanh Cong');
  } else {
    console.error('Dang Nhap That Bai');
  }
}
</script>

<form on:submit|preventDefault={signIn}>
<label>
  Email:
  <input type="username" bind:value={username} required />
</label>
<label>
  Password:
  <input type="password" bind:value={password} required />
</label>
<button type="submit">Dang Nhap</button>
<button type="submit">Khong Co Tai Khoan</button>
</form>