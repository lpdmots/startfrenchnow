"use client";
import React, { useEffect, useState } from "react";
import { getVocabItems } from "@/app/serverActions/exerciseActions";
import { VocabItem } from "@/app/types/sfn/blog";
import { AiOutlineSound } from "react-icons/ai";
import { m } from "framer-motion";
import { VscMute } from "react-icons/vsc";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const Sound = ({ vocabItemId, children, phonetics }: { vocabItemId: string; children: React.ReactNode; phonetics: string | undefined }) => {
    const [vocabItem, setVocabItem] = useState<VocabItem | null>(null);
    console.log("vocabItem", vocabItemId, vocabItem);
    useEffect(() => {
        const fetchData = async () => {
            if (vocabItemId) {
                const { vocabItems } = await getVocabItems([vocabItemId]);
                vocabItems?.length && setVocabItem(vocabItems[0]);
            }
        };
        fetchData();
    }, []);

    const sound = vocabItem?.soundFr;
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Cette vérification assure que le code est exécuté uniquement côté client
        if (typeof window !== "undefined" && sound) {
            setAudio(new Audio(cloudFrontDomain + sound));
        }
    }, [sound, vocabItem]);

    const soundComponent = (
        <m.span
            className="font-bold relative"
            onClick={audio ? () => audio.play() : undefined}
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
            style={{ minWidth: 30 }}
        ></m.span>
    );

    return (
        <m.span
            className="underline decoration-dotted underline-offset-4 decoration-1font-bold relative cursor-pointer"
            onClick={audio ? () => audio.play() : undefined}
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
            style={{ minWidth: 30 }}
        >
            <span style={{ width: 35, display: "inline-block" }}>
                {audio ? (
                    <AiOutlineSound className="mr-2 text-2xl md:text-3xl absolute top-0" style={{ minWidth: 30 }} />
                ) : (
                    <VscMute className="mr-2 text-2xl md:text-3xl absolute top-0" style={{ minWidth: 30 }} />
                )}
            </span>
            <span>
                {children}
                {phonetics && " (" + phonetics + ")"}
            </span>
        </m.span>
    );
};

export default Sound;
