"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIESCOLORS, CATEGORIESCOLORSSHADES } from "@/app/lib/constantes";
import { shuffleArray } from "@/app/lib/utils";
import { FlashcardsProps, Reference, TabelVocFilters, Theme, ThemeWithVocab, VocabItem } from "@/app/types/sfn/blog";
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

export default function Flashcards({ data }: Props) {
    const [theme, setTheme] = useState<ThemeWithVocab | null>(null);

    useEffect(() => {
        const fetchThemeData = async () => {
            const { themes } = await getThemes(data.themes.map((theme) => theme._ref));
            const allVocabItems = themes?.map((theme) => theme.vocabItems).flat();
            const vocabItems = allVocabItems?.filter((item) => filterVocabItems(item, data.filters));
            if (!themes || !vocabItems?.length) return console.warn("No themes or vocabItems found");
            setTheme({ ...themes[0], vocabItems });
        };

        fetchThemeData();
    }, [data.themes]);

    return <FlashCardsWrapper data={data} theme={theme} />;
}

const FlashCardsWrapper = ({ data, theme }: { data: FlashcardsProps; theme: ThemeWithVocab | null }) => {
    const [shuffledCards, setShuffledCards] = useState<VocabItem[]>(shuffleArray(theme?.vocabItems || []));
    const [isFrontFrench, setIsFrontFrench] = useState<boolean>(true);
    const [voices, setVoices] = useState<boolean>(false);
    const colorVar = CATEGORIESCOLORS[theme?.category || "vocabulary"];
    const colorVarLight = CATEGORIESCOLORSSHADES[theme?.category || "vocabulary"];
    const options = data.options;
    const containerRef = useRef<HTMLDivElement | null>(null);

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

    const handleRefresh = () => {
        setShuffledCards(shuffleArray(theme?.vocabItems || []));
    };

    const handleVoice = () => {
        setVoices((prev) => !prev);
    };

    return (
        <div className="my-12">
            <div className="flex flex-col">
                <h3>{title}</h3>
                {instruction}
                <div className="flex justify-center gap-6 mb-4 cards-center">
                    {options?.shuffle !== false && (
                        <div onClick={handleRefresh}>
                            <SimpleButton>
                                <IoShuffleOutline />
                                <p className="pl-1 mb-0 font-bold">{shuffle}</p>
                            </SimpleButton>
                        </div>
                    )}
                    {options?.swapFaces !== false && (
                        <div onClick={() => setIsFrontFrench((isFrontFrench) => !isFrontFrench)}>
                            <SimpleButton>
                                <AiOutlineSwap />
                                <p className="pl-1 mb-0 font-bold">{swapFaces}</p>
                            </SimpleButton>
                        </div>
                    )}
                    {options?.withSound !== false && (
                        <div className="w-checkbox checkbox-field-wrapper mb-0">
                            <label className="w-form-label flex cards-center justify-center" onClick={handleVoice}>
                                <div
                                    id="checkbox"
                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${voices ? "w--redirected-checked" : undefined} mr-0`}
                                    style={{ minHeight: 18, minWidth: 18 }}
                                ></div>
                                <p className="pl-1 mb-0 font-bold">{withSound}</p>
                            </label>
                        </div>
                    )}
                </div>
            </div>
            <div className="flashcards card" style={{ backgroundColor: colorVar, overflow: "hidden" }}>
                {!shuffledCards.length ? (
                    <div className="flex justify-center items-center cards-center w-full h-full" style={{ minHeight: 323 }}>
                        <Spinner radius maxHeight="40px" message={loading} />
                    </div>
                ) : (
                    <FlashCardsCarousel cards={shuffledCards} isFrontFrench={isFrontFrench} voices={voices} colorVarLight={colorVarLight} />
                )}
            </div>
        </div>
    );
};

interface FlashCardsCarouselProps {
    isFrontFrench: boolean;
    voices: boolean;
    cards: VocabItem[];
    colorVarLight: string;
}

function FlashCardsCarousel({ cards, isFrontFrench, voices, colorVarLight }: FlashCardsCarouselProps) {
    const [[activeIndex, direction], setActiveIndex] = useState<[number, number]>([0, 0]);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const indexInArrayScope = ((activeIndex % cards.length) + cards.length) % cards.length;
    const visibleCards = [...cards, ...cards].slice(indexInArrayScope, indexInArrayScope + 3);

    const handleClick = (newDirection: number) => {
        setActiveIndex((prevIndex) => [prevIndex[0] + newDirection, newDirection]);
        setTimeout(() => setSelectedCard(null), 10);
    };

    const handleCardClick = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, cardFrench: string) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).closest(".audioButton")) return;
        setSelectedCard(cardFrench === selectedCard ? null : cardFrench);
    };

    return (
        <div className="flashcard-main-wrapper">
            <div className="flashcard-wrapper">
                <AnimatePresence mode="popLayout" initial={false}>
                    {visibleCards.map((card, i) => {
                        const isSelected = selectedCard === card.french;
                        return (
                            <motion.div
                                className="flashcard"
                                key={card.french}
                                layout
                                custom={{
                                    direction,
                                    position: () => {
                                        if (card === visibleCards[0]) {
                                            return "left";
                                        } else if (card === visibleCards[1]) {
                                            return "center";
                                        } else {
                                            return "right";
                                        }
                                    },
                                }}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.5 }}
                            >
                                <div
                                    className={`card cardFlash ${isSelected ? "flipped" : ""}`}
                                    key={i}
                                    onClick={
                                        card === visibleCards[1] && isSelected
                                            ? () => handleClick(1)
                                            : card === visibleCards[1]
                                            ? (e) => handleCardClick(e, card.french)
                                            : card === visibleCards[0]
                                            ? () => handleClick(-1)
                                            : () => handleClick(1)
                                    }
                                    style={{ borderWidth: 2 }}
                                >
                                    <div className="card__face card__face--front flex justify-center items-center">
                                        <FrontCardContent isFrontFrench={isFrontFrench} voices={voices} card={card} />
                                    </div>
                                    <div className="card__face card__face--back flex justify-center items-center only-radius" style={{ backgroundColor: colorVarLight }}>
                                        <BackCardContent isFrontFrench={isFrontFrench} voices={voices} card={card} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            <div>
                <motion.button className="text-4xl md:text-5xl" style={{ backgroundColor: "transparent" }} whileTap={{ scale: 0.8 }} onClick={() => handleClick(-1)}>
                    ◀︎
                </motion.button>
                <motion.button className="text-4xl md:text-5xl" style={{ backgroundColor: "transparent" }} whileTap={{ scale: 0.8 }} onClick={() => handleClick(1)}>
                    ▶︎
                </motion.button>
            </div>
        </div>
    );
}

const variants = {
    enter: ({ direction }: { direction: number }) => ({
        scale: 0.2,
        x: direction < 1 ? 50 : -50,
        opacity: 0,
        transition: {
            zIndex: { delay: 0.1 }, // Ajout d'un délai pour zIndex
        },
    }),
    center: ({ position, direction }: { position: () => string; direction: number }) => ({
        scale: position() === "center" ? 1 : 0.7,
        x: 0,
        zIndex: getZIndex({ position, direction }),
        opacity: 1,
        transition: {
            zIndex: { delay: 0.1 }, // Ajout d'un délai pour zIndex
        },
    }),
    exit: ({ direction }: { direction: number }) => ({
        scale: 0.2,
        x: direction < 1 ? -50 : 50,
        opacity: 0,
        transition: {
            zIndex: { delay: 0.1 }, // Ajout d'un délai pour zIndex
        },
    }),
};

function getZIndex({ position, direction }: { position: () => string; direction: number }) {
    const indexes = {
        left: direction > 0 ? 2 : 1,
        center: 3,
        right: direction > 0 ? 1 : 2,
    };
    return indexes[position() as keyof typeof indexes];
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
        instruction: instructionData ? <PortableText value={instructionData} components={RichTextComponents(data?.category)} /> : <p></p>,
        shuffle: DEFAULTCONTENT[postLang].shuffle,
        swapFaces: DEFAULTCONTENT[postLang].swapFaces,
        withSound: DEFAULTCONTENT[postLang].withSound,
        loading: DEFAULTCONTENT[postLang].loading,
    };
};

const filterVocabItems = (item: VocabItem, filters: TabelVocFilters) => {
    const { status: filterStatus, tags: filterTags, nature: filterNature } = filters;
    const itemNature = (item.nature === "expression" ? "expressions" : "words") as "expressions" | "words" | "all";
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterTags?.length && !filterTags?.some((tag) => item.tags?.includes(tag))) return false;
    if (filterNature !== "all" && itemNature !== filterNature) return false;
    return true;
};
