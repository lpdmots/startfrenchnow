import Image from "next/image";
import React from "react";

export const comments = [
    {
        userName: "Santiago Terreno D.",
        userImage: "/images/andy-smith-image-paperfolio-webflow-template.png",
        logo: "",
        comment:
            "Excellent course, couldn't have been better! The explanations were very clear, the exercises were really helpful to solidify concepts, and the pace was optimal. Amazing teacher and great content! Looking forward to continue to learn and improve my French.",
    },
    {
        userName: "Kanishka A.",
        userImage: "/images/frances-willem-image-paperfolio-webflow-template.png",
        logo: "",
        comment:
            "The most organised, well-explained and fun to learn French course on Udemy. It contains a great deal of information, being inclusive of all the major themes one requires to learn French in the initial stage. 10/10 on quality, quantity and engagement. Je viens de finir ce cours et maintenant vais compléter les fiches d'exercices pour plus de révision. Vous avez été d'une grande aide! Encore, merci beaucoup.",
    },
    {
        userName: "Diana S.",
        userImage: "/images/lily-woods-image-paperflow-webflow-template.png",
        logo: "",
        comment:
            "As always, great teaching skills and very organized classes. Always includes exercises in order to practice what we have learnt so far. Took begginner's level with Yohan and he never disappoints. Thank you so much!",
    },
];

function Comment({ slideIndex }: { slideIndex: any }) {
    const selectedSlide = slideIndex < comments.length && slideIndex >= 0 ? comments[slideIndex] : comments[0];
    return (
        <div key={selectedSlide.userName} className="w-slide">
            <div className="inner-container testimonial-slider">
                <div className="card testimonial-card">
                    <div className="testimonial-card-content-wrapper position-relative">
                        <div className="inner-container _500px grow">
                            <div>
                                <div className="mg-bottom-24px mg-top--80px keep position-absolute top-0">
                                    <Image src="/images/quote-sign-paperflow-webflow-template.svg" height={77} width={77} loading="eager" alt="" />
                                </div>
                                <p className={` ${selectedSlide.comment.length > 300 && "text-base"}`}>{selectedSlide.comment}</p>
                                <div className="flex-horizontal space-between wrap-24px">
                                    <div className="full-width-mobile">
                                        <div className="text-200 bold color-neutral-800">{selectedSlide.userName}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-image-wrapper image-comment lg:h-auto">
                            <Image src={selectedSlide.userImage} height={500} width={500} alt={selectedSlide.userName} className="image object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Comment;
