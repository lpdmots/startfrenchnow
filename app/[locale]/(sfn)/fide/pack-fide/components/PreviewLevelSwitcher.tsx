"use client";
import { Exam } from "@/app/types/fide/exam";
import React, { useState } from "react";
import { VideoFide } from "../../components/VideoFide";
import LinkArrow from "@/app/components/common/LinkArrow";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import clsx from "clsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { AiFillSignal } from "react-icons/ai";
import Link from "next-intl/link";
import { HiCheckCircle, HiPlay } from "react-icons/hi";

interface Props {
    exams: {
        A1: Exam[];
        A2: Exam[];
        B1: Exam[];
    };
    videosUrl: {
        A1: {
            videoKey: string;
            poster: string;
        };
        A2: {
            videoKey: string;
            poster: string;
        };
        B1: {
            videoKey: string;
            poster: string;
        };
    };
}

type Level = "A1" | "A2" | "B1";

export const PreviewLevelSwitcher = ({ exams, videosUrl }: Props) => {
    const [selectedLevel, setSelectedLevel] = useState<Level>("A2");
    const selectedExams = exams[selectedLevel];
    const selectedVideo = videosUrl[selectedLevel];

    return (
        <div className="flex justify-center w-full">
            <div className="max-w-3xl xl:max-w-none">
                <div className="flex mb-8 xl:mb-0">
                    <Select name="niveau" value={selectedLevel} onValueChange={(val: Level) => setSelectedLevel(val)}>
                        <SelectTrigger className="max-w-60 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--neutral-800)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)] mb-2">
                            <SelectValue>
                                <p className="flex items-center mb-0">
                                    Niveau ciblé :{" "}
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
                                    <p className="text-sm text-neutral-700 mb-0">6 vidéos offertes • 60+ dans le Pack</p>
                                    <h3 className="mb-0">
                                        Nos <span className="heading-span-secondary-4">vidéos</span> gratuites
                                    </h3>
                                </div>
                                <div className="xl:pr-8 flex flex-col">
                                    <VideoFide videoKey={selectedVideo.videoKey} poster={selectedVideo.poster} />
                                </div>
                            </div>
                            <div className="flex w-full justify-center">
                                <LinkArrow url="/fide/videos" className="text-lg md:text-xl font-bold mt-6 xl:mt-12 mb-12 xl:mb-0 text-neutral-700" category="grammar">
                                    <span className="flex items-center">
                                        <HiPlay className="text-4xl md:text-6xl mr-2 text-secondary-4" /> <span>Plus de vidéos gratuites</span>
                                    </span>
                                </LinkArrow>
                            </div>
                        </div>
                        <div className="col-span-7 xl:col-span-3 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-col md:flex-row justify-between w-full md:pl-4 xl:pl-8 mb-4 md:items-end">
                                    <h3 className="mb-0">
                                        Vos <span className="heading-span-secondary-5">examens</span>
                                    </h3>
                                    <p className="text-sm text-neutral-700 mb-0">9 examens offerts • 100+ dans le Pack</p>
                                </div>

                                <div className="relative xl:pl-8">
                                    <div className="hidden xl:block absolute left-0 top-0 h-full" style={{ borderLeft: "2px solid var(--neutral-600)" }} />
                                    <ExpandableCardDemo exams={selectedExams} withStars={false} />
                                </div>
                            </div>

                            <div className="flex w-full justify-center">
                                <LinkArrow url="/fide/exams" className="text-lg md:text-xl font-bold mt-4 xl:mt-12 xl:mb-0 text-neutral-700" category="culture">
                                    <span className="flex items-center">
                                        <HiCheckCircle className="text-4xl md:text-6xl mr-2 text-secondary-5" /> <span>Plus d'examens blancs</span>
                                    </span>
                                </LinkArrow>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
