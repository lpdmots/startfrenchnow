"use client";

import { ModalFromBottomWithPortal } from "@/app/components/animations/ModalFromBottomWithPortal";
import Marquee from "@/app/components/ui/marquee";
import { sharedFideReviews } from "@/app/[locale]/(sfn)/fide/components/ReviewsFide";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { cn } from "@/app/lib/schadcn-utils";
import { m } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type ReviewWithText = {
    userName: string;
    userImage: ReactNode;
    title: string;
    comment: ReactNode;
    score?: number;
    date?: number;
};

export function MarqueeSocial({ locale }: { locale: string }) {
    const isMedium = useMediaQuery("(max-width: 768px)");
    const [selectedReview, setSelectedReview] = useState<ReviewWithText | null>(null);

    const reviews = useMemo<ReviewWithText[]>(
        () =>
            [...sharedFideReviews]
                .filter((review) => !review.isVideo)
                .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
                .map((review) => ({
                    userName: review.userName,
                    userImage: review.userImage,
                    title: review.title,
                    comment: review.comment,
                    score: review.score,
                    date: review.date,
                })),
        [],
    );

    const splitIndex = Math.ceil(reviews.length / 2);
    const firstRow = reviews.slice(0, splitIndex);
    const secondRow = reviews.slice(splitIndex);

    return (
        <div className="flex justify-center">
            <div
                className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden bg-neutral-200", !isMedium ? "h-[620px]" : "h-[1020px]")}
                style={{ maxWidth: 1300 }}
            >
                <Marquee vertical={isMedium} pauseOnHover paused={!!selectedReview} className="[--duration:64s] [--gap:1.5rem] md:[--gap:2rem]">
                    {firstRow.map((review, index) => (
                        <CommentCard key={`${review.userName}-${index}`} review={review} locale={locale} onOpen={() => setSelectedReview(review)} />
                    ))}
                </Marquee>
                {!isMedium && secondRow.length > 0 && (
                    <Marquee reverse pauseOnHover paused={!!selectedReview} className="[--duration:64s] [--gap:1.5rem] md:[--gap:2rem]">
                        {secondRow.map((review, index) => (
                            <CommentCard key={`${review.userName}-${index}`} review={review} locale={locale} onOpen={() => setSelectedReview(review)} />
                        ))}
                    </Marquee>
                )}
                {!isMedium ? (
                    <>
                        <div className="gradient-left"></div>
                        <div className="gradient-right"></div>
                    </>
                ) : (
                    <>
                        <div className="gradient-top"></div>
                        <div className="gradient-bottom"></div>
                    </>
                )}
            </div>
            {selectedReview && <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />}
        </div>
    );
}

function CommentCard({ review, locale, onOpen }: { review: ReviewWithText; locale: string; onOpen: () => void }) {
    const tHome = useTranslations("CommentsCarousel");
    const commentText = extractText(review.comment);
    const formattedDate = review.date ? formatDate(review.date, locale) : "";

    return (
        <div className="w-slide my-4 overflow-visible">
            <div className="max-w-sm overflow-visible md:max-w-md">
                <m.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onOpen} className="w-full overflow-visible text-left">
                    <div className="card link-card group relative flex h-[16.5rem] flex-col px-4 py-3 md:h-[17.5rem] md:px-5 md:py-4">
                        <div className="mg-bottom-24px mt-[-80px] keep absolute top-14">
                            <Quote />
                        </div>
                        <div className="mt-8 flex items-start gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
                                <div className="origin-top-left scale-[0.56]">{review.userImage}</div>
                            </div>
                            <div className="min-w-0">
                                <p className="mb-0 font-bold line-clamp-1">{review.userName}</p>
                                {typeof review.score === "number" && <p className="mb-0 text-sm font-semibold text-secondary-5">{tHome("fideScore", { score: review.score })}</p>}
                                {formattedDate && <p className="mb-0 text-sm italic">{formattedDate}</p>}
                            </div>
                        </div>
                        <div className="mt-4 min-h-0 flex-1">
                            <div className="line-clamp-4 overflow-hidden text-sm leading-7 text-neutral-700">{commentText}</div>
                        </div>
                    </div>
                </m.button>
            </div>
        </div>
    );
}

function ReviewModal({ review, onClose }: { review: ReviewWithText; onClose: () => void }) {
    const commentText = extractText(review.comment);
    const data = {
        setOpen: (value: boolean) => {
            if (!value) onClose();
        },
        title: review.title,
        message: <p className="mb-0 whitespace-pre-line">{commentText}</p>,
        functionOk: onClose,
        buttonOkStr: "OK",
        clickOutside: true,
        oneButtonOnly: true,
        className: "max-h-[80vh] overflow-y-auto",
    };

    return <ModalFromBottomWithPortal data={data} open={true} />;
}

function formatDate(timestamp: number, locale: string) {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString(locale, options);
}

function extractText(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (typeof node === "object" && "props" in node) {
        const props = (node as { props?: { children?: ReactNode } }).props;
        return extractText(props?.children);
    }
    return "";
}

const Quote = () => {
    return (
        <svg width="40" height="40" viewBox="0 0 76 77" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="38" cy="38.8037" r="38" className="fill-neutral-800" />
            <path
                d="M39.7733 49.0392V32.5615C39.7733 30.1777 40.7202 27.8916 42.4058 26.2061C44.0913 24.5205 46.3774 23.5736 48.7611 23.5736C49.1584 23.5736 49.5394 23.7314 49.8204 24.0124C50.1013 24.2933 50.2591 24.6743 50.2591 25.0716C50.2591 25.4689 50.1013 25.8499 49.8204 26.1308C49.5394 26.4117 49.1584 26.5696 48.7611 26.5696C47.1735 26.5745 45.6523 27.2074 44.5297 28.33C43.407 29.4526 42.7742 30.9738 42.7692 32.5615V34.0594H54.004C54.7986 34.0594 55.5607 34.3751 56.1225 34.9369C56.6844 35.4988 57 36.2608 57 37.0554V49.0392C57 49.8338 56.6844 50.5958 56.1225 51.1577C55.5607 51.7195 54.7986 52.0352 54.004 52.0352H42.7692C41.9747 52.0352 41.2126 51.7195 40.6508 51.1577C40.0889 50.5958 39.7733 49.8338 39.7733 49.0392ZM21.0486 52.0352H32.2834C33.078 52.0352 33.84 51.7195 34.4019 51.1577C34.9637 50.5958 35.2794 49.8338 35.2794 49.0392V37.0554C35.2794 36.2608 34.9637 35.4988 34.4019 34.9369C33.84 34.3751 33.078 34.0594 32.2834 34.0594H21.0486V32.5615C21.0535 30.9738 21.6864 29.4526 22.809 28.33C23.9317 27.2074 25.4529 26.5745 27.0405 26.5696C27.4378 26.5696 27.8188 26.4117 28.0997 26.1308C28.3806 25.8499 28.5385 25.4689 28.5385 25.0716C28.5385 24.6743 28.3806 24.2933 28.0997 24.0124C27.8188 23.7314 27.4378 23.5736 27.0405 23.5736C24.6568 23.5736 22.3707 24.5205 20.6851 26.2061C18.9996 27.8916 18.0526 30.1777 18.0526 32.5615V49.0392C18.0526 49.8338 18.3683 50.5958 18.9301 51.1577C19.492 51.7195 20.254 52.0352 21.0486 52.0352Z"
                className="fill-neutral-100"
            />
        </svg>
    );
};
