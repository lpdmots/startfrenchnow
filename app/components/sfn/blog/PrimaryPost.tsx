import { Post } from "../../../types/sfn/blog";
import Image from "next/image";
import ClientSideRoute from "../../common/ClientSideRoute";
import urlFor from "@/app/lib/urlFor";
import React from "react";
import { AiFillSignal } from "react-icons/ai";
import { LEVELDATA } from "@/app/lib/constantes";
import { ScaleChildren } from "../../animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import { CategoryBadge } from "./CategoryBadge";

const PrimaryPost = ({ post, postLang = "en" }: { post: Post; postLang?: "en" | "fr" }) => {
    const locale = useLocale();
    const level = post.level?.length ? post.level.map((lev) => LEVELDATA[lev]) : null;
    const firstCategory = post?.categories?.[0] || "tips";
    const tCat = useTranslations(`Categories.${firstCategory}`);
    const title = postLang === "fr" ? post.title : post.title_en;
    const description = postLang === "fr" ? post.description : post.description_en;

    return (
        <ClientSideRoute route={`/blog/post/${post.slug.current}`} locale={locale as Locale}>
            <div className="blog-card-wrapper card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card max-heigth-330px">
                    <ScaleChildren>
                        <Image src={urlFor(post.mainImage).url()} width={400} height={400} loading="lazy" alt={title || "no title"} className="blog-card-image" />
                    </ScaleChildren>
                    <CategoryBadge category={firstCategory} label={tCat("title")} primary={true} />
                </div>
                <div className="blog-card-content-inside">
                    <div className="inner-container _350px---mbl">
                        <h2 className="blog-card-title display-4 mg-bottom-24px">{title}</h2>
                    </div>
                    <div className="mg-top-auto">
                        <div className="flex-col gap-24px _15px---mbp">
                            <p className="line-clamp-4">{description}</p>
                            <div className="flex justify-end items-center text-300 medium color-neutral-600 gap-2">
                                {level && (
                                    <div className="flex  gap-2 items-center">
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

                                {new Date(post.publishedAt).toLocaleDateString(postLang, { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientSideRoute>
    );
};

export default PrimaryPost;
