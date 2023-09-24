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

const SecondaryPost = ({ post, postLang = "en" }: { post: Post; postLang?: "en" | "fr" }) => {
    const locale = useLocale();
    const level = post.level ? LEVELDATA[post.level] : null;
    const tCat = useTranslations(`Categories.${post?.categorie}`);
    const title = getDataInRightLang(post, postLang, "title");
    const description = getDataInRightLang(post, postLang, "description");

    return (
        <ClientSideRoute route={`/blog/post/${post.slug.current}`} locale={locale as Locale}>
            <div className="card blog-secondary-card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card blog-secondary-card-image ">
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
                    <div className="blog-card-badge-wrapper-top text-right">
                        <div className="badge-primary small">{tCat("title")}</div>
                    </div>
                </div>
                <div className="inner-container blog-secondary-card-content flex flex-col justify-between" style={{ minHeight: 200 }}>
                    <div>
                        <h2 className="mg-bottom-16px display-4">{title || "Pas de titre"}</h2>
                        <p className="mg-bottom-0 line-clamp-5">{description || "Pas de description"}</p>
                    </div>
                    <div className="flex justify-end items-center text-300 medium color-neutral-600 mt-4" style={{ fontSize: 16 }}>
                        {level ? (
                            <>
                                <AiFillSignal className=" mr-2" style={{ fontSize: "1.5rem", color: level?.color }} />
                                {`${level.label} - `}
                            </>
                        ) : (
                            ""
                        )}
                        {new Date(post.publishedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                </div>
            </div>
        </ClientSideRoute>
    );
};

export default SecondaryPost;
