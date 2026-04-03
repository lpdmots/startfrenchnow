import { Post } from "../../../types/sfn/blog";
import Image from "next/image";
import ClientSideRoute from "../../common/ClientSideRoute";
import urlFor from "@/app/lib/urlFor";
import React from "react";
import { AiFillSignal } from "react-icons/ai";
import { CATEGORIESCOLORS, CATEGORY_NAMES, LEVELDATA } from "@/app/lib/constantes";
import { ScaleChildren } from "../../animations/ParentToChildrens";
import { Locale } from "@/i18n";
import { CategoryBadge } from "./CategoryBadge";
import { ImPlay2 } from "react-icons/im";

const PrimaryPost = ({ post, locale }: { post: Post; locale: string }) => {
    const { title, description } = post;
    const level = post.level?.length ? post.level.map((lev) => LEVELDATA[lev]) : null;
    const firstCategory = post?.categories?.[0] || "tips";
    const categories = CATEGORY_NAMES[locale as keyof typeof CATEGORY_NAMES];
    const categoryName = categories && firstCategory in categories ? categories[firstCategory as keyof typeof categories] : undefined;
    const hasVideo = post?.mainVideo?.url;
    const categoryColor = CATEGORIESCOLORS[firstCategory as keyof typeof CATEGORIESCOLORS];

    const pathBase = ["pack_fide"].includes(firstCategory) ? `/fide/videos/` : `/blog/post/`;

    return (
        <ClientSideRoute route={pathBase + post.slug.current} locale={locale as Locale}>
            <div className="max-w-[1010px] ml-auto text-[var(--neutral-600)] no-underline flex h-full p-[30px_30px_40px] flex-col rounded-[32px] max-h-[none] p-[28px_28px_54px] max-[991px]:w-full max-[991px]:max-h-[none] max-[991px]:pr-[24px] max-[991px]:pb-[45px] max-[991px]:pl-[24px] max-[767px]:pt-[24px] max-[767px]:pr-[24px] max-[767px]:pl-[24px] max-[479px]:rounded-[24px] card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card max-h-[330px] max-[991px]:max-h-[none] max-[479px]:min-h-[140px]">
                    <ScaleChildren>
                        <Image
                            src={urlFor(post.mainImage).url()}
                            width={400}
                            height={400}
                            loading="lazy"
                            alt={title || "no title"}
                            className="w-full h-full object-cover"
                            style={{ minHeight: 150, objectFit: "contain" }}
                        />
                    </ScaleChildren>
                    <CategoryBadge category={firstCategory} label={categoryName as unknown as string} primary={true} />
                </div>
                <div className="flex p-[40px_0px_0px] flex-col [flex:1_1] max-[479px]:p-[24px_0px_0px]">
                    <div className="inner-container _350px---mbl">
                        <h2 className="blog-card-title display-4 mg-bottom-24px">{title}</h2>
                    </div>
                    <div className="mt-auto">
                        <div className="flex-col gap-x-[24px] gap-y-[24px] max-[479px]:flex-wrap max-[479px]:gap-x-[15px] max-[479px]:gap-y-[15px] max-[479px]:gap-x-[15px] max-[479px]:gap-y-[15px]">
                            <p className="line-clamp-4">{description}</p>
                            <div className="flex justify-end items-center text-300 medium color-neutral-600 gap-2">
                                {hasVideo && (
                                    <div className="flex items-center gap-2">
                                        <ImPlay2 className="text-2xl" style={{ color: categoryColor }} />
                                        <p className="mb-0"> - </p>
                                    </div>
                                )}
                                {level && (
                                    <div className="flex gap-2 items-center">
                                        {level.reverse().map((level, index) => {
                                            return (
                                                <div className="flex items-center gap-2" key={level.label}>
                                                    {!!index && " / "}
                                                    <AiFillSignal style={{ fontSize: "1.2rem", color: level.color }} />
                                                    {level.label}
                                                </div>
                                            );
                                        })}
                                        <p className="mb-0"> - </p>
                                    </div>
                                )}

                                {new Date(post.publishedAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientSideRoute>
    );
};

export default PrimaryPost;
