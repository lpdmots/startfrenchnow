import { CheckCircle2, Clock3, MessageCircle, Target } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BookFirstMeeting } from "../../components/BookFirstMeeting";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

const HERO_IMAGE_SRC = "/images/etudiante-cours.png";

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
                            <h1 className="display-1 mb-0 whitespace-nowrap text-center leading-[1.03] lg:text-left" style={{ whiteSpace: "nowrap" }}>
                                {t.rich("title.full", rich)}
                            </h1>
                            <p className="mb-0 text-center text-base text-neutral-700 sm:text-lg lg:text-left">
                                {t("subtitle")}
                            </p>
                            <div className="flex w-full flex-col items-stretch justify-center gap-3 md:flex-row md:flex-nowrap md:items-center lg:justify-start">
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

                        <div className="relative">
                            <div className="mx-auto hidden w-full max-w-[860px] lg:grid lg:grid-cols-[350px_minmax(260px,360px)] lg:items-center lg:justify-center lg:gap-8">
                                <div className="flex justify-center pt-12">
                                    <div className="relative h-[340px] w-[340px] overflow-hidden" style={{ borderBottomRightRadius: 100 }}>
                                        <div className="relative h-full w-full">
                                            <Image src={HERO_IMAGE_SRC} alt={t("imageAlt")} fill sizes="(min-width: 992px) 340px, 224px" className="object-cover" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid h-[520px] grid-rows-4 gap-8">
                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(-90px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                                <Target className="h-4 w-4 text-secondary-2" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.plan.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.plan.text")}</p>
                                    </article>

                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(0px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                                <MessageCircle className="h-4 w-4 text-secondary-5" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.scenarios.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.scenarios.text")}</p>
                                    </article>

                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(30px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-4" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4">
                                                <CheckCircle2 className="h-4 w-4 text-secondary-4" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.feedback.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.feedback.text")}</p>
                                    </article>

                                    <article
                                        className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md"
                                        style={{ transform: "translate(-20px, 0px)" }}
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-1" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-1">
                                                <Clock3 className="h-4 w-4 text-secondary-1" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.flexible.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.flexible.text")}</p>
                                    </article>
                                </div>
                            </div>

                            <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-4 lg:hidden">
                                <div className="relative h-56 w-56 overflow-hidden" style={{ borderBottomRightRadius: 64 }}>
                                    <div className="relative h-full w-full">
                                        <Image src={HERO_IMAGE_SRC} alt={t("imageAlt")} fill sizes="(min-width: 992px) 340px, 224px" className="object-cover" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-2" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-2">
                                                <Target className="h-4 w-4 text-secondary-2" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.plan.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.plan.text")}</p>
                                    </article>
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-5" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-5">
                                                <MessageCircle className="h-4 w-4 text-secondary-5" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.scenarios.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.scenarios.text")}</p>
                                    </article>
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-4" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-4">
                                                <CheckCircle2 className="h-4 w-4 text-secondary-4" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.feedback.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.feedback.text")}</p>
                                    </article>
                                    <article className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-100 p-4 shadow-md">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-secondary-1" />
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondaryShades-1">
                                                <Clock3 className="h-4 w-4 text-secondary-1" />
                                            </span>
                                            <p className="mb-0 text-base font-bold text-neutral-800">{t("cards.flexible.title")}</p>
                                        </div>
                                        <p className="mb-0 text-sm text-neutral-700">{t("cards.flexible.text")}</p>
                                    </article>
                                </div>
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
