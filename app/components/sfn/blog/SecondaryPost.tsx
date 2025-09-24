import { Post } from "../../../types/sfn/blog";
import Image from "next/image";
import ClientSideRoute from "../../common/ClientSideRoute";
import urlFor from "@/app/lib/urlFor";
import { AiFillSignal } from "react-icons/ai";
import { CATEGORIESCOLORS, CATEGORY_NAMES, LEVELDATA } from "@/app/lib/constantes";
import { ScaleChildren } from "../../animations/ParentToChildrens";
import { getDataInRightLang } from "@/app/lib/utils";
import { Locale } from "@/i18n";
import { ImPlay2 } from "react-icons/im";
import { CategoryBadge } from "./CategoryBadge";

const SecondaryPost = ({ post, locale }: { post: Post; locale: string }) => {
    const { title, description } = post;
    const level = post.level?.length ? post.level.map((lev) => LEVELDATA[lev]) : null;
    const firstCategory = post?.categories?.[0] || "tips";
    const categories = CATEGORY_NAMES[locale as keyof typeof CATEGORY_NAMES];
    const categoryName = categories && firstCategory in categories ? categories[firstCategory as keyof typeof categories] : undefined;
    const hasVideo = post?.mainVideo?.url;
    const categoryColor = CATEGORIESCOLORS[firstCategory as keyof typeof CATEGORIESCOLORS];

    const pathBase = ["pack_fide", "fide"].includes(firstCategory) ? `/fide/videos/` : `/blog/post/`;

    return (
        <ClientSideRoute route={pathBase + post.slug.current} locale={locale as Locale}>
            <div className="card blog-secondary-card link-card w-inline-block !p-4 !sm:p-8">
                <div className="blog-card-image-wrapper inside-card blog-secondary-card-image flex flex-col gap-4 h-full" style={{ maxHeight: "none", overflow: "visible" }}>
                    <div className="rounded-2xl sm:rounded-3xl" style={{ overflow: "hidden" }}>
                        <ScaleChildren>
                            <Image
                                src={urlFor(post.mainImage).url()}
                                width={350}
                                height={200}
                                loading="lazy"
                                alt={post.title || "no title"}
                                className="blog-card-image object-contain"
                                style={{ width: "auto", height: "auto", maxHeight: "200px", minHeight: 150 }}
                            />
                        </ScaleChildren>
                    </div>
                    <CategoryBadge category={firstCategory} label={categoryName as unknown as string} />
                </div>
                <div className="inner-container blog-secondary-card-content flex flex-col justify-between" style={{ minHeight: 200 }}>
                    <div>
                        <h2 className="bl font-extrabold">{title || "Pas de titre"}</h2>
                        <p className="mg-bottom-0 line-clamp-5">{description || "Pas de description"}</p>
                    </div>
                    <div className="flex justify-end items-center text-300 medium color-neutral-600 mt-4 gap-2" style={{ fontSize: 16 }}>
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
        </ClientSideRoute>
    );
};

export default SecondaryPost;
