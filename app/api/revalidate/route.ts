import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BLOGCATEGORIES } from "@/app/lib/constantes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SanityWebhookPayload = {
    _id?: string;
    _type?: string;
    slug?: string | { current?: string };
    categories?: string[];
    document?: {
        _id?: string;
        _type?: string;
        slug?: string | { current?: string };
        categories?: string[];
    };
};

function getSecret(request: NextRequest) {
    return request.nextUrl.searchParams.get("secret") || request.headers.get("x-webhook-secret");
}

function getSlug(payload: SanityWebhookPayload): string | undefined {
    const value = payload.slug ?? payload.document?.slug;
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value.current === "string") return value.current;
    return undefined;
}

function getCategories(payload: SanityWebhookPayload): string[] {
    const fromPayload = payload.categories;
    if (Array.isArray(fromPayload)) return fromPayload;
    const fromDocument = payload.document?.categories;
    if (Array.isArray(fromDocument)) return fromDocument;
    return [];
}

function isBlogPayload(payload: SanityWebhookPayload) {
    const type = payload._type ?? payload.document?._type;
    return type === "post" || type === "blogPost";
}

function addPath(paths: Set<string>, path: string, options?: { withFr?: boolean }) {
    const withFr = options?.withFr ?? true;
    paths.add(path);
    if (!withFr || path.startsWith("/fr")) return;
    if (path === "/") {
        paths.add("/fr");
        return;
    }
    paths.add(`/fr${path}`);
}

export async function POST(request: NextRequest) {
    const configuredSecret = process.env.SANITY_REVALIDATE_SECRET;
    if (!configuredSecret) {
        return NextResponse.json({ ok: false, message: "SANITY_REVALIDATE_SECRET is missing" }, { status: 500 });
    }

    const receivedSecret = getSecret(request);
    if (!receivedSecret || receivedSecret !== configuredSecret) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    let payload: SanityWebhookPayload = {};
    try {
        payload = (await request.json()) as SanityWebhookPayload;
    } catch {
        // Some sanity webhook setups may send an empty body for ping checks.
    }

    const paths = new Set<string>();

    // Always refresh main listing and sitemap.
    addPath(paths, "/blog");
    addPath(paths, "/sitemap.xml", { withFr: false });

    const slug = getSlug(payload);
    const categories = getCategories(payload).filter((category) => BLOGCATEGORIES.includes(category));

    // For explicit blog changes, invalidate known blog-category pages.
    if (isBlogPayload(payload)) {
        const cats = categories.length ? categories : BLOGCATEGORIES;
        for (const category of cats) {
            if (category === "fide") continue;
            addPath(paths, `/blog/category/${category}`);
        }

        if (slug) {
            addPath(paths, `/blog/post/${slug}`);
        }
    } else {
        // Defensive fallback when payload type isn't explicit.
        if (slug) {
            addPath(paths, `/blog/post/${slug}`);
        }
        for (const category of categories) {
            if (category === "fide") continue;
            addPath(paths, `/blog/category/${category}`);
        }
    }

    for (const path of paths) {
        revalidatePath(path);
    }

    const patterns: string[] = [];
    if (isBlogPayload(payload)) {
        // Defensive invalidation for slug/category changes when webhook payload is incomplete.
        revalidatePath("/blog/post/[slug]", "page");
        revalidatePath("/fr/blog/post/[slug]", "page");
        revalidatePath("/blog/category/[slug]", "page");
        revalidatePath("/fr/blog/category/[slug]", "page");
        patterns.push("/blog/post/[slug]", "/fr/blog/post/[slug]", "/blog/category/[slug]", "/fr/blog/category/[slug]");
    }

    return NextResponse.json({
        ok: true,
        revalidated: Array.from(paths).sort(),
        revalidatedPatterns: patterns,
        received: {
            _id: payload._id ?? payload.document?._id ?? null,
            _type: payload._type ?? payload.document?._type ?? null,
            slug: slug ?? null,
            categories,
        },
    });
}
