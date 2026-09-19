<script lang="ts">
  /**
   * One printed document.
   *
   * Rendered as a white sheet on screen as well as on paper, on purpose: a
   * council should see the page it is about to sign, not a themed web page that
   * happens to print. Every surface here is hard-coded to paper values rather
   * than theme tokens, so dark mode cannot change what a printed Form B looks
   * like. On screen it is a sheet with a shadow; in print the shadow, radius
   * and page margin come off and the browser's own page box takes over.
   */
  import BrandMark from './BrandMark.svelte';
  import { docReference, type PrintDocument, type Organization } from '$lib/documents';

  let {
    doc,
    org,
    sample = true
  }: { doc: PrintDocument; org: Organization; sample?: boolean } = $props();

  const ref = $derived(docReference(doc.prefix, doc.issued));
</script>

<article class="print-doc" aria-label="{doc.title} — {ref}">
  <header class="print-letterhead">
    <div class="print-brand">
      <BrandMark size={40} />
      <div>
        <p class="print-org">{org.name}</p>
        <p class="print-org-line">{org.address}</p>
        <p class="print-org-line">{org.contact}</p>
        <p class="print-org-line print-org-registration">{org.registration}</p>
      </div>
    </div>
    <dl class="print-ref">
      <dt>Reference</dt>
      <dd>{ref}</dd>
      <dt>Issued</dt>
      <dd>{doc.issued}</dd>
    </dl>
  </header>

  <div class="print-rule" aria-hidden="true"></div>

  <div class="print-title-block">
    <h1>{doc.title}</h1>
    <p class="print-subtitle">{doc.subtitle}</p>
    <p class="print-purpose">{doc.purpose}</p>
  </div>

  <p class="print-basis">{doc.basis}</p>

  <div class="print-body">
    {#each doc.blocks as block}
      {#if block.kind === 'heading'}
        <h2 class="print-h2">{block.text}</h2>
      {:else if block.kind === 'para'}
        <p class="print-p">{block.text}</p>
      {:else if block.kind === 'list'}
        {#if block.ordered}
          <ol class="print-list">
            {#each block.items as item}<li>{item}</li>{/each}
          </ol>
        {:else}
          <ul class="print-list">
            {#each block.items as item}<li>{item}</li>{/each}
          </ul>
        {/if}
      {:else if block.kind === 'note'}
        <p class="print-note">{block.text}</p>
      {:else if block.kind === 'table'}
        <div class="print-table-wrap">
          <table>
            {#if block.head.some((cell) => cell.trim())}
              <thead>
                <tr>{#each block.head as cell}<th>{cell}</th>{/each}</tr>
              </thead>
            {/if}
            <tbody>
              {#each block.rows as row}
                <tr>
                  {#each row as cell, index}
                    {#if index === 0}
                      <th scope="row">{cell}</th>
                    {:else}
                      <td>{cell}</td>
                    {/if}
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
          {#if block.note}<p class="print-table-note">{block.note}</p>{/if}
        </div>
      {:else if block.kind === 'signatures'}
        <div class="print-signatures">
          {#each block.rows as row}
            <div class="print-signature">
              <p class="print-signature-line" aria-hidden="true"></p>
              <p class="print-signature-role">{row.role}</p>
              <p class="print-signature-name">{row.name}</p>
            </div>
          {/each}
        </div>
      {/if}
    {/each}
  </div>

  <footer class="print-foot">
    <p>{doc.footer}</p>
    {#if sample}<p class="print-foot-sample">Template preview — sample data, not a filed record.</p>{/if}
  </footer>
</article>

<style>
  /* Paper values, not theme tokens — this sheet is the same in light and dark. */
  .print-doc {
    width: 100%;
    max-width: 52rem;
    margin: 0 auto;
    padding: 2.75rem 3rem 2.25rem;
    border: 1px solid #dfe4e8;
    border-radius: 14px;
    background: #ffffff;
    color: #14181c;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12.5pt;
    line-height: 1.55;
    box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
  }

  .print-letterhead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
  }
  .print-brand {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    color: #f0801a;
  }
  .print-org {
    margin: 0;
    color: #14181c;
    font-size: 15pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }
  .print-org-line {
    margin: 2px 0 0;
    color: #5a6672;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 8.5pt;
    letter-spacing: 0.02em;
  }
  .print-org-registration { color: #7d8890; }

  .print-ref { margin: 0; text-align: right; }
  .print-ref dt {
    color: #7d8890;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .print-ref dd {
    margin: 1px 0 8px;
    color: #14181c;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 10pt;
    font-weight: 500;
  }

  .print-rule {
    height: 2px;
    margin: 18px 0 22px;
    background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
  }

  .print-title-block h1 {
    margin: 0;
    font-size: 21pt;
    font-weight: 700;
    letter-spacing: -0.015em;
    line-height: 1.12;
  }
  .print-subtitle {
    margin: 4px 0 0;
    color: #3f4a55;
    font-size: 11pt;
  }
  .print-purpose {
    margin: 10px 0 0;
    max-width: 44rem;
    color: #3f4a55;
    font-size: 10.5pt;
    font-style: italic;
  }
  .print-basis {
    margin: 14px 0 0;
    padding: 9px 12px;
    border-left: 3px solid #f0801a;
    background: #fdf6ef;
    color: #3f4a55;
    font-size: 10pt;
  }

  .print-body { margin-top: 22px; }
  .print-h2 {
    margin: 20px 0 6px;
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 0.01em;
    break-after: avoid;
  }
  .print-p { margin: 0 0 10px; }
  .print-list { margin: 0 0 10px; padding-left: 1.4rem; }
  .print-list li { margin-bottom: 4px; }
  .print-note {
    margin: 12px 0;
    padding: 10px 12px;
    border: 1px solid #e4d8c8;
    border-radius: 6px;
    background: #fdfaf5;
    color: #4b5563;
    font-size: 10pt;
  }

  .print-table-wrap { margin: 12px 0 16px; }
  .print-table-wrap table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }
  .print-table-wrap th,
  .print-table-wrap td {
    padding: 6px 10px;
    border: 1px solid #dfe4e8;
    text-align: left;
    vertical-align: top;
  }
  .print-table-wrap thead th {
    background: #f3f6f7;
    color: #3f4a55;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 8pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .print-table-wrap tbody th {
    width: 34%;
    color: #3f4a55;
    font-weight: 600;
  }
  .print-table-note {
    margin: 6px 0 0;
    color: #7d8890;
    font-size: 9pt;
  }

  .print-signatures {
    display: grid;
    gap: 22px;
    margin-top: 28px;
  }
  .print-signature-line {
    height: 1px;
    margin: 0 0 6px;
    background: #9aa5ad;
  }
  .print-signature-role {
    margin: 0;
    color: #7d8890;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .print-signature-name {
    margin: 2px 0 0;
    color: #14181c;
    font-size: 10pt;
  }

  .print-foot {
    margin-top: 26px;
    padding-top: 10px;
    border-top: 1px solid #dfe4e8;
    color: #7d8890;
    font-family: 'DM Mono', ui-monospace, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.02em;
  }
  .print-foot p { margin: 0; }
  .print-foot-sample { margin-top: 3px; color: #a8672a; }

  /* Phones: the 3rem sheet gutter wastes the whole viewport. */
  @media (max-width: 700px) {
    .print-doc { padding: 1.5rem 1.25rem; border-radius: 10px; font-size: 11.5pt; }
    .print-letterhead { flex-direction: column; gap: 12px; }
    .print-ref { text-align: left; }
    .print-ref dd { margin-bottom: 4px; }
    .print-table-wrap tbody th { width: 42%; }
  }
</style>
