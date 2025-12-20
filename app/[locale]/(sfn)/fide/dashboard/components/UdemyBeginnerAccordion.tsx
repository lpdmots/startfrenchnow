"use client";

import { FidePackSommaire, getPackSommaire } from "@/app/serverActions/productActions";
import { Locale } from "@/i18n";
import { useEffect, useState } from "react";
import { CoursesAccordionClient } from "../../components/CoursesAccordionClient";
import { Progress } from "@/app/types/sfn/auth";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { HeroData, buildHeroData } from "./dashboardUtils";
import Spinner from "@/app/components/common/Spinner";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";

const FIDE_USER_PROGRESS_QUERY = groq`
  *[_type == "user" && _id == $userId][0].learningProgress[type == "udemy_course_beginner"][0]{
    _key,
    type,
    videoLogs,
  }
`;

export const UdemyBeginnerAccordion = ({ locale, userId, hasPack }: { locale: Locale; userId?: string; hasPack: boolean }) => {
    const [packSommaire, setPackSommaire] = useState<FidePackSommaire | null>(null);
    const [hero, setHero] = useState<HeroData | null>(null);
    const [openModuleKeys, setOpenModuleKeys] = useState<string[]>([]);
    const t = useTranslations("VideosSection");

    useEffect(() => {
        const fetchData = async () => {
            const [fidePackSommaire, fideUserProgress] = await Promise.all([
                getPackSommaire(locale, "udemy_course_beginner"),
                userId ? client.fetch<Progress>(FIDE_USER_PROGRESS_QUERY, { userId }) : Promise.resolve(null),
            ]);
            const hero = buildHeroData(fideUserProgress, fidePackSommaire, []);
            setPackSommaire(fidePackSommaire);
            setHero(hero);
        };
        if (openModuleKeys.length && !packSommaire) fetchData();
    }, [openModuleKeys.length]);

    return (
        <Accordion type="multiple" value={openModuleKeys} onValueChange={setOpenModuleKeys} className="w-full text-neutral-800">
            <AccordionItem value="udemy-beginner">
                <AccordionTrigger className="hover:no-underline rounded-lg text-neutral-800 border-2 border-solid border-neutral-800 bg-neutral-100 sm:mx-4">
                    <div className="flex flex-col sm:flex-row w-full sm:items-center justify-between pr-4 sm:flex-wrap">
                        <div className="flex gap-2 mr-2">
                            <p className="font-medium text-neutral-800 text-base mb-0">Les Bases du Français A0 {">"} A2</p>
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent>
                    {packSommaire && hero ? (
                        <CoursesAccordionClient
                            fidePackSommaire={packSommaire}
                            hasPack={hasPack}
                            expandAll={false}
                            defaultModuleKeyIndex={0}
                            currentPostSlug={hero.video?.main?.slug}
                            linkPrefix="/courses/beginners/"
                            noPadding={true}
                            withPackageName={false}
                        />
                    ) : (
                        <div className="min-h-[200px] flex items-center justify-center w-full">
                            <Spinner radius maxHeight="30px" color="var(--neutral-600)" />
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
