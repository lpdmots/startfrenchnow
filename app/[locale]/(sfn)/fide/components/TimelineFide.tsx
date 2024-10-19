import { Timeline } from "@/app/components/ui/timeline";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import Image from "next/image";
import React from "react";
import { FideCourseCard } from "./FideCourseCard";
import ShimmerButton from "@/app/components/ui/shimmer-button";

export const TimelineFide = () => {
    const t = useTranslations("LessonCards");

    const timelineData1 = [
        {
            title: t("lessons.lowIntermediateLevel3.title"),
            subtitle: (
                <div className="flex flex-col">
                    <p className="mb-8">
                        Le <span className="heading-span-secondary-2">complément idéal</span> pour réussir votre examen FIDE B1 avec confiance.
                    </p>
                    <div className="flex justify-center w-full">
                        <Link href="/courses/dialogues" className="no-underline w-full sm:w-auto">
                            <ShimmerButton className="btn-primary button-row w-button flex items-center justify-center small !mr-0">Voir ce cours</ShimmerButton>
                        </Link>
                    </div>
                </div>
            ),
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/dialogues" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours3.jpg" alt="Daily Life Dialogues" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                </div>
            ),
            color: "bg-secondary-5",
        },
        {
            title: t("lessons.lowIntermediateLevel2.title"),
            subtitle: (
                <div className="flex flex-col">
                    <p className="mb-8">Un passage clé vers le niveau B1, conçu pour une progression fluide et maîtrisée.</p>
                    <div className="flex justify-center w-full">
                        <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto">
                            <button className="btn-secondary button-row w-button flex items-center justify-center small">Voir ce cours</button>
                        </Link>
                    </div>
                </div>
            ),
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours2.jpg" alt="Low Intermediates" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                </div>
            ),
            color: "bg-secondary-4",
        },
        {
            title: t("lessons.beginnerLevel1.title"),
            subtitle: (
                <div className="flex flex-col">
                    <p className="mb-8">Commencez de zéro ou consolidez vos bases avec ce cours essentiel pour progresser rapidement.</p>
                    <div className="flex justify-center w-full">
                        <Link href="/courses/beginners" className="no-underline w-full sm:w-auto">
                            <button className="btn-secondary button-row w-button flex items-center justify-center small">Voir ce cours</button>
                        </Link>
                    </div>
                </div>
            ),
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/beginners" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours1.jpg" alt="Beginners" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                </div>
            ),
            color: "bg-secondary-2",
        },
    ];

    const timelineData2 = [
        {
            title: t("lessons.lowIntermediateLevel3.title"),
            subtitle: <></>,
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/dialogues" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours3.jpg" alt="Daily Life Dialogues" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                    <div className="flex flex-col">
                        <p className="mb-8">
                            Le <span className="heading-span-secondary-2">complément idéal</span> pour réussir votre examen FIDE B1 avec confiance.
                        </p>
                        <div className="flex justify-center w-full">
                            <Link href="/courses/dialogues" className="no-underline w-full sm:w-auto">
                                <ShimmerButton className="btn-primary button-row w-button flex items-center justify-center small !mr-0 w-full sm:w-auto min-w-60">Voir ce cours</ShimmerButton>
                            </Link>
                        </div>
                    </div>
                </div>
            ),
            color: "bg-secondary-5",
        },
        {
            title: t("lessons.lowIntermediateLevel2.title"),
            subtitle: <></>,
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours2.jpg" alt="Low Intermediates" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                    <div className="flex flex-col">
                        <p className="mb-8">Un passage clé vers le niveau B1, conçu pour une progression fluide et maîtrisée.</p>
                        <div className="flex justify-center w-full">
                            <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto">
                                <button className="btn-secondary button-row w-button flex items-center justify-center small">Voir ce cours</button>
                            </Link>
                        </div>
                    </div>
                </div>
            ),
            color: "bg-secondary-4",
        },
        {
            title: t("lessons.beginnerLevel1.title"),
            subtitle: <></>,
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/beginners" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours1.jpg" alt="Beginners" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                    <div className="flex flex-col">
                        <p className="mb-8">Commencez de zéro ou consolidez vos bases avec ce cours essentiel pour progresser rapidement.</p>
                        <div className="flex justify-center w-full">
                            <Link href="/courses/beginners" className="no-underline w-full sm:w-auto">
                                <button className="btn-secondary button-row w-button flex items-center justify-center small">Voir ce cours</button>
                            </Link>
                        </div>
                    </div>
                </div>
            ),
            color: "bg-secondary-2",
        },
    ];

    const timelineData3 = [
        {
            title: t("lessons.lowIntermediateLevel3.title"),
            subtitle: (
                <div className="flex flex-col">
                    <p className="mb-8">
                        Le <span className="heading-span-secondary-2">complément idéal</span> pour réussir votre examen FIDE B1 avec confiance.
                    </p>
                    <div className="flex justify-center w-full">
                        <Link href="/courses/dialogues" className="no-underline w-full sm:w-auto">
                            <ShimmerButton className="btn-primary button-row w-button flex items-center justify-center small !mr-0">Voir ce cours</ShimmerButton>
                        </Link>
                    </div>
                </div>
            ),
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/dialogues" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours3.jpg" alt="Daily Life Dialogues" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                    <p>{t("lessons.lowIntermediateLevel3.description")}</p>
                </div>
            ),
            color: "bg-secondary-5",
        },
        {
            title: t("lessons.lowIntermediateLevel2.title"),
            subtitle: (
                <div className="flex flex-col">
                    <p className="mb-8">Un passage clé vers le niveau B1, conçu pour une progression fluide et maîtrisée.</p>
                    <div className="flex justify-center w-full">
                        <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto">
                            <button className="btn-secondary button-row w-button flex items-center justify-center small">Voir ce cours</button>
                        </Link>
                    </div>
                </div>
            ),
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours2.jpg" alt="Low Intermediates" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                    <p>{t("lessons.lowIntermediateLevel2.description")}</p>
                </div>
            ),
            color: "bg-secondary-4",
        },
        {
            title: t("lessons.beginnerLevel1.title"),
            subtitle: (
                <div className="flex flex-col">
                    <p className="mb-8">Commencez de zéro ou consolidez vos bases avec ce cours essentiel pour progresser rapidement.</p>
                    <div className="flex justify-center w-full">
                        <Link href="/courses/beginners" className="no-underline w-full sm:w-auto">
                            <button className="btn-secondary button-row w-button flex items-center justify-center small">Voir ce cours</button>
                        </Link>
                    </div>
                </div>
            ),
            content: (
                <div className="flex flex-col gap-4 w-full">
                    <Link href="/courses/beginners" className="no-underline w-full sm:w-auto">
                        <Image src="/images/cours1.jpg" alt="Beginners" width={500} height={500} className="w-full h-auto contain rounded-2xl card link-card cursor-pointer" />
                    </Link>
                    <p>{t("lessons.beginnerLevel1.description")}</p>
                </div>
            ),
            color: "bg-secondary-2",
        },
    ];

    return (
        <div className="flex flex-col gap-12">
            <Timeline data={timelineData1} />
            <Timeline data={timelineData2} />
            <Timeline data={timelineData3} />
        </div>
    );
};
