import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Post } from "../../../types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../../sanity/RichTextComponents";
import NewsletterCard from "../../common/newsletter/NewsletterCard";
import Helper from "./Helper";
import VideoBlog from "../../sanity/RichTextSfnComponents/VideoBlog";
import { useLocale, useTranslations } from "next-intl";
import Link from "next-intl/link";
import { Locale } from "@/i18n";
import { CategoryBadge } from "../blog/CategoryBadge";
import { CATEGORIESCOLORS } from "@/app/lib/constantes";
import { ContactFideCard } from "./ContactFideCard";

function PostContent({ post }: { post: Post }) {
    const locale = useLocale() as Locale;
    const { title, description, categories, mainVideo, mainImage, externLinks, body } = post;
    const tCat = useTranslations(`Categories.${categories?.[0] || "tips"}`);

    const firstCategory = categories?.[0] || "tips";

    return (
        <>
            <section className="section hero v4 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---mbl center">
                        <div className="flex w-full justify-center items-center gap-8 mb-8">
                            <Link href={`/blog/category/${firstCategory}`}>
                                <CategoryBadge category={firstCategory} label={tCat("title")} />
                            </Link>
                        </div>
                        <div className="text-center">
                            <div className="inner-container _1015px center">
                                <h1 className="display-1 mg-bottom-12px">{title}</h1>
                            </div>
                        </div>
                    </div>
                    {mainVideo ? (
                        <div className=" mt-12">
                            <VideoBlog values={{ url: mainVideo.url, title: mainVideo.title }} />
                            <Helper post={post} locale={locale} />
                        </div>
                    ) : mainImage ? (
                        <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto mt-8" style={{ maxWidth: "800px" }}>
                            <Image src={urlFor(mainImage).url()} height={800} width={800} loading="eager" alt={title} className="image object-contain rounded-lg" />
                            <Helper post={post} locale={locale} />
                        </div>
                    ) : (
                        <Helper post={post} locale={locale} />
                    )}
                </div>
            </section>
            <section className="section pd-bottom-220px pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="grid-2-columns post-rigth-sidebar _1-col-tablet">
                            <div className="inner-container _758px">
                                <div className="mg-bottom-48px">
                                    <PortableText value={body} components={RichTextComponents(categories[0] as keyof typeof CATEGORIESCOLORS)} />
                                </div>
                                {externLinks?.length > 0 && (
                                    <div>
                                        <p className="underline">Sources:</p>
                                        <ul>
                                            {externLinks.map((link, index) => (
                                                <li key={index}>
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-neutral-500">
                                                        {link.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div id="w-node-_2efa5bda-72aa-9528-9385-590a86804244-6f543d60" className="sticky-top _48px-top">
                                {firstCategory === "fide" ? <ContactFideCard /> : <NewsletterCard />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default PostContent;
