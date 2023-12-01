import { Post } from "../../../types/sfn/blog";
import Image from "next/image";
import ClientSideRoute from "../../common/ClientSideRoute";
import urlFor from "@/app/lib/urlFor";
import { AiFillSignal } from "react-icons/ai";
import { LEVELDATA } from "@/app/lib/constantes";
import { ScaleChildren } from "../../animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { getDataInRightLang } from "@/app/lib/utils";
import { Locale } from "@/i18n";
import { CategoryBadge } from "./CategoryBadge";

const SecondaryPost = ({ post, postLang = "en" }: { post: Post; postLang?: "en" | "fr" }) => {
    const locale = useLocale();
    const level = post.level?.length ? post.level.map((lev) => LEVELDATA[lev]) : null;
    const firstCategory = post?.categories?.[0] || "tips";
    const tCat = useTranslations(`Categories.${firstCategory}`);
    const title = getDataInRightLang(post, postLang, "title");
    const description = getDataInRightLang(post, postLang, "description");

    return (
        <ClientSideRoute route={`/blog/post/${post.slug.current}`} locale={locale as Locale}>
            <div className="card blog-secondary-card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card blog-secondary-card-image flex flex-col gap-4 h-full" style={{ maxHeight: "none", overflow: "visible" }}>
                    <ScaleChildren>
                        <Image
                            src={urlFor(post.mainImage).url()}
                            width={200}
                            height={200}
                            loading="lazy"
                            alt={post.title || "no title"}
                            className="blog-card-image object-contain rounded-2xl sm:rounded-3xl"
                            style={{ width: "auto", height: "auto", maxHeight: "200px" }}
                        />
                    </ScaleChildren>
                    <CategoryBadge category={firstCategory} label={tCat("title")} />
                </div>
                <div className="inner-container blog-secondary-card-content flex flex-col justify-between" style={{ minHeight: 200 }}>
                    <div>
                        <h2 className="mg-bottom-16px display-4">{title || "Pas de titre"}</h2>
                        <p className="mg-bottom-0 line-clamp-5">{description || "Pas de description"}</p>
                    </div>
                    <div className="flex justify-end items-center text-300 medium color-neutral-600 mt-4 gap-2" style={{ fontSize: 16 }}>
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
        </ClientSideRoute>
    );
};

export default SecondaryPost;
