# About Page Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/about` as a bilingual trust-and-identity page that keeps its personal tone and incumbent Start French Now design while exposing verified professional experience and fully localizing the hobbies section.

**Architecture:** Keep the route and current visual vocabulary, split the professional proof into a focused component, and drive all visible copy through `next-intl`. Protect the page contract with a real rendered-HTML integration test for both locales, including the intentional French H1 on the English page.

**Tech Stack:** Next.js 16 App Router, React, next-intl, Tailwind utility classes, JSDOM, Node.js test runner.

## Global Constraints

- Keep “Enchanté, moi c’est Yohann” in French on both locale versions as an intentional language-learning reference.
- Use only facts already present on the homepage, FIDE trainer section, private-course pages, existing biography, or existing social links.
- Do not add new qualifications, employers, learner outcomes, locations, testimonials, or follower counts.
- Preserve the incumbent Poppins typography, thick dark borders, rounded image treatments, secondary color palette, and existing motion components.
- Keep the page personal; professional proof supports trust and GEO entity consistency rather than hard-selling.
- Preserve unrelated dirty-worktree changes, especially existing dictionary edits, and do not commit.

---

### Task 1: Rendered page contract

**Files:**
- Create: `scripts/seo/about-page.integration.test.mjs`

**Interfaces:**
- Consumes: rendered `/about` and `/fr/about` HTML from a local Next.js server.
- Produces: regression coverage for the intentional H1, professional proof, localized hobbies, social identities, and localized FIDE link.

- [x] **Step 1: Write the failing integration test**

  Assert that both locales retain the French H1; that a `[data-about-proof]` section exposes the existing 16-year, 8-year, 300+, 98%, and 60,000 facts; that Instagram, TikTok, YouTube, and Udemy are visible links; and that English hobby titles are genuinely English.

- [x] **Step 2: Run the test to verify RED**

  Run: `BASE_URL=http://127.0.0.1:3000 node --test scripts/seo/about-page.integration.test.mjs`

  Expected: FAIL because the professional proof section does not exist and the English hobbies are still French.

### Task 2: Professional identity block

**Files:**
- Create: `app/components/sfn/about/AboutProfessionalProof.tsx`
- Modify: `app/[locale]/(sfn)/about/page.tsx`
- Modify: `app/dictionaries/fr.json`
- Modify: `app/dictionaries/en.json`

**Interfaces:**
- Consumes: `About.professional` translations and existing social profile URLs.
- Produces: a server-rendered `[data-about-proof]` section with verified experience markers, a concise biography, social links, and a soft link to the FIDE preparation page.

- [x] **Step 1: Add bilingual copy using only existing claims**

  Reuse these facts exactly: more than 16 years teaching French as a foreign language, more than 8 years preparing learners for FIDE, more than 300 learners prepared, 98% success rate, and more than 60,000 learners on Udemy.

- [x] **Step 2: Build the proof component in the incumbent visual language**

  Use a dark full-width section, restrained colored proof markers, one real Yohann image, semantic headings, and accessible external links. Avoid sales pricing, testimonials, invented certifications, and new performance claims.

- [x] **Step 3: Integrate it between the hero and personal story**

  Keep the French H1 unchanged, retain the current hero illustration assets, and make the professional block the bridge from identity to story.

### Task 3: Fully localized, compact hobbies

**Files:**
- Modify: `app/components/sfn/about/Hobbies.tsx`
- Modify: `app/dictionaries/fr.json`
- Modify: `app/dictionaries/en.json`

**Interfaces:**
- Consumes: `About.Hobbies.items.<key>.title` and `.description` for seven existing hobbies.
- Produces: a responsive `[data-about-hobbies]` section with the same seven facts in both languages.

- [x] **Step 1: Move the existing French hobby text into translations**

  Keep Languages, Travel, Running, Mountains, Series & Films, Croissants, and Going out without changing their factual content.

- [x] **Step 2: Add faithful English translations**

  Translate the existing text rather than summarizing it into new claims. Keep first-person voice and the current playful tone.

- [x] **Step 3: Rebuild the layout as a responsive card grid**

  Reuse the current icons, borders, neutral and secondary backgrounds, and motion components. Use two columns only where content width permits and one column on mobile.

### Task 4: Metadata and visual verification

**Files:**
- Modify: `app/dictionaries/fr.json`
- Modify: `app/dictionaries/en.json`
- Test: `scripts/seo/about-page.integration.test.mjs`

**Interfaces:**
- Consumes: existing `Metadata.About` namespace.
- Produces: factual metadata aligned with the page and verified visual output at desktop/mobile widths.

- [x] **Step 1: Replace unsupported “global expert” metadata**

  Use Yohann Coussot’s name, French-teacher role, FIDE preparation specialization, and existing experience facts without superlatives.

- [x] **Step 2: Run the integration test to verify GREEN**

  Run: `BASE_URL=http://127.0.0.1:3000 node --test scripts/seo/about-page.integration.test.mjs`

  Expected: both locale tests pass.

- [x] **Step 3: Inspect one desktop and one mobile render**

  Capture `/fr/about` and `/about` at desktop and mobile widths in one bounded browser pass. Check hierarchy, overflow, localized wrapping, focus order, touch targets, and image rendering; apply one batched correction pass if needed.

- [x] **Step 4: Run final verification**

  Run: `NODE_OPTIONS=--max-old-space-size=4096 npm run typecheck`

  Run: `npm run lint:quiet`

  Run: `node --test scripts/seo/entity-graph.test.mjs`

  Run: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

  Run the Impeccable detector once over the changed UI targets and resolve material findings.
