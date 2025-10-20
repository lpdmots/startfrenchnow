"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { LevelParam, TypeParam } from "../page";
import { Exam } from "@/app/types/fide/exam";
import { useSfnStore } from "@/app/stores/sfnStore";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import { useTranslations, useLocale } from "next-intl";

type Props = {
    exams: Exam[];
    initialLevel?: LevelParam;
    initialType?: TypeParam;
    hasPack: boolean;
};

// Clés "source of truth"
const LEVEL_KEYS: LevelParam[] = ["all", "a1", "a2", "b1"];
const TYPE_KEYS: (TypeParam | "all")[] = ["all", "speak", "understand", "read", "write"];

// Normalisation de chaînes (pour matcher FR/EN, accents, casse)
const normalize = (s?: string) =>
    (s || "")
        .toString()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();

// Map libellé (FR/EN) -> clé interne
const TYPE_BY_LABEL = new Map<string, TypeParam>([
    // FR
    ["parler", "speak"],
    ["comprendre", "understand"],
    ["lire", "read"],
    ["ecrire", "write"],
    ["écrire", "write"],
    // EN (et variantes)
    ["speak", "speak"],
    ["speaking", "speak"],
    ["understand", "understand"],
    ["listening", "understand"],
    ["read", "read"],
    ["reading", "read"],
    ["write", "write"],
    ["writing", "write"],
]);

export const ExamCardsList: React.FC<Props> = ({ exams, initialLevel = "all", initialType, hasPack }) => {
    const t = useTranslations("FideExams.filters");

    // 1) État local initialisé depuis le SSR (zéro jank)
    const [level, setLevel] = useState<LevelParam>(initialLevel ?? "all");
    const [type, setType] = useState<TypeParam | "all">(initialType ?? "all");

    // 2) Store (Zustand): nouvelles valeurs
    const [storeLevel, setStoreLevel, storeType, setStoreType] = useSfnStore((s) => [s.fideExamsSelectedLevel, s.setFideExamsSelectedLevel, s.fideExamsSelectedType, s.setFideExamsSelectedType]);

    // 3) À l’hydratation, si le store a une valeur valide, on l’applique (sinon on pousse nos valeurs SSR dans le store)
    useEffect(() => {
        const validLevel = (v: any): v is LevelParam => v === "a1" || v === "a2" || v === "b1" || v === "all";
        const validType = (v: any): v is TypeParam | "all" => v === "speak" || v === "understand" || v === "read" || v === "write" || v === "all";

        const l = validLevel(storeLevel) ? storeLevel : level;
        const tpe = validType(storeType) ? storeType : type;

        if (l !== level) setLevel(l);
        if (tpe !== type) setType(tpe);

        if (!validLevel(storeLevel)) setStoreLevel(l);
        if (!validType(storeType)) setStoreType(tpe);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    // 4) Sync URL sans navigation (replaceState)
    const syncUrl = (nextLevel: LevelParam, nextType: TypeParam | "all") => {
        const url = new URL(window.location.href);
        if (nextLevel && nextLevel !== "all") url.searchParams.set("level", nextLevel);
        else url.searchParams.delete("level");

        if (nextType && nextType !== "all") url.searchParams.set("type", nextType);
        else url.searchParams.delete("type");

        window.history.replaceState(null, "", url.toString());
    };

    // 5) Handlers des selects
    const onChangeLevel = (val: string) => {
        const nextLevel = (val as LevelParam) || "all";
        setLevel(nextLevel);
        setStoreLevel(nextLevel);
        syncUrl(nextLevel, type);
    };

    const onChangeType = (val: string) => {
        const nextType = (val as TypeParam | "all") || "all";
        setType(nextType);
        setStoreType(nextType);
        syncUrl(level, nextType);
    };

    // 6) Normalisation (sécurité runtime sans “inventer” le typage)
    const getExamLevel = (e: Exam): string | undefined => e?.level?.toString().toLowerCase();

    const getExamType = (e: Exam): TypeParam | undefined => {
        const n = normalize(e?.competence);
        return TYPE_BY_LABEL.get(n);
    };

    // 7) Filtrage en mémoire
    const filteredExams = useMemo(() => {
        return exams.filter((ex) => {
            const exLevel = getExamLevel(ex);
            const exType = getExamType(ex) || "understand"; // par défaut

            const levelOk = level === "all" ? true : exLevel === level;
            const typeOk = type === "all" ? true : exType === type;

            return levelOk && typeOk;
        });
    }, [exams, level, type]);

    return (
        <div className="w-full">
            {/* Barre de filtres */}
            <div className="flex gap-3 sm:gap-4 mb-6 flex-nowrap">
                <Select name="level" value={level} onValueChange={onChangeLevel}>
                    <SelectTrigger className="max-w-64 card rounded-xl p-3 !text-neutral-800" style={{ flexShrink: 3 }}>
                        <SelectValue placeholder={t("level.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {LEVEL_KEYS.map((k) => (
                                <SelectItem key={k} value={k} className="text-neutral-800">
                                    {t(`level.options.${k}`)}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select name="type" value={type} onValueChange={onChangeType}>
                    <SelectTrigger className="max-w-64 card rounded-xl p-3 !text-neutral-800" style={{ flexShrink: 1 }}>
                        <SelectValue placeholder={t("type.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {TYPE_KEYS.map((k) => (
                                <SelectItem key={k} value={k}>
                                    {t(`type.options.${k}`)}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Liste filtrée */}
            <ExpandableCardDemo exams={filteredExams} withStars={true} twoColumns={true} hasPack={hasPack} />
        </div>
    );
};
