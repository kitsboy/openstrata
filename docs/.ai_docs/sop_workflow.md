# openstrata — Standard Operating Procedure

## Build
```bash
cd ~/projects/openstrata && npm run build
```

## Dev Server
```bash
cd ~/projects/openstrata && npm run dev
```

## Pre-Deploy Checks
```bash
cd ~/projects/openstrata && git status && npm run build
```
## Deploy (Auto — git push triggers CF Pages)
```bash
cd ~/projects/openstrata && git push origin main
```

## Post-Deploy Verify
```bash
curl -s ## Stack\n| Layer | Technology |\n|-------|-----------|\n| Framework | SvelteKit 5 |\n| Styling | Tailwind CSS v4 |\n| Language | TypeScript |\n\n## Ports\n| Service | Port |\n|---------|------|\n| Dev server | 5173 |\n\n## Key Architecture\n- Sovereign data portability\n- BCFSA-aware strata ops\n- Routes include /tools/wizard\n- Bitcoin, Lightning, Nostr integration\n\n## Hosting\nCloudflare Pages auto-deploy — openstrata.giveabit.io | grep -q 'openstrata'
```
