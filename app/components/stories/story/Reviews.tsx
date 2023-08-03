import { Review, ScoreProps, Success } from "@/app/types/stories/element";
import { LayoutProps } from "@/app/types/stories/state";
import React from "react";
import ScoreGauge from "./ScoreGauge";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../../sanity/RichTextStory";
import urlFor from "@/app/lib/urlFor";
import { SlideFromBottom } from "../../animations/Slides";
import { ReviewFormularButton } from "./ReviewFormular";

export const Reviews = ({ data }: { data: LayoutProps }) => {
    if (!data.reviews) return null;

    return (
        <div>
            {data.reviews.map((review, index) => (
                <Review key={index} review={review} />
            ))}
            <ReviewFormularButton />
        </div>
    );
};

const Review = ({ review }: { review: Review }) => {
    const oneScore = review?.scores?.length === 1;

    return (
        <div className="py-6 flex flex-col justify-center items-center ">
            <h2 className={`display-4 heading-span-${review.color} mb-6`}>{review?.title}</h2>
            <div className={oneScore ? "max-w-2xl" : "w-layout-grid grid-2-columns values-grid"}>
                {review?.scores?.map((score) => (
                    <Score key={score.title} review={review} score={score} />
                ))}
            </div>

            <div className="w-layout-grid grid-3-columns values-grid">
                {review?.success?.map((success) => (
                    <Success key={success.title} review={review} success={success} />
                ))}
            </div>
        </div>
    );
};

const Score = ({ score, review }: { score: ScoreProps; review: Review }) => {
    const color = score.color || review.color;
    const { title, text } = score;

    return (
        <SlideFromBottom>
            <div className="card image-left---text-rigth">
                <div className="image-wrapper card-value-image-left-wrapper flex justify-center items-center p-6 w-full !max-w-none">
                    <ScoreGauge score={score?.value || 0} />
                </div>
                <div className="card-value-conter-left">
                    <h3>{title}</h3>
                    <p className="mg-bottom-0">
                        <PortableText value={text} components={RichTextStory(true)} />
                    </p>
                </div>
            </div>
        </SlideFromBottom>
    );
};

const Success = ({ success, review }: { success: Success; review: Review }) => {
    const color = success.color || review.color;
    const { title, text, image, unlocked } = success;
    const imgToDisplay = image && unlocked ? urlFor(image).url() : unlocked ? "/images/beneficier-a.png" : "/images/cadenas.png";

    return (
        <SlideFromBottom>
            <div className="card flex flex-col sm:grid sm:grid-cols-4 relative" style={{ borderColor: unlocked ? "var(--neutral-900)" : "var(--neutral-400)" }}>
                <div className="image-wrapper card-value-image-left-wrapper flex justify-center items-center p-2 w-full !max-w-none">
                    <img src={imgToDisplay} loading="eager" alt={title} className="h-full w-full object-contain max-h-24" />
                </div>
                <div className="p-2 pl-2 sm:pl-0 col-span-3 flex flex-col justify-center">
                    <h3 className="sm:text-left bl">{title}</h3>
                    {unlocked ? (
                        <p className="mg-bottom-0 sm:text-left bs" style={{ minHeight: 120 }}>
                            <PortableText value={text} components={RichTextStory(true)} />
                        </p>
                    ) : (
                        <div className="flex flex-col justify-between py-4" style={{ minHeight: 120 }}>
                            <div className="bg-neutral-300 w-full h-3" style={{ borderRadius: 25 }}></div>
                            <div className="bg-neutral-300 w-4/5 h-3" style={{ borderRadius: 25 }}></div>
                            <div className="bg-neutral-300 w-full h-3" style={{ borderRadius: 25 }}></div>
                            <div className="bg-neutral-300 w-5/6 h-3" style={{ borderRadius: 25 }}></div>
                        </div>
                    )}
                </div>
                {!unlocked && <div className="absolute w-full h-full bg-neutral-700" style={{ borderRadius: 24, opacity: 0.1 }}></div>}
            </div>
        </SlideFromBottom>
    );
};
