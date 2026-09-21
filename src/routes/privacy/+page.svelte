<script>
  import LegalDoc from '$lib/components/LegalDoc.svelte';
  import { privacyHtml } from '$lib/legal/family-privacy.js';
  import { copy } from '$lib/i18n';
</script>

<svelte:head>
  <title>{$copy.privacyPageTitle}</title>
  <meta name="description" content={$copy.privacyMetaDescription} />
  <link rel="canonical" href="https://openstrata.giveabit.io/privacy" />
</svelte:head>

<LegalDoc html={privacyHtml} page="privacy" />
