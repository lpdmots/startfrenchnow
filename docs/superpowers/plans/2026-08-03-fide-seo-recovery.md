# FIDE SEO Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore discovery of all published FIDE articles, migrate every legacy Start French Now URL inside their Sanity Portable Text, and remove the remaining unsubstantiated commercial superlatives from the FIDE landing pages.

**Architecture:** Keep the current Next.js App Router and bilingual `/` + `/fr` URL model. Protect the Sanity mutation behind a pure, unit-tested URL transformer, a dry-run, and a local JSON backup; update only published posts carrying the `fide` category. Extend the existing production-page SEO audit so sitemap and copy regressions are verified against rendered HTML/XML.

**Tech Stack:** Next.js 16, TypeScript, next-intl, Sanity Portable Text, `@sanity/client`, Node.js built-in test runner, JSDOM.

## Global Constraints

- Preserve all existing uncommitted user changes in the dirty `main` worktree.
- Do not commit, push, deploy, or alter the deferred internal-linking, free-exam, permit-segmentation, or proof-methodology projects.
- Keep English routes unprefixed and French routes under `/fr`.
- Back up all 12 affected Sanity documents before the first production mutation.
- Run the Sanity migration first in dry-run mode and abort on an unexpected document count or URL.
- Keep the success-rate display at the user-approved 98%; do not invent supporting methodology.

---

### Task 1: Add regression coverage for the FIDE sitemap

**Files:**
- Modify: `scripts/seo/check-priority-pages.mjs`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `/sitemap.xml` from a running production build and published Sanity posts.
- Produces: no FIDE category URL, both locale URLs for every published FIDE post, and no duplicate `<loc>` values.

- [ ] **Step 1: Write the failing integration assertions**

Parse the sitemap and assert that `/blog/category/fide` and `/fr/blog/category/fide` are absent. Query the expected 12 FIDE slugs through the same dataset used by the application and assert that both `/blog/post/{slug}` and `/fr/blog/post/{slug}` are present.

- [ ] **Step 2: Run the audit against the current production site**

Run: `BASE_URL=https://startfrenchnow.ch node scripts/seo/check-priority-pages.mjs`

Expected: FAIL because pure-FIDE posts are missing and the two category URLs remain.

- [ ] **Step 3: Implement the minimal sitemap correction**

Generate category URLs from `BLOGCATEGORIES.filter(category => category !== "fide")`. Query blog posts with all `BLOGCATEGORIES`, so posts assigned only to `fide` are included. Preserve the existing final URL deduplication and `lastModified` behavior.

- [ ] **Step 4: Build and rerun the audit locally**

Run the production build, start it on port 3100, then run `BASE_URL=http://127.0.0.1:3100 node scripts/seo/check-priority-pages.mjs`.

Expected: PASS for sitemap category exclusion, all 24 localized FIDE article URLs, and sitemap uniqueness.

---

### Task 2: Build and verify the Portable Text URL migration

**Files:**
- Create: `scripts/sanity/fideLegacyLinks.test.mjs`
- Create: `scripts/sanity/fideLegacyLinks.mjs`
- Create: `scripts/sanity/migrateFideLegacyLinks.mjs`
- Local backup only: `/tmp/startfrenchnow-sanity-backups/fide-posts-before-link-migration-2026-08-03.json`

**Interfaces:**
- Consumes: `body` and `body_en` Portable Text arrays from the 12 published `post` documents whose categories contain `fide`.
- Produces: an immutable transformer returning locale-correct `.ch` URLs and a migration command supporting `--dry-run`, `--apply`, and `--verify`.

- [ ] **Step 1: Write failing transformer tests**

Test recursive Portable Text traversal, preservation of unrelated values and array keys, `.com` → `.ch`, removal of erroneous `/fr` from English-body links, addition of `/fr` to French-body links, and these exact legacy slug repairs:

```text
4-guide-pour-reussir-la-partie-lire-et-ecrire-du-test-fide
→ 4-le-test-fide-lire-et-ecrire

5-comment-reussir-la-partie-orale-a2-de-le-test-fide
→ 5-le-test-fide-l-oral-a2-en-detail
```

- [ ] **Step 2: Run the test and verify the red state**

Run: `node --test scripts/sanity/fideLegacyLinks.test.mjs`

Expected: FAIL for the missing URL transformation behavior.

- [ ] **Step 3: Implement the pure transformer**

Export `rewriteLegacyStartFrenchNowUrl(url, locale)` and `rewritePortableTextLegacyLinks(value, locale)`. Rewrite only strings under `href` keys inside Portable Text and return `{value, changes}` without mutating the input.

- [ ] **Step 4: Verify the transformer is green**

Run: `node --test scripts/sanity/fideLegacyLinks.test.mjs`

Expected: all cases PASS.

- [ ] **Step 5: Implement the guarded migration runner**

Load `.env.local`, target `NEXT_PUBLIC_SANITY_DATASET_PROD`, require exactly 12 published FIDE documents, write the complete pre-mutation documents to the `/tmp` backup, print every old/new URL pair during `--dry-run`, patch only changed `body` and `body_en` fields during `--apply`, and refetch documents during `--verify`.

- [ ] **Step 6: Dry-run and review all mutations**

Run: `node scripts/sanity/migrateFideLegacyLinks.mjs --dry-run`

Expected: 12 affected documents, 48 rewritten URLs, zero non-Portable-Text changes, and only approved `.ch` destinations.

- [ ] **Step 7: Apply and verify Sanity**

Run: `node scripts/sanity/migrateFideLegacyLinks.mjs --apply`, then `node scripts/sanity/migrateFideLegacyLinks.mjs --verify`.

Expected: 12 documents patched, zero remaining `startfrenchnow.com` values, every migrated `.ch` URL returning a non-error destination, and the backup path printed.

---

### Task 3: Remove stale H1 and commercial-proof regressions

**Files:**
- Modify: `scripts/seo/check-priority-pages.mjs`
- Modify: `app/dictionaries/fr.json`
- Modify: `app/dictionaries/en.json`
- Verify existing: `app/[locale]/(sfn)/fide/pack-fide/components/WhatIsPackFideSection.tsx`
- Verify existing: `app/components/sfn/courses/FideCourseRatings.tsx`

**Interfaces:**
- Consumes: rendered English and French FIDE hub, pack, mock-exam, and private-course pages.
- Produces: exactly one H1 per page, server-rendered `300+` and `98%`, and no “most complete” or “guaranteed progress” claims.

- [ ] **Step 1: Add failing rendered-copy assertions**

Assert that neither language contains the old “plateforme la plus complète / most complete platform” or “progression garantie / guaranteed progress” wording. Retain existing assertions for one H1, visible `98%`, no `99` gauge, and no animated `0+` initial value.

- [ ] **Step 2: Run against the current implementation**

Expected: FAIL only on the remaining unsupported superlative/guarantee copy; the existing H1 and counter fixes should already pass.

- [ ] **Step 3: Replace only the unsupported wording**

Use “plateforme e-learning structurée pour l’examen / structured e-learning platform for the exam” and “parcours progressif / step-by-step learning path”. Preserve prices, product quantities, the user-approved 98%, and all offer mechanics.

- [ ] **Step 4: Rebuild and rerun the rendered audit**

Expected: one H1 and consistent counters/copy on every priority route in both languages.

---

### Task 4: Competitor diagnosis and deferred-project specifications

**Files:**
- No production changes.
- Report results in the task handoff.

**Interfaces:**
- Consumes: current Swiss FIDE search results, public competitor pages, existing GSC exports, and current Start French Now assets.
- Produces: evidence-backed explanation for MyLinguistics/test-fide.ch rankings and exact, non-implemented specifications for contextual linking, permit segmentation, and Swiss proof strengthening.

- [ ] **Step 1: Compare SERP intent, indexed footprint, domain history, content depth, structured data, internal linking, and Swiss/local trust signals.**
- [ ] **Step 2: Separate confirmed observations from backlink/traffic inferences that require paid data.**
- [ ] **Step 3: Define the deferred work page by page, including proposed placements, anchor types, evidence needed, and success metrics.**

---

### Task 5: Final verification

**Files:**
- Modify only if verification reveals a scoped defect.

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: fresh evidence for code, rendered pages, sitemap, and Sanity contents.

- [ ] **Step 1: Run unit tests**

Run: `node --test scripts/seo/*.test.mjs scripts/sanity/*.test.mjs`.

- [ ] **Step 2: Run static verification**

Run: `npm run typecheck` and `npm run lint:quiet`.

- [ ] **Step 3: Run a production build and rendered SEO audit**

Run: `npm run build`, start the production server, and run `BASE_URL=http://127.0.0.1:3100 node scripts/seo/check-priority-pages.mjs`.

- [ ] **Step 4: Reverify Sanity after all code checks**

Run: `node scripts/sanity/migrateFideLegacyLinks.mjs --verify`.

- [ ] **Step 5: Inspect the final diff without modifying unrelated user work**

Report changed files, Sanity backup location, mutation counts, verification results, competitor findings, and the three deferred specifications.
