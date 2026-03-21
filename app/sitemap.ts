// app/sitemap.ts
import type { MetadataRoute } from "next";
import { client } from "@/app/lib/sanity.client";
import { BLOGCATEGORIES } from "@/app/lib/constantes";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");

function abs(path: string) {
    return `${SITE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function withLocales(path: string) {
    // EN (default) = /..., FR = /fr/...
    const en = path === "/" ? "/" : path;
    const fr = path === "/" ? "/fr" : `/fr${path}`;
    return [en, fr];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1) Pages “publiques” stables
    const staticPaths = [
        "/", // home
        "/fide",
        "/fide/mock-exams",
        "/fide/exams",
        "/fide/videos",
        "/blog",
        "/stories",
        "/contact",
        "/about",
        "/courses/beginners",
        "/courses/intermediates",
        "/courses/dialogues",
        "/courses/past-tenses",
        "/exercises",
        "/test-your-level",
        "/videos",
    ];

    const entries: MetadataRoute.Sitemap = [];

    for (const p of staticPaths) {
        for (const loc of withLocales(p)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(),
            });
        }
    }

    // 2) /blog/category/[slug] depuis BLOGCATEGORIES (sans fetch)
    for (const cat of BLOGCATEGORIES) {
        const path = `/blog/category/${cat}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(),
            });
        }
    }

    // 3) /blog/post/[slug]
    // -> tous les posts qui ont AU MOINS une catégorie dans BLOGCATEGORIES sauf "fide"
    // -> si un post a ["fide", "tips"], il est gardé (car il a "tips")
    const blogCatsNoFide = BLOGCATEGORIES.filter((c) => c !== "fide");

    const blogPosts: { slug: string; updatedAt: string }[] = await client.fetch(
        `*[
        _type == "post"
        && defined(slug.current)
        && !(_id in path("drafts.**"))
        && count(categories[@ in $blogCats]) > 0
      ]{
        "slug": slug.current,
        "updatedAt": coalesce(_updatedAt, _createdAt)
      }`,
        { blogCats: blogCatsNoFide },
    );

    for (const p of blogPosts) {
        const path = `/blog/post/${p.slug}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(p.updatedAt),
            });
        }
    }

    // 4) /courses/beginners/[slug] : catégorie "udemy_course_beginner"
    const beginnerPosts: { slug: string; updatedAt: string }[] = await client.fetch(
        `*[
        _type == "post"
        && defined(slug.current)
        && !(_id in path("drafts.**"))
        && "udemy_course_beginner" in categories
      ]{
        "slug": slug.current,
        "updatedAt": coalesce(_updatedAt, _createdAt)
      }`,
    );

    for (const p of beginnerPosts) {
        const path = `/courses/beginners/${p.slug}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(p.updatedAt),
            });
        }
    }

    // 4.b) /courses/intermediates/[slug] : catégorie "udemy_course_intermediate"
    const intermediatePosts: { slug: string; updatedAt: string }[] = await client.fetch(
        `*[
        _type == "post"
        && defined(slug.current)
        && !(_id in path("drafts.**"))
        && "udemy_course_intermediate" in categories
      ]{
        "slug": slug.current,
        "updatedAt": coalesce(_updatedAt, _createdAt)
      }`,
    );

    for (const p of intermediatePosts) {
        const path = `/courses/intermediates/${p.slug}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(p.updatedAt),
            });
        }
    }

    // 4.c) /courses/dialogues/[slug] : catégorie "udemy_course_dialogs"
    const dialoguesPosts: { slug: string; updatedAt: string }[] = await client.fetch(
        `*[
        _type == "post"
        && defined(slug.current)
        && !(_id in path("drafts.**"))
        && "udemy_course_dialogs" in categories
      ]{
        "slug": slug.current,
        "updatedAt": coalesce(_updatedAt, _createdAt)
      }`,
    );

    for (const p of dialoguesPosts) {
        const path = `/courses/dialogues/${p.slug}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(p.updatedAt),
            });
        }
    }

    // 5) /fide/scenarios/[slug] et /fide/videos/[slug] depuis les productPackage
    async function getPackagePostSlugs(referenceKey: string, options?: { onlyPreview?: boolean }): Promise<{ slug: string; updatedAt: string }[]> {
        const pkg: {
            modules?: {
                posts?: { slug?: string; updatedAt?: string; _id?: string; isPreview?: boolean }[];
            }[];
        } | null = await client.fetch(
            `*[_type == "productPackage" && referenceKey == $referenceKey][0]{
          modules[]{
            "posts": posts[]->{
              "slug": slug.current,
              "updatedAt": coalesce(_updatedAt, _createdAt),
              "_id": _id,
              "isPreview": coalesce(isPreview, false)
            }
          }
        }`,
            { referenceKey },
        );

        // dédoublonnage + date la plus récente
        const bestBySlug = new Map<string, string>();

        for (const m of pkg?.modules ?? []) {
            for (const p of m.posts ?? []) {
                if (!p?.slug) continue;
                if (p._id?.startsWith("drafts.")) continue;
                if (options?.onlyPreview && !p.isPreview) continue;
                const updatedAt = p.updatedAt || new Date().toISOString();

                const prev = bestBySlug.get(p.slug);
                if (!prev || new Date(updatedAt).getTime() > new Date(prev).getTime()) {
                    bestBySlug.set(p.slug, updatedAt);
                }
            }
        }

        return Array.from(bestBySlug.entries()).map(([slug, updatedAt]) => ({ slug, updatedAt }));
    }

    // /fide/scenarios/[slug]
    const scenarioPosts = await getPackagePostSlugs("pack_fide_scenarios", { onlyPreview: true });
    for (const p of scenarioPosts) {
        const path = `/fide/scenarios/${p.slug}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(p.updatedAt),
            });
        }
    }

    // /fide/videos/[slug]
    const videoPosts = await getPackagePostSlugs("pack_fide", { onlyPreview: true });
    for (const p of videoPosts) {
        const path = `/fide/videos/${p.slug}`;
        for (const loc of withLocales(path)) {
            entries.push({
                url: abs(loc),
                lastModified: new Date(p.updatedAt),
            });
        }
    }

    return entries;
}
