"use client";
import { COLORVARIABLES } from "@/app/lib/constantes";
import { ColorsTypes, Reference, ThemeWithVocab } from "@/app/types/sfn/blog";
import React, { useEffect, useState } from "react";
import { BsCaretRightFill } from "react-icons/bs";
import fetchData from "@/app/lib/apiStories";
import { CgNotes } from "react-icons/cg";
import { AiOutlineSound } from "react-icons/ai";
import { Popover } from "../../animations/Popover";
import { m } from "framer-motion";
import Spinner from "../../common/Spinner";
import Image from "next/image";
import { getThemes } from "@/app/serverActions/exerciseActions";

interface Props {
    data: {
        color: ColorsTypes;
        themes: Reference[];
    };
}

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

function TabelVoc({ data }: Props) {
    const [theme, setTheme] = useState<ThemeWithVocab | null>(null);

    useEffect(() => {
        const fetchThemeData = async () => {
            const { themes } = await getThemes(data.themes.map((theme) => theme._ref));
            console.log(themes);
            const vocabItems = themes?.map((theme) => theme.vocabItems).flat();
            if (!themes || !vocabItems?.length) return console.warn("No themes or vocabItems found");
            setTheme({ ...themes[0], vocabItems });
        };

        fetchThemeData();
    }, [data.themes]);

    const colorVar = COLORVARIABLES[data.color || "blue"];
    const colorLight = "var(--neutral-200)";

    return (
        <div className="inner-container _600px---tablet center py-8">
            <div className="inner-container _500px---mbl center card overflow-hidden">
                <table id="customers">
                    <tbody className="bl">
                        <tr style={{ borderBottom: "solid 2px var(--neutral-800)", backgroundColor: colorVar }}>
                            <th>
                                <span className="pl-0 sm:pl-4" style={{ marginLeft: 26 }}>
                                    <Image src="/images/france.png" height={40} width={50} alt="french flag" style={{ objectFit: "contain" }} />
                                </span>
                            </th>
                            <th>
                                <span className="pr-0 sm:pr-4">
                                    <Image src="/images/royaume-uni.png" alt="UK flag" height={40} width={50} style={{ height: 40, objectFit: "contain" }} />
                                </span>
                            </th>
                        </tr>
                        {theme ? (
                            theme.vocabItems.map((vocabItem, index) => {
                                const audio = new Audio(cloudFrontDomain + vocabItem.soundFr);
                                return (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "var(--neutral-100)" : colorLight }}>
                                        <td className="flex justify-between items-center">
                                            {vocabItem.soundFr ? (
                                                <m.span
                                                    className="pl-0 sm:pl-4 font-bold flex items-center underline decoration-dotted underline-offset-4 cursor-pointer decoration-1"
                                                    onClick={() => audio.play()}
                                                    whileHover={{ y: -2 }} // orange sur hover
                                                    whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
                                                    transition={{ duration: 0.2 }} // transition smooth
                                                >
                                                    {vocabItem.soundFr && <AiOutlineSound className="mr-2" />}
                                                    {vocabItem.french}
                                                </m.span>
                                            ) : (
                                                <span className="pl-0 sm:pl-4 font-bold flex items-center">{vocabItem.french}</span>
                                            )}
                                            <BsCaretRightFill style={{ color: "var(--neutral-600)", marginRight: 2, height: 16, objectFit: "contain", flexShrink: 0 }} />
                                        </td>
                                        <td>
                                            <div className="flex justify-between items-center">
                                                <span className="pr-0 sm:pr-4 font-bold">{vocabItem.english}</span>
                                                <m.span
                                                    className="cursor-pointer mr-0 sm:mr-2 "
                                                    whileHover={{ y: -2 }} // orange sur hover
                                                    whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
                                                    transition={{ duration: 0.2 }} // transition smooth
                                                >
                                                    {vocabItem.note && <Popover content={<CgNotes />} popover={vocabItem.note} small />}
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
                                        <Spinner radius maxHeight="40px" message="Chargement des données" color={colorVar} />
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
