---
name: admin-page
description: Conventions pour créer ou refondre une page admin du site (app/[locale]/(sfn)/admin/*) - accès admin, données depuis app/lib, tableaux de bord avec chiffres clés et graphiques Recharts, états de données manquantes, clair/sombre via data-theme, mobile sans scroll horizontal, formats fr-CH et heure de Zurich. À utiliser dès qu'on touche une page sous /admin, qu'on ajoute un rapport, un graphique ou un tableau réservé aux admins.
---

# Pages admin

Implémentation de référence : `app/[locale]/(sfn)/admin/reports/` (page + `components/`).
Avant d'écrire une nouvelle page, lis-la : la plupart des briques se réutilisent telles quelles.

## Structure

- `page.tsx` est un **server component** qui ne fait que : vérifier l'accès, lire `params` / `searchParams`, appeler une fonction de `app/lib/...`, assembler les composants.
  **Aucun calcul métier dans la page** : agrégats, séries, conversions vont dans `app/lib` (ex. `app/lib/reporting/salesReport.ts`), et la page reçoit des données prêtes à afficher.
- Accès, toujours en premier :
  ```ts
  const session = await getServerSession(authOptions);
  if (session?.user?.isAdmin !== true) redirect("/");
  ```
  Les server actions admin refont la même vérification (voir `app/serverActions/reportActions.ts`).
- `export const dynamic = "force-dynamic"` et `metadata = { robots: { index: false, follow: false } }`.
- Composants dans `components/` à côté de la page (convention des autres pages admin, pas `_components`).
  Seuls les graphiques sont `"use client"` ; tuiles, tableaux et panneaux restent serveur.
  Dans un composant client, n'importer que des **types** depuis `app/lib/reporting/*` (`import type`), ces modules sont `server-only`.
- Filtres (période, etc.) en `<form method="get">` + liens `href={{ query: {...} }}` : l'état vit dans l'URL, pas dans un state client.

## Mise en page

- Conteneur : `mx-auto w-full max-w-[1200px] px-4 sm:px-6`, avec la classe `admin-viz` dès qu'il y a des graphiques.
- Ordre : en-tête (titre + période + date de génération) → filtres / actions → bandeaux de retour → chiffres clés → graphiques → tableaux détaillés → détails secondaires en `<details>`.
- Panneaux : `Panel` de `reports/components/ReportTables.tsx` (bordure `neutral-300`, fond `neutral-100`, `rounded-lg`).
- Chiffres clés : une seule bande divisée (`grid gap-px bg-neutral-300`), pas une rangée de cartes séparées. Voir `KpiStrip.tsx`.
- **Piège Webflow** : `webflow.css` donne `padding: 240px 0` à toute balise `section`. Toute `<section>` doit fixer son padding (`p-0`, `p-4`…), sinon un grand vide apparaît.
- Les titres `h1`/`h2` ont des styles globaux : toujours fixer taille et marge en classes (`text-lg font-semibold mb-0`).
- Typo : celle du site (Poppins). Pas de mot accentué en couleur dans les titres, pas d'étiquettes en capitales.

## Mobile (375 px) sans scroll horizontal de la page

- Pas de `<table className="min-w-[...]">` dans un `overflow-x-auto`.
- Tableau de 3 colonnes courtes : `table-fixed` + `break-words` suffit.
- Au-delà : une grille par ligne (`ul > li.grid md:grid-cols-[...]`), en-têtes visibles à partir de `md`, et sur mobile chaque ligne devient une fiche avec des libellés `md:hidden` (`CellLabel`). Voir `CustomersTable` / `CalendlyTable`.
- E-mails et identifiants longs : `break-all`.
- Graphiques en `ResponsiveContainer`, barres par catégorie **horizontales** (les libellés restent lisibles).

## Clair / sombre

- Le thème du site passe par `data-theme="dark"` sur `<html>` ; Tailwind n'y est **pas** branché (`darkMode: ["class"]`), donc `dark:` ne marche pas.
- Préférer les couleurs à jetons (`neutral-100` … `neutral-800`, `border`, `card`…), qui basculent toutes seules.
- Pour une couleur Tailwind fixe (vert, rouge, ambre), ajouter la variante : `[[data-theme=dark]_&]:bg-green-950 [[data-theme=dark]_&]:text-green-100`.
- Couleurs de graphiques : variables `--viz-*` définies sur `.admin-viz` dans `app/styles/globals.css` (bloc `purgecss ignore`), avec leur version `[data-theme="dark"] .admin-viz`.
  Utilisées directement en SVG : `fill="var(--viz-purchases)"`.
  | Jeton | Rôle |
  |---|---|
  | `--viz-purchases` | achats (bleu) |
  | `--viz-customers` | nouveaux clients (orange) |
  | `--viz-calendly` | RDV Calendly (aqua) |
  | `--viz-money` | revenus / résultat (violet) |
  | `--viz-cost` | dépenses (gris neutre) |
  | `--viz-grid`, `--viz-axis`, `--viz-hatch` | grille, axes, hachures d'état manquant |
- Une **entité garde sa couleur** sur toute la page (achats toujours bleu). Nouvelle série = nouveau jeton, ajouté dans l'ordre et **validé** avec le validateur du skill `dataviz` (`validate_palette.js`, en clair sur `#ffffff`/`#faf9f6` et en sombre sur `#0e0e0e`).

## Graphiques (Recharts, seule librairie autorisée)

- Charger le skill `dataviz` avant d'écrire un graphique.
- Pas de double axe : deux mesures d'échelles différentes = deux petits graphiques empilés avec `syncId`.
- Barres `radius` 4 sur l'extrémité, lignes `strokeWidth={2}` et `type="linear"` pour des comptages, `isAnimationActive={false}`.
- Infobulle personnalisée (`TooltipBox`) au survol, légende HTML au-dessus dès 2 séries (et masquée si le graphique est vide), valeurs en étiquettes directes sur les barres horizontales.
- Textes et valeurs en couleurs de texte (`neutral-*`), jamais dans la couleur de la série.
- Peu de lignes (≤ 5) avec des états à montrer : des barres HTML suffisent (voir `AdsVsRevenue.tsx`).
- Données vides : un message (`ChartNote`) plutôt qu'un graphique plat à zéro.

## Données manquantes

- Une source non configurée ou indisponible ne s'affiche **jamais comme 0**.
- Les modules de `app/lib` renvoient un statut (`"available" | "not_configured" | "unavailable"` + `message`) ; l'UI l'affiche avec `StatusBadge` (icône + libellé, `whitespace-nowrap`).
- Un total qui en dépend dit ce qu'il exclut (« Hors Google Ads, non configuré ») ou s'affiche « Non calculable » avec la raison.

## Formats (`reports/components/format.ts`)

- Montants et nombres : `Intl` en `fr-CH` (`formatMoney`, `formatCount`), `tabular-nums` sur les colonnes de chiffres.
- Horodatages (achat, demande, envoi) : `formatDateTime`, en `Europe/Zurich`.
- Jours sans heure (`AAAA-MM-JJ`, bornes de période, regroupements) : `formatDay` / `formatDayRange`, formatés en **UTC** pour ne pas décaler le jour.
  Les périodes de `createReportDateRange` sont des jours UTC ; les regroupements doivent suivre le même découpage pour que les totaux concordent.

## Textes

- Français, phrases simples, tutoiement comme le reste de l'admin.
- Les boutons disent ce qu'ils font (« Afficher la période », « Envoyer ce rapport par e-mail ») et le retour reprend le même verbe (« Rapport envoyé par e-mail… »).
- Un échec dit quoi faire (« Vérifie la configuration e-mail, puis réessaie. »).

## Vérification avant de rendre la main

1. `npm run typecheck`
2. ESLint : `npx eslint "app/[locale]/(sfn)/admin/<page>" app/lib/<module>`.
   (`npm run lint` cite encore `middleware.ts`, renommé en `proxy.ts` ; tant que le script n'est pas corrigé, lancer ESLint directement.)
3. Contrôle visuel avec le serveur `dev` (`.claude/launch.json`) : desktop et mobile 375 px, clair et sombre (`document.documentElement.setAttribute('data-theme','dark')`), et `document.documentElement.scrollWidth === clientWidth` sur mobile.
   La page exige une session admin : si le navigateur n'est pas connecté, demander à l'utilisateur de se connecter, ou monter une page d'aperçu temporaire avec des données fictives couvrant les états manquants, puis la **supprimer**.
