<script lang="ts">
  /**
   * The OpenStrata brush mark.
   *
   * Inline SVG drawn in `currentColor`, so the same component serves the light
   * header, the dark app sidebar, the footer and the auth card without a second
   * palette. `aria-hidden` by default: it always sits beside the wordmark, so
   * announcing it would just repeat the name.
   *
   * The raster favicons are the same art with the colour baked in (see
   * `static/icon.svg` and `scripts/generate-icons.mjs`).
   */
  let { size = 26, class: className = '', label }: { size?: number; class?: string; label?: string } =
    $props();
</script>

<span
  class="brand-mark {className}"
  style="--mark-size: {size}px"
  aria-hidden={label ? undefined : 'true'}
  role={label ? 'img' : undefined}
  aria-label={label}
>
  <svg viewBox="0 0 283 448" fill="currentColor" focusable="false">
    <path
      d="M146.5 22C155 5.5 174 2.5 181.5 13.5L196.5 55.5C198.5 62.5 194 68.5 187 68.5H161.5C154.5 68.5 150.5 62.5 149.5 56Z"
    />
    <path
      d="M26 96.5C90 86 190 80 271 86.5C279.5 87.2 280.5 93.5 274.5 96C190 105.5 92 113.5 26.5 120C17.5 121 14.5 114.5 16.5 106.5C18 99 21 96 26 96.5Z"
    />
    <path
      d="M20 216.5C86 209 178 204.5 257 213.5C265.5 214.5 266.5 220.5 260.5 223.5C178 232.5 86 237 19.5 234.5C11 234 8.5 227.5 10.5 221.5C12 217 15 216 20 216.5Z"
    />
    <path
      d="M17 278.5C66 268.5 142 259.5 267 266.5C277.5 267.2 278.5 273.5 270.5 277.5C142 290 66 292 18.5 290C8.5 289.5 5.5 283.5 9.5 280C12 278 14 278 17 278.5Z"
    />
    <path
      d="M140.5 405C148.5 395.5 157 400 159.5 412C163 429 163.5 443 155 447C146.5 451 137 442.5 133.5 430C130.5 417.5 133 410 140.5 405Z"
    />
  </svg>
</span>
