# SEO and Mobile Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the five priority FIDE landing pages by fixing their SEO signals, reducing mobile loading and layout work, and producing a reproducible before/after Lighthouse comparison without adding redirects for mistyped URLs.

**Architecture:** Preserve the existing Next.js App Router and `next-intl` routing. Validate public behavior with a Node integration audit against a production build, optimize display assets without changing social-preview compatibility, and reduce the root client translation payload to the namespaces reachable from client boundaries. Keep the consent and GTM architecture intact unless a duplicate injector is demonstrated in source.

**Tech Stack:** Next.js 16, React 18, TypeScript, next-intl, next/image, next/font, Sharp, Node test/assert, Lighthouse mobile.

## Global Constraints

- Do not add redirects for `/fide/pack-exam` or `/fide/mock-exam`; those URLs were user typing mistakes.
- Preserve the current canonical URLs `/fide/pack-fide` and `/fide/mock-exams` and their French equivalents.
- Use a single, consistent 98% success-rate claim in English and French.
- Do not remove or delay analytics, ads, consent, or Clarity unless a duplicate loader is proven in the repository.
- Preserve Open Graph PNG/JPEG images for crawler compatibility even when browser-facing assets use AVIF/WebP.
- Preserve locale switching; remove only explicit same-locale link props that force `/en/` redirect hops.
- Do not modify unrelated application behavior or product pricing.

---

### Task 1: Establish reproducible SEO and performance baselines

**Files:**
- Create: `scripts/seo/check-priority-pages.mjs`
- Generated only: `/tmp/sfn-lighthouse-before/*.json`

**Interfaces:**
- Consumes: a running production server through `BASE_URL` (default `http://127.0.0.1:3100`).
- Produces: a non-zero exit when priority-page HTML violates agreed SEO behavior; Lighthouse JSON baselines for the five canonical pages.

- [ ] **Step 1: Write the failing integration audit**

```js
const expected = {
  "/": {title: "Swiss FIDE Test Prep (A1–B1) | Start French Now"},
  "/fide": {title: "Swiss FIDE Test: Complete A1–B1 Guide | Start French Now"},
  "/fide/pack-fide": {title: "FIDE Exam Pack A1–B1 | Start French Now"},
  "/fide/mock-exams": {title: "Online FIDE Mock Exam A1–B1 | Start French Now"},
  "/fide/private-courses": {title: "Online Private FIDE Lessons A1–B1 | Start French Now"}
};
```

For each page, fetch the real HTML and assert status 200, the expected title, exactly one `<h1>`, no internal `href="/en/…"`, and a bounded document size. Additionally assert homepage Open Graph/Twitter tags, absence of known French guide titles on English `/fide`, locale-correct French checkout structured-data URL, and unique sitemap `<loc>` values.

- [ ] **Step 2: Run the integration audit against the unmodified production build**

Run: `BASE_URL=http://127.0.0.1:3100 node scripts/seo/check-priority-pages.mjs`

Expected: FAIL on the new title, H1, social metadata, `/en/` links, English guide localization, French checkout, or sitemap uniqueness assertions.

- [ ] **Step 3: Capture the mobile Lighthouse baseline**

Run one Lighthouse mobile report for `/`, `/fide`, `/fide/pack-fide`, `/fide/mock-exams`, and `/fide/private-courses`, saving JSON under `/tmp/sfn-lighthouse-before` and recording Performance, LCP, TBT, CLS, DOM size, and transfer size.

---

### Task 2: Correct titles, social metadata, proof claims, structured data, guide language, sitemap, and headings

**Files:**
- Modify: `app/dictionaries/en.json`
- Modify: `app/dictionaries/fr.json`
- Modify: `app/[locale]/(sfn)/page.tsx`
- Modify: `app/[locale]/(sfn)/fide/page.tsx`
- Modify: `app/[locale]/(sfn)/fide/mock-exams/page.tsx`
- Modify: `app/components/ui/typing-animation.tsx`
- Modify: `app/components/sfn/courses/FideCourseRatings.tsx`
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: existing translation namespaces and canonical route conventions.
- Produces: unique concise metadata, one semantic H1 per target page, English guide cards, locale-correct offer URL, consistent 98% proof, and a URL-unique sitemap.

- [ ] **Step 1: Run the failing audit assertions for this task**

Run: `BASE_URL=http://127.0.0.1:3100 node scripts/seo/check-priority-pages.mjs`

Expected: FAIL for at least one Task 2 assertion.

- [ ] **Step 2: Update metadata translations and homepage social metadata**

Use the approved concise titles. Add homepage Open Graph and Twitter cards using the current homepage hero/social PNG, canonical URL, locale, and translated description.

- [ ] **Step 3: Make decorative typing text non-heading content**

Change `TypingAnimation` to render a `<p>` by default with an optional semantic `as` prop only if a future caller explicitly needs another tag. Existing page heroes remain the only H1 elements.

- [ ] **Step 4: Normalize success proof to 98%**

Render 98 in the circular progress component, localize its label, update “close to 100%” copy to 98%, and render the learner count’s final value in initial HTML so crawlers do not see `0+`.

- [ ] **Step 5: Localize the known English FIDE guide cards**

Map the six curated French Sanity slugs to English titles and English descriptions while preserving their existing URLs, images, ordering, and French content on `/fr/fide`.

- [ ] **Step 6: Correct the French mock-exam checkout URL**

Build both `callbackPath` and `checkoutPath` with the active locale so the French Product/Offer URL begins with `/fr/checkout/` and returns to `/fr/fide/mock-exams`.

- [ ] **Step 7: Deduplicate sitemap entries by URL**

At the sitemap boundary, retain one entry per URL and keep the newest `lastModified` value when duplicate dynamic sources emit the same URL.

- [ ] **Step 8: Build and run the audit**

Run: `npm run typecheck`, `npm run lint:quiet`, `npm run build`, then rerun the integration audit against the production server.

Expected: all Task 2 assertions PASS.

---

### Task 3: Remove English locale redirect hops from internal navigation

**Files:**
- Modify: `app/components/common/PrimaryNavItem.tsx`
- Modify: `app/components/common/Burger.tsx`
- Modify: `app/components/common/NavMenuLink.tsx`
- Modify: `app/components/common/LinkCurrentBlog.tsx`
- Modify: `app/components/common/ClientSideRoute.tsx`
- Modify call sites only where obsolete locale props cause lint/type errors.

**Interfaces:**
- Consumes: `createNavigation` with `localePrefix: "as-needed"`.
- Produces: English links such as `/fide` and French links such as `/fr/fide` without forcing the current locale into the URL.

- [ ] **Step 1: Verify the redirect-hop assertion fails**

Run the integration audit against English `/`; expected FAIL because rendered internal links contain `/en/`.

- [ ] **Step 2: Remove explicit current-locale props from ordinary links**

Allow next-intl to infer the current locale. Keep explicit locale only in the actual locale-switching control.

- [ ] **Step 3: Verify both languages**

Assert English target pages have no `/en/` internal links and French target pages retain `/fr/` for localized navigation.

---

### Task 4: Optimize fonts, images, hero geometry, and responsive DOM

**Files:**
- Create: `public/images/fide-presentation-thumbnail.webp`
- Create: `public/images/rita-thumbnail.webp`
- Create: `public/images/hero-fide4.avif`
- Create: `public/images/pack-fide-hero-5.avif`
- Create: `public/images/mock-exam-hero.avif`
- Create: `public/images/etudiante-cours.avif`
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/global-not-found.tsx`
- Modify: `app/styles/globals.css`
- Modify display references to the optimized assets.
- Modify: `app/[locale]/(sfn)/fide/pack-fide/components/HeroPackFide.tsx`
- Modify: `app/[locale]/(sfn)/fide/mock-exams/components/HeroMockExams.tsx`
- Modify: `app/[locale]/(sfn)/fide/private-courses/components/HeroPrivateCourses.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/ReviewsFide.tsx`
- Modify: `app/components/sfn/home/HeroSfn.tsx`

**Interfaces:**
- Consumes: the existing visual assets and responsive layouts.
- Produces: self-hosted Poppins through `next/font`, substantially smaller display assets, correct intrinsic image ratios, eager/high-priority active LCP images, and one responsive DOM structure for each duplicated hero.

- [ ] **Step 1: Convert and visually verify assets**

Use Sharp with AVIF quality 58 for transparent illustrations, WebP quality 76 for video posters, and resize Rita’s 2571×4570 poster to 600 px wide. Compare decoded previews with the originals before adding them.

- [ ] **Step 2: Replace fontsource imports with next/font**

Configure Poppins weights 400, 500, 600, and 700, subsets `latin`, display `swap`, and CSS variable `--font-poppins`; apply the variable to both localized and global-not-found HTML roots.

- [ ] **Step 3: Correct intrinsic geometry and reserve CTA height**

Use the real Pack hero ratio 1147×614, explicit aspect-ratio/min-height wrappers where needed, and stable button-row dimensions across breakpoints.

- [ ] **Step 4: Use one responsive hero image and card list**

For Mock Exams, render a single image component that moves through CSS grid rather than separate hidden mobile/desktop images. For Private Courses, render one image and map one card array into a responsive grid, preserving the existing desktop transforms only at large breakpoints.

- [ ] **Step 5: Preload only active LCP assets**

Mark the single Mock and Private hero images `priority`/high priority. Do not preload hidden variants or below-the-fold images.

- [ ] **Step 6: Build and visually inspect mobile and desktop routes**

Inspect `/`, `/fide/pack-fide`, `/fide/mock-exams`, and `/fide/private-courses` at mobile and desktop widths; verify no overlapping, missing, or distorted content.

---

### Task 5: Reduce root client translation payload without breaking routes

**Files:**
- Create: `app/lib/i18n/clientMessages.ts`
- Modify: `app/[locale]/layout.tsx`
- Modify deferred providers only if they unnecessarily reserialize the entire selected object.
- Test through: `scripts/seo/check-priority-pages.mjs`

**Interfaces:**
- Consumes: full server dictionaries for `getTranslations` and a statically audited list of namespaces reachable from client module boundaries.
- Produces: a minimal nested messages object for `NextIntlClientProvider`; server translations remain complete.

- [ ] **Step 1: Add a failing serialized-payload assertion**

Set a generous maximum HTML size based on the observed pre-change baseline but low enough to fail while complete dictionaries are embedded.

- [ ] **Step 2: Implement nested namespace selection**

Select `Navigation`, `NotificationsMenu`, `ExercisesPage`, `HomeRitaVideo`, `CommentsCarousel`, `BlogHelpCta`, `BlogContactCta`, `OfficialFideSourceNotice`, and the client-reachable `Fide` subtrees. Keep checkout’s existing nested provider responsible for checkout-only root messages.

- [ ] **Step 3: Verify translations on target and representative non-target routes**

Run the production build and request English/French target routes plus checkout, exercises, a course route, and a logged-out account route. Browser console must contain no missing-message errors.

- [ ] **Step 4: Compare serialized HTML sizes**

Record before/after uncompressed HTML byte counts for all priority routes.

---

### Task 6: Validate, benchmark, and review

**Files:**
- Modify only if verification or code review identifies a concrete issue.
- Generated only: `/tmp/sfn-lighthouse-after/*.json`

**Interfaces:**
- Consumes: completed implementation and Task 1 baseline.
- Produces: fresh test evidence, Lighthouse comparison, and a reviewed handoff.

- [ ] **Step 1: Run complete static verification**

Run: `npm run typecheck`, `npm run lint`, and `npm run build`.

- [ ] **Step 2: Run real-page integration verification**

Start the production server and run `BASE_URL=http://127.0.0.1:3100 node scripts/seo/check-priority-pages.mjs`.

- [ ] **Step 3: Capture after Lighthouse measurements**

Use the same Lighthouse version, mobile preset, port, and page order as the baseline. Run three measurements per route when practical and compare medians; otherwise clearly label single-run variability.

- [ ] **Step 4: Review tracking network behavior**

Confirm one GTM bootstrap in source and one GTM container request per page load. Do not classify GA4 and Ads requests emitted by the container as duplicate loaders.

- [ ] **Step 5: Request an independent code review**

Provide the reviewer with this plan, the base commit, and the full working-tree diff. Fix all Critical and Important findings, then repeat relevant verification.

- [ ] **Step 6: Report results and analytics access options**

Report exact before/after Performance, LCP, TBT, CLS, transfer, DOM, HTML size, image-byte savings, and remaining risks. Explain that Google Search Console access or exports are the priority for queries, pages, indexing, and field Core Web Vitals; GA4 access or exports complement this with landing-page engagement and conversions.
