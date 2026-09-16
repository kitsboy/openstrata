<script>
  import LegalDoc from '$lib/components/LegalDoc.svelte';
  import { privacyHtml } from '$lib/legal/family-privacy.js';
</script>

<svelte:head>
  <title>Privacy Policy — OpenStrata</title>
  <meta
    name="description"
    content="How the Give A Bit family handles data: no accounts, no cookies, cookie-less analytics, and how to reach us."
  />
  <link rel="canonical" href="https://openstrata.giveabit.io/privacy" />
</svelte:head>

<LegalDoc html={privacyHtml} page="privacy" />
