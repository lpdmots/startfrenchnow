"use client";
import { m } from "framer-motion";
import { AiOutlineSound } from "react-icons/ai";
import { Popover } from "../animations/Popover";
import { CgNotes } from "react-icons/cg";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../sanity/RichTextComponents";
import { Block, PrimaryCategory, VocabItem } from "@/app/types/sfn/blog";
import { useEffect, useState } from "react";
import { CATEGORIESCOLORS, natures } from "@/app/lib/constantes";
import { FaInfoCircle } from "react-icons/fa";
import { useLocale } from "next-intl";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export const TabelVocSoundButton = ({ vocabItem }: { vocabItem: VocabItem }) => {
    const { soundFr: sound, french: text } = vocabItem;
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Cette vérification assure que le code est exécuté uniquement côté client
        if (typeof window !== "undefined") {
            setAudio(new Audio(cloudFrontDomain + sound));
        }
    }, [sound]);

    if (!sound) return <span className="pl-0 sm:pl-4 font-bold flex items-center">{text}</span>;
    return (
        <m.span
            className="pl-0 sm:pl-4 font-bold flex items-center underline decoration-dotted underline-offset-4 cursor-pointer decoration-1"
            onClick={audio ? () => audio.play() : undefined}
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
        >
            <AiOutlineSound className="mr-2 text-3xl md:text-4xl" style={{ minWidth: 30 }} />
            {text}
        </m.span>
    );
};

export const NotePopover = ({ vocabItem, category }: { vocabItem: VocabItem; category: PrimaryCategory }) => {
    const popoverText = usePopoverText(vocabItem, category);
    if (!popoverText) return null;

    return (
        <m.span
            className="cursor-pointer mr-0 sm:mr-2 "
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
        >
            <Popover content={<CgNotes />} popover={popoverText} small />
        </m.span>
    );
};

export const NotePopoverTransalation = ({ vocabItem, category }: { vocabItem: VocabItem; category: PrimaryCategory }) => {
    const popoverText = usePopoverText(vocabItem, category);
    if (!popoverText) return null;

    return (
        <m.span
            className="cursor-pointer"
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
        >
            <Popover content={<FaInfoCircle className="text-xl mt-2 ml-2" />} popover={popoverText} small />
        </m.span>
    );
};

export const usePopoverText = (vocabItem: VocabItem, category: PrimaryCategory) => {
    const locale = useLocale() as "fr" | "en";
    const { noteFr, noteEn, alternatives, example } = vocabItem;
    const note = locale === "fr" && noteFr ? noteFr : noteEn || noteFr;
    const nature = natures[vocabItem.nature as keyof typeof natures]?.[locale === "fr" ? "french" : "english"];
    const alternativesString = alternatives?.join(" - ");
    const isSomethingToShow = !!note || !!alternativesString || !!nature || !!example;

    if (!isSomethingToShow) return null;
    return (
        <>
            {!!alternativesString && (
                <p>
                    <span className="underline">Alternatives:</span> <b style={{ color: CATEGORIESCOLORS[category || "tips"] }}>{alternativesString}</b>
                </p>
            )}
            {!!nature && (
                <p className="mb-0">
                    <span className="underline mb-0">Nature:</span> <b style={{ color: CATEGORIESCOLORS[category || "tips"] }}>{nature}</b>
                </p>
            )}
            {!!note && <PortableText value={note} components={RichTextComponents(category)} />}
            {!!example && (
                <p>
                    <span className="underline">{locale === "fr" ? "Exemple :" : "Example:"}</span>
                    <span className="italic"> {example}</span>
                </p>
            )}
        </>
    );
};
