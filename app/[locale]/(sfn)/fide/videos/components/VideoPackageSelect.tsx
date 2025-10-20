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
    const t = useTranslations("FideVideosPage.packageSelect");
    const allLabel = t("all");

    const keyToTitle = (key?: string) => {
        if (!key || key === "all") return allLabel;
        const pack = packages.find((p) => p.referenceKey === key);
        return pack ? pack.title : allLabel;
    };

    const [selectedPackageName, setSelectedPackageName] = useState<string>(() => keyToTitle(initialPackageKey));
    const selectedPackage = packages.find((p) => p.title === selectedPackageName) || { packageColor: "var(--neutral-800)" as ColorType };

    const [_, setFideVideosSelectedPackage] = useSfnStore((s) => [s.fideVideosSelectedPackage, s.setFideVideosSelectedPackage]);

    const handleChange = (val: string) => {
        setSelectedPackageName(val);
        const key = val === allLabel ? "all" : packages.find((p) => p.title === val)?.referenceKey ?? "all";
        setFideVideosSelectedPackage(key);

        const url = new URL(window.location.href);
        if (key === "all") url.searchParams.delete("package");
        else url.searchParams.set("package", key);
        window.history.replaceState(null, "", url.toString());
    };

    const filteredPackSommaire = useMemo(() => {
        if (selectedPackageName === allLabel) return flatFidePackSommaire;
        const key = packages.find((p) => p.title === selectedPackageName)?.referenceKey;
        if (!key) return flatFidePackSommaire;
        return flatFidePackSommaire.filter((item) => item.packageReferenceKey === key);
    }, [selectedPackageName, allLabel, flatFidePackSommaire, packages]);

    return (
        <div className="flex justify-center w-full">
            <div className="max-w-3xl xl:max-w-none w-full">
                <div className="flex mb-8">
                    <Select name="theme" value={selectedPackageName} onValueChange={handleChange}>
                        <SelectTrigger className="max-w-96 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--neutral-800)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)] mb-2">
                            <SelectValue>
                                <p className="flex items-center mb-0">
                                    <span className="underline">{t("targetedVideos")}</span> :{" "}
                                    <span
                                        className="font-bold ml-2"
                                        style={{
                                            color: selectedPackageName === allLabel ? "var(--neutral-800)" : selectedPackage.packageColor,
                                        }}
                                    >
                                        {selectedPackageName}
                                    </span>
                                </p>
                            </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectItem className="hover:bg-neutral-200" value={allLabel}>
                                    {allLabel}
                                </SelectItem>
                                {packages.map((pack) => (
                                    <SelectItem key={pack.title} className="hover:bg-neutral-200" value={pack.title}>
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
