"use client";
import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import CircularProgressMagic from "../CircularProgressMagic";
import { useLocale, useTranslations } from "next-intl";
import Video from "@/app/schemas/sfn/video";
import { VideoFide } from "@/app/[locale]/(sfn)/fide/components/VideoFide";
import { LuMaximize2 } from "react-icons/lu";
import { ModalFromBottom } from "../../animations/Modals";
import { ModalFromBottomWithPortal } from "../../animations/ModalFromBottomWithPortal";

export const CarouselReviews = ({ comments }: any) => {
    const [slideIndex, setSlideIndex] = useState(0);

    const handleSlide = (number: 1 | -1) => {
        let newSlideIndex = slideIndex + number;
        if (newSlideIndex >= (comments?.length || 0)) newSlideIndex = 0;
        if (newSlideIndex < 0) newSlideIndex = comments.length - 1;
        setSlideIndex(newSlideIndex);
    };

    return (
        <>
            <div className="slider-mask overflow-visible w-slider-mask">
                <AnimatePresence mode="wait">
                    <m.div key={slideIndex ? slideIndex : "empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <Comment slideIndex={slideIndex} comments={comments} />
                    </m.div>
                </AnimatePresence>
            </div>
            <div className="btn-circle-secondary slider-arrow left---center-center w-slider-arrow-left" onClick={() => handleSlide(-1)}>
                <AiOutlineArrowLeft />
            </div>
            <div className="btn-circle-secondary slider-arrow right---center-center w-slider-arrow-right" onClick={() => handleSlide(1)}>
                <AiOutlineArrowRight />
            </div>
            <div className="hidden-on-desktop w-slider-nav w-round"></div>
        </>
    );
};

function Comment({ slideIndex, comments }: { slideIndex: any; comments: any[] }) {
    const selectedSlide = slideIndex < comments.length && slideIndex >= 0 ? comments[slideIndex] : comments[0];

    if (selectedSlide?.isVideo) return <VideoSlide selectedSlide={selectedSlide} />;
    return <CommentSlide selectedSlide={selectedSlide} />;
}

export default Comment;

const CommentSlide = ({ selectedSlide }: { selectedSlide: any }) => {
    const locale = useLocale();
    const t = useTranslations("ReviewsFide.circularProgress");
    const { userImage, userName, comment, score, title, progressFrom, progressTo, lessons, date } = selectedSlide;
    const getDate = () => {
        const dateString = new Date(date);
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
        return dateString.toLocaleDateString(locale, options);
    };
    return (
        <div key={selectedSlide.userName} className="w-slide">
            <div className="relative card p-4 md:p-8 max-w-3xl m-auto">
                <div className="mg-bottom-24px mg-top--80px keep absolute top-12">
                    <Quote />
                </div>
                <div className="flex flex-col gap-4 min-h-[390px]">
                    <p className="text-2xl font-bold mb-0 mt-8">"{title}"</p>
                    <div className="flex items-center min-h-32">{comment}</div>
                    <div className="flex items-center gap-4 w-full">
                        {userImage}
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 w-full">
                            <div className="flex flex-col justify-center">
                                <p className="text-lg font-bold mb-0">
                                    <span className="inline-block">{userName.toUpperCase()}</span>{" "}
                                    <span className="inline-block">
                                        ({lessons} {t("lessons")})
                                    </span>
                                </p>
                                <p className="mb-0">{!!progressFrom && t("progress", { progressFrom, progressTo })}</p>
                                <p className="mb-0 italic">{!!date && getDate()}</p>
                            </div>
                            <div className="flex items-center md:justify-end">
                                <p className="text-xl mb-0 font-bold">{t("score")}</p>
                                <CircularProgressMagic
                                    max={100}
                                    min={0}
                                    value={score}
                                    gaugePrimaryColor="var(--secondary-5)"
                                    gaugeSecondaryColor="var(--neutral-300)"
                                    className="h-[60px] -ml-10 -mr-12"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoSlide = ({ selectedSlide }: { selectedSlide: any }) => {
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const t = useTranslations("ReviewsFide.circularProgress");
    const { userName, comment, score, title, progressFrom, progressTo, lessons, date, videoUrl, videoThumbnail, modalComment, subtitleENUrl, subtitleFRUrl } = selectedSlide;
    const getDate = () => {
        const dateString = new Date(date);
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
        return dateString.toLocaleDateString(locale, options);
    };

    const onClickComment = () => {
        setOpen(true);
    };

    const data = {
        setOpen,
        title: "",
        message: modalComment,
        functionOk: () => setOpen(false),
        buttonOkStr: "OK",
        clickOutside: true,
        oneButtonOnly: true,
        className: "max-h-[80vh] overflow-y-auto",
    };

    return (
        <div key={selectedSlide.userName} className="w-slide">
            <div className="relative card p-4 md:p-8 max-w-3xl m-auto">
                <div className="mg-bottom-24px mg-top--80px keep absolute top-12">
                    <Quote />
                </div>
                <div className="flex flex-col gap-4 min-h-[390px]">
                    <div className="grid grid-cols-3 gap-4 lg:gap-8">
                        <p className="col-span-3 text-lg md:text-2xl font-bold mb-0 mt-8 text-justify md:hidden">"{title}"</p>
                        <div className="md:hidden col-span-3 max-h-96 mx-auto">
                            <VideoFide
                                videoKey={videoUrl}
                                poster={videoThumbnail}
                                isAnimated={false}
                                subtitleENUrl={subtitleENUrl}
                                subtitleFRUrl={subtitleFRUrl}
                                videoClassName="max-h-96 w-auto"
                                className="shadow-none"
                            />
                        </div>
                        <div className="col-span-3 md:col-span-2 flex flex-col gap-4">
                            <p className="hidden md:block text-2xl font-bold mb-0 mt-8 text-justify">"{title}"</p>
                            <CommentPreview comment={comment} onClick={onClickComment} />
                            <div className="flex w-full justify-between gap-4">
                                <div className="flex flex-col justify-center">
                                    <p className="text-lg font-bold mb-0">
                                        <span className="inline-block">{userName.toUpperCase()}</span>{" "}
                                        <span className="inline-block">
                                            ({lessons} {t("lessons")})
                                        </span>
                                    </p>
                                    <p className="mb-0">{!!progressFrom && t("progress", { progressFrom, progressTo })}</p>
                                    <p className="mb-0 italic">{!!date && getDate()}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-xl mb-0 font-bold">{t("score")}</p>
                                    <CircularProgressMagic
                                        max={100}
                                        min={0}
                                        value={score}
                                        gaugePrimaryColor="var(--secondary-5)"
                                        gaugeSecondaryColor="var(--neutral-300)"
                                        className="h-[60px] -ml-10 -mr-12"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block col-span-1 max-h-96">
                            <VideoFide
                                videoKey={videoUrl}
                                poster={videoThumbnail}
                                isAnimated={false}
                                subtitleENUrl={subtitleENUrl}
                                subtitleFRUrl={subtitleFRUrl}
                                videoClassName="max-h-96 w-auto"
                                className="shadow-none"
                            />
                        </div>
                    </div>
                    <ModalFromBottomWithPortal data={data} open={open} />
                </div>
            </div>
        </div>
    );
};

type CommentPreviewProps = {
    comment: string;
    onClick?: () => void; // ouvrir le modal / page détail
};

export function CommentPreview({ comment, onClick }: CommentPreviewProps) {
    const t = useTranslations("ReviewsFide");
    return (
        <m.button
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative w-full text-left p-0 group cursor-pointer rounded-lg border border-transparent transition-colors"
        >
            {/* Texte clampé */}
            <div className="min-h-32 text-sm text-neutral-600 line-clamp-5">{comment}</div>

            {/* Dégradé en bas pour suggérer qu'il y a une suite */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent group-hover:from-neutral-50 group-hover:via-neutral-50/80" />

            {/* Badge "Voir plus" au hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-end pr-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-300 px-2.5 py-0.5 text-sm font-bold text-neutral-600 shadow-sm ring-1 ring-neutral-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <LuMaximize2 className="h-3 w-3" />
                    {t("seeFullComment")}
                </span>
            </div>
        </m.button>
    );
}

const Quote = () => {
    return (
        <svg width="76" height="77" viewBox="0 0 76 77" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="38" cy="38.8037" r="38" className="fill-neutral-800" />
            <path
                d="M39.7733 49.0392V32.5615C39.7733 30.1777 40.7202 27.8916 42.4058 26.2061C44.0913 24.5205 46.3774 23.5736 48.7611 23.5736C49.1584 23.5736 49.5394 23.7314 49.8204 24.0124C50.1013 24.2933 50.2591 24.6743 50.2591 25.0716C50.2591 25.4689 50.1013 25.8499 49.8204 26.1308C49.5394 26.4117 49.1584 26.5696 48.7611 26.5696C47.1735 26.5745 45.6523 27.2074 44.5297 28.33C43.407 29.4526 42.7742 30.9738 42.7692 32.5615V34.0594H54.004C54.7986 34.0594 55.5607 34.3751 56.1225 34.9369C56.6844 35.4988 57 36.2608 57 37.0554V49.0392C57 49.8338 56.6844 50.5958 56.1225 51.1577C55.5607 51.7195 54.7986 52.0352 54.004 52.0352H42.7692C41.9747 52.0352 41.2126 51.7195 40.6508 51.1577C40.0889 50.5958 39.7733 49.8338 39.7733 49.0392ZM21.0486 52.0352H32.2834C33.078 52.0352 33.84 51.7195 34.4019 51.1577C34.9637 50.5958 35.2794 49.8338 35.2794 49.0392V37.0554C35.2794 36.2608 34.9637 35.4988 34.4019 34.9369C33.84 34.3751 33.078 34.0594 32.2834 34.0594H21.0486V32.5615C21.0535 30.9738 21.6864 29.4526 22.809 28.33C23.9317 27.2074 25.4529 26.5745 27.0405 26.5696C27.4378 26.5696 27.8188 26.4117 28.0997 26.1308C28.3806 25.8499 28.5385 25.4689 28.5385 25.0716C28.5385 24.6743 28.3806 24.2933 28.0997 24.0124C27.8188 23.7314 27.4378 23.5736 27.0405 23.5736C24.6568 23.5736 22.3707 24.5205 20.6851 26.2061C18.9996 27.8916 18.0526 30.1777 18.0526 32.5615V49.0392C18.0526 49.8338 18.3683 50.5958 18.9301 51.1577C19.492 51.7195 20.254 52.0352 21.0486 52.0352Z"
                className="fill-neutral-100"
            />
        </svg>
    );
};
