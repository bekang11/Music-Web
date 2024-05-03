<script>
import { Router, Route } from 'svelte-routing';
import SignInPage from './signin/SignInPage.svelte';
import SignUpPage from './signup/SignUpPage.svelte';
</script>

<main>
<Router>
  <Route path="/auth/signin" component={SignInPage} />
  <Route path="/auth/signup" component={SignUpPage} />
</Router>
</main>
  