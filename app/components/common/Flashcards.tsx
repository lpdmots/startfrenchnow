"use client";
import fetchData from "@/app/lib/apiStories";
import { COLORVARIABLES, COLORVARIABLESLIGHT } from "@/app/lib/constantes";
import { shuffleArray } from "@/app/lib/utils";
import { Reference, Vocabulary } from "@/app/types/sfn/blog";
import React, { useRef, useEffect, useState, MouseEvent, RefObject, useMemo } from "react";
import { AiOutlineSwap } from "react-icons/ai";
import { IoShuffleOutline } from "react-icons/io5";
import SimpleButton from "../animations/SimpleButton";
import Spinner from "./Spinner";
import { AiOutlineSound } from "react-icons/ai";
import { m } from "framer-motion";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

interface Props {
    data: Data;
}

interface Data {
    color: "yellow" | "blue" | "red" | "purple" | "green";
    vocabulary: Reference;
}

interface Card {
    french: string;
    english: string;
    sound: string;
    note: string;
}

interface DragStart {
    startX: number;
    startScrollLeft: number;
    isDragging: boolean;
}

export default function Flashcards({ data }: Props) {
    const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);

    useEffect(() => {
        const fetchVocabularyData = async () => {
            const vocabulary: Vocabulary = await fetchData("vocabulary", data.vocabulary._ref);
            setVocabulary(vocabulary);
        };
        fetchVocabularyData();
    }, []);

    return <FlashcardsRender data={data} vocabulary={vocabulary} />;
}

function FlashcardsRender({ data, vocabulary }: { data: Data; vocabulary: Vocabulary | null }) {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [shuffledCards, setShuffledCards] = useState<Card[]>(shuffleArray(vocabulary?.lines || []));
    const [isFrontFrench, setIsFrontFrench] = useState<boolean>(true);
    const [voices, setVoices] = useState<boolean>(false);
    const [{ startX, startScrollLeft, isDragging }, setDragStart] = useState<DragStart>({ startX: 0, startScrollLeft: 0, isDragging: false });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const cardRefs = useRef<RefObject<HTMLDivElement>[]>([]);
    const colorVar = COLORVARIABLES[data.color || "blue"];
    const colorVarLight = COLORVARIABLESLIGHT[data.color || "blue"];

    useEffect(() => {
        setShuffledCards(shuffleArray(vocabulary?.lines || []));
    }, [vocabulary]);

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
        setShuffledCards(shuffleArray(vocabulary?.lines || []));
    };

    const handleVoice = () => {
        setVoices((prev) => !prev);
    };

    return (
        <div className="my-12">
            <div className="flex flex-col">
                <h2>Les flashcards</h2>
                <p>Les flashcards sont un moyen ludique de mémoriser le vocabulaire. N'hésite pas à explorer les différentes options pour varier les plaisirs.</p>
                <div className="flex justify-center gap-6 mb-4 items-center">
                    <div onClick={handleRefresh}>
                        <SimpleButton>
                            <IoShuffleOutline />
                            <p className="pl-1 mb-0 font-bold">Shuffle</p>
                        </SimpleButton>
                    </div>
                    <div onClick={() => setIsFrontFrench((isFrontFrench) => !isFrontFrench)}>
                        <SimpleButton>
                            <AiOutlineSwap />
                            <p className="pl-1 mb-0 font-bold">Swap faces</p>
                        </SimpleButton>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper mb-0">
                        <label className="w-form-label flex items-center justify-center" onClick={handleVoice}>
                            <div
                                id="checkbox"
                                className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${voices ? "w--redirected-checked" : undefined} mr-0`}
                                style={{ minHeight: 18, minWidth: 18 }}
                            ></div>
                            <p className="pl-1 mb-0 font-bold">Voices</p>
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
                            <Spinner radius maxHeight="40px" message="Chargement des données" />
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
    card: Card;
}

interface AudioButtonProps {
    card: Card;
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
        {card.sound && <AiOutlineSound style={{ fontSize }} />}
    </m.p>
);

// Création d'un composant réutilisable pour le texte de la carte
const CardText: React.FC<CardTextProps> = ({ text }) => <p className="p-2 text-3xl font-extrabold text-center mb-0">{text}</p>;

const FrontCardContent: React.FC<CardContentProps> = ({ isFrontFrench, voices, card }) => {
    const audio = useMemo(() => new Audio(cloudFrontDomain + card.sound), [card.sound]);

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
    const audio = useMemo(() => new Audio(cloudFrontDomain + card.sound), [card.sound]);

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
