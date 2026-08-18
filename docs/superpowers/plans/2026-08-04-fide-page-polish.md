# FIDE Page Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish `/fide` across hierarchy, surfaces, interactions, responsive behavior, and accessibility without changing its content or incumbent visual identity.

**Architecture:** Keep the existing page composition and translation namespaces. Make narrowly scoped Tailwind and shared-style changes in the route components, use the rendered FR page as the behavioral boundary, and cover semantic regressions with a JSDOM integration test against the running Next.js page.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind CSS 3.4, next-intl, Framer Motion, Lucide, Node test runner, JSDOM.

## Global Constraints

- Preserve existing copy, routes, analytics attributes, SEO JSON-LD, Sanity queries, and FIDE brand colors.
- Preserve all unrelated dirty-worktree changes.
- Use existing Tailwind/Webflow conventions; add no styling dependency.
- Use Lucide icons with `currentColor`, accessible names, and 2px strokes beside semibold text.
- Use exact transition properties, 150ms interactive transitions, `scale(0.96)` press feedback, and reduced-motion fallbacks.
- Run the Impeccable detector once only, after all UI edits are complete.

---

### Task 1: Rendered-page accessibility contract

**Files:**
- Create: `scripts/style/fideInterface.test.mjs`
- Test: `scripts/style/fideInterface.test.mjs`

**Interfaces:**
- Consumes: a running FIDE page at `FIDE_TEST_URL` or `http://127.0.0.1:3000/fr/fide`.
- Produces: a Node test suite that validates semantic hero markup, lazy video controls, the PDF email label, and the consultation CTA in server-rendered HTML.

- [ ] **Step 1: Write the failing rendered-page tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const pageUrl = process.env.FIDE_TEST_URL ?? "http://127.0.0.1:3000/fr/fide";
const response = await fetch(pageUrl);
assert.equal(response.status, 200);
const document = new JSDOM(await response.text()).window.document;

test("the FIDE hero is a labelled section with one page heading", () => {
    const hero = document.querySelector("section#HeroFide");
    assert.ok(hero);
    assert.equal(document.querySelectorAll("h1").length, 1);
    assert.equal(hero.getAttribute("aria-labelledby"), "fide-page-title");
});

test("video previews name the play action and defer iframes", () => {
    const previews = [...document.querySelectorAll("button")].filter((button) => button.querySelector("[data-youtube-thumbnail]"));
    assert.ok(previews.length >= 4);
    assert.ok(previews.every((button) => button.getAttribute("aria-label")?.startsWith("Lire la vidéo")));
    assert.equal(document.querySelectorAll("iframe[src*='youtube']").length, 0);
});

test("the PDF field is labelled and the consultation CTA survives SSR", () => {
    assert.equal(document.querySelector("label[for='fide-pdf-email']")?.textContent?.trim(), "Votre adresse e-mail");
    assert.ok([...document.querySelectorAll("button")].some((button) => button.textContent?.trim() === "Consultation gratuite"));
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `node --test scripts/style/fideInterface.test.mjs`

Expected: failures for the hero landmark, localized play action, PDF label, and consultation CTA.

### Task 2: Page shell and hero hierarchy

**Files:**
- Modify: `app/[locale]/(sfn)/fide/page.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/FidePageHeroSection.tsx`
- Modify: `app/styles/globals.css`

**Interfaces:**
- Consumes: existing `Fide.FidePageHero` translations and shared theme variables.
- Produces: a scoped `fide-page` surface and a semantic hero with tactile anchors and outlined imagery.

- [ ] **Step 1: Implement the minimal shell and hero changes**

```tsx
<div className="fide-page w-full mb-24">
<section id="HeroFide" aria-labelledby="fide-page-title" ...>
<h1 id="fide-page-title" className="display-1 ...">...</h1>
<a className="... transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.96]">...</a>
<Image className="fide-image-outline rounded-2xl outline outline-1 -outline-offset-1 outline-black/10 ..." ... />
```

Add scoped balanced headings, pretty short copy, focus-visible rings, and dark-mode image outlines to `globals.css`.

- [ ] **Step 2: Keep the test RED only for the remaining tasks**

Run: `node --test scripts/style/fideInterface.test.mjs`

Expected: hero test passes; play-action and form tests still fail.

### Task 3: Video, exam, and tips interaction polish

**Files:**
- Modify: `app/[locale]/(sfn)/fide/components/FideLiteYoutubeEmbed.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/FideStickyScrollReveal.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/FidePageStickyExamsSection.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/FidePageTipsSection.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/FidePageOverviewSection.tsx`

**Interfaces:**
- Consumes: video `id` and translated `title`; existing sticky item objects.
- Produces: localized play names, a Lucide play icon, stable readable sticky content, structural 1px dividers, and non-justified copy.

- [ ] **Step 1: Implement localized video controls**

```tsx
const locale = useLocale();
const playAction = locale === "fr" ? "Lire la vidéo" : "Play video";
<button aria-label={`${playAction} : ${title}`} className="... active:scale-[0.96]">
  <Play aria-hidden="true" className="ml-0.5 size-8" fill="currentColor" strokeWidth={2.5} />
</button>
```

- [ ] **Step 2: Replace disruptive emphasis with static readable cues**

Keep sticky text at full opacity, use a 1px active divider, preserve the reduced-motion media transition, replace `text-justify` with left-aligned pretty text, and replace 4px colored side bars with structural top or 1px dividers.

- [ ] **Step 3: Run tests to verify only the form contract remains RED**

Run: `node --test scripts/style/fideInterface.test.mjs`

Expected: hero and video tests pass; form test fails.

### Task 4: Preparation cards and form states

**Files:**
- Modify: `app/[locale]/(sfn)/fide/components/FidePageHubSection.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/AskForPdf.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/BookFirstMeeting.tsx`
- Modify: `app/[locale]/(sfn)/fide/components/FidePermitPathSection.tsx`

**Interfaces:**
- Consumes: existing card translations, PDF form messages, Calendly modal props, and permit-level content.
- Produces: tactile elevated cards, a labelled busy-aware form, and an SSR-stable consultation button.

- [ ] **Step 1: Polish hub and permit interactions**

Use layered shadow tokens instead of decorative borders, concentric image radii, pure black/white image outlines, exact 150ms transitions, `active:scale-[0.96]`, hidden decorative icons, and stable level numerals.

- [ ] **Step 2: Implement accessible PDF form states**

```tsx
<label htmlFor="fide-pdf-email" className="sr-only">{messages.emailPlaceholder}</label>
<input id="fide-pdf-email" ... />
<button type="submit" disabled={pending} aria-busy={pending}>...</button>
<p role="status">...</p>
<p role="alert">...</p>
```

Reset stale error state on resubmit and prevent duplicate submissions while pending.

- [ ] **Step 3: Keep the consultation button in SSR HTML**

Render the trigger regardless of `rootElement`; render `TrackedCalendlyPopupModal` only after its portal root exists.

- [ ] **Step 4: Run the complete integration suite GREEN**

Run: `node --test scripts/style/fideInterface.test.mjs`

Expected: all tests pass.

### Task 5: Verification and delivery

**Files:**
- Verify all changed files above.

**Interfaces:**
- Consumes: completed implementation and tests.
- Produces: verified production-ready changes and a full review report.

- [ ] **Step 1: Run the one allowed Impeccable detector pass**

Run: `node /home/nicou/.agents/skills/impeccable/scripts/detect.mjs --json <changed-targets>`

Expected: `[]` or documented actionable findings fixed in one batch.

- [ ] **Step 2: Run automated verification**

Run:

```bash
node --test scripts/style/fideInterface.test.mjs
npx eslint <changed TypeScript files>
NODE_OPTIONS=--max-old-space-size=4096 npm run typecheck
git diff --check
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

Expected: zero test failures, zero lint/type errors, clean diff, and build exit code 0.

- [ ] **Step 3: Verify rendered FR and EN HTML**

Fetch `/fr/fide` and `/fide`; verify HTTP 200, one `h1`, labelled video buttons, no initial YouTube iframes, and no nested interactive elements.

- [ ] **Step 4: Report browser limitation honestly**

If the in-app browser still rejects the WSL workspace path, mark desktop/mobile screenshots and 10%-speed motion inspection **Not verified** and keep the verdict at `Needs changes` solely for those unperformed checks.

