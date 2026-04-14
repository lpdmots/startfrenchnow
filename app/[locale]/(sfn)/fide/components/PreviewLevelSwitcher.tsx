"use client";
import { Exam } from "@/app/types/fide/exam";
import React, { useState } from "react";
import { VideoFide } from "./VideoFide";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { AiFillSignal } from "react-icons/ai";
import { HiCheckCircle, HiPlay } from "react-icons/hi";
import { LinkArrowToFideVideos } from "@/app/components/common/LinkToFideVideos";
import { LinkArrowToFideExams } from "@/app/components/common/LinkToFideExams";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

interface Props {
    exams: Exam[];
    videosUrl: {
        A1: {
            videoKey: string;
            poster: string;
            subtitleFRUrl: string;
            subtitleENUrl: string;
        };
        A2: {
            videoKey: string;
            poster: string;
            subtitleFRUrl: string;
            subtitleENUrl: string;
        };
        B1: {
            videoKey: string;
            poster: string;
            subtitleFRUrl: string;
            subtitleENUrl: string;
        };
    };
}

type Level = "A1" | "A2" | "B1";

export const PreviewLevelSwitcher = ({ exams, videosUrl }: Props) => {
    const [selectedLevel, setSelectedLevel] = useState<Level>("A2");
    const selectedExams = exams.filter((ex) => ex.levels.includes(selectedLevel));
    const selectedVideo = videosUrl[selectedLevel];
    const t = useTranslations("Fide.PreviewsSection");

    return (
        <div className="flex justify-center w-full">
            <div className="max-w-3xl xl:max-w-none">
                <div className="flex mb-8 xl:mb-0">
                    <Select name="niveau" value={selectedLevel} onValueChange={(val: Level) => setSelectedLevel(val)}>
                        <SelectTrigger className="max-w-60 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--neutral-800)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)] mb-2">
                            <SelectValue>
                                <p className="flex items-center mb-0">
                                    {t("targetLevel")} :{" "}
                                    <AiFillSignal
                                        className="mx-2"
                                        style={{
                                            fontSize: "1.5rem",
                                            color: selectedLevel === "A1" ? "var(--secondary-5)" : selectedLevel === "A2" ? "var(--secondary-1)" : "var(--secondary-4)",
                                        }}
                                    />
                                    {selectedLevel}
                                </p>
                            </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectItem className="hover:bg-neutral-200" value="A1">
                                    A1
                                </SelectItem>
                                <SelectItem className="hover:bg-neutral-200" value="A2">
                                    A2
                                </SelectItem>
                                <SelectItem className="hover:bg-neutral-200" value="B1">
                                    B1
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-center w-full">
                    <div className="grid grid-cols-7">
                        <div className="col-span-7 xl:col-span-4 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col-reverse md:flex-row-reverse xl:flex-row justify-between w-full md:items-end md:pr-4 xl:pr-8 mb-4">
                                    <p className="text-sm text-neutral-700 mb-0">{t("videosBadge")}</p>
                                    <h3 className="mb-0">{t.rich("videosTitle", intelRich())}</h3>
                                </div>
                                <div className="xl:pr-8 flex flex-col">
                                    <VideoFide
                                        videoKey={selectedVideo.videoKey}
                                        poster={selectedVideo.poster}
                                        subtitleFRUrl={selectedVideo.subtitleFRUrl}
                                        subtitleENUrl={selectedVideo.subtitleENUrl}
                                    />
                                </div>
                            </div>
                            <div className="flex w-full justify-center">
                                <LinkArrowToFideVideos className="text-lg md:text-xl font-bold mt-6 xl:mt-12 mb-12 xl:mb-0 text-neutral-700" category="grammar">
                                    <span className="flex items-center">
                                        <HiPlay className="text-4xl md:text-6xl mr-2 text-secondary-4" /> <span>{t("moreVideos")}</span>
                                    </span>
                                </LinkArrowToFideVideos>
                            </div>
                        </div>
                        <div className="col-span-7 xl:col-span-3 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col md:flex-row justify-between w-full md:pl-4 xl:pl-8 mb-4 md:items-end">
                                    <h3 className="mb-0 shrink-0">{t.rich("examsTitle", intelRich())}</h3>
                                    <p className="text-sm text-neutral-700 mb-0">{t("examsBadge")}</p>
                                </div>

                                <div className="relative xl:pl-8">
                                    <div className="hidden xl:block absolute left-0 top-0 h-full" style={{ borderLeft: "2px solid var(--neutral-600)" }} />
                                    <ExpandableCardDemo exams={selectedExams.slice(0, 1)} withStars={false} isPreviewSection={true} />
                                </div>
                            </div>

                            <div className="flex w-full justify-center">
                                <LinkArrowToFideExams className="text-lg md:text-xl font-bold mt-4 xl:mt-12 xl:mb-0 text-neutral-700" category="culture">
                                    <span className="flex items-center">
                                        <HiCheckCircle className="text-4xl md:text-6xl mr-2 text-secondary-5" /> <span>{t("moreExams")}</span>
                                    </span>
                                </LinkArrowToFideExams>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
