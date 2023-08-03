"use client";
import { COLORVARIABLES, COLORVARIABLESLIGHT } from "@/app/lib/constantes";
import { Reference, Vocabulary } from "@/app/types/sfn/blog";
import React, { useEffect, useState } from "react";
import { BsCaretRightFill } from "react-icons/bs";
import fetchData from "@/app/lib/apiStories";
import { CgNotes } from "react-icons/cg";
import { AiOutlineSound } from "react-icons/ai";
import { Popover } from "../animations/Popover";
import { m } from "framer-motion";
import Spinner from "../common/Spinner";

interface Props {
    data: {
        color: "yellow" | "blue" | "red" | "purple" | "green";
        vocabulary: Reference;
    };
}

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

function TabelVoc({ data }: Props) {
    const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);

    useEffect(() => {
        const fetchVocabularyData = async () => {
            const vocabulary: Vocabulary = await fetchData("vocabulary", data.vocabulary._ref);
            setVocabulary(vocabulary);
        };
        fetchVocabularyData();
    }, []);

    const colorVar = COLORVARIABLES[data.color || "blue"];
    const colorLight = COLORVARIABLESLIGHT[data.color || "blue"];

    return (
        <div className="inner-container _600px---tablet center py-8">
            <div className="inner-container _500px---mbl center card overflow-hidden">
                <table id="customers">
                    <tbody className="bl">
                        <tr style={{ borderBottom: "solid 2px var(--neutral-800)", backgroundColor: colorVar }}>
                            <th>
                                <span className="pl-0 sm:pl-4" style={{ marginLeft: 26 }}>
                                    <img src="/images/france.png" style={{ height: 40, objectFit: "contain" }} />
                                </span>
                            </th>
                            <th>
                                <span className="pr-0 sm:pr-4">
                                    <img src="/images/royaume-uni.png" style={{ height: 40, objectFit: "contain" }} />
                                </span>
                            </th>
                        </tr>
                        {vocabulary ? (
                            vocabulary.lines.map((line, index) => {
                                const audio = new Audio(cloudFrontDomain + line.sound);
                                return (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "var(--neutral-100)" : colorLight }}>
                                        <td className="flex justify-between items-center">
                                            {line.sound ? (
                                                <m.span
                                                    className="pl-0 sm:pl-4 font-bold flex items-center underline decoration-dotted underline-offset-4 cursor-pointer decoration-1"
                                                    onClick={() => audio.play()}
                                                    whileHover={{ y: -2 }} // orange sur hover
                                                    whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
                                                    transition={{ duration: 0.2 }} // transition smooth
                                                >
                                                    {line.sound && <AiOutlineSound className="mr-2" />}
                                                    {line.french}
                                                </m.span>
                                            ) : (
                                                <span className="pl-0 sm:pl-4 font-bold flex items-center">{line.french}</span>
                                            )}
                                            <BsCaretRightFill style={{ color: "var(--neutral-600)", marginRight: 2, height: 16, objectFit: "contain", flexShrink: 0 }} />
                                        </td>
                                        <td>
                                            <div className="flex justify-between items-center">
                                                <span className="pr-0 sm:pr-4 font-bold">{line.english}</span>
                                                <m.span
                                                    className="cursor-pointer mr-0 sm:mr-2 "
                                                    whileHover={{ y: -2 }} // orange sur hover
                                                    whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
                                                    transition={{ duration: 0.2 }} // transition smooth
                                                >
                                                    {line.note && <Popover content={<CgNotes />} popover={line.note} small />}
                                                </m.span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={2}>
                                    <div className="flex flex-col items-center justify-center" style={{ minHeight: 450 }}>
                                        <Spinner radius maxHeight="40px" message="Chargement des données" />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TabelVoc;
