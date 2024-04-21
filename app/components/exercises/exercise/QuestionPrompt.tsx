"use client";
import { Question, Response } from "@/app/types/sfn/blog";
import { createElement, useEffect, useMemo, useState } from "react";
import { splitAndKeepMultipleKeywords } from "@/app/lib/utils";
import Image from "next/image";
import { m } from "framer-motion";
import urlFor from "@/app/lib/urlFor";
import { AiOutlineSound } from "react-icons/ai";
import SimpleButton from "../../animations/SimpleButton";
import ImageMapper from "react-img-mapper";
import useImageDimensions from "@/app/hooks/exercises/exercise/useImageDimensions";
import { getOptionsList } from "./SelectLayout";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export default function QuestionPrompt({ currentQuestion, htmlElement, handler }: { currentQuestion: Question; htmlElement: "disabledInput" | "select" | "input"; handler?: HandlerFunction }) {
    const chunks = useMemo(() => splitAndKeepMultipleKeywords(currentQuestion.prompt?.text || "", keywordPairs(htmlElement === "disabledInput")), [currentQuestion.prompt, htmlElement]);
    if (!currentQuestion.prompt?.text) return null;

    let imgIndex = 0;
    let sndIndex = 0;
    let respIndex = 0;

    return (
        <div className="flex flex-col justify-center items-center gap-4 md:gap-8 w-full">
            <div className="card shadow-1 flex items-center p-4 w-full font-bold" style={{ minHeight: 100, minWidth: 250 }}>
                <div className="my-1 w-full ">
                    {chunks.map((chunk, index) => {
                        if (chunk === "RESP") {
                            respIndex++;
                            if (htmlElement === "disabledInput") {
                                return (
                                    <input
                                        key={respIndex}
                                        type="text"
                                        className="rounded-lg px-2 text-secondary-2 text-center my-1"
                                        style={{ width: 150, minHeight: 40 }}
                                        disabled
                                        name="response"
                                        placeholder="?"
                                        autoComplete="off"
                                    />
                                );
                            }
                            if (htmlElement === "select") {
                                return <SelectInput key={index} index={respIndex} responses={currentQuestion.responses} handler={handler as HandlerFunction} />;
                            }
                            return <TextInput key={index} index={respIndex} handler={handler as HandlerFunction} />;
                        }
                        if (chunk in renderers) {
                            return createElement(renderers[chunk], {
                                key: index,
                                imageData: currentQuestion.prompt.images?.[imgIndex++],
                                soundString: currentQuestion.prompt.sounds?.[sndIndex++],
                                currentQuestion,
                                handler: handler,
                            });
                        }
                        return <span key={index}>{chunk}</span>;
                    })}
                </div>
            </div>
        </div>
    );
}

const SelectInput: React.FC<{ index: number; responses: Response[]; handler: HandlerFunction }> = ({ index, responses, handler }) => {
    const selectedResponses = getOptionsList(responses, index);
    return (
        <select
            key={index}
            className="rounded-lg px-2 text-secondary-2 text-base md:text-lg font-bold my-1"
            style={{ minHeight: 40 }}
            onChange={(e) => handler(index, e)}
            autoComplete="off"
            defaultValue=""
        >
            <option value="" hidden></option>
            {selectedResponses.map((response, index) => (
                <option className="text-base md:text-lg font-bold mx-6" key={index} value={response.text}>
                    {response.text}
                </option>
            ))}
        </select>
    );
};

const TextInput: React.FC<{ index: number; handler: HandlerFunction }> = ({ index, handler }) => (
    <input
        key={index}
        type="text"
        className="rounded-lg px-2 text-secondary-2 my-1 mx-1 focus:border-secondary-2"
        style={{ width: 150, minHeight: 40 }}
        onChange={(e) => handler(index, e)}
        name="response"
        placeholder="..."
        autoComplete="off"
    />
);

const RenderImageBlock = ({ imageData }: { imageData: string }) => {
    if (!imageData) return null;
    return (
        <div className="w-full flex items-center justify-center my-2 rounded-xl overflow-hidden">
            <Image src={urlFor(imageData).url()} alt="image" height={350} width={500} className="object-contain h-auto rounded-xl" style={{ maxWidth: "100%", maxHeight: 350 }} />
        </div>
    );
};

const RenderImageSpan = ({ imageData }: { imageData: string }) => {
    if (!imageData) return null;
    return (
        <span className="mb-0 mx-2">
            <Image src={urlFor(imageData).url()} alt="image" height={75} width={75} className="object-contain" style={{ maxWidth: "100%" }} />
        </span>
    );
};

const RenderSoundBlock = ({ soundString }: { soundString: string }) => {
    if (!soundString) return null;
    const audio = new Audio(cloudFrontDomain + soundString);
    return (
        <div className="flex justify-center w-full">
            <SimpleButton>
                <m.div onClick={() => audio.play()} whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <AiOutlineSound className="text-5xl lg:text-6xl" />
                </m.div>
            </SimpleButton>
        </div>
    );
};

const RenderSoundSpan = ({ soundString }: { soundString: string }) => {
    if (!soundString) return null;
    const audio = new Audio(cloudFrontDomain + soundString);
    return (
        <m.span
            className="inline-block relative items-center cursor-pointer mx-2 w-7 lg:w-8"
            onClick={() => audio.play()}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
        >
            <AiOutlineSound className="text-3xl lg:text-4xl absolute -bottom-2 lg:-bottom-3" />
        </m.span>
    );
};

const RenderImageMap = ({ currentQuestion, handler }: { currentQuestion: Question; handler?: HandlerFunction }) => {
    const imageUrl = urlFor(currentQuestion.prompt.images?.[0]).url();
    const minHeight = useImageDimensions(currentQuestion.prompt.images?.[0]?.asset._ref || "", "image-map-container");
    const [parentWidth, setParentWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            const parent = document.getElementById("image-map-container");
            if (parent) {
                setParentWidth(parent.offsetWidth);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Pour initialiser parentWidth
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!imageUrl || !handler) return <p>Veuillez nous excuser, cette question comporte une erreur...</p>;

    const areas = currentQuestion.responses
        .map((response) => {
            try {
                return { ...JSON.parse(response.isCorrect || ""), preFillColor: "rgba(0, 0, 0, 0)", strokeColor: "rgba(0, 0, 0, 0)", fillColor: "rgba(0, 0, 0, 0)" };
            } catch (e) {
                console.error("Erreur lors du parsing de isCorrect:", e);
                return null;
            }
        })
        .filter(Boolean); // Filtrer les valeurs nulles ou incorrectes

    const MAP = {
        name: "image-map",
        areas: areas,
    };

    const handleClickOutside = () => {
        handler(0, null);
    };

    const handleClickArea = (area: any) => {
        handler(0, area);
    };
    console.log({ MAP });

    return (
        <div id="image-map-container" className="w-full flex items-center justify-center my-2 rounded-xl overflow-hidden cursor-pointer" style={{ maxWidth: "100%", minHeight }}>
            <m.div initial={{ scale: 1 }} whileTap={{ scale: 1.005 }}>
                <ImageMapper src={imageUrl} map={MAP} responsive={true} parentWidth={parentWidth} onImageClick={() => handleClickOutside()} onClick={(area) => handleClickArea(area)} />
            </m.div>
        </div>
    );
};

const renderers: any = {
    IMGBLOCK: RenderImageBlock,
    IMGSPAN: RenderImageSpan,
    SNDBLOCK: RenderSoundBlock,
    SNDSPAN: RenderSoundSpan,
    IMGMAP: RenderImageMap,
    BR: () => <br />,
};

type HandlerFunction = (responseNumber: number, e: any) => void;

const keywordPairs = (isForPrompt: boolean) => {
    return [
        { keyword: "RESPONSE", keywordReplace: "RESP", maxKeyword: isForPrompt ? 1 : Infinity },
        { keyword: "BREAK", keywordReplace: "BR", maxKeyword: isForPrompt ? 1 : Infinity },
        { keyword: "IMAGEBLOCK", keywordReplace: "IMGBLOCK", maxKeyword: Infinity },
        { keyword: "IMAGESPAN", keywordReplace: "IMGSPAN", maxKeyword: Infinity },
        { keyword: "SOUNDBLOCK", keywordReplace: "SNDBLOCK", maxKeyword: Infinity },
        { keyword: "SOUNDSPAN", keywordReplace: "SNDSPAN", maxKeyword: Infinity },
        { keyword: "IMAGEMAP", keywordReplace: "IMGMAP", maxKeyword: Infinity },
    ];
};
