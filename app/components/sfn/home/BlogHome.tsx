import { groq } from "next-sanity";
import React from "react";
import { Post } from "../../../types/sfn/blog";
import PrimaryPost from "../blog/PrimaryPost";
import SecondaryPost from "../blog/SecondaryPost";
import { client } from "@/app/lib/sanity.client";
import { BiPencil } from "react-icons/bi";
import { SlideFromBottom } from "../../animations/Slides";
import { Scale } from "../../animations/Scale";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";
import { LinkBlog } from "../blog/LinkBlog";

const query = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && langage == 'both' && isReady == true] {
        ...,
    } | order(publishedAt desc)[0...3]
`;

export default async function BlogHome() {
    const posts: Post[] = await client.fetch(query);
    return <BlogHomeRender posts={posts} />;
}

const BlogHomeRender = ({ posts }: { posts: Post[] }) => {
    const t = useTranslations("BlogHome");
    const locale = useLocale();
    const postLang = locale === "fr" ? "fr" : "en";

    return (
        <div className="section wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <SlideFromBottom>
                            <div className="mg-bottom-56px">
                                <div className="text-center---tablet">
                                    <div data-w-id="a1ac5fbd-201a-a9b1-b1a1-3019f18603fe" className="w-layout-grid grid-2-columns title-and-buttons _1-col-tablet">
                                        <h2 className="display-2 mg-bottom-0">{t.rich("title", intelRich())}</h2>
                                        <div className="buttons-row center-tablet">
                                            <LinkBlog href="/blog" className="btn-secondary w-button" locale={locale as Locale}>
                                                <span className="flex items-center">
                                                    <BiPencil className="mr-2" />
                                                    {t("button")}
                                                </span>
                                            </LinkBlog>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SlideFromBottom>

                        <div className="grid-2-columns blog-featured-grid">
                            <Scale>
                                <div className="w-dyn-list">
                                    <div role="list" className="height-100 w-dyn-items">
                                        <div role="listitem" className="height-100 w-dyn-item">
                                            {posts.length > 0 && (
                                                <ParentToChildrens>
                                                    <PrimaryPost post={posts[0]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Scale>
                            <div className="collection-list-wrapper w-dyn-list">
                                <div role="list" className="grid-1-column gap-32px w-dyn-items">
                                    <Scale>
                                        <div role="listitem" className="w-dyn-item">
                                            {posts.length > 1 && (
                                                <ParentToChildrens>
                                                    <SecondaryPost post={posts[1]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </Scale>
                                    <Scale>
                                        <div role="listitem" className="w-dyn-item">
                                            {posts.length > 2 && (
                                                <ParentToChildrens>
                                                    <SecondaryPost post={posts[2]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </Scale>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
