"use client";
import Marquee from "@/app/components/ui/marquee";
import { CommentProps } from "../courses/LastComments";
import { renderStars } from "../../common/CompteurIncrement";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { cn } from "@/app/lib/schadcn-utils";
import { useEffect, useState } from "react";
import { getLastComments } from "@/app/serverActions/udemyActions";

const COURSE_ID = "3693426";
const NBREOFCOMMENTS = 10;

const reviews: CommentProps[] = [
    {
        comment:
            "It's great that we're beginning with the alphabet and vowels. Many courses start with words without teaching pronunciation first, but understanding the pronunciation of the word's components is essential.",
        rating: 5,
        userName: "Chuck Savage",
        created: "25 septembre 2024",
    },
    {
        comment:
            "The course is really well. It takes you step by step through the basics of French. By the end of it, you’ll be familiar with lots of vocabulary and expressions. As well as being able to form a great number of sentences to express yourself in many basic areas of life.",
        rating: 5,
        userName: "Osama Basrawi",
        created: "17 septembre 2024",
    },
    {
        comment: "It's slow enough to understand, but I don't feel like he's treating me like a dummy!",
        rating: 5,
        userName: "Meribeth Minshew",
        created: "17 septembre 2024",
    },
    {
        comment: "Very clear and easy to understand as the trainer always rèpètez",
        rating: 5,
        userName: "Faiz Kadir Ismail",
        created: "15 septembre 2024",
    },
    {
        comment: "I do love his native French speaking and that he use actually lot of French",
        rating: 5,
        userName: "Osman KHODER",
        created: "12 septembre 2024",
    },
    {
        comment:
            "Yohann is an excellent teacher! The explanations are clear and easy to follow.\nOne thing I would change is to split A1 and A2 into two separate courses and include even more exercises in each of them.",
        rating: 5,
        userName: "Ewelina Kosciukiewicz",
        created: "12 septembre 2024",
    },
    {
        comment:
            "amazing course, great teacher, does not assume we know anything and always explains what I would have asked to be explained if this were a live course. Looking forward to taking his intermediate course once I finish this one!",
        rating: 5,
        userName: "Vic G",
        created: "8 septembre 2024",
    },
    {
        comment: "Solid introductory course, the extra exercises and materials that are included are helpful as well.",
        rating: 4.5,
        userName: "Gergő Horváth",
        created: "5 septembre 2024",
    },
    {
        comment: "Trés bien! Fun. The teacher explains everything using a variety of topics and making the lessons easy to follow and understand. Magnifique!",
        rating: 5,
        userName: "Carlos Rojas",
        created: "28 août 2024",
    },
    {
        comment:
            "I'm absolutely loving Yohann's French lessons! This course is exactly what I was looking for. As someone who started with zero knowledge of French, I really needed something with a solid structure to help me build a strong foundation—and Yohann has done that perfectly.\n\nThe colorful visuals make the lessons fun and easy to remember, which is great for a visual learner like me. Yohann explains everything so clearly, it feels like you're in a live session with him. I also appreciate the homework/exercises at the end of each section—it’s a great way to review what I’ve learned.\n\nEven though I'm only on section 2, I can already see myself making progress and actually using what I’ve learned! I’m really happy with this course and excited to keep going!",
        rating: 5,
        userName: "Alejandra Campos",
        created: "27 août 2024",
    },
];

export function MarqueeSocial({ locale }: { locale: string }) {
    const isMedium = useMediaQuery("(max-width: 768px)");
    const [comments, setComments] = useState<CommentProps[]>([]);

    const getDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString(locale, options);
    };

    const firstRow = comments.length ? comments.slice(comments.length / 2) : reviews.slice(reviews.length / 2);
    const secondRow = comments.length ? comments.slice(0, comments.length / 2) : reviews.slice(0, reviews.length / 2);

    useEffect(() => {
        (async () => {
            const useFullComments: CommentProps[] = [];
            let page = 1;
            while (useFullComments.length < NBREOFCOMMENTS - 1 && page < 8) {
                const comments = await getLastComments(COURSE_ID, page);
                if (comments?.error?.message) {
                    page = 5;
                    console.error(comments.error.message);
                    continue;
                }
                const filtredComments = comments
                    .filter((comment: any) => comment.content.length > 50 && comment.rating > 4)
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
            useFullComments.length = Math.min(useFullComments.length, NBREOFCOMMENTS);
            setComments(useFullComments);
        })();
    }, []);

    return (
        <div className="flex justify-center">
            <div
                className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background", !isMedium ? "h-[500px]" : "h-[800px]")}
                style={{ maxWidth: 1300 }}
            >
                <Marquee vertical={!isMedium ? false : true} pauseOnHover className="[--duration:30s]">
                    {firstRow.map((review, i) => (
                        <Comment key={review?.userName || "" + i} review={review} />
                    ))}
                </Marquee>
                {!isMedium && (
                    <Marquee reverse pauseOnHover className="[--duration:30s]">
                        {secondRow.map((review, i) => (
                            <Comment key={review?.userName || "" + i} review={review} />
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
        </div>
    );
}

function Comment({ review }: { review: CommentProps }) {
    const { rating, created, comment, userName } = review;
    return (
        <div key={review.userName} className="w-slide my-4">
            <div className="max-w-sm md:max-w-md">
                <div className={`card link-card p-2 md:p-4 h-52`}>
                    <div className="mg-bottom-24px mg-top--80px keep position-absolute top-16">
                        <Quote />
                    </div>
                    <div className="flex flex-row items-end justify-between gap-2 w-full mt-4">
                        <div className="flex flex-col justify-center">
                            <p className="font-bold mb-0">{userName}</p>
                            <p className="italic mb-0">{created ? created : ""}</p>
                        </div>
                        {rating && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-2xl md:text-4xl font-extrabold mb-0">{rating}</p>
                                <div>{renderStars(rating)}</div>
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-sm line-clamp-3">{comment}</p>
                </div>
            </div>
        </div>
    );
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
