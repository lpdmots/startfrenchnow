"use client";
import { CATEGORIESCOLORS, CATEGORIESCOLORSSHADES } from "@/app/lib/constantes";
import { shuffleArray } from "@/app/lib/utils";
import { FlashcardsProps, Reference, Theme, ThemeWithVocab, VocabItem } from "@/app/types/sfn/blog";
import React, { useRef, useEffect, useState, MouseEvent, RefObject, useMemo } from "react";
import { AiOutlineSwap } from "react-icons/ai";
import { IoShuffleOutline } from "react-icons/io5";
import SimpleButton from "../animations/SimpleButton";
import Spinner from "../common/Spinner";
import { AiOutlineSound } from "react-icons/ai";
import { m } from "framer-motion";
import { usePostLang } from "@/app/hooks/usePostLang";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../sanity/RichTextComponents";
import { getThemes } from "@/app/serverActions/exerciseActions";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;
const DEFAULTCONTENT = {
    fr: {
        title: "Flashcards",
        instruction: "Les flashcards sont un moyen ludique de mémoriser le vocabulaire. N'hésite pas à explorer les différentes options pour varier les plaisirs.",
        shuffle: "Mélanger",
        swapFaces: "Inverser",
        withSound: "Voix",
        loading: "Chargement...",
    },
    en: {
        title: "Flashcards",
        instruction: "Flashcards are a fun way to memorize vocabulary. Feel free to explore the different options to vary the pleasures.",
        shuffle: "Shuffle",
        swapFaces: "Swap faces",
        withSound: "Voices",
        loading: "Loading...",
    },
};

interface Props {
    data: FlashcardsProps;
}

interface DragStart {
    startX: number;
    startScrollLeft: number;
    isDragging: boolean;
}

export default function Flashcards({ data }: Props) {
    const [theme, setTheme] = useState<ThemeWithVocab | null>(null);

    useEffect(() => {
        const fetchThemeData = async () => {
            const { themes } = await getThemes(data.themes.map((theme) => theme._ref));
            const vocabItems = themes?.map((theme) => theme.vocabItems).flat();
            if (!themes || !vocabItems?.length) return console.warn("No themes or vocabItems found");
            setTheme({ ...themes[0], vocabItems });
        };

        fetchThemeData();
    }, [data.themes]);

    return <FlashcardsRender data={data} theme={theme} />;
}

function FlashcardsRender({ data, theme }: { data: FlashcardsProps; theme: ThemeWithVocab | null }) {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [shuffledCards, setShuffledCards] = useState<VocabItem[]>(shuffleArray(theme?.vocabItems || []));
    const [isFrontFrench, setIsFrontFrench] = useState<boolean>(true);
    const [voices, setVoices] = useState<boolean>(false);
    const [{ startX, startScrollLeft, isDragging }, setDragStart] = useState<DragStart>({ startX: 0, startScrollLeft: 0, isDragging: false });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const cardRefs = useRef<RefObject<HTMLDivElement>[]>([]);
    const colorVar = CATEGORIESCOLORS[data.category || "vocabulary"];
    const colorVarLight = CATEGORIESCOLORSSHADES[data.category || "vocabulary"];

    const postLang = usePostLang();
    const { title, instruction, shuffle, swapFaces, withSound, loading } = useMemo(() => getContent(postLang, data), [postLang, data]);

    useEffect(() => {
        setShuffledCards(shuffleArray(theme?.vocabItems || []));
    }, [theme]);

    useEffect(() => {
        if (containerRef.current) {
            const { scrollWidth, clientWidth } = containerRef.current;
            const halfScroll = (scrollWidth - clientWidth) / 2;
            containerRef.current.scrollLeft = halfScroll;
        }
    }, []);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            setDragStart({
                startX: e.pageX - containerRef.current.offsetLeft,
                startScrollLeft: containerRef.current.scrollLeft,
                isDragging: true,
            });
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = x - startX;
        containerRef.current.scrollLeft = startScrollLeft - walk;
    };

    const selectCard = (card: number) => {
        setSelectedCard(card === selectedCard ? null : card);
        if (card !== null && selectedCard === null && cardRefs.current[card - 1]?.current) {
            cardRefs?.current[card - 1]?.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    };

    const handleCardMouseUp = (e: MouseEvent<HTMLDivElement>, card: number) => {
        if ((e.target as HTMLElement).closest(".audioButton")) return;

        if (isDragging && containerRef.current) {
            const x = e.pageX - containerRef.current.offsetLeft;
            const walk = x - startX;
            if (Math.abs(walk) < 5) selectCard(card);
        } else selectCard(card);
    };

    const handleRefresh = () => {
        setShuffledCards(shuffleArray(theme?.vocabItems || []));
    };

    const handleVoice = () => {
        setVoices((prev) => !prev);
    };

    return (
        <div className="my-12">
            <div className="flex flex-col">
                <h2>{title}</h2>
                {instruction}
                <div className="flex justify-center gap-6 mb-4 items-center">
                    <div onClick={handleRefresh}>
                        <SimpleButton>
                            <IoShuffleOutline />
                            <p className="pl-1 mb-0 font-bold">{shuffle}</p>
                        </SimpleButton>
                    </div>
                    <div onClick={() => setIsFrontFrench((isFrontFrench) => !isFrontFrench)}>
                        <SimpleButton>
                            <AiOutlineSwap />
                            <p className="pl-1 mb-0 font-bold">{swapFaces}</p>
                        </SimpleButton>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper mb-0">
                        <label className="w-form-label flex items-center justify-center" onClick={handleVoice}>
                            <div
                                id="checkbox"
                                className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${voices ? "w--redirected-checked" : undefined} mr-0`}
                                style={{ minHeight: 18, minWidth: 18 }}
                            ></div>
                            <p className="pl-1 mb-0 font-bold">{withSound}</p>
                        </label>
                    </div>
                </div>
            </div>
            <div
                className="flashcards card"
                style={{ backgroundColor: colorVar }}
                onMouseDown={handleMouseDown}
                onMouseUp={() => setDragStart((prev) => ({ ...prev, isDragging: false }))}
                onMouseMove={handleMouseMove}
            >
                <div className="flashcards__container" ref={containerRef}>
                    {shuffledCards.map((card, i) => {
                        return (
                            <div
                                className={`card cardFlash ${selectedCard === i ? "flipped left-shadow-1" : "shadow-1"}`}
                                key={i}
                                ref={(el: any) => cardRefs.current.push(el)}
                                onMouseUp={(e) => handleCardMouseUp(e, i)}
                            >
                                <div className="card__face card__face--front flex justify-center items-center">
                                    <FrontCardContent isFrontFrench={isFrontFrench} voices={voices} card={card} />
                                </div>
                                <div className="card__face card__face--back flex justify-center items-center only-radius" style={{ backgroundColor: colorVarLight }}>
                                    <BackCardContent isFrontFrench={isFrontFrench} voices={voices} card={card} />
                                </div>
                            </div>
                        );
                    })}
                    {!shuffledCards.length && (
                        <div className="flex justify-center items-center w-full" style={{ minHeight: 323 }}>
                            <Spinner radius maxHeight="40px" message={loading} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CardContentProps {
    isFrontFrench: boolean;
    voices: boolean;
    card: VocabItem;
}

interface AudioButtonProps {
    card: VocabItem;
    handleAudio: (e: MouseEvent<HTMLParagraphElement, globalThis.MouseEvent>) => void;
    fontSize: number;
}

interface CardTextProps {
    text: string;
}

// Création d'un composant réutilisable pour le bouton audio
const AudioButton: React.FC<AudioButtonProps> = ({ card, handleAudio, fontSize }) => (
    <m.p
        className="audioButton pl-0 sm:pl-4 font-bold flex items-center underline decoration-dotted underline-offset-4 cursor-pointer decoration-1"
        onClick={handleAudio}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
    >
        {card.soundFr && <AiOutlineSound style={{ fontSize }} />}
    </m.p>
);

// Création d'un composant réutilisable pour le texte de la carte
const CardText: React.FC<CardTextProps> = ({ text }) => <p className="p-2 text-3xl font-extrabold text-center mb-0">{text}</p>;

const FrontCardContent: React.FC<CardContentProps> = ({ isFrontFrench, voices, card }) => {
    const audio = useMemo(() => new Audio(cloudFrontDomain + card.soundFr), [card.soundFr]);

    const handleAudio = (e: MouseEvent<HTMLParagraphElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        audio.play();
    };

    if (voices) {
        return isFrontFrench ? <AudioButton card={card} handleAudio={handleAudio} fontSize={60} /> : <CardText text={card.english} />;
    } else {
        return <CardText text={isFrontFrench ? card.french : card.english} />;
    }
};

const BackCardContent: React.FC<CardContentProps> = ({ isFrontFrench, voices, card }) => {
    const audio = useMemo(() => new Audio(cloudFrontDomain + card.soundFr), [card.soundFr]);

    const handleAudio = (e: MouseEvent<HTMLParagraphElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        audio.play();
    };

    if (voices) {
        if (isFrontFrench) {
            return (
                <div>
                    <CardText text={card.french} />
                    <p className="p-2 text-2xl text-center mb-0">{card.english}</p>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center">
                    <AudioButton card={card} handleAudio={handleAudio} fontSize={40} />
                    <CardText text={card.french} />
                </div>
            );
        }
    } else {
        return <CardText text={isFrontFrench ? card.english : card.french} />;
    }
};

const getContent = (postLang: "fr" | "en", data: FlashcardsProps) => {
    const instructionData = data[`instruction${postLang === "en" ? "_en" : ""}`];
    return {
        title: data[`title${postLang === "en" ? "_en" : ""}`] || DEFAULTCONTENT[postLang].title,
        instruction: instructionData ? <PortableText value={instructionData} components={RichTextComponents(data?.category)} /> : <p>{DEFAULTCONTENT[postLang].instruction}</p>,
        shuffle: DEFAULTCONTENT[postLang].shuffle,
        swapFaces: DEFAULTCONTENT[postLang].swapFaces,
        withSound: DEFAULTCONTENT[postLang].withSound,
        loading: DEFAULTCONTENT[postLang].loading,
    };
};
