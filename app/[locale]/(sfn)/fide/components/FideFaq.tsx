import { Accordion, AccordionContent, AccordionItem } from "@/app/components/ui/accordion";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { ReactNode } from "react";

type FideFaqItem = {
    title: string;
    content: ReactNode;
};

type FideFaqProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    items?: FideFaqItem[];
    variant?: "default" | "thin";
    showHeader?: boolean;
    className?: string;
    maxWidthClassName?: string;
};

export function FideFaq({ title, subtitle, items, variant = "default", showHeader = true, className = "", maxWidthClassName = "max-w-5xl" }: FideFaqProps = {}) {
    const t = useTranslations("Fide.FideFAQ");
    const rich = intelRich();
    const quickAdviceRich = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="#ContactForFIDECourses" target="_self" className="text-sm font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };
    const trainFormatRich = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/mock-exams" target="_self" className="text-sm font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };
    const structuredPathRich = {
        ...rich,
        link: (chunks: ReactNode) => (
            <LinkArrow url="/fide/pack-fide" target="_self" className="font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };
    const guidedPracticeRich = {
        ...rich,
        private: (chunks: ReactNode) => (
            <LinkArrow url="/fide/private-courses" target="_self" className="font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
        mock: (chunks: ReactNode) => (
            <LinkArrow url="/fide/mock-exams" target="_self" className="font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };
    const oralPracticeRich = {
        ...rich,
        private: (chunks: ReactNode) => (
            <LinkArrow url="/fide/private-courses" target="_self" className="font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
        mock: (chunks: ReactNode) => (
            <LinkArrow url="/fide/mock-exams" target="_self" className="font-semibold inline-flex">
                {chunks}
            </LinkArrow>
        ),
    };

    const data: FideFaqItem[] = items ?? [
        {
            title: t("qu_est_ce_que_fide.title"),
            content: <p>{t("qu_est_ce_que_fide.content")}</p>,
        },
        {
            title: t("de_quel_niveau_besoin.title"),
            content: (
                <>
                    <p>{t("de_quel_niveau_besoin.content.part1")}</p>
                    <ul>
                        <li>{t("de_quel_niveau_besoin.content.list.item1")}</li>
                        <li>{t("de_quel_niveau_besoin.content.list.item2")}</li>
                        <li>{t("de_quel_niveau_besoin.content.list.item3")}</li>
                        <li>{t("de_quel_niveau_besoin.content.list.item4")}</li>
                    </ul>
                    <p>{t("de_quel_niveau_besoin.content.part2")}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <LinkArrow url="https://fide-info.ch/doc/708/fideFR_CompetencesLinguistiques.pdf">{t("de_quel_niveau_besoin.content.link")}</LinkArrow>
                        <span className="text-sm text-neutral-600">{t.rich("quickAdvice.text", quickAdviceRich)}</span>
                    </div>
                </>
            ),
        },
        {
            title: t("ou_et_quand_passer_examen.title"),
            content: (
                <div>
                    <p>{t("ou_et_quand_passer_examen.content.part1")}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <LinkArrow url="https://fide-service.ch/en/proofs/fide-test/#:~:text=The%20fide%20test%20assesses%20your,Secretariat%20for%20Migration%20(SEM)">
                            {t("ou_et_quand_passer_examen.content.link")}
                        </LinkArrow>
                        <span className="text-sm text-neutral-600">{t.rich("trainFormat.text", trainFormatRich)}</span>
                    </div>
                </div>
            ),
        },
        {
            title: t("combien_de_temps_examen.title"),
            content: <p>{t("combien_de_temps_examen.content")}</p>,
        },
        {
            title: t("parties_examen.title"),
            content: (
                <div>
                    <p>{t("parties_examen.content.part1")}</p>
                    <ul>
                        <li>{t.rich("parties_examen.content.list.item1", intelRich())}</li>
                        <li>{t.rich("parties_examen.content.list.item2", intelRich())}</li>
                    </ul>
                </div>
            ),
        },
        {
            title: t("combien_coute_examen.title"),
            content: <p>{t("combien_coute_examen.content")}</p>,
        },
        {
            title: t("resultats_examen.title"),
            content: <p>{t("resultats_examen.content")}</p>,
        },
        {
            title: t("validite_examen.title"),
            content: <p>{t("validite_examen.content")}</p>,
        },
        {
            title: t("nombre_de_passages.title"),
            content: (
                <>
                    <p>{t("nombre_de_passages.content.part1")}</p>
                    <p>{t("nombre_de_passages.content.part2")}</p>
                </>
            ),
        },
        {
            title: t("difficulte_examen.title"),
            content: <p>{t("difficulte_examen.content")}</p>,
        },
        {
            title: t("duree_obtention_b1.title"),
            content: (
                <>
                    <p>{t("duree_obtention_b1.content.part1")}</p>
                    <p>{t("duree_obtention_b1.content.part2")}</p>
                    <p>{t("duree_obtention_b1.content.part3")}</p>
                    <p>{t("duree_obtention_b1.content.part4")}</p>
                </>
            ),
        },
        {
            title: t("preparation_examen.title"),
            content: (
                <>
                    <p>{t("preparation_examen.content.part1")}</p>
                    <p>{t("preparation_examen.content.part2")}</p>
                    <p>{t.rich("structuredPath.text", structuredPathRich)}</p>
                    <p className="mb-0">{t.rich("guidedPractice.text", guidedPracticeRich)}</p>
                </>
            ),
        },
        {
            title: t("sujets_oral_examen.title"),
            content: (
                <>
                    <p>{t("sujets_oral_examen.content.part1")}</p>
                    <p>{t.rich("oralPractice.text", oralPracticeRich)}</p>
                </>
            ),
        },
        {
            title: t("meilleure_ecole_preparation.title"),
            content: (
                <>
                    <p>{t("meilleure_ecole_preparation.content.part1")}</p>
                    <p>{t("meilleure_ecole_preparation.content.part2")}</p>
                    <ul>
                        <li>{t("meilleure_ecole_preparation.content.list.item1")}</li>
                        <li>{t("meilleure_ecole_preparation.content.list.item2")}</li>
                        <li>{t("meilleure_ecole_preparation.content.list.item3")}</li>
                        <li>{t("meilleure_ecole_preparation.content.list.item4")}</li>
                    </ul>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <LinkArrow url="#ContactForFIDECourses" target="_self">
                            {t("meilleure_ecole_preparation.content.link")}
                        </LinkArrow>
                    </div>
                </>
            ),
        },
    ];
    const isThin = variant === "thin";
    const resolvedTitle = title ?? t.rich("title", intelRich());
    const resolvedSubtitle = subtitle ?? t.rich("subtitle", intelRich());

    return (
        <div className={`flex flex-col items-center px-2 ${className}`.trim()}>
            {showHeader ? (
                <SlideFromBottom>
                    <div className="flex w-full justify-center">
                        <div className={`text-center ${maxWidthClassName}`.trim()}>
                            <h2 className="display-2 pb-4 lg:pb-8">{resolvedTitle}</h2>
                            <p className="mg-bottom-48px">{resolvedSubtitle}</p>
                        </div>
                    </div>
                </SlideFromBottom>
            ) : null}
            <Accordion type="multiple" className={`w-full flex flex-col ${isThin ? "gap-2 md:gap-3" : "gap-2 md:gap-4"} ${maxWidthClassName}`.trim()}>
                {data.map((item, index) => (
                    <div key={index} className={isThin ? "w-full rounded-2xl border border-neutral-300 bg-neutral-100 shadow-sm" : "card link-card w-full"}>
                        <AccordionItem value={`item-${index}`}>
                            <RadixAccordion.Trigger className="group flex w-full flex-col p-0" style={{ backgroundColor: "transparent" }}>
                                <div className="w-full p-4">
                                    <div className="flex w-full justify-between items-center color-neutral-800 gap-6">
                                        <h3
                                            className={
                                                isThin
                                                    ? "mb-0 text-left text-lg font-bold color-neutral-800 group-hover:underline md:text-xl"
                                                    : "mb-0 text-left text-lg font-bold color-neutral-800 group-hover:underline md:text-2xl"
                                            }
                                        >
                                            {item.title}
                                        </h3>
                                        <div
                                            aria-hidden="true"
                                            className={
                                                isThin
                                                    ? "btn btn-secondary small flex h-[44px] w-[44px] shrink-0 items-center justify-center border !border-neutral-300 !p-2"
                                                    : "btn btn-secondary small flex h-[50px] w-[50px] shrink-0 items-center justify-center border-[3px] !p-2"
                                            }
                                        >
                                            <Plus
                                                aria-hidden="true"
                                                className="transition-transform duration-150 ease-out group-data-[state=open]:rotate-45 motion-reduce:transition-none"
                                                strokeWidth={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </RadixAccordion.Trigger>
                            <AccordionContent className={isThin ? "px-4 pb-4 pt-0 text-left text-base color-neutral-800" : "px-4 pb-4 pt-0 text-left text-lg color-neutral-800"}>
                                {item.content}
                            </AccordionContent>
                        </AccordionItem>
                    </div>
                ))}
            </Accordion>
        </div>
    );
}
