import { CATEGORIES } from "@/app/lib/constantes";
import { Category, Post } from "@/app/types/sfn/blog";
import { Locale } from "@/i18n";
import { useLocale, useTranslations } from "next-intl";
import Link from "next-intl/link";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import { SlideFromBottom } from "../../animations/Slides";
import { LinkBlog } from "../blog/LinkBlog";
import SecondaryPost from "../blog/SecondaryPost";

export default function PostsList({ posts, postLang }: { posts: Post[]; postLang: "en" | "fr" }) {
    const t = useTranslations("Blog.PostsList");
    const locale = useLocale();

    return (
        <div className="section pd-200px pd-top-184px wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                            <div className="sticky-top _48px-top sticky-tbl">
                                <div className="inner-container _380">
                                    <SlideFromBottom>
                                        <div className="text-center---tablet">
                                            <h2 className="display-2 mg-bottom-40px">
                                                <span className="z-index-1">{t("latest")} </span>
                                                <span className="heading-span-secondary-3 v2">{t("posts")}</span>
                                            </h2>
                                            <div className="card categories-card !p-8">
                                                <Link href="#" className="blog-categories-item-wrapper current w-inline-block pointer-events-none">
                                                    {t("all")}
                                                </Link>
                                                <div className="w-dyn-list">
                                                    <div role="list" className="collection-list categories w-dyn-items">
                                                        {CATEGORIES.map((category) => (
                                                            <CategoryItem key={category} category={category as Category} locale={locale as Locale} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SlideFromBottom>
                                </div>
                            </div>
                            <div className="grid gap-12">
                                {posts.map((post) => (
                                    <ParentToChildrens key={post.title}>
                                        <SecondaryPost post={post} postLang={postLang} />
                                    </ParentToChildrens>
                                ))}
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
