import assert from "node:assert/strict";
import test from "node:test";

import { FIDE_CONTEXTUAL_LINK_PLAN, rewriteFideContextualLinks } from "./fideContextualLinks.mjs";

const expectedPaths = [
    ["1-votre-guide-pratique-pour-reussir-le-test-fide", "pack", "2-le-test-fide-la-partie-orale-parler"],
    ["2-le-test-fide-la-partie-orale-parler", "private", "3-le-test-fide-la-partie-orale-comprendre"],
    ["3-le-test-fide-la-partie-orale-comprendre", "mock", "4-le-test-fide-lire-et-ecrire"],
    ["4-le-test-fide-lire-et-ecrire", "mock", "5-le-test-fide-l-oral-a2-en-detail"],
    ["5-le-test-fide-l-oral-a2-en-detail", "private", "6-le-test-fide-l-oral-b1-en-detail"],
    ["6-le-test-fide-l-oral-b1-en-detail", "private", "7-le-test-fide-conseils-et-strategies"],
    ["7-le-test-fide-conseils-et-strategies", "pack", "fide-a2-reussir-description-image-oral-tache-1"],
    ["fide-a2-reussir-description-image-oral-tache-1", "mock", "fide-exam-jeu-de-role-simulation-a2"],
    ["fide-exam-jeu-de-role-simulation-a2", "private", "fide-a2-oral-reussir-discussion-tache-3"],
    ["fide-a2-oral-reussir-discussion-tache-3", "private", "fide-test-la-partie-b1-parler"],
    ["fide-test-la-partie-b1-parler", "private", "7-le-test-fide-conseils-et-strategies"],
    ["passe-compose-a2-usage-avoir-etre-participe-passe", "pack", "5-le-test-fide-l-oral-a2-en-detail"],
];

function block({ key, text, href, style = "normal" }) {
    const markKey = `${key}-link`;
    return {
        _key: key,
        _type: "block",
        style,
        markDefs: href ? [{ _key: markKey, _type: "link", href }] : [],
        children: [{ _key: `${key}-span`, _type: "span", marks: href ? [markKey] : [], text }],
    };
}

function collectLinks(value) {
    return value.flatMap((item) => item?.markDefs || []).map((mark) => mark.href).filter(Boolean);
}

function collectLinkMarks(value) {
    return value.flatMap((item) => item?.markDefs || []).filter((mark) => mark?._type === "link");
}

function portableTextBlockText(item) {
    return (item?.children || []).map((child) => child?.text || "").join("");
}

test("defines one deliberate offer and next guide for each of the 12 FIDE articles", () => {
    const actual = Object.entries(FIDE_CONTEXTUAL_LINK_PLAN)
        .map(([slug, entry]) => [slug, entry.offer, entry.next.slug])
        .sort(([left], [right]) => left.localeCompare(right));
    const expected = [...expectedPaths].sort(([left], [right]) => left.localeCompare(right));

    assert.deepEqual(actual, expected);
});

test("replaces the repetitive French tail with three contextual exits and preserves editorial content", () => {
    const editorialLink = block({
        key: "editorial",
        text: "Consultez la source officielle.",
        href: "https://fide-service.ch/fr/attestations/test-fide",
    });
    const input = [
        block({ key: "intro", text: "Contenu éditorial à préserver." }),
        editorialLink,
        block({ key: "summary", text: "En résumé", style: "h2" }),
        block({ key: "cta-1", text: "N'attendez plus, commencez votre préparation gratuitement." }),
        block({ key: "cta-2", text: "Contactez-moi", href: "https://startfrenchnow.ch/fr/fide#ContactForFIDECourses" }),
        block({ key: "cta-3", text: "Mettez toutes les chances de votre côté pour réussir le test FIDE !" }),
        block({
            key: "next",
            text: "Pour en savoir plus sur la partie orale de l'examen, consultez l'article suivant.",
            href: "https://startfrenchnow.ch/fr/blog/post/2-le-test-fide-la-partie-orale-parler",
        }),
    ];

    const result = rewriteFideContextualLinks(input, {
        slug: "1-votre-guide-pratique-pour-reussir-le-test-fide",
        locale: "fr",
    });

    assert.deepEqual(result.value.slice(0, 3), input.slice(0, 3));
    assert.equal(result.removedBlockCount, 4);
    assert.equal(result.value.at(-4).style, "h2");
    assert.equal(result.value.at(-4).children[0].text, "Pour continuer votre préparation");
    assert.deepEqual(collectLinks(result.value.slice(-3)), [
        "https://startfrenchnow.ch/fr/fide",
        "https://startfrenchnow.ch/fr/fide/pack-fide",
        "https://startfrenchnow.ch/fr/blog/post/2-le-test-fide-la-partie-orale-parler",
    ]);
    assert.ok(collectLinkMarks(result.value.slice(-3)).every((mark) => mark.isSpan === true));
    assert.ok(result.value.slice(-3).every((item) => !portableTextBlockText(item).endsWith(".")));
    assert.ok(!JSON.stringify(result.value).includes("ContactForFIDECourses"));
});

test("uses canonical English routes without a French prefix", () => {
    const result = rewriteFideContextualLinks([block({ key: "content", text: "Editorial content." })], {
        slug: "3-le-test-fide-la-partie-orale-comprendre",
        locale: "en",
    });

    assert.equal(result.value.at(-4).children[0].text, "Continue your preparation");
    assert.deepEqual(collectLinks(result.value.slice(-3)), [
        "https://startfrenchnow.ch/fide",
        "https://startfrenchnow.ch/fide/mock-exams",
        "https://startfrenchnow.ch/blog/post/4-le-test-fide-lire-et-ecrire",
    ]);
    assert.ok(collectLinks(result.value).every((href) => !new URL(href).pathname.startsWith("/fr/")));
});

test("is idempotent when the contextual footer already exists", () => {
    const first = rewriteFideContextualLinks([block({ key: "content", text: "Contenu." })], {
        slug: "fide-exam-jeu-de-role-simulation-a2",
        locale: "fr",
    });
    const second = rewriteFideContextualLinks(first.value, {
        slug: "fide-exam-jeu-de-role-simulation-a2",
        locale: "fr",
    });

    assert.deepEqual(second.value, first.value);
    assert.equal(second.changed, false);
});

test("treats Sanity object-key reordering as an unchanged document", () => {
    const first = rewriteFideContextualLinks([block({ key: "content", text: "Contenu." })], {
        slug: "fide-exam-jeu-de-role-simulation-a2",
        locale: "fr",
    });
    const reorderedBySanity = first.value.map((item) => ({
        _type: item._type,
        _key: item._key,
        children: item.children?.map((child) => ({ text: child.text, marks: child.marks, _type: child._type, _key: child._key })),
        markDefs: item.markDefs?.map((mark) => ({ isSpan: mark.isSpan, href: mark.href, _type: mark._type, _key: mark._key })),
        style: item.style,
    }));

    const second = rewriteFideContextualLinks(reorderedBySanity, {
        slug: "fide-exam-jeu-de-role-simulation-a2",
        locale: "fr",
    });

    assert.equal(second.changed, false);
});

test("preserves a legitimate official-source link near the article footer", () => {
    const source = block({
        key: "official-source",
        text: "For more information on exam dates and locations, check the official website.",
        href: "https://fide-info.ch/",
    });
    const first = rewriteFideContextualLinks([source], {
        slug: "1-votre-guide-pratique-pour-reussir-le-test-fide",
        locale: "en",
    });
    const second = rewriteFideContextualLinks(first.value, {
        slug: "1-votre-guide-pratique-pour-reussir-le-test-fide",
        locale: "en",
    });

    assert.deepEqual(second.value[0], source);
    assert.equal(second.changed, false);
});

test("rejects an unknown article instead of guessing a destination", () => {
    const input = [block({ key: "content", text: "Contenu." })];

    assert.throws(
        () => rewriteFideContextualLinks(input, { slug: "article-inconnu", locale: "fr" }),
        /Unknown FIDE article slug/,
    );
    assert.deepEqual(input, [block({ key: "content", text: "Contenu." })]);
});
