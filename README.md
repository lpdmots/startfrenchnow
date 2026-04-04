# Start French Now

## Prerequis

- Node `22.x` requis (`package.json -> engines`)
- npm `>=10`

## Installation

```bash
npm ci
```

Important: utiliser `npm ci` (et pas `npm i`) pour respecter exactement `package-lock.json`.

## Scripts utiles

- `npm run dev`: dev server principal avec Turbopack
- `npm run dev:webpack`: dev server webpack (fallback si comportement instable en turbo)
- `npm run dev:studio`: alias webpack pour travailler sur `/studio`
- `npm run typecheck`: verification TypeScript sans emission
- `npm run lint:quiet`: lint sans warnings non bloquants
- `npm run build -- --no-lint`: build prod
- `npm run analyze`: build + rapport bundle analyzer (`ANALYZE=true`)

## Notes de workflow

- Le mode turbo est prioritaire pour le front public.
- Pour `Sanity Studio`, preferer `npm run dev:studio` si HMR/turbo devient instable localement.
- Les articles blog sont configures en ISR avec endpoint `/api/revalidate` pour forcer la mise a jour immediate via webhook Sanity.

## CI

Workflow GitHub Actions: `.github/workflows/ci.yml`

Le workflow execute:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint:quiet`
4. `npm run build -- --no-lint` (si les secrets requis sont presents)
