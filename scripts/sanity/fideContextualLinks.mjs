import { isDeepStrictEqual } from "node:util";

const SITE = "https://startfrenchnow.ch";
export const FIDE_CONTEXTUAL_LINK_KEY_PREFIX = "seo-contextual-";
const GENERATED_KEY_PREFIX = FIDE_CONTEXTUAL_LINK_KEY_PREFIX;

export const FIDE_CONTEXTUAL_LINK_PLAN = {
    "1-votre-guide-pratique-pour-reussir-le-test-fide": {
        context: "overview",
        offer: "pack",
        next: {
            slug: "2-le-test-fide-la-partie-orale-parler",
            fr: "Le Test FIDE : la partie orale – parler",
            en: "The FIDE Test: the speaking section",
        },
    },
    "2-le-test-fide-la-partie-orale-parler": {
        context: "oral",
        offer: "private",
        next: {
            slug: "3-le-test-fide-la-partie-orale-comprendre",
            fr: "Le Test FIDE : la partie orale – comprendre",
            en: "The FIDE Test: the listening section",
        },
    },
    "3-le-test-fide-la-partie-orale-comprendre": {
        context: "listening",
        offer: "mock",
        next: {
            slug: "4-le-test-fide-lire-et-ecrire",
            fr: "Le test FIDE : lire et écrire",
            en: "The FIDE Test: reading and writing",
        },
    },
    "4-le-test-fide-lire-et-ecrire": {
        context: "written",
        offer: "mock",
        next: {
            slug: "5-le-test-fide-l-oral-a2-en-detail",
            fr: "Le test FIDE : l’oral A2 en détail",
            en: "The FIDE Test: the A2 oral exam in detail",
        },
    },
    "5-le-test-fide-l-oral-a2-en-detail": {
        context: "oral",
        offer: "private",
        next: {
            slug: "6-le-test-fide-l-oral-b1-en-detail",
            fr: "Le test FIDE : l’oral B1 en détail",
            en: "The FIDE Test: the B1 oral exam in detail",
        },
    },
    "6-le-test-fide-l-oral-b1-en-detail": {
        context: "oral",
        offer: "private",
        next: {
            slug: "7-le-test-fide-conseils-et-strategies",
            fr: "Le test FIDE : conseils et stratégies",
            en: "The FIDE Test: tips and strategies",
        },
    },
    "7-le-test-fide-conseils-et-strategies": {
        context: "strategy",
        offer: "pack",
        next: {
            slug: "fide-a2-reussir-description-image-oral-tache-1",
            fr: "FIDE A2 : réussir la description d’image à l’oral",
            en: "FIDE A2: how to describe a picture in the oral exam",
        },
    },
    "fide-a2-reussir-description-image-oral-tache-1": {
        context: "oral",
        offer: "mock",
        next: {
            slug: "fide-exam-jeu-de-role-simulation-a2",
            fr: "FIDE A2 : réussir le jeu de rôle",
            en: "FIDE A2: succeed in the role-play task",
        },
    },
    "fide-exam-jeu-de-role-simulation-a2": {
        context: "oral",
        offer: "private",
        next: {
            slug: "fide-a2-oral-reussir-discussion-tache-3",
            fr: "FIDE A2 oral : réussir la discussion de la tâche 3",
            en: "FIDE A2 speaking: succeed in the Task 3 discussion",
        },
    },
    "fide-a2-oral-reussir-discussion-tache-3": {
        context: "oral",
        offer: "private",
        next: {
            slug: "fide-test-la-partie-b1-parler",
            fr: "FIDE Test : la partie B1 parler",
            en: "FIDE Test: the B1 speaking section",
        },
    },
    "fide-test-la-partie-b1-parler": {
        context: "oral",
        offer: "private",
        next: {
            slug: "7-le-test-fide-conseils-et-strategies",
            fr: "Le test FIDE : conseils et stratégies",
            en: "The FIDE Test: tips and strategies",
        },
    },
    "passe-compose-a2-usage-avoir-etre-participe-passe": {
        context: "grammar",
        offer: "pack",
        next: {
            slug: "5-le-test-fide-l-oral-a2-en-detail",
            fr: "Le test FIDE : l’oral A2 en détail",
            en: "The FIDE Test: the A2 oral exam in detail",
        },
    },
};

const HUB_COPY = {
    fr: {
        overview: ["Retrouvez le format, les niveaux et chaque épreuve dans notre ", "guide complet du test FIDE", ""],
        oral: ["Découvrez le déroulement des autres épreuves dans notre ", "guide complet du test FIDE", ""],
        listening: ["Retrouvez l’épreuve orale et le reste du test dans notre ", "guide complet du test FIDE", ""],
        written: ["Retrouvez l’épreuve écrite et le reste du test dans notre ", "guide complet du test FIDE", ""],
        strategy: ["Retrouvez le format et chaque épreuve dans notre ", "guide complet du test FIDE", ""],
        grammar: ["Reliez ce point de grammaire aux tâches de l’examen avec notre ", "guide complet du test FIDE", ""],
    },
    en: {
        overview: ["Explore the format, levels and every section in our ", "complete FIDE test guide", ""],
        oral: ["See how the other test sections work in our ", "complete FIDE test guide", ""],
        listening: ["Explore the oral test and the other sections in our ", "complete FIDE test guide", ""],
        written: ["Explore the written test and the other sections in our ", "complete FIDE test guide", ""],
        strategy: ["Explore the format and every section in our ", "complete FIDE test guide", ""],
        grammar: ["Connect this grammar point to the exam tasks with our ", "complete FIDE test guide", ""],
    },
};

const OFFER_COPY = {
    fr: {
        pack: ["Suivez un parcours structuré avec le ", "Pack Exam FIDE", ""],
        mock: ["Mettez cette compétence en pratique avec les ", "examens blancs FIDE", ""],
        private: ["Travaillez cette compétence avec un professeur lors de ", "cours privés FIDE", ""],
    },
    en: {
        pack: ["Follow a structured learning path with the ", "FIDE Exam Pack", ""],
        mock: ["Put this skill into practice with our ", "FIDE mock exams", ""],
        private: ["Work on this skill with a teacher in ", "private FIDE lessons", ""],
    },
};

const OFFER_PATHS = {
    pack: "/fide/pack-fide",
    mock: "/fide/mock-exams",
    private: "/fide/private-courses",
};

const LEGACY_TEXT_PREFIXES = [
    "n'attendez plus",
    "alors n'attendez plus",
    "contactez-moi",
    "mettez toutes les chances",
    "découvrez nos packs",
    "envie de pratiquer",
    "don’t wait any longer",
    "don't wait any longer",
    "so don’t wait",
    "so don't wait",
    "contact me",
    "discover our fide",
    "want to practice",
];

function localizedPath(pathname, locale) {
    return locale === "fr" ? `/fr${pathname}` : pathname;
}

export function getFideContextualLinkTargets(slug, locale) {
    const plan = FIDE_CONTEXTUAL_LINK_PLAN[slug];
    if (!plan) throw new Error(`Unknown FIDE article slug: ${slug}`);
    if (locale !== "fr" && locale !== "en") throw new Error(`Unsupported locale: ${locale}`);

    const localePrefix = locale === "fr" ? "/fr" : "";
    return [
        `${SITE}${localizedPath("/fide", locale)}`,
        `${SITE}${localizedPath(OFFER_PATHS[plan.offer], locale)}`,
        `${SITE}${localePrefix}/blog/post/${plan.next.slug}`,
    ];
}

function plainText(block) {
    return Array.isArray(block?.children) ? block.children.map((child) => child?.text || "").join("").trim().toLowerCase() : "";
}

function isLegacyTailBlock(block) {
    const text = plainText(block);
    if (!text) return false;
    if (LEGACY_TEXT_PREFIXES.some((prefix) => text.startsWith(prefix))) return true;

    const links = Array.isArray(block?.markDefs) ? block.markDefs.map((mark) => mark?.href).filter(Boolean) : [];
    return links.some((href) => {
        if (typeof href !== "string") return false;
        return href.includes("#ContactForFIDECourses") || /^https:\/\/startfrenchnow\.ch\/(?:fr\/)?blog\/post\//.test(href);
    });
}

function makeHeading(locale) {
    return {
        _key: `${GENERATED_KEY_PREFIX}heading`,
        _type: "block",
        style: "h2",
        markDefs: [],
        children: [
            {
                _key: `${GENERATED_KEY_PREFIX}heading-span`,
                _type: "span",
                marks: [],
                text: locale === "fr" ? "Pour continuer votre préparation" : "Continue your preparation",
            },
        ],
    };
}

function makeLinkedBlock({ key, prefix, linkText, suffix, href }) {
    const markKey = `${GENERATED_KEY_PREFIX}${key}-link`;
    return {
        _key: `${GENERATED_KEY_PREFIX}${key}`,
        _type: "block",
        style: "normal",
        markDefs: [{ _key: markKey, _type: "link", href, isSpan: true }],
        children: [
            { _key: `${GENERATED_KEY_PREFIX}${key}-prefix`, _type: "span", marks: [], text: prefix },
            { _key: `${GENERATED_KEY_PREFIX}${key}-text`, _type: "span", marks: [markKey], text: linkText },
            { _key: `${GENERATED_KEY_PREFIX}${key}-suffix`, _type: "span", marks: [], text: suffix },
        ],
    };
}

function makeContextualFooter(slug, locale) {
    const plan = FIDE_CONTEXTUAL_LINK_PLAN[slug];
    const hubCopy = HUB_COPY[locale][plan.context];
    const offerCopy = OFFER_COPY[locale][plan.offer];
    const [hubUrl, offerUrl, nextUrl] = getFideContextualLinkTargets(slug, locale);

    return [
        makeHeading(locale),
        makeLinkedBlock({
            key: "hub",
            prefix: hubCopy[0],
            linkText: hubCopy[1],
            suffix: hubCopy[2],
            href: hubUrl,
        }),
        makeLinkedBlock({
            key: "offer",
            prefix: offerCopy[0],
            linkText: offerCopy[1],
            suffix: offerCopy[2],
            href: offerUrl,
        }),
        makeLinkedBlock({
            key: "next",
            prefix: locale === "fr" ? "Poursuivez avec : " : "Continue with: ",
            linkText: plan.next[locale],
            suffix: "",
            href: nextUrl,
        }),
    ];
}

export function rewriteFideContextualLinks(body, { slug, locale }) {
    if (!Object.hasOwn(FIDE_CONTEXTUAL_LINK_PLAN, slug)) {
        throw new Error(`Unknown FIDE article slug: ${slug}`);
    }
    if (locale !== "fr" && locale !== "en") {
        throw new Error(`Unsupported locale: ${locale}`);
    }
    if (!Array.isArray(body)) {
        throw new Error(`Expected Portable Text array for ${slug} (${locale}).`);
    }

    const withoutGenerated = body.filter((block) => !String(block?._key || "").startsWith(GENERATED_KEY_PREFIX));
    const tailStart = Math.max(0, withoutGenerated.length - 12);
    let removedBlockCount = 0;
    const preserved = withoutGenerated.filter((block, index) => {
        if (index < tailStart || !isLegacyTailBlock(block)) return true;
        removedBlockCount += 1;
        return false;
    });
    const value = [...preserved, ...makeContextualFooter(slug, locale)];

    return {
        value,
        changed: !isDeepStrictEqual(value, body),
        removedBlockCount,
    };
}
