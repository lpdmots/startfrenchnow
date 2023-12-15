"use client";
import { m } from "framer-motion";
import { AiOutlineSound } from "react-icons/ai";
import { Popover } from "../animations/Popover";
import { CgNotes } from "react-icons/cg";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../sanity/RichTextComponents";
import { Block } from "@/app/types/sfn/blog";
import { useEffect, useState } from "react";
import { usePostLang } from "@/app/hooks/usePostLang";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

interface TabelVocSoundButtonProps {
    sound: string;
    text: string;
}

export const TabelVocSoundButton = ({ sound, text }: TabelVocSoundButtonProps) => {
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
            <AiOutlineSound className="mr-2" />
            {text}
        </m.span>
    );
};

interface NotePopoverProps {
    noteFr?: Block[];
    noteEn?: Block[];
}
export const NotePopover = ({ noteFr, noteEn }: NotePopoverProps) => {
    const postLang = usePostLang();
    const note = postLang === "fr" && noteFr ? noteFr : noteEn || noteFr;

    if (!note) return null;
    return (
        <m.span
            className="cursor-pointer mr-0 sm:mr-2 "
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
        >
            {note && <Popover content={<CgNotes />} popover={<PortableText value={note} components={RichTextComponents()} />} small />}
        </m.span>
    );
};
