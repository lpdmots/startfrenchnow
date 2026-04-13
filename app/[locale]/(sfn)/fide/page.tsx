import { getTranslations } from "next-intl/server";
import { SanityServerClient } from "@/app/lib/sanity.clientServerDev";
import { groq } from "next-sanity";
import type { Image as SanityImage } from "@/app/types/sfn/blog";
import type { FlatFidePackSommaire } from "./videos/page";
import { normalizeLocale } from "@/i18n";
import { FidePageHeroSection } from "./components/FidePageHeroSection";
import { FidePageOverviewSection } from "./components/FidePageOverviewSection";
import { FidePageStickyExamsSection } from "./components/FidePageStickyExamsSection";
import { FidePageTipsSection } from "./components/FidePageTipsSection";
import { FidePageDetailedGuidesSection } from "./components/FidePageDetailedGuidesSection";
import { FidePageHubSection } from "./components/FidePageHubSection";
import { FidePageContactSection } from "./components/FidePageContactSection";
import { FidePageFaqSection } from "./components/FidePageFaqSection";
import GetPdfBand from "./components/GetPdfBand";
import { ContactForFideBand } from "./components/ContactForFideBand";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");
const FIDE_DETAILED_GUIDE_SLUGS = [
    "fide-test-la-partie-b1-parler",
    "fide-a2-oral-reussir-discussion-tache-3",
    "fide-exam-jeu-de-role-simulation-a2",
    "fide-a2-reussir-description-image-oral-tache-1",
    "5-le-test-fide-l-oral-a2-en-detail",
    "6-le-test-fide-l-oral-b1-en-detail",
] as const;
const FIDE_DEV_EXTRA_GUIDE_SLUGS = ["test-scenarios-a1", "la-sante-dialogues-et-vocabulaire"] as const;
const IS_DEV = process.env.NODE_ENV === "development";
const GUIDE_PACKAGE_COLORS = ["var(--secondary-6)", "var(--secondary-5)", "var(--secondary-2)", "var(--secondary-4)"] as const;

export const revalidate = 3600;

type DetailedGuidePost = {
    _id: string;
    slug?: { _type?: "slug"; current?: string };
    title?: string;
    description?: string;
    mainImage?: SanityImage;
};

const detailedGuidesBySlugsQuery = groq`
    *[
        _type == 'post'
        && slug.current in $slugs
        && defined(slug.current)
        && defined(mainImage)
        && dateTime(publishedAt) < dateTime(now())
        && isReady == true
    ]{
        _id,
        slug,
        title,
        description,
        mainImage
    }
`;

async function getDetailedGuidesBySlugs(slugs: readonly string[]): Promise<DetailedGuidePost[]> {
    try {
        const posts = await SanityServerClient.fetch<DetailedGuidePost[]>(detailedGuidesBySlugsQuery, { slugs }, { next: { revalidate: 3600 } });
        const postsBySlug = new Map(posts.map((post) => [post.slug?.current, post] as const));
        return slugs.map((slug) => postsBySlug.get(slug)).filter((post): post is DetailedGuidePost => Boolean(post));
    } catch (error) {
        console.error("Failed to fetch detailed FIDE guides by slugs:", error);
        return [];
    }
}

async function ExamsPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    const isFr = locale === "fr";
    const tFaq = await getTranslations({ locale, namespace: "Fide.FideFAQ" });
    const detailedGuideSlugs = IS_DEV ? [...FIDE_DETAILED_GUIDE_SLUGS, ...FIDE_DEV_EXTRA_GUIDE_SLUGS] : FIDE_DETAILED_GUIDE_SLUGS;
    const detailedGuides = await getDetailedGuidesBySlugs(detailedGuideSlugs);
    const detailedGuideCards: FlatFidePackSommaire = detailedGuides
        .filter((post) => post.slug?.current && post.mainImage)
        .map((post, index) => ({
            packageTitle: "Gratuites",
            packageReferenceKey: "free-guides",
            packageColor: GUIDE_PACKAGE_COLORS[index % GUIDE_PACKAGE_COLORS.length],
            moduleKey: `guide-${post._id}`,
            moduleTitle: "Guides détaillés",
            moduleSubtitle: undefined,
            moduleLevel: undefined,
            postId: post._id,
            postSlug: { _type: "slug", current: post.slug?.current ?? "" },
            postMainVideo: undefined,
            postMainImage: post.mainImage!,
            postTitle: post.title ?? "Guide FIDE",
            postDescription: post.description ?? "Conseils pratiques et méthode pour réussir le test FIDE.",
            postLevel: undefined,
            postDurationSec: undefined,
            postIsPreview: true,
        }));

    const stripTags = (value: string) => value.replace(/<[^>]*>/g, "").trim();
    const faqText = <K extends Parameters<typeof tFaq.raw>[0]>(key: K) => {
        const value = tFaq.raw(key);
        return stripTags(typeof value === "string" ? value : String(value ?? ""));
    };
    const faqAnswer = (...parts: string[]) =>
        parts
            .map((part) => part.trim())
            .filter(Boolean)
            .join(" ");
    const localizePath = (path: string) => (isFr ? `/fr${path}` : path);
    const canonicalPath = localizePath("/fide");
    const homePath = isFr ? "/fr" : "/";
    const canonicalUrl = `${SITE}${canonicalPath}`;
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: faqText("qu_est_ce_que_fide.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("qu_est_ce_que_fide.content")),
                },
            },
            {
                "@type": "Question",
                name: faqText("de_quel_niveau_besoin.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(
                        faqText("de_quel_niveau_besoin.content.part1"),
                        faqText("de_quel_niveau_besoin.content.list.item1"),
                        faqText("de_quel_niveau_besoin.content.list.item2"),
                        faqText("de_quel_niveau_besoin.content.list.item3"),
                        faqText("de_quel_niveau_besoin.content.list.item4"),
                        faqText("de_quel_niveau_besoin.content.part2"),
                    ),
                },
            },
            {
                "@type": "Question",
                name: faqText("ou_et_quand_passer_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("ou_et_quand_passer_examen.content.part1")),
                },
            },
            {
                "@type": "Question",
                name: faqText("combien_de_temps_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("combien_de_temps_examen.content")),
                },
            },
            {
                "@type": "Question",
                name: faqText("parties_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("parties_examen.content.part1"), faqText("parties_examen.content.list.item1"), faqText("parties_examen.content.list.item2")),
                },
            },
            {
                "@type": "Question",
                name: faqText("combien_coute_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("combien_coute_examen.content")),
                },
            },
            {
                "@type": "Question",
                name: faqText("resultats_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("resultats_examen.content")),
                },
            },
            {
                "@type": "Question",
                name: faqText("validite_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("validite_examen.content")),
                },
            },
            {
                "@type": "Question",
                name: faqText("nombre_de_passages.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("nombre_de_passages.content.part1"), faqText("nombre_de_passages.content.part2")),
                },
            },
            {
                "@type": "Question",
                name: faqText("difficulte_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("difficulte_examen.content")),
                },
            },
            {
                "@type": "Question",
                name: faqText("duree_obtention_b1.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(
                        faqText("duree_obtention_b1.content.part1"),
                        faqText("duree_obtention_b1.content.part2"),
                        faqText("duree_obtention_b1.content.part3"),
                        faqText("duree_obtention_b1.content.part4"),
                    ),
                },
            },
            {
                "@type": "Question",
                name: faqText("preparation_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(
                        faqText("preparation_examen.content.part1"),
                        faqText("preparation_examen.content.part2"),
                        faqText("preparation_examen.content.link1a"),
                        faqText("preparation_examen.content.link1b"),
                        faqText("preparation_examen.content.link2a"),
                        faqText("preparation_examen.content.link2b"),
                    ),
                },
            },
            {
                "@type": "Question",
                name: faqText("sujets_oral_examen.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(faqText("sujets_oral_examen.content.part1"), faqText("sujets_oral_examen.content.linka"), faqText("sujets_oral_examen.content.linkb")),
                },
            },
            {
                "@type": "Question",
                name: faqText("meilleure_ecole_preparation.title"),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faqAnswer(
                        faqText("meilleure_ecole_preparation.content.part1"),
                        faqText("meilleure_ecole_preparation.content.part2"),
                        faqText("meilleure_ecole_preparation.content.list.item1"),
                        faqText("meilleure_ecole_preparation.content.list.item2"),
                        faqText("meilleure_ecole_preparation.content.list.item3"),
                        faqText("meilleure_ecole_preparation.content.list.item4"),
                        faqText("meilleure_ecole_preparation.content.link"),
                    ),
                },
            },
        ],
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: isFr ? "Accueil" : "Home",
                item: `${SITE}${homePath}`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "FIDE",
                item: canonicalUrl,
            },
        ],
    };

    const hubItemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#fide-hub`,
        name: isFr ? "Préparation test FIDE" : "FIDE test preparation hub",
        url: canonicalUrl,
        mainEntity: {
            "@type": "ItemList",
            name: isFr ? "Formats de préparation FIDE" : "FIDE preparation formats",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: isFr ? "Pack FIDE" : "FIDE pack",
                    url: `${SITE}${localizePath("/fide/pack-fide")}`,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: isFr ? "Examens blancs FIDE" : "FIDE mock exams",
                    url: `${SITE}${localizePath("/fide/mock-exams")}`,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: isFr ? "Cours privés FIDE" : "Private FIDE courses",
                    url: `${SITE}${localizePath("/fide/private-courses")}`,
                },
            ],
        },
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubItemListJsonLd) }} />
            <FidePageHeroSection />
            <FidePageOverviewSection />
            <FidePageStickyExamsSection />
            <GetPdfBand insetDarkPanel />
            <FidePageHubSection />
            <FidePageTipsSection />
            <ContactForFideBand />
            <FidePageDetailedGuidesSection guides={detailedGuideCards} />
            <FidePageContactSection />
            <FidePageFaqSection />
        </div>
    );
}

export default ExamsPage;
