"use client";
import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Comment from "./Comment";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { CommentProps } from "../courses/LastComments";
import Image from "next/image";

const defaultComments: CommentProps[] = [
    {
        userName: "Santiago Terreno D.",
        userImage: (
            <div className="testimonial-image-wrapper image-comment lg:h-auto">
                <Image src="/images/andy-smith-image-paperfolio-webflow-template.png" height={500} width={500} alt={"Avatar de Santiago"} className="image object-contain" />
            </div>
        ),
        comment:
            "Excellent course, couldn't have been better! The explanations were very clear, the exercises were really helpful to solidify concepts, and the pace was optimal. Amazing teacher and great content! Looking forward to continue to learn and improve my French.",
    },
    {
        userName: "Kanishka A.",
        userImage: (
            <div className="testimonial-image-wrapper image-comment lg:h-auto">
                <Image src="/images/frances-willem-image-paperfolio-webflow-template.png" height={500} width={500} alt={"Avatar de Kanishka"} className="image object-contain" />
            </div>
        ),
        comment:
            "The most organised, well-explained and fun to learn French course on Udemy. It contains a great deal of information, being inclusive of all the major themes one requires to learn French in the initial stage. 10/10 on quality, quantity and engagement. Je viens de finir ce cours et maintenant vais compléter les fiches d'exercices pour plus de révision. Vous avez été d'une grande aide! Encore, merci beaucoup.",
    },
    {
        userName: "Diana S.",
        userImage: (
            <div className="testimonial-image-wrapper image-comment lg:h-auto">
                <Image src="/images/lily-woods-image-paperflow-webflow-template.png" height={500} width={500} alt={"Avatar de Diana"} className="image object-contain" />
            </div>
        ),
        comment:
            "As always, great teaching skills and very organized classes. Always includes exercises in order to practice what we have learnt so far. Took begginner's level with Yohan and he never disappoints. Thank you so much!",
    },
];

export const CarouselComments = ({ comments }: any) => {
    const [slideIndex, setSlideIndex] = useState(0);
    const commentsList = comments?.length ? comments : defaultComments;

    const handleSlide = (number: 1 | -1) => {
        let newSlideIndex = slideIndex + number;
        if (newSlideIndex >= (commentsList?.length || 0)) newSlideIndex = 0;
        if (newSlideIndex < 0) newSlideIndex = commentsList.length - 1;
        setSlideIndex(newSlideIndex);
    };
    return (
        <>
            <div className="slider-mask overflow-visible w-slider-mask">
                <AnimatePresence mode="wait">
                    <m.div key={slideIndex ? slideIndex : "empty"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <Comment slideIndex={slideIndex} comments={commentsList} />
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
