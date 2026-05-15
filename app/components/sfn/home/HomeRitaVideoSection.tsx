"use client";

import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import CircularProgressMagic from "@/app/components/common/CircularProgressMagic";
import { VideoFide } from "@/app/[locale]/(sfn)/fide/components/VideoFide";
import { sharedFideReviews } from "@/app/[locale]/(sfn)/fide/components/ReviewsFide";
import { m } from "framer-motion";
import { Quote } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";
import { LuMaximize2 } from "react-icons/lu";
import { intelRich } from "@/app/lib/intelRich";

type HomeVideoReview = (typeof sharedFideReviews)[number] & {
    videoUrl: string;
    videoThumbnail?: string;
    subtitleENUrl?: string;
    subtitleFRUrl?: string;
    score?: number;
    lessons?: number;
    progressFrom?: string;
    progressTo?: string;
    date?: number;
    comment?: ReactNode;
    modalComment?: ReactNode;
};

export function HomeRitaVideoSection() {
    const t = useTranslations("HomeRitaVideo");
    const reviewT = useTranslations("Fide.ReviewsFide.circularProgress");
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const ritaReview = sharedFideReviews.find((review) => review.isVideo) as HomeVideoReview | undefined;

    if (!ritaReview?.videoUrl) return null;

    const date = ritaReview.date ? new Date(ritaReview.date).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : null;
    const progressLabel = ritaReview.progressFrom && ritaReview.progressTo ? reviewT("progress", { progressFrom: ritaReview.progressFrom, progressTo: ritaReview.progressTo }) : null;
    const modalData = {
        setOpen,
        title: "",
        message: ritaReview.modalComment ?? ritaReview.comment,
        functionOk: () => setOpen(false),
        buttonOkStr: "OK",
        clickOutside: true,
        oneButtonOnly: true,
        className: "max-h-[80vh] overflow-y-auto",
    };

    return (
        <section className="px-4 py-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <SlideFromBottom>
                        <div>
                            <div className="mx-auto mb-10 max-w-4xl text-center">
                                <h2 className="display-3 mb-3">{t.rich("title", intelRich())}</h2>
                            </div>

                        <div className="relative card m-auto max-w-5xl p-4 md:p-8">
                            <div className="mg-bottom-24px mt-[-80px] keep absolute top-12">
                                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-neutral-800 text-neutral-100">
                                    <Quote className="h-9 w-9" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 min-h-[390px]">
                                <div className="grid grid-cols-3 gap-4 lg:gap-8">
                                    <div className="order-2 col-span-3 max-h-96 mx-auto md:order-2 md:col-span-1">
                                        <VideoFide
                                            videoKey={ritaReview.videoUrl}
                                            poster={ritaReview.videoThumbnail}
                                            isAnimated={false}
                                            subtitleENUrl={ritaReview.subtitleENUrl}
                                            subtitleFRUrl={ritaReview.subtitleFRUrl}
                                            videoClassName="max-h-96 w-auto"
                                            className="shadow-none"
                                        />
                                    </div>
                                    <div className="order-3 col-span-3 flex flex-col gap-4 md:order-1 md:col-span-2">
                                        <p className="text-lg md:text-2xl font-bold mb-0 mt-8 text-justify">"{ritaReview.title}"</p>
                                        <CommentPreview comment={ritaReview.comment} onClick={() => setOpen(true)} />
                                        <div className="flex w-full justify-between gap-4">
                                            <div className="flex flex-col justify-center">
                                                <p className="text-lg font-bold mb-0">
                                                    <span className="inline-block">{ritaReview.userName.toUpperCase()}</span>{" "}
                                                    {typeof ritaReview.lessons === "number" ? (
                                                        <span className="inline-block">
                                                            ({ritaReview.lessons} {reviewT("lessons")})
                                                        </span>
                                                    ) : null}
                                                </p>
                                                {progressLabel ? <p className="mb-0">{progressLabel}</p> : null}
                                                {date ? <p className="mb-0 italic">{date}</p> : null}
                                            </div>
                                            {typeof ritaReview.score === "number" ? (
                                                <div className="flex flex-col items-center">
                                                    <p className="text-xl mb-0 font-bold">{reviewT("score")}</p>
                                                    <CircularProgressMagic
                                                        max={100}
                                                        min={0}
                                                        value={ritaReview.score}
                                                        gaugePrimaryColor="var(--secondary-5)"
                                                        gaugeSecondaryColor="var(--neutral-300)"
                                                        className="h-[60px] -ml-10 -mr-12"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <ModalFromBottomWithPortal data={modalData} open={open} />
                            </div>
                        </div>
                    </div>
                </SlideFromBottom>
            </div>
        </section>
    );
}

function CommentPreview({ comment, onClick }: { comment?: ReactNode; onClick: () => void }) {
    const t = useTranslations("Fide.ReviewsFide");

    return (
        <m.button
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative w-full text-left p-0 group cursor-pointer rounded-lg border border-transparent transition-colors"
        >
            <div className="min-h-32 text-sm text-neutral-600 line-clamp-5">{comment}</div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent group-hover:from-neutral-50 group-hover:via-neutral-50/80" />
            <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-end pr-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-300 px-2.5 py-0.5 text-sm font-bold text-neutral-600 shadow-sm ring-1 ring-neutral-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <LuMaximize2 className="h-3 w-3" />
                    {t("seeFullComment")}
                </span>
            </div>
        </m.button>
    );
}
