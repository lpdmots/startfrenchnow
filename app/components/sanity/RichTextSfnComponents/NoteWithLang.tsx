"use client";
import { Block, PrimaryCategory } from "@/app/types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../RichTextComponents";
import { useLocale } from "next-intl";

interface NoteWithLangProps {
    noteFr?: Block[];
    noteEn?: Block[];
    category?: PrimaryCategory;
}

export const NoteWithLang = ({ noteFr, noteEn, category }: NoteWithLangProps) => {
    const locale = useLocale() as "fr" | "en";
    const note = locale === "fr" && noteFr ? noteFr : noteEn || noteFr;

    if (!note) return null;
    return <PortableText value={note} components={RichTextComponents(category)} />;
};
