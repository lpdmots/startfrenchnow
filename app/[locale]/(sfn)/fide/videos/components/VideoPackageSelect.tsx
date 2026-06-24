"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ColorType, FlatFidePackSommaire } from "../page";
import VideoList from "./FideVideoList";
import { useSfnStore } from "@/app/stores/sfnStore";
import { useTranslations } from "next-intl";

type Props = {
    flatFidePackSommaire: FlatFidePackSommaire;
    packages: { title: string; packageColor: ColorType; referenceKey: string }[];
    locale: string;
    hasPack: boolean;
    initialPackageKey?: string;
};

export const VideoPackageSelect = ({ flatFidePackSommaire, packages, locale, hasPack, initialPackageKey }: Props) => {
    const t = useTranslations("Fide.FideVideosPage.packageSelect");
    const allLabel = t("all");
    const normalizedInitialKey = initialPackageKey && initialPackageKey !== "all" ? initialPackageKey : "all";

    const keyToTitle = (key?: string) => {
        if (!key || key === "all") return allLabel;
        const pack = packages.find((p) => p.referenceKey === key);
        return pack ? pack.title : allLabel;
    };

    const [selectedPackageKey, setSelectedPackageKey] = useState<string>(normalizedInitialKey);
    const selectedPackageName = keyToTitle(selectedPackageKey);
    const selectedPackage = packages.find((p) => p.referenceKey === selectedPackageKey) || { packageColor: "var(--neutral-800)" as ColorType };

    const [_, setFideVideosSelectedPackage] = useSfnStore((s) => [s.fideVideosSelectedPackage, s.setFideVideosSelectedPackage]);

    useEffect(() => {
        setSelectedPackageKey(normalizedInitialKey);
    }, [normalizedInitialKey]);

    const handleChange = (val: string) => {
        const key = val === "all" ? "all" : val;
        setSelectedPackageKey(key);
        setFideVideosSelectedPackage(key);

        const url = new URL(window.location.href);
        if (key === "all") url.searchParams.delete("package");
        else url.searchParams.set("package", key);
        window.history.replaceState(null, "", url.toString());
    };

    const filteredPackSommaire = useMemo(() => {
        if (selectedPackageKey === "all") return flatFidePackSommaire;
        return flatFidePackSommaire.filter((item) => item.packageReferenceKey === selectedPackageKey);
    }, [selectedPackageKey, flatFidePackSommaire]);

    return (
        <div className="flex justify-center w-full">
            <div className="max-w-3xl xl:max-w-none w-full">
                <div className="flex mb-8">
                    <Select name="theme" value={selectedPackageKey} onValueChange={handleChange}>
                        <SelectTrigger className="max-w-96 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--neutral-800)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)] mb-2">
                            <SelectValue>
                                <p className="flex items-center mb-0">
                                    <span className="underline">{t("targetedVideos")}</span> :{" "}
                                    <span
                                        className="font-bold ml-2"
                                        style={{
                                            color: selectedPackageKey === "all" ? "var(--neutral-800)" : selectedPackage.packageColor,
                                        }}
                                    >
                                        {selectedPackageName}
                                    </span>
                                </p>
                            </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectItem className="hover:bg-neutral-200" value="all">
                                    {allLabel}
                                </SelectItem>
                                {packages.map((pack) => (
                                    <SelectItem key={pack.referenceKey} className="hover:bg-neutral-200" value={pack.referenceKey}>
                                        {pack.title}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <VideoList filteredPackSommaire={filteredPackSommaire} locale={locale} hasPack={hasPack} />
            </div>
        </div>
    );
};
