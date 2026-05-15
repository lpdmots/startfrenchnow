import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

const cards = [
    {
        key: "mockExams",
        href: "/fide/mock-exams",
        image: "/images/mock-exam-hero.png",
        badgeClassName: "bg-secondaryShades-5 text-secondary-5",
        linkClassName: "hover:border-secondary-5",
        ctaClassName: "text-secondary-5",
        points: ["point1", "point2", "point3"],
    },
    {
        key: "pack",
        href: "/fide/pack-fide",
        image: "/images/pack-fide-hero.png",
        badgeClassName: "bg-secondaryShades-4 text-secondary-6",
        linkClassName: "hover:border-secondary-6",
        ctaClassName: "text-secondary-6",
        points: ["point1", "point2", "point3"],
    },
    {
        key: "private",
        href: "/fide/private-courses",
        image: "/images/etudiante-cours.png",
        badgeClassName: "bg-secondaryShades-2 text-secondary-2",
        linkClassName: "hover:border-secondary-2",
        ctaClassName: "text-secondary-2",
        points: ["point1", "point2", "point3"],
    },
] as const;

export function HomePreparationOptionsSection() {
    const t = useTranslations("HomePreparationOptions");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6">{chunks}</span>,
    };

    return (
        <section id="fide-hub" className="py-16">
            <div id="plans" className="scroll-mt-24" />
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="display-2 mb-4">{t.rich("title", rich)}</h2>
                    <p className="mb-0">{t("subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                    {cards.map(({ key, href, image, badgeClassName, linkClassName, ctaClassName, points }) => (
                        <Link
                            key={key}
                            href={href}
                            className={`group flex h-full flex-col rounded-2xl border border-neutral-300 bg-neutral-100 p-5 !no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${linkClassName}`}
                        >
                            <div className="mb-4 flex h-56 justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                                <Image
                                    src={image}
                                    alt={t(`cards.${key}.imageAlt` as never)}
                                    width={1200}
                                    height={675}
                                    sizes="(min-width: 992px) 380px, (min-width: 768px) 33vw, 100vw"
                                    className="h-full w-full max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                                />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <div className={`mb-3 inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClassName}`}>
                                    {t(`cards.${key}.badge` as never)}
                                </div>
                                <p className="mb-1 text-lg font-bold text-neutral-800">{t(`cards.${key}.title` as never)}</p>
                                <p className="mb-3 text-sm font-semibold text-neutral-800">{t(`cards.${key}.fit` as never)}</p>
                                <p className="mb-4 text-sm text-neutral-700">{t(`cards.${key}.description` as never)}</p>
                                <ul className="mb-5 grid list-none gap-2 pl-0">
                                    {points.map((point) => (
                                        <li key={point} className="flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${ctaClassName}`} />
                                            <span>{t(`cards.${key}.points.${point}` as never)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className={`mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold ${ctaClassName}`}>
                                    {t(`cards.${key}.cta` as never)}
                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
