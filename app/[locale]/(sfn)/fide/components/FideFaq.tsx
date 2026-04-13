import { Accordion, AccordionContent, AccordionItem } from "@/app/components/ui/accordion";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { AccordionButton } from "@/app/components/common/Accordion/AccordionButton";
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
                        <span className="text-sm text-neutral-600">
                            Besoin d'un avis rapide ?{" "}
                            <LinkArrow url="#ContactForFIDECourses" target="_self" className="text-sm font-semibold inline-flex">
                                Prendre un entretien
                            </LinkArrow>
                        </span>
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
                        <span className="text-sm text-neutral-600">
                            S'entraîner au format ?{" "}
                            <LinkArrow url="/fide/mock-exams" target="_self" className="text-sm font-semibold inline-flex">
                                Voir les examens blancs
                            </LinkArrow>
                        </span>
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
                    <p>
                        Pour un parcours structuré,{" "}
                        <LinkArrow url="/fide/pack-fide" target="_self" className="font-semibold inline-flex">
                            découvrez le Pack FIDE
                        </LinkArrow>
                        .
                    </p>
                    <p className="mb-0">
                        Besoin de pratique guidée ?{" "}
                        <LinkArrow url="/fide/private-courses" target="_self" className="font-semibold inline-flex">
                            Cours privés
                        </LinkArrow>{" "}
                        ou{" "}
                        <LinkArrow url="/fide/mock-exams" target="_self" className="font-semibold inline-flex">
                            examens blancs
                        </LinkArrow>
                        .
                    </p>
                </>
            ),
        },
        {
            title: t("sujets_oral_examen.title"),
            content: (
                <>
                    <p>{t("sujets_oral_examen.content.part1")}</p>
                    <p>
                        Pour vous entraîner à l'oral,{" "}
                        <LinkArrow url="/fide/private-courses" target="_self" className="font-semibold inline-flex">
                            réservez des cours privés
                        </LinkArrow>{" "}
                        ou{" "}
                        <LinkArrow url="/fide/mock-exams" target="_self" className="font-semibold inline-flex">
                            testez des examens blancs
                        </LinkArrow>
                        .
                    </p>
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
                        <AccordionItem key={index} value={`item-${index}`}>
                            <RadixAccordion.Trigger className="w-full flex flex-col p-0" style={{ backgroundColor: "transparent" }}>
                                <AccordionButton>
                                    <div className="flex w-full justify-between items-center color-neutral-800 gap-6">
                                        <h3 className={isThin ? "font-bold text-lg md:text-xl mb-0 color-neutral-800 text-left" : "font-bold text-lg md:text-2xl mb-0 color-neutral-800 text-left"}>
                                            {item.title}
                                        </h3>
                                        <div
                                            className={
                                                isThin
                                                    ? "btn btn-secondary small border !border-neutral-300 !p-2 w-[44px] h-[44px] flex items-center justify-center"
                                                    : "btn btn-secondary small border-[3px] !p-2 w-[50px] h-[50px] flex items-center justify-center"
                                            }
                                        >
                                            <Plus />
                                        </div>
                                    </div>
                                    <AccordionContent className={isThin ? "text-base color-neutral-800 text-left pt-3 pb-0" : "text-lg color-neutral-800 text-left pt-4 pb-0"}>
                                        {item.content}
                                    </AccordionContent>
                                </AccordionButton>
                            </RadixAccordion.Trigger>
                        </AccordionItem>
                    </div>
                ))}
            </Accordion>
        </div>
    );
}
