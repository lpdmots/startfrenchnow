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
    results?: React.ReactNode;
}

export const LastComments = ({
    courseId,
    locale,
    t,
    courseUrl,
    hasCourse = false,
    udemyCourseUrl,
    ctaExtra,
}: {
    courseId: string;
    locale: string;
    t: any;
    courseUrl: string;
    hasCourse?: boolean;
    udemyCourseUrl: string;
    ctaExtra?: React.ReactNode;
}) => {
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
        <section className="section overflow-hidden max-[767px]:pb-[150px] wf-section pt-0 pb-24">
            <div className="container-default w-container">
                <SlideFromBottom>
                    <div className="inner-container max-w-[600px] max-[991px]:max-w-full center">
                        <div className="inner-container _600px---tablet center">
                            <div className="text-center mg-bottom-40px">
                                <div className="inner-container _400px---mbl center">
                                    <div className="center">
                                        <h2 className="display-2 mb-4">{t["title"]}</h2>
                                    </div>
                                </div>
                                <p className="mg-bottom-48px">{t["description"]}</p>
                                {ctaExtra}
                                <Link href={hasCourse ? "/courses/dashboard" : courseUrl} className="btn-primary project-btn w-inline-block">
                                    <span className="line-rounded-icon link-icon-right">{hasCourse ? t["continue"] : t["buyNow"]}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <div className="h-full bg-[transparent] max-[991px]:pb-[120px] max-[767px]:pb-[110px] max-[479px]:pb-[100px] w-slider">
                        <CarouselComments comments={comments} />
                    </div>
                </Fade>
            </div>
        </section>
    );
};
