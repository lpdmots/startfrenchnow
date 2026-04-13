import { normalizeLocale } from "@/i18n";
import { client } from "@/app/lib/sanity.client";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import Marquee from "@/app/components/ui/marquee";
import { FideFaq } from "../components/FideFaq";
import { ContactForFideCourses } from "../components/ContactForFideCourses";
import MarqueePackFideContent from "../components/MarqueePackFideContent";
import { VideosSection } from "../components/VideosSection";
import { HeroPackFide } from "./components/HeroPackFide";
import { WhatIsPackFideSection } from "./components/WhatIsPackFideSection";
import { PackFideNextStepsSection } from "./components/PackFideNextStepsSection";
import { PackFidePricingSectionClient } from "./components/PackFidePricingSectionClient";
import { ContactForFide } from "../components/ContactForFide";
import { DeferredPackFideExamsSection } from "./components/DeferredPackFideExamsSection";
import { DeferredPackFideReviews } from "./components/DeferredPackFideReviews";

const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, "");
const queryProductBySlug = groq`*[_type=='product' && slug.current == $slug][0]`;

type FaqItem = {
    question: string;
    answer: string;
    content?: ReactNode;
};

export default async function PackFidePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    const isFr = locale === "fr";

    const [autonomieProduct, accompagneProduct] = await Promise.all([
        client.fetch<ProductFetch>(queryProductBySlug, { slug: "pack-fide" }),
        client.fetch<ProductFetch>(queryProductBySlug, { slug: "pack-fide-accompagne" }),
    ]);

    let pricingAutonomie: PricingDetails | null = null;
    let pricingAccompagne: PricingDetails | null = null;

    if (autonomieProduct) {
        try {
            const { pricingDetails } = await getAmount(autonomieProduct, "1", "CHF", undefined);
            pricingAutonomie = pricingDetails;
        } catch (error) {
            console.error("Failed to load pricing for pack-fide:", error);
        }
    }

    if (accompagneProduct) {
        try {
            const { pricingDetails } = await getAmount(accompagneProduct, "1", "CHF", undefined);
            pricingAccompagne = pricingDetails;
        } catch (error) {
            console.error("Failed to load pricing for pack-fide-accompagne:", error);
        }
    }

    const homePath = isFr ? "/fr" : "/";
    const fidePath = isFr ? "/fr/fide" : "/fide";
    const packPath = isFr ? "/fr/fide/pack-fide" : "/fide/pack-fide";

    const faqItems: FaqItem[] = isFr
        ? [
              {
                  question: "Que contient exactement le Pack FIDE e-learning ?",
                  answer: "Le pack comprend un parcours vidéo structuré (du niveau débutant jusqu'au B1), des contenus spécifiques à l'examen FIDE (méthode, points clés, conseils pratiques), plus de 100 examens blancs, des supports de travail et des mises à jour régulières. Vous avez aussi un dashboard pour suivre votre progression et un espace d'échange avec votre professeur.",
              },
              {
                  question: "Quelle est la différence entre le pack autonome et le pack accompagné ?",
                  answer: "Le pack autonome vous donne tous les contenus pour travailler en autonomie. Le pack accompagné ajoute un suivi pédagogique plus étroit, avec des sessions ciblées sur les scénarios FIDE actuels.",
              },
              {
                  question: "Le pack convient-il si je pars de zéro ?",
                  answer: "Oui. Le parcours est progressif et pensé pour vous amener étape par étape vers le niveau attendu au FIDE. Si vous débutez, vous commencez par les bases du français (cours débutant inclus), puis vous montez progressivement jusqu'au B1 avec les contenus spécifiques FIDE.",
              },
              {
                  question: "Est-ce que les scénarios sont mis à jour ?",
                  answer: "Oui. Les contenus sont régulièrement ajustés selon les retours récents de candidats et l'évolution des attentes de l'examen. Quand de nouveaux scénarios apparaissent, nous les intégrons pour que votre préparation reste alignée avec les sujets les plus pertinents.",
              },
              {
                  question: "Puis-je combiner le pack avec des cours privés ?",
                  answer: "Oui. Beaucoup d'étudiants combinent e-learning et coaching 1:1. Le pack accompagné va déjà dans ce sens, avec un suivi plus rapproché et des sessions ciblées sur les scénarios actuels du FIDE. Et si vous voulez un accompagnement encore plus personnalisé, vous pouvez ajouter des cours privés.",
                  content: (
                      <p className="mb-0">
                          Oui. Beaucoup d'étudiants combinent e-learning et coaching 1:1. Le pack accompagné va déjà dans ce sens, avec un suivi plus rapproché et des sessions ciblées sur les
                          scénarios actuels du FIDE. Et si vous voulez un accompagnement encore plus personnalisé, vous pouvez ajouter des cours privés.{" "}
                          <Link href="/fide/private-courses" className="font-semibold text-secondary-2 underline">
                              Voir les cours privés
                          </Link>
                          .
                      </p>
                  ),
              },
              {
                  question: "Y a-t-il une option gratuite avant d'acheter ?",
                  answer: "Oui. Vous pouvez consulter des vidéos gratuites et des aperçus pour tester la méthode avant d'acheter le pack.",
                  content: (
                      <p className="mb-0">
                          Oui. Vous pouvez commencer par des contenus gratuits pour tester la méthode.{" "}
                          <Link href="/fide/videos" className="font-semibold text-secondary-6 underline">
                              Accéder aux vidéos gratuites
                          </Link>
                          .
                      </p>
                  ),
              },
              {
                  question: "Est-ce que le pack suffit pour préparer aussi l'oral ?",
                  answer: "Oui, le pack couvre les bases indispensables, y compris l'expression orale. Si vous avez besoin de retours directs et personnalisés, ajoutez des examens blancs encadrés ou des cours privés.",
                  content: (
                      <p className="mb-0">
                          Oui, le pack couvre les bases indispensables, y compris l'expression orale. Si vous avez besoin de retours directs et personnalisés, ajoutez des{" "}
                          <Link href="/fide/mock-exams" className="font-semibold text-secondary-5 underline">
                              examens blancs encadrés
                          </Link>{" "}
                          ou des{" "}
                          <Link href="/fide/private-courses" className="font-semibold text-secondary-2 underline">
                              cours privés
                          </Link>
                          .
                      </p>
                  ),
              },
              {
                  question: "Comment choisir entre les formules ?",
                  answer: "Si vous hésitez entre les formules, réservez un entretien gratuit. Le professeur vous aidera à définir un plan de formation personnalisé selon votre niveau, votre délai et votre objectif.",
                  content: (
                      <p className="mb-0">
                          Si vous hésitez entre les formules,{" "}
                          <Link href="/fide/pack-fide#ContactForFIDECourses" className="font-semibold text-secondary-6 underline">
                              réservez un entretien gratuit
                          </Link>
                          . Le professeur vous aidera à définir un plan de formation personnalisé selon votre niveau, votre délai et votre objectif.
                      </p>
                  ),
              },
          ]
        : [
              {
                  question: "What is included in the FIDE e-learning pack?",
                  answer: "The pack includes a structured video path (from beginner to B1), FIDE-specific content (method, key exam points, practical tips), 100+ mock exams, study resources, and regular updates. You also get a dashboard to track progress and a messaging space to exchange with your teacher.",
              },
              {
                  question: "What is the difference between the self-paced and guided packs?",
                  answer: "The self-paced pack gives you all content for independent study. The guided pack adds closer pedagogical support, with targeted sessions on current FIDE scenarios.",
              },
              {
                  question: "Is this suitable if I start from zero?",
                  answer: "Yes. The path is progressive and designed to take you step by step toward the expected FIDE level. If you are starting from scratch, you begin with the included beginner course, then move up to B1 through FIDE-specific content.",
              },
              {
                  question: "Are scenarios updated regularly?",
                  answer: "Yes. Content is regularly updated based on recent candidate feedback and exam expectations. When new scenarios appear, we integrate them so your preparation stays aligned with the most relevant topics.",
              },
              {
                  question: "Can I combine the pack with private coaching?",
                  answer: "Yes. Many learners combine e-learning with 1:1 coaching. The guided pack already includes closer support and targeted work on current FIDE scenarios. If you want even more personalized support, you can add private lessons.",
                  content: (
                      <p className="mb-0">
                          Yes. Many learners combine e-learning with 1:1 coaching. The guided pack already includes closer support and targeted work on current FIDE scenarios. If you want even more
                          personalized support, you can add private lessons.{" "}
                          <Link href="/fide/private-courses" className="font-semibold text-secondary-2 underline">
                              See private coaching
                          </Link>
                          .
                      </p>
                  ),
              },
              {
                  question: "Is there a free option before purchasing?",
                  answer: "Yes. You can start with free videos and previews to test the method before buying.",
                  content: (
                      <p className="mb-0">
                          Yes. You can start with free resources before purchasing.{" "}
                          <Link href="/fide/videos" className="font-semibold text-secondary-6 underline">
                              Access free videos
                          </Link>
                          .
                      </p>
                  ),
              },
              {
                  question: "Is the pack enough for speaking preparation as well?",
                  answer: "Yes, the pack covers essential speaking foundations. If you need direct, personalized feedback, add supervised mock exams or private coaching.",
                  content: (
                      <p className="mb-0">
                          Yes, the pack covers essential speaking foundations. If you need direct, personalized feedback, add{" "}
                          <Link href="/fide/mock-exams" className="font-semibold text-secondary-5 underline">
                              supervised mock exams
                          </Link>{" "}
                          or{" "}
                          <Link href="/fide/private-courses" className="font-semibold text-secondary-2 underline">
                              private coaching
                          </Link>
                          .
                      </p>
                  ),
              },
              {
                  question: "How should I choose between plans?",
                  answer: "If you are unsure which plan fits you best, book a free consultation. Your teacher can help you define a personalized plan based on your current level, timeline, and target.",
                  content: (
                      <p className="mb-0">
                          If you are unsure which plan fits you best,{" "}
                          <Link href="/fide/pack-fide#ContactForFIDECourses" className="font-semibold text-secondary-6 underline">
                              book a free consultation
                          </Link>
                          . Your teacher can help you define a personalized plan based on your current level, timeline, and target.
                      </p>
                  ),
              },
          ];

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
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
                item: `${SITE}${fidePath}`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: isFr ? "Pack FIDE e-learning" : "FIDE e-learning pack",
                item: `${SITE}${packPath}`,
            },
        ],
    };

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE}${packPath}#fide-pack-product`,
        name: isFr ? "Pack FIDE e-learning" : "FIDE e-learning pack",
        description: isFr
            ? "Programme vidéo FIDE, examens blancs et parcours structuré pour préparer l'examen avec confiance."
            : "Structured FIDE video program, mock exams, and guided path to prepare with confidence.",
        image: [`${SITE}/images/pack-fide-hero.png`],
        brand: {
            "@type": "Brand",
            name: "Start French Now",
        },
        offers: [
            {
                "@type": "Offer",
                url: `${SITE}${packPath}#pack-pricing`,
                priceCurrency: pricingAutonomie?.currency ?? "CHF",
                price: pricingAutonomie?.amount ?? 499,
                availability: "https://schema.org/InStock",
            },
            {
                "@type": "Offer",
                url: `${SITE}${packPath}#pack-pricing`,
                priceCurrency: pricingAccompagne?.currency ?? "CHF",
                price: pricingAccompagne?.amount ?? 875,
                availability: "https://schema.org/InStock",
            },
        ],
    };

    return (
        <div className="w-full mb-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroPackFide />
            </div>

            <WhatIsPackFideSection />
            <PackFidePricingSectionClient locale={locale} pricingAutonomie={pricingAutonomie} pricingAccompagne={pricingAccompagne} />
            <ContactForFide />
            <VideosSection locale={locale} />
            <DeferredPackFideExamsSection />

            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:60s]">
                        <MarqueePackFideContent />
                    </Marquee>
                </div>
            </div>

            <div className="max-w-7xl m-auto pt-24 pb-24 px-4 lg:px-8">
                <DeferredPackFideReviews />
            </div>
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>

            <div id="pack-fide-faq" className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq
                        variant="thin"
                        title={
                            isFr ? (
                                <>
                                    <span className="heading-span-secondary-6">FAQ</span> spéciale Pack FIDE
                                </>
                            ) : (
                                <>
                                    <span className="heading-span-secondary-6">FAQ</span> for the FIDE Pack
                                </>
                            )
                        }
                        subtitle={isFr ? "Toutes les réponses essentielles pour choisir votre formule e-learning." : "Essential answers to choose the right e-learning option."}
                        items={faqItems.map((item) => ({
                            title: item.question,
                            content: item.content ?? <p>{item.answer}</p>,
                        }))}
                    />
                </div>
            </div>

            <PackFideNextStepsSection locale={locale} />
        </div>
    );
}
