# GEO Entity Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a stable, reusable entity graph for Start French Now and Yohann Coussot, connect commercial and editorial structured data to it, and expose complete BlogPosting authorship and freshness signals.

**Architecture:** Put all schema.org identifiers and graph builders in one framework-independent module so Node tests can exercise the real JSON-LD payloads. Render the site graph once from the locale root layout, reference its stable identifiers from Product and Service schemas, and build each BlogPosting from the localized Sanity post. Keep visible author and date presentation in a small server-rendered component.

**Tech Stack:** Next.js 16 App Router, React 18, next-intl, Sanity, schema.org JSON-LD, Node.js built-in test runner.

## Global Constraints

- Preserve all existing uncommitted user changes; make only targeted patches.
- Do not create a commit because several integration files already contain unrelated user work.
- Use `https://startfrenchnow.ch` as the default canonical origin, while honoring `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_BASE_URL` at runtime.
- Use stable identifiers ending in `#website`, `#organization`, and `/about#yohann-coussot`.
- Link only verified identity profiles: Udemy, YouTube, and LinkedIn.
- Escape `<` when serializing JSON-LD into script elements.
- Keep English as the unprefixed default locale and French under `/fr`.

---

### Task 1: Shared entity graph

**Files:**
- Create: `app/lib/seo/entityGraph.mjs`
- Create: `scripts/seo/entity-graph.test.mjs`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Produces: `getEntityIds(siteUrl)`, `buildSiteEntityGraph({ locale, siteUrl })`, and `serializeJsonLd(data)`.
- Consumed by: the root layout, commercial schemas, and BlogPosting builder.

- [x] **Step 1: Write the failing entity-graph tests**

  Test the stable absolute IDs, bilingual WebSite node, Organization publisher/founder relations, Person expertise and verified `sameAs` URLs, runtime origin normalization, and safe JSON-LD serialization.

- [x] **Step 2: Run the test to verify RED**

  Run: `node --test scripts/seo/entity-graph.test.mjs`

  Expected: FAIL because `app/lib/seo/entityGraph.mjs` does not exist.

- [x] **Step 3: Implement the minimal shared graph module**

  Return a schema.org `@graph` containing `WebSite`, `Organization`, and `Person`. Reference the organization from `WebSite.publisher`, the person from `Organization.founder`, and the organization from `Person.worksFor`.

- [x] **Step 4: Run the test to verify GREEN**

  Run: `node --test scripts/seo/entity-graph.test.mjs`

  Expected: all entity graph tests pass.

- [x] **Step 5: Render the graph once in the locale root layout**

  Import the builder and serializer into `app/[locale]/layout.tsx`, then emit one `<script type="application/ld+json">` inside `<head>` for every locale page.

### Task 2: Commercial entity references

**Files:**
- Modify: `app/[locale]/(sfn)/fide/mock-exams/page.tsx`
- Modify: `app/[locale]/(sfn)/fide/pack-fide/page.tsx`
- Modify: `app/[locale]/(sfn)/fide/private-courses/page.tsx`
- Modify: `scripts/seo/check-priority-pages.mjs`

**Interfaces:**
- Consumes: `getEntityIds(siteUrl)` from Task 1.
- Produces: Product `brand`/`seller` and Service `provider` references to the canonical organization node.

- [x] **Step 1: Add failing integration checks**

  Parse the priority-page JSON-LD and require every commercial schema to reference `https://startfrenchnow.ch#organization` rather than redeclaring an anonymous Organization or Brand.

- [x] **Step 2: Run the priority-page audit to verify RED**

  Run against the local production server with: `SEO_AUDIT_LOCALE=fr node scripts/seo/check-priority-pages.mjs`

  Expected: FAIL on the new organization-reference checks.

- [x] **Step 3: Replace inline seller/provider/brand declarations**

  Use `{ "@id": entityIds.organization }` in the three commercial schemas while preserving their current prices, URLs, availability, and localized text.

- [x] **Step 4: Re-run the audit to verify GREEN**

  Expected: the new commercial entity-reference checks pass.

### Task 3: BlogPosting structured data

**Files:**
- Modify: `app/lib/seo/entityGraph.mjs`
- Modify: `scripts/seo/entity-graph.test.mjs`
- Modify: `app/[locale]/(sfn)/blog/post/[slug]/page.tsx`

**Interfaces:**
- Produces: `buildBlogPostingJsonLd({ locale, slug, title, description, publishedAt, updatedAt, imageUrl, siteUrl })`.
- Consumes: stable Website, Organization, and Person IDs from Task 1.

- [x] **Step 1: Write failing BlogPosting tests**

  Require localized canonical URLs, `BlogPosting` type, headline, description, image, `datePublished`, `dateModified`, `inLanguage`, `mainEntityOfPage`, and `author`/`publisher` references.

- [x] **Step 2: Run the test to verify RED**

  Expected: FAIL because `buildBlogPostingJsonLd` is not exported.

- [x] **Step 3: Implement the builder and render it on article pages**

  Build the JSON-LD from the localized Sanity post, use the Sanity hero image when present, fall back to the FIDE social image, and serialize safely before rendering.

- [x] **Step 4: Run the test to verify GREEN**

  Expected: all entity and BlogPosting tests pass.

### Task 4: Visible authorship and freshness

**Files:**
- Create: `app/components/sfn/post/PostAuthorMeta.tsx`
- Modify: `app/components/sfn/post/PostContent.tsx`
- Modify: `app/components/sfn/post/Helper.tsx`

**Interfaces:**
- Produces: server-rendered author link plus semantic `<time>` elements for publication and material updates.
- Consumes: `publishedAt`, `_updatedAt`, and current locale from the localized post.

- [x] **Step 1: Add the author metadata component**

  Render “By/Par Yohann Coussot” linked to `/about`, a publication date, and an update date only when `_updatedAt` is later than `publishedAt` by at least one day.

- [x] **Step 2: Integrate it below the article title and remove duplicate date output**

  Keep the difficulty/help controls in `Helper`, but move all publication metadata into the new server-rendered component.

- [x] **Step 3: Run full verification**

  Run: `node --test scripts/seo/entity-graph.test.mjs scripts/seo/client-messages.test.mjs scripts/seo/link-locale.test.mjs`

  Run: `npm run typecheck`

  Run: `npm run lint:quiet`

  Run: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

  Inspect local HTML for the root entity graph, one FIDE BlogPosting, visible author/time elements, and canonical organization references on all three commercial pages.
