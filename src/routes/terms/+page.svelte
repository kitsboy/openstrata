<script>
  import LegalDoc from '$lib/components/LegalDoc.svelte';
  import { termsHtml } from '$lib/legal/family-terms.js';
</script>

<svelte:head>
  <title>Terms &amp; Conditions — OpenStrata</title>
  <meta
    name="description"
    content="The terms for using the Give A Bit family sites: informational tools, no advice, no warranty, donations vs paid services."
  />
  <link rel="canonical" href="https://openstrata.giveabit.io/terms" />
</svelte:head>

<LegalDoc html={termsHtml} page="terms" />
