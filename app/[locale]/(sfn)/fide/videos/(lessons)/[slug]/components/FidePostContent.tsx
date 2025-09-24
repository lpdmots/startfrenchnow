"use client";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Post } from "@/app/types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n";
import { CATEGORIESCOLORS } from "@/app/lib/constantes";
import { RichTextComponents } from "@/app/components/sanity/RichTextComponents";
import Link from "next-intl/link";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import VideoProgressPlayer from "./VideoProgressPlayer";
import { ManualWatched } from "./ManualWatched";
import SommaireModal from "@/app/components/common/SommaireModal";
import { FidePackSommaire } from "@/app/serverActions/productActions";
import { CoursesAccordionClient } from "../../../../pack-fide/components/CoursesAccordionClient";
import clsx from "clsx";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

function FidePostContent({
    post,
    previous,
    next,
    hasPack,
    fidePackSommaire,
}: {
    post: Post;
    previous: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
    hasPack: boolean;
    fidePackSommaire: FidePackSommaire;
}) {
    const locale = useLocale() as Locale;
    const { title, description, categories, mainVideo, mainImage, body } = post;
    const firstCategory = categories?.[0] || "tips";

    return (
        <div className="space-y-8">
            <div>
                {mainVideo ? (
                    <div className="mt-12 sm:mt-4">
                        <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto relative" style={{ width: "100%", lineHeight: 0 }}>
                            <VideoProgressPlayer postId={post._id} src={cloudFrontDomain + mainVideo.url} poster={mainImage ? urlFor(mainImage).url() : undefined} className="w-full" controls />

                            {previous && (
                                <Link href={`/fide/videos/${previous.slug}`} className="hidden -left-2 sm:flex items-center justify-center center-y ">
                                    <span className="hidden sm:inline-block translate_on_hover">
                                        <LuChevronLeft size={50} color="var(--neutral-800)" />
                                    </span>
                                </Link>
                            )}

                            {next && (
                                <Link href={`/fide/videos/${next.slug}`} className="hidden -right-2 sm:flex items-center justify-center center-y">
                                    <span className="translate_on_hover">
                                        <LuChevronRight size={50} color="var(--neutral-800)" />
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                ) : mainImage ? (
                    <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto mt-6" style={{ maxWidth: "800px" }}>
                        <Image src={urlFor(mainImage).url()} height={800} width={800} loading="eager" alt={title} className="image object-contain rounded-lg" />
                    </div>
                ) : null}
            </div>
            <div className="text-center !mt-4">
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center w-full gap-2 flex-wrap">
                    <div className="flex justify-center gap-4 w-full sm:hidden">
                        <Link href={previous ? `/fide/videos/${previous.slug}` : "#"} className="flex items-center justify-center">
                            <button className={clsx("roundButton small !bg-neutral-300", { "opacity-30 cursor-not-allowed": !previous })}>
                                <LuChevronLeft size={30} color="var(--neutral-800)" />
                            </button>
                        </Link>
                        <Link href={next ? `/fide/videos/${next.slug}` : "#"} className="flex items-center justify-center">
                            <button className={clsx("roundButton small !bg-neutral-300", { "opacity-30 cursor-not-allowed": !next })}>
                                <LuChevronRight size={30} color="var(--neutral-800)" />
                            </button>
                        </Link>
                    </div>
                    <h1 className="display-3 mb-0 flex justify-center w-full lg:w-auto lg:justify-start">{title}</h1>
                    <div className="flex items-center justify-between w-full lg:w-auto">
                        <div className="lg:hidden">
                            <SommaireModal>
                                <CoursesAccordionClient fidePackSommaire={fidePackSommaire} hasPack={hasPack} expandAll={false} />
                            </SommaireModal>
                        </div>
                        <ManualWatched postId={post._id} />
                    </div>
                </div>
            </div>
            <div className="mg-bottom-48px">
                <PortableText value={body} components={RichTextComponents(categories[0] as keyof typeof CATEGORIESCOLORS)} />
            </div>
        </div>
    );
}

export default FidePostContent;
