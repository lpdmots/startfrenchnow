"use client";
import { use, useEffect, useState } from "react";
import { CarouselComments } from "../home/CarouselComments";
import { Fade } from "../../animations/Fades";
import LinkArrow from "../../common/LinkArrow";
import { SlideFromBottom } from "../../animations/Slides";
import { getLastComments } from "@/app/serverActions/udemyActions";
import Link from "next-intl/link";

export interface CommentProps {
    userName?: string;
    userImage?: React.ReactNode;
    comment: string;
    rating?: number;
    created?: string;
}

export const LastComments = ({ courseId, locale, t, courseUrl }: { courseId: string; locale: string; t: any; courseUrl: string }) => {
    const [comments, setComments] = useState<CommentProps[]>([]);

    const getDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString(locale, options);
    };

    useEffect(() => {
        (async () => {
            const useFullComments: CommentProps[] = [];
            let page = 1;
            while (useFullComments.length < 5 && page < 5) {
                const comments = await getLastComments(courseId, page);
                if (comments?.error?.message) {
                    page = 5;
                    console.error(comments.error.message);
                    continue;
                }
                const filtredComments = comments
                    .filter((comment: any) => comment.content.length > 70 && comment.rating > 3.5)
                    .map((comment: any) => {
                        const date = getDate(comment.created);
                        return {
                            comment: comment.content,
                            rating: comment.rating,
                            userName: comment.user.display_name,
                            created: date,
                        };
                    });
                useFullComments.push(...filtredComments);
                page++;
            }
            useFullComments.length = Math.min(useFullComments.length, 5);
            setComments(useFullComments);
        })();
    }, []);

    return (
        <section className="section overflow-hidden testimonial-section wf-section pt-0 pb-24">
            <div className="container-default w-container">
                <SlideFromBottom>
                    <div className="inner-container _600px center">
                        <div className="inner-container _600px---tablet center">
                            <div className="text-center mg-bottom-40px">
                                <div className="inner-container _400px---mbl center">
                                    <div className="center">
                                        <h2 className="display-2">{t["title"]}</h2>
                                    </div>
                                </div>
                                <p className="mg-bottom-48px">
                                    {t["description"]} <LinkArrow url="https://www.udemy.com/course/french-for-beginners-a1/">Udemy</LinkArrow>.
                                </p>
                                <Link href={courseUrl} className="btn-primary project-btn w-inline-block">
                                    <span className="line-rounded-icon link-icon-right">{t["buyNow"]}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <div className="slider-wrapper w-slider">
                        <CarouselComments comments={comments} />
                    </div>
                </Fade>
            </div>
        </section>
    );
};
