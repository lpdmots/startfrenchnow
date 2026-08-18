# FIDE Contextual Linking and Permit Segmentation Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task by task.

**Goal:** Ajouter un maillage contextuel utile aux 12 articles FIDE et une section compacte permis B / permis C / naturalisation sur le hub FIDE, sans refondre la page ni créer de pages SEO pauvres.

**Architecture:** Le maillage est défini dans une table de correspondance déterministe, appliquée aux champs Portable Text français et anglais par un script Sanity réexécutable. La section permis est un composant serveur localisé, inséré entre l’introduction du hub et le détail des épreuves. Les tests verrouillent les destinations, l’idempotence, la présence des trois cartes et l’absence de H1 supplémentaire.

**Tech Stack:** Next.js App Router, next-intl, TypeScript, Sanity Portable Text, Node test runner, Cheerio, Tailwind CSS.

**Constraints:** Préserver tous les changements existants du worktree. Sauvegarder les documents Sanity avant toute mutation. Ne pas modifier l’affirmation « 98 % ». Ne pas commit, pousser ou déployer sans demande explicite.

---

## Task 1: Verrouiller le maillage attendu par des tests

**Files:**
- Create: `scripts/sanity/fideContextualLinks.test.mjs`
- Create: `scripts/sanity/fideContextualLinks.mjs`

- [x] Écrire un test contenant la liste explicite des 12 slugs, leur offre pertinente et leur guide suivant.
- [x] Tester sur un exemple français la conservation du contenu éditorial, la suppression des anciens CTA de fin et l’ajout de trois sorties localisées.
- [x] Tester les URL anglaises sans préfixe `/fr`.
- [x] Tester qu’une seconde transformation ne modifie plus le document.
- [x] Tester qu’un slug inconnu est refusé sans mutation silencieuse.
- [x] Exécuter le test avant l’implémentation et confirmer son échec pour la raison attendue.
- [x] Implémenter la transformation Portable Text minimale.
- [x] Réexécuter le test et confirmer son succès.

## Task 2: Verrouiller puis ajouter la section de décision

**Files:**
- Modify: `scripts/seo/check-priority-pages.mjs`
- Create: `app/[locale]/(sfn)/fide/components/FidePermitPathSection.tsx`
- Modify: `app/[locale]/(sfn)/fide/page.tsx`
- Modify: `app/dictionaries/fr.json`
- Modify: `app/dictionaries/en.json`

- [x] Ajouter au contrôle rendu les assertions : une section, trois cartes, les niveaux attendus, une source SEM officielle et aucun H1 supplémentaire.
- [x] Exécuter le contrôle contre l’état actuel et constater l’échec attendu sur la section absente.
- [x] Créer un composant serveur compact, sans image ni JavaScript client.
- [x] Présenter avec prudence les cas permis B, permis C et naturalisation, avec réserve cantonale.
- [x] Lier le CTA global à `#fide-hub` et la source vers le SEM dans la bonne langue.
- [x] Insérer la section après l’aperçu général et avant le détail des épreuves.
- [x] Ajouter les traductions françaises et anglaises.
- [x] Réexécuter le contrôle rendu et confirmer le succès.

## Task 3: Préparer et auditer la migration Sanity

**Files:**
- Create: `scripts/sanity/migrateFideContextualLinks.mjs`

- [x] Implémenter les modes `--dry-run`, `--apply` et `--verify` ciblant exactement les 12 articles publiés.
- [x] En mode apply, créer avant mutation une sauvegarde exclusive dans `/tmp/startfrenchnow-sanity-backups/`.
- [x] N’écrire que `body` et `body_en`, dans une transaction Sanity.
- [x] Vérifier pour chaque langue exactement trois liens contextuels : hub, préparation et guide suivant.
- [x] Vérifier l’absence des anciens CTA de contact dans la fin des articles.
- [x] Lancer le dry-run sur le dataset de production et examiner les 12 transformations.

## Task 4: Appliquer le maillage contextuel

**Files:**
- Modify externally: Sanity dataset `startfrenchnow`, 12 documents FIDE uniquement

- [x] Exécuter la migration `--apply` après le dry-run concluant.
- [x] Exécuter immédiatement `--verify`.
- [x] Contrôler que toutes les destinations internes uniques répondent correctement.
- [x] Réexécuter le dry-run et vérifier qu’il ne propose plus aucun changement.

## Task 5: Vérification finale

**Files:**
- Verify only: all files above and existing SEO changes

- [x] Exécuter tous les tests Node SEO/Sanity concernés.
- [x] Exécuter un build Next.js complet.
- [x] Démarrer la build localement et exécuter l’audit des pages FIDE françaises rendues.
- [x] Contrôler le diff pour détecter toute modification hors périmètre.
- [x] Rapporter les changements, les résultats mesurés, la sauvegarde Sanity et l’absence de déploiement.

## Verification Results

- 14 tests Node passent.
- Build Next.js de production réussi avec `NODE_OPTIONS=--max-old-space-size=4096`.
- Audit local des 10 pages prioritaires réussi.
- Audit du sitemap actuellement en production réussi.
- Migration Sanity vérifiée : 12 documents, 72 liens contextuels, 28 destinations uniques accessibles, second dry-run à 0 changement.
