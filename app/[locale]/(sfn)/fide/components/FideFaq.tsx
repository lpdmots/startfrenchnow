import { Accordion, AccordionContent, AccordionItem } from "@/app/components/ui/accordion";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { AccordionButton } from "@/app/components/common/Accordion/AccordionButton";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

export function FideFaq() {
    const t = useTranslations("Fide.FideFAQ");

    const data = [
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
                    <div className="flex justify-end">
                        <LinkArrow url="https://fide-info.ch/doc/708/fideFR_CompetencesLinguistiques.pdf">{t("de_quel_niveau_besoin.content.link")}</LinkArrow>
                    </div>
                </>
            ),
        },
        {
            title: t("ou_et_quand_passer_examen.title"),
            content: (
                <div>
                    <p>{t("ou_et_quand_passer_examen.content.part1")}</p>
                    <div className="flex justify-end">
                        <LinkArrow url="https://fide-service.ch/en/proofs/fide-test/#:~:text=The%20fide%20test%20assesses%20your,Secretariat%20for%20Migration%20(SEM)">
                            {t("ou_et_quand_passer_examen.content.link")}
                        </LinkArrow>
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
                        {t("preparation_examen.content.link1a")}{" "}
                        <span>
                            <LinkArrow url="#HeroFide" target="_self">
                                {t("preparation_examen.content.link1b")}
                            </LinkArrow>
                        </span>
                    </p>
                    <>
                        {t("preparation_examen.content.link2a")}{" "}
                        <span>
                            <LinkArrow url="#ContactForFIDECourses" target="_self">
                                {t("preparation_examen.content.link2b")}
                            </LinkArrow>
                        </span>
                    </>
                </>
            ),
        },
        {
            title: t("sujets_oral_examen.title"),
            content: (
                <>
                    <p>{t("sujets_oral_examen.content.part1")}</p>
                    <p>
                        {t("sujets_oral_examen.content.linka")}{" "}
                        <span>
                            <LinkArrow url="#whatIsFIDE" target="_self">
                                {t("sujets_oral_examen.content.linkb")}
                            </LinkArrow>
                        </span>
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
                    <LinkArrow url="#ContactForFIDECourses" target="_self">
                        {t("meilleure_ecole_preparation.content.link")}
                    </LinkArrow>
                </>
            ),
        },
    ];

    return (
        <div className="flex flex-col items-center">
            <SlideFromBottom>
                <div className="flex w-full justify-center">
                    <div className="text-center max-w-5xl">
                        <h2 className="display-2">{t.rich("title", intelRich())}</h2>
                        <p className="mg-bottom-48px">{t.rich("subtitle", intelRich())}</p>
                    </div>
                </div>
            </SlideFromBottom>
            <Accordion type="multiple" className="w-full flex flex-col gap-4 max-w-5xl">
                {data.map((item, index) => (
                    <div key={index} className="card link-card w-full">
                        <AccordionItem key={index} value={`item-${index}`}>
                            <RadixAccordion.Trigger className="w-full flex flex-col p-0" style={{ backgroundColor: "transparent" }}>
                                <AccordionButton>
                                    <div className="flex w-full justify-between items-center color-neutral-800 gap-6">
                                        <h3 className="font-bold text-lg md:text-2xl mb-0 color-neutral-800 text-left">{item.title}</h3>
                                        <div className="btn btn-secondary small border-[3px] !p-2 w-[50px] h-[50px] flex items-center justify-center">
                                            <Plus />
                                        </div>
                                    </div>
                                    <AccordionContent className="text-lg color-neutral-800 text-left pt-4 pb-0">{item.content}</AccordionContent>
                                </AccordionButton>
                            </RadixAccordion.Trigger>
                        </AccordionItem>
                    </div>
                ))}
            </Accordion>
        </div>
    );
}
