"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsCaretRightFill } from "react-icons/bs";
import { ContentRenderer, Popover } from "react-tiny-popover";
import { NotePopoverTransalation } from "../../animations/BlogAnimations";
import { getVocabItems } from "@/app/serverActions/exerciseActions";
import { PrimaryCategory, Reference, VocabItem } from "@/app/types/sfn/blog";
import { CATEGORIESCOLORS } from "@/app/lib/constantes";

interface DropdownProps {
    data: {
        french: string;
        english: string;
        vocabItemId: Reference;
        category: PrimaryCategory;
    };
    children: React.ReactNode;
}

const TranslationPopover: React.FC<DropdownProps> = ({ data, children }) => {
    const { french, english, vocabItemId, category } = data;
    const [isOpen, setIsOpen] = useState(false);
    const [vocabItem, setVocabItem] = useState<VocabItem | null>(null);
    const [isMouseOverPopover, setIsMouseOverPopover] = useState(false);
    const closeTimer = useRef<NodeJS.Timeout | null>(null); // pour stocker le timer

    useEffect(() => {
        const fetchData = async () => {
            if (vocabItemId) {
                const { vocabItems } = await getVocabItems([vocabItemId._ref]);
                vocabItems?.length && setVocabItem(vocabItems[0]);
            }
        };
        fetchData();
    }, []);

    const content = useMemo(() => getTranslationContent(french, english, vocabItem, category), [french, english, vocabItem, category]);

    const handleContentMouseEnter = () => {
        setIsMouseOverPopover(true);
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    const handleContentMouseLeave = () => {
        setIsMouseOverPopover(false);
        closeTimer.current = setTimeout(() => setIsOpen(false), 200); // 1000ms = 1 seconde
    };

    const contentWithHandlers = (
        <div className="bg-neutral-100 simple-border shadow-1 p-4 m-2" style={{ maxWidth: "min(95vw, 450px)" }} onMouseEnter={handleContentMouseEnter} onMouseLeave={handleContentMouseLeave}>
            {content}
        </div>
    );

    return (
        <Popover isOpen={isOpen} positions={["top"]} onClickOutside={() => setIsOpen(false)} content={contentWithHandlers}>
            <span
                className="cursor-pointer relative underline decoration-dotted decoration-1 underline-offset-4 "
                onMouseEnter={() => {
                    setIsOpen(true);
                    if (closeTimer.current) {
                        clearTimeout(closeTimer.current);
                    }
                }}
                onMouseLeave={() => {
                    if (!isMouseOverPopover) {
                        closeTimer.current = setTimeout(() => setIsOpen(false), 200);
                    }
                }}
            >
                {children}
            </span>
        </Popover>
    );
};

export default TranslationPopover;

const getTranslationContent = (fr: string, en: string, vocabItem: VocabItem | null, category: PrimaryCategory) => {
    const data = vocabItem ? vocabItem : { french: fr, english: en };
    const { french, english } = data;
    return (
        <div className="flex gap-2 items-center bs">
            <p className="mb-0 font-bold">{french}</p>
            <BsCaretRightFill style={{ color: "var(--neutral-600)", height: 16, objectFit: "contain", flexShrink: 0 }} />
            <p className="mb-0 italic">{english ? english : "Chargement..."}</p>
            <NotePopoverTransalation vocabItem={data as unknown as VocabItem} category={category || "tips"} />
        </div>
    );
};
