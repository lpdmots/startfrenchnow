# FIDE Student Reviews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Paula, Selahattin, Murat, Javier, and Jessica to every commercial FIDE review surface, keep Paula first, associate each supplied result image with the correct review, and prevent avatars from rendering as ovals.

**Architecture:** Continue using `sharedFideReviews` as the single source consumed by the FIDE, Pack FIDE, private-course, mock-exam, and homepage review surfaces. Add a small tested ordering helper that pins featured reviews before date sorting, and a shared fixed-square avatar wrapper that clips every avatar to a true circle. Store optimized student assets under `public/images/fide/reviews` and allow root-relative certificate/result URLs alongside existing CloudFront keys.

**Tech Stack:** Next.js 16, React 18, TypeScript, next/image, Tailwind CSS, Node test runner, Sharp.

## Global Constraints

- Preserve all unrelated local work already present in the dirty worktree.
- Publish the supplied result images without masking personal information, per the user's instruction.
- Paula must appear first even when newer dated reviews exist.
- New students without photos use existing avatar artwork; duplicates are allowed.
- Do not commit or push changes unless the user requests it.

---

### Task 1: Protect review ordering and avatar geometry

**Files:**
- Create: `scripts/reviews/fide-reviews.test.mjs`
- Create: `app/lib/fideReviews.mjs`
- Create: `app/components/common/ReviewAvatar.mjs`
- Modify: `app/[locale]/(sfn)/fide/components/ReviewsFide.tsx`
- Modify: `app/[locale]/(sfn)/fide/mock-exams/components/DeferredMockExamsReviewsCarousel.tsx`
- Modify: `app/components/sfn/home/MarqueeSocial.tsx`
- Modify: `app/components/common/CarouselReviews.tsx/CarouselReviews.tsx`

**Interfaces:**
- Produces: `sortFideReviews<T extends { featured?: boolean; date?: number }>(reviews: T[]): T[]`.
- Produces: `ReviewAvatar({ children, compact? })`, a fixed-square circular clipping wrapper.

- [ ] **Step 1: Write the failing behavioral tests**

```js
test("featured reviews stay ahead of newer dated reviews", () => {
    assert.deepEqual(sortFideReviews([
        { userName: "Newer", date: 2 },
        { userName: "Featured", date: 1, featured: true },
    ]).map(({ userName }) => userName), ["Featured", "Newer"]);
});

test("review avatars render with equal width and height and circular clipping", () => {
    const markup = renderToStaticMarkup(React.createElement(ReviewAvatar, null, "avatar"));
    assert.match(markup, /h-\[100px\]/);
    assert.match(markup, /w-\[100px\]/);
    assert.match(markup, /rounded-full/);
    assert.match(markup, /overflow-hidden/);
});
```

- [ ] **Step 2: Run the test and confirm it fails because both modules are missing**

Run: `node --test scripts/reviews/fide-reviews.test.mjs`
Expected: FAIL stating that `sortFideReviews` and `ReviewAvatar` are not implemented.

- [ ] **Step 3: Implement the minimal ordering helper and avatar wrapper**

```js
export function sortFideReviews(reviews) {
    return [...reviews].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (b.date ?? 0) - (a.date ?? 0));
}
```

Render avatars through a `100px × 100px`, `shrink-0`, `rounded-full`, `overflow-hidden` wrapper and use `56px`/`64px` square variants in the homepage cards and modal.

- [ ] **Step 4: Replace the duplicated date-only sorts and direct avatar output**

Use `sortFideReviews(sharedFideReviews)` everywhere the shared list is presented. Wrap `userImage` with `ReviewAvatar` in both carousel and marquee rendering paths.

- [ ] **Step 5: Run the focused tests**

Run: `node --test scripts/reviews/fide-reviews.test.mjs`
Expected: PASS.

### Task 2: Add the five testimonials and their assets

**Files:**
- Create: `public/images/fide/reviews/paula.webp`
- Create: `public/images/fide/reviews/javier-result.webp`
- Create: `public/images/fide/reviews/murat-result.webp`
- Create: `public/images/fide/reviews/selahattin-result.webp`
- Modify: `app/[locale]/(sfn)/fide/components/ReviewsFide.tsx`
- Modify: `app/components/sfn/home/MarqueeSocial.tsx`

**Interfaces:**
- Extends: `SharedFideReview` with `featured?: boolean`.
- Consumes: root-relative `certificat` values such as `/images/fide/reviews/javier-result.webp`.

- [ ] **Step 1: Extend the failing review-data test**

Add hand-checked fixtures for the five names, dates, scores, featured state, and result paths. Assert that each public asset exists and that root-relative certificate URLs remain root-relative.

- [ ] **Step 2: Run the test and confirm missing records/assets fail**

Run: `node --test scripts/reviews/fide-reviews.test.mjs`
Expected: FAIL for the absent review records or assets.

- [ ] **Step 3: Generate optimized web assets from the four supplied images**

Use Sharp to apply EXIF orientation, cap width at 1800 pixels without enlargement, and encode WebP at quality 82. Do not crop, mask, or alter visible personal details.

- [ ] **Step 4: Add the reviews to the shared list**

Add Paula as `featured: true`, `score: 100`, and reuse her supplied photo for both avatar and result. Add the full or extended testimonial text in `modalComment` where the card excerpt is shortened. Use existing male/female avatar assets for Selahattin, Murat, Javier, and Jessica.

- [ ] **Step 5: Support local result links**

Return `certificat` unchanged when it begins with `/`; continue prefixing legacy relative CloudFront keys.

- [ ] **Step 6: Run the focused tests**

Run: `node --test scripts/reviews/fide-reviews.test.mjs`
Expected: PASS.

### Task 3: Verify the integrated commercial review surfaces

**Files:**
- Modify only if verification finds a concrete defect.

**Interfaces:**
- Consumes: the completed shared review list and UI wrappers from Tasks 1–2.
- Produces: verified desktop and mobile review presentation.

- [ ] **Step 1: Run static verification**

Run: `npm run typecheck`
Expected: exit 0.

Run: `npx eslint 'app/[locale]/(sfn)/fide/components/ReviewsFide.tsx' 'app/[locale]/(sfn)/fide/mock-exams/components/DeferredMockExamsReviewsCarousel.tsx' 'app/components/common/CarouselReviews.tsx/CarouselReviews.tsx' 'app/components/sfn/home/MarqueeSocial.tsx' 'app/lib/fideReviews.mjs' 'app/components/common/ReviewAvatar.mjs' 'scripts/reviews/fide-reviews.test.mjs'`
Expected: exit 0.

- [ ] **Step 2: Run the UI detector once**

Run: `node /home/nicou/.agents/skills/impeccable/scripts/detect.mjs --json app/components/common/CarouselReviews.tsx/CarouselReviews.tsx app/components/sfn/home/MarqueeSocial.tsx app/[locale]/(sfn)/fide/components/ReviewsFide.tsx`
Expected: no new actionable defect related to the changed UI.

- [ ] **Step 3: Inspect a production render at desktop and mobile widths**

Verify that Paula is first, Orkun and Wendy M. are circular, every new avatar remains circular, long comments fit or open fully, and local result links resolve.

- [ ] **Step 4: Review the final diff**

Confirm the diff contains only the plan, focused tests, helper components, five review records, four optimized assets, and the narrow presentation fixes. Preserve the pre-existing Rita thumbnail modification.
