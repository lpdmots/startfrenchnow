import { CheckCircle2, Clock3, MessageCircle, Target } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BookFirstMeeting } from "../../components/BookFirstMeeting";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

const HERO_IMAGE_SRC = "/images/etudiante-cours.avif";

const privateCourseCards = [
    {
        key: "plan",
        Icon: Target,
        barClassName: "bg-secondary-2",
        iconWrapperClassName: "bg-secondaryShades-2",
        iconClassName: "text-secondary-2",
        transformClassName: "lg:-translate-x-[90px]",
    },
    {
        key: "scenarios",
        Icon: MessageCircle,
        barClassName: "bg-secondary-5",
        iconWrapperClassName: "bg-secondaryShades-5",
        iconClassName: "text-secondary-5",
        transformClassName: "lg:translate-x-0",
    },
    {
        key: "feedback",
        Icon: CheckCircle2,
        barClassName: "bg-secondary-4",
        iconWrapperClassName: "bg-secondaryShades-4",
        iconClassName: "text-secondary-4",
        transformClassName: "lg:translate-x-[30px]",
    },
    {
        key: "flexible",
        Icon: Clock3,
        barClassName: "bg-secondary-1",
        iconWrapperClassName: "bg-secondaryShades-1",
        iconClassName: "text-secondary-1",
        transformClassName: "lg:-translate-x-[20px]",
    },
] as const;

export function HeroPrivateCourses() {
    const t = useTranslations("Fide.PrivateCoursesHero");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-2">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-2">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-2">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-2">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-2">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-2">{chunks}</span>,
        br: () => <br />,
    };

    return (
        <section
            id="HeroPrivateCourses"
            className="section hero v1 wf-section relative isolate overflow-hidden !pt-6 !pb-8 lg:!pb-10 lg:min-h-[calc(100svh-150px)] lg:flex lg:flex-col lg:justify-center"
        >
            <div className="relative z-0 w-full px-4 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(320px,420px)_1fr] lg:gap-12">
                        <div className="flex flex-col gap-5 lg:gap-12">
                            <h1 className="display-1 mb-0 whitespace-nowrap text-center leading-[1.03] lg:text-left">{t.rich("title.full", rich)}</h1>
                            <p className="mb-0 text-center text-base text-neutral-700 sm:text-lg lg:text-left">{t("subtitle")}</p>
                            <div className="flex min-h-[132px] w-full flex-col items-stretch justify-center gap-3 md:min-h-[76px] md:flex-row md:flex-nowrap md:items-center lg:justify-start">
                                <Link href="#plans" className="btn btn-secondary small !py-5 text-center whitespace-nowrap shrink-0 w-full md:w-auto">
                                    {t("ctaPrimary")}
                                </Link>
                                <BookFirstMeeting
                                    label={t("ctaSecondary")}
                                    small={true}
                                    className="w-full md:!w-auto shrink-0"
                                    buttonClassName="!w-full md:!w-auto shrink-0 whitespace-nowrap"
                                />
                            </div>
                        </div>

                        <div className="relative mx-auto grid w-full max-w-[860px] grid-cols-1 items-center gap-4 lg:grid-cols-[350px_minmax(260px,360px)] lg:justify-center lg:gap-8">
                            <div className="flex justify-center lg:pt-12">
                                <div className="relative h-56 w-56 overflow-hidden rounded-br-[64px] lg:h-[340px] lg:w-[340px] lg:rounded-br-[100px]">
                                    <Image
                                        src={HERO_IMAGE_SRC}
                                        alt={t("imageAlt")}
                                        fill
                                        sizes="(min-width: 992px) 340px, 224px"
                                        className="object-cover"
                                        priority
                                        fetchPriority="high"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:h-[520px] lg:grid-cols-1 lg:grid-rows-4 lg:gap-8">
                                {privateCourseCards.map(({ key, Icon, barClassName, iconWrapperClassName, iconClassName, transformClassName }) => (
                                    <article
                                        key={key}
                                        className={`relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md ${transformClassName}`}
                                    >
                                        <div className={`absolute inset-y-0 left-0 w-1 ${barClassName}`} />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconWrapperClassName}`}>
                                                <Icon className={`h-4 w-4 ${iconClassName}`} />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t(`cards.${key}.title`)}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t(`cards.${key}.text`)}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center w-full">
                <div className="flex flex-wrap gap-6 justify-around items-center w-full pt-6 max-w-4xl">
                    <div className="flex justify-center items-center">
                        <FideCourseRatings />
                    </div>
                </div>
            </div>
        </section>
    );
}
