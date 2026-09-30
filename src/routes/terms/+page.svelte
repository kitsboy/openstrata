<script>
  import LegalDoc from '$lib/components/LegalDoc.svelte';
  import { termsHtml } from '$lib/legal/family-terms.js';
  import { copy } from '$lib/i18n';
</script>

<svelte:head>
  <title>{$copy.termsPageTitle}</title>
  <meta name="description" content={$copy.termsMetaDescription} />
  <link rel="canonical" href="https://openstrata.giveabit.io/terms" />
</svelte:head>

<LegalDoc html={termsHtml} page="terms" />
