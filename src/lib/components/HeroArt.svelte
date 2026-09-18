<script lang="ts">
  // Per-tab header artwork.
  //
  // The shared `.page-hero` band gave every tab one consistent header language,
  // but it left them looking like siblings: same wash, same grid, same hairline.
  // This adds the one thing that makes a tab recognisable at a glance — a single
  // on-brand motif, drawn once per section, sitting behind the h1.
  //
  // Rules that keep it from becoming decoration soup:
  //   - Purely decorative: aria-hidden, pointer-events none, never carries copy.
  //   - Drawn with `currentColor` only, so it inherits the band's brand tint and
  //     flips with the theme instead of needing a second dark-mode palette.
  //   - Positioned bottom-right and masked toward the edges, so it can never sit
  //     under a headline in either theme at any width.
  export type HeroArtVariant =
    | 'modules'   // /tools            — the module lattice
    | 'chain'     // /roadmap, /spec   — blocks linked into a proof chain
    | 'scales'    // /compliance, legal— statutes and balance
    | 'ledger'    // /docs, /templates — stacked, ruled documents
    | 'network'   // /about, /blog, /design — the community graph
    | 'signal';   // /faq, /rss, /thank-you     — answers radiating outward

  let { variant = 'modules' }: { variant?: HeroArtVariant } = $props();
</script>

<svg
  class="hero-art"
  viewBox="0 0 520 340"
  fill="none"
  aria-hidden="true"
  preserveAspectRatio="xMaxYMid meet"
  focusable="false"
>
  {#if variant === 'modules'}
    <!-- A board of modules: some shipped (filled), some planned (outline). -->
    <g stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
      <path d="M96 66h96v72H96zM240 30h112v108H240zM240 186h112v108H240zM96 186h96v72H96z" />
      <path d="M96 246h96v72H96zM240 342h112" opacity=".55" />
    </g>
    <g fill="currentColor">
      <rect x="240" y="30" width="112" height="108" rx="3" opacity=".16" />
      <rect x="96" y="186" width="96" height="72" rx="3" opacity=".1" />
    </g>
    <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".33">
      <path d="M150 138v48M192 210h48M296 138v48M352 66v-36M120 84v60M330 210v60" />
    </g>
    <g fill="currentColor" opacity=".55">
      <circle cx="150" cy="186" r="2.6" /><circle cx="240" cy="210" r="2.6" /><circle cx="296" cy="186" r="2.6" />
      <circle cx="352" cy="30" r="2.6" /><circle cx="330" cy="270" r="2.6" />
    </g>
  {:else if variant === 'chain'}
    <!-- Four blocks, each carrying a shorter hash tick, linked into a chain. -->
    <g stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
      <path d="M40 96h92v86H40zM172 96h92v86h-92zM304 96h92v86h-92zM436 96h60v86h-60z" />
    </g>
    <g fill="currentColor" opacity=".12">
      <rect x="172" y="96" width="92" height="86" rx="3" />
      <rect x="436" y="96" width="60" height="86" rx="3" />
    </g>
    <g stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".38">
      <path d="M40 224v34h488v-34M40 224v-42M486 224v-42" />
      <path d="M166 139h-34M298 139h-34M430 139h-34" stroke-width="1.6" />
    </g>
    <g stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".5">
      <path d="M58 118h56M58 132h40M58 146h48" />
      <path d="M190 118h56M190 132h40M190 146h48" />
      <path d="M322 118h56M322 132h40M322 146h48" />
      <path d="M452 118h28M452 132h20M452 146h24" />
    </g>
    <g fill="currentColor" opacity=".6">
      <circle cx="149" cy="258" r="2.4" /><circle cx="281" cy="258" r="2.4" /><circle cx="413" cy="258" r="2.4" />
    </g>
  {:else if variant === 'scales'}
    <!-- Balance: statute panel on the left, weighing beam over it. -->
    <g stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
      <path d="M40 48h150v244H40z" />
      <path d="M62 78h106M62 96h84M62 114h96M62 132h70M62 150h90M62 168h60" opacity=".4" />
    </g>
    <g fill="currentColor" opacity=".1"><rect x="40" y="48" width="150" height="244" rx="3" /></g>
    <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <path d="M330 74v168M258 104h144M276 132a26 26 0 0 0 52 0M276 132l-14 26h66l-14-26" />
      <path d="M330 74l-24 30M330 74l24 30" opacity=".5" />
    </g>
    <g stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" opacity=".45">
      <path d="M302 242h56l14 50H288zM330 242v-64" />
    </g>
    <g stroke="currentColor" stroke-width="1.1" opacity=".3">
      <path d="M430 104v138M414 242h32M430 104l-16 168" />
    </g>
  {:else if variant === 'ledger'}
    <!-- Stacked, ruled documents with a seal on the front sheet. -->
    <g stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
      <path d="M96 34h230v272H96z" />
      <path d="M126 34v272M96 34h230" opacity=".35" />
    </g>
    <g fill="currentColor" opacity=".1"><rect x="96" y="34" width="230" height="272" rx="3" /></g>
    <g stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".42">
      <path d="M152 82h144M152 104h110M152 126h144M152 148h96" />
      <path d="M152 216h144M152 238h120M152 260h144" />
    </g>
    <g stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" opacity=".6">
      <path d="M382 108l58-58 20 20-58 58-26 6z" />
    </g>
    <g stroke="currentColor" stroke-width="1.2" opacity=".4">
      <circle cx="248" cy="182" r="22" />
      <path d="M238 182l8 8 16-18" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  {:else if variant === 'network'}
    <!-- One building in the middle of a community: units, council, records. -->
    <g stroke="currentColor" stroke-width="1.1" opacity=".32" stroke-linecap="round">
      <path d="M260 170L132 78M260 170l128-92M260 170L120 268M260 170l146 88M260 170v-108M260 170v118" />
    </g>
    <g stroke="currentColor" stroke-width="1.2" stroke-linejoin="round">
      <path d="M212 122h96v96h-96z" />
      <path d="M236 122v96M284 122v96M212 170h96" opacity=".38" />
    </g>
    <g fill="currentColor">
      <rect x="212" y="122" width="96" height="96" rx="3" opacity=".14" />
      <circle cx="132" cy="78" r="11" opacity=".22" /><circle cx="388" cy="78" r="11" opacity=".22" />
      <circle cx="120" cy="268" r="11" opacity=".22" /><circle cx="406" cy="258" r="11" opacity=".22" />
      <circle cx="260" cy="62" r="8" opacity=".3" /><circle cx="260" cy="288" r="8" opacity=".3" />
    </g>
    <g stroke="currentColor" stroke-width="1.3" opacity=".5">
      <circle cx="132" cy="78" r="11" /><circle cx="388" cy="78" r="11" />
      <circle cx="120" cy="268" r="11" /><circle cx="406" cy="258" r="11" />
    </g>
  {:else}
    <!-- Answers radiating out of a source, with the citation set beneath. -->
    <g stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".42">
      <path d="M104 300a212 212 0 0 1 212-212M104 300a158 158 0 0 1 158-158M104 300a104 104 0 0 1 104-104M104 300a50 50 0 0 1 50-50" />
    </g>
    <g stroke="currentColor" stroke-width="1.1" opacity=".28">
      <path d="M104 300h372M104 300V44" />
    </g>
    <g fill="currentColor">
      <circle cx="314" cy="88" r="10" opacity=".3" />
      <circle cx="262" cy="142" r="8" opacity=".26" />
      <circle cx="208" cy="196" r="7" opacity=".22" />
      <circle cx="154" cy="250" r="6" opacity=".2" />
      <circle cx="104" cy="300" r="5" opacity=".55" />
    </g>
    <g stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".4">
      <path d="M336 300h140M336 282h96M336 264h120" />
    </g>
    <g stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" opacity=".45">
      <path d="M368 60h92v34h-92zM388 44h92v34" />
    </g>
  {/if}
</svg>

<style>
  /* Bottom-right, behind the copy, and masked so it dissolves into the band
     rather than ending in a hard edge. Hidden on narrow screens, where the
     header is tight and the art would only add noise. */
  .hero-art {
    position: absolute;
    right: -2%;
    bottom: -14%;
    z-index: -1;
    width: min(46rem, 62vw);
    height: auto;
    max-height: 118%;
    color: var(--color-brand-500);
    opacity: 0.3;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(105deg, transparent 12%, #000 62%);
    mask-image: linear-gradient(105deg, transparent 12%, #000 62%);
    transition: opacity 0.3s ease;
  }

  /* Dark mode: the band is deeper, so the same stroke reads quieter. Lift it
     slightly and let the accent warm it up. */
  :global(.dark) .hero-art {
    color: var(--color-brand-400);
    opacity: 0.26;
  }

  @media (max-width: 900px) {
    .hero-art { display: none; }
  }
</style>
