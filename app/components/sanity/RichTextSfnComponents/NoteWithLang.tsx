"use client";
import { Block, PrimaryCategory } from "@/app/types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../RichTextComponents";
import { usePostLang } from "@/app/hooks/usePostLang";
import { CATEGORIESCOLORS } from "@/app/lib/constantes";

interface NoteWithLangProps {
    noteFr?: Block[];
    noteEn?: Block[];
    category?: PrimaryCategory;
}

export const NoteWithLang = ({ noteFr, noteEn, category }: NoteWithLangProps) => {
    const postLang = usePostLang();
    const note = postLang === "fr" && noteFr ? noteFr : noteEn || noteFr;

    if (!note) return null;
    return <PortableText value={note} components={RichTextComponents(category)} />;
};
