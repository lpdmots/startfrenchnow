import { CATEGORIES } from "@/app/lib/constantes";
import { Category, Post } from "@/app/types/sfn/blog";
import { Locale } from "@/i18n";
import { useLocale, useTranslations } from "next-intl";
import Link from "next-intl/link";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import { SlideFromBottom } from "../../animations/Slides";
import { LinkBlog } from "../blog/LinkBlog";
import SecondaryPost from "../blog/SecondaryPost";
import { intelRich } from "@/app/lib/intelRich";

export default function PostsList({ posts, postLang }: { posts: Post[]; postLang: "en" | "fr" }) {
    const t = useTranslations("Blog.BlogList");
    const tp = useTranslations("Blog.PostsList");
    const locale = useLocale();

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-60px">
                                <div className="text-center---tablet">
                                    <div className="w-layout-grid grid-2-columns title-and-paragraph v2">
                                        <div className="flex-horizontal start flex-wrap center---tablet">
                                            <div>
                                                <h1 className="display-1 mg-bottom-0">{t.rich("articlesAndResources", intelRich())}</h1>
                                            </div>
                                        </div>
                                        <div className="inner-container _560px">
                                            <p className="mg-bottom-0">{t.rich("description", intelRich())}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                                <div className="sticky-top _48px-top sticky-tbl">
                                    <div className="inner-container _380">
                                        <div className="text-center---tablet">
                                            <div className="card categories-card !p-8">
                                                <LinkBlog href="/blog" className="blog-categories-item-wrapper w-inline-block current pointer-events-none" locale={locale as Locale}>
                                                    {tp("all")}
                                                </LinkBlog>
                                                <div className="w-dyn-list">
                                                    <div role="list" className="collection-list categories w-dyn-items">
                                                        {CATEGORIES.map((category) => (
                                                            <CategoryItem key={category} category={category as Category} locale={locale as Locale} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-12">
                                    {posts.map((post) => (
                                        <ParentToChildrens key={post.title}>
                                            <SecondaryPost post={post} postLang={postLang as "fr" | "en"} />
                                        </ParentToChildrens>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CategoryItem = ({ category, locale }: { category: Category; locale: Locale }) => {
    const tCat = useTranslations(`Categories.${category}`);
    return (
        <div role="listitem" key={category} className="w-dyn-item">
            <LinkBlog href={`/blog/category/${category}`} className="blog-categories-item-wrapper w-inline-block" locale={locale}>
                {tCat("title")}
            </LinkBlog>
        </div>
    );
};
