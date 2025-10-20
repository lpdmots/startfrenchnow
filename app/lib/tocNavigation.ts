import { FidePackSommaire } from "../serverActions/productActions";

// app/lib/tocNavigation.ts
export type SlugStr = string;

export type AdjacentItem = {
    packIndex: number;
    moduleIndex: number;
    postIndex: number;
    _id: string;
    slug: SlugStr;
    title: string;
};

export type AdjacentResult = {
    previous: AdjacentItem | null;
    next: AdjacentItem | null;
    // infos utiles si tu veux afficher "Module x / y"
    current?: AdjacentItem;
};

/**
 * Retourne previous / next selon l’ordre du sommaire:
 * post suivant dans le même module → sinon premier du module suivant → sinon premier du pack suivant.
 * Idem en sens inverse pour previous.
 */
export function findAdjacentFromTOC(
    toc: FidePackSommaire,
    currentSlug: SlugStr,
    hasPackFide: boolean // NEW
): AdjacentResult {
    const P = toc.packages;
    if (!P?.length) return { previous: null, next: null };

    let cur: AdjacentItem | undefined;

    // Localiser la position courante (inchangé)
    outer: for (let pi = 0; pi < P.length; pi++) {
        const M = P[pi].modules || [];
        for (let mi = 0; mi < M.length; mi++) {
            const posts = M[mi].posts || [];
            for (let li = 0; li < posts.length; li++) {
                if (posts[li]?.slug.current === currentSlug) {
                    const post = posts[li]!;
                    cur = {
                        packIndex: pi,
                        moduleIndex: mi,
                        postIndex: li,
                        _id: post._id,
                        slug: post.slug.current,
                        title: post.title,
                    };
                    break outer;
                }
            }
        }
    }

    if (!cur) return { previous: null, next: null };

    // Seuil d'accès : avec pack → tout, sinon uniquement les previews
    const canOffer = (p?: { isPreview?: boolean }) => hasPackFide || !!p?.isPreview;

    const getNext = (): AdjacentItem | null => {
        const { packIndex: pi, moduleIndex: mi, postIndex: li } = cur!;
        const postsIn = (pi: number, mi: number) => P[pi].modules[mi].posts || [];

        // 1) avancer dans le module courant
        {
            const posts = postsIn(pi, mi);
            for (let idx = li + 1; idx < posts.length; idx++) {
                const p = posts[idx];
                if (p && canOffer(p)) {
                    return { packIndex: pi, moduleIndex: mi, postIndex: idx, _id: p._id, slug: p.slug.current, title: p.title };
                }
            }
        }

        // 2) parcourir les modules suivants du même pack
        for (let m2 = mi + 1; m2 < P[pi].modules.length; m2++) {
            const posts = postsIn(pi, m2);
            for (let idx = 0; idx < posts.length; idx++) {
                const p = posts[idx];
                if (p && canOffer(p)) {
                    return { packIndex: pi, moduleIndex: m2, postIndex: idx, _id: p._id, slug: p.slug.current, title: p.title };
                }
            }
        }

        // 3) parcourir les packs suivants
        for (let p2 = pi + 1; p2 < P.length; p2++) {
            const mods = P[p2].modules || [];
            for (let m2 = 0; m2 < mods.length; m2++) {
                const posts = mods[m2].posts || [];
                for (let idx = 0; idx < posts.length; idx++) {
                    const p = posts[idx];
                    if (p && canOffer(p)) {
                        return { packIndex: p2, moduleIndex: m2, postIndex: idx, _id: p._id, slug: p.slug.current, title: p.title };
                    }
                }
            }
        }

        return null;
    };

    const getPrev = (): AdjacentItem | null => {
        const { packIndex: pi, moduleIndex: mi, postIndex: li } = cur!;
        const postsIn = (pi: number, mi: number) => P[pi].modules[mi].posts || [];

        // 1) reculer dans le module courant
        {
            const posts = postsIn(pi, mi);
            for (let idx = li - 1; idx >= 0; idx--) {
                const p = posts[idx];
                if (p && canOffer(p)) {
                    return { packIndex: pi, moduleIndex: mi, postIndex: idx, _id: p._id, slug: p.slug.current, title: p.title };
                }
            }
        }

        // 2) parcourir les modules précédents du même pack (en partant de la fin)
        for (let m2 = mi - 1; m2 >= 0; m2--) {
            const posts = postsIn(pi, m2);
            for (let idx = posts.length - 1; idx >= 0; idx--) {
                const p = posts[idx];
                if (p && canOffer(p)) {
                    return { packIndex: pi, moduleIndex: m2, postIndex: idx, _id: p._id, slug: p.slug.current, title: p.title };
                }
            }
        }

        // 3) parcourir les packs précédents (en partant de la fin)
        for (let p2 = pi - 1; p2 >= 0; p2--) {
            const mods = P[p2].modules || [];
            for (let m2 = mods.length - 1; m2 >= 0; m2--) {
                const posts = mods[m2].posts || [];
                for (let idx = posts.length - 1; idx >= 0; idx--) {
                    const p = posts[idx];
                    if (p && canOffer(p)) {
                        return { packIndex: p2, moduleIndex: m2, postIndex: idx, _id: p._id, slug: p.slug.current, title: p.title };
                    }
                }
            }
        }

        return null;
    };

    return { previous: getPrev(), next: getNext(), current: cur };
}
