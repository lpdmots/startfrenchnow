import { Category, Post } from "@/app/types/sfn/blog";
import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES, HEADINGSPANCOLORS } from "@/app/lib/constantes";
import { Locale } from "@/i18n";
import { PostsListInfiniteScroll } from "@/app/components/sfn/post/PostsListInfiniteScroll";
import { getCategoryPostsSlice } from "@/app/serverActions/blogActions";
import Link from "next/link";
import { localizePosts } from "@/app/lib/utils";

type Props = {
    params: {
        slug: Category;
        locale: Locale;
    };
};

export const revalidate = 60;

async function Categories({ params: { slug, locale } }: Props) {
    const postsData: Post[] = await getCategoryPostsSlice(slug, 0, 10);
    const posts = localizePosts(postsData, locale);
    return <CategoriesNoAsync posts={posts} slug={slug} />;
}

export default Categories;

const CategoriesNoAsync = ({ posts: posts, slug }: { posts: Post[]; slug: string }) => {
    const locale = useLocale();
    const t = useTranslations(`Categories.${slug}`);

    const headingSpanColor = HEADINGSPANCOLORS[slug as keyof typeof HEADINGSPANCOLORS];

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
                                            <div className={headingSpanColor}>
                                                <h1 className="display-1 color-neutral-100 mg-bottom-0">{t("title")}</h1>
                                            </div>
                                            <div className="display-1"> </div>
                                            <h2 className="display-1 mg-bottom-0">{t("posts")}</h2>
                                        </div>
                                        <div className="inner-container _560px">
                                            <p className="mg-bottom-0">{t("description")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                                <div className="sticky-top _48px-top sticky-tbl">
                                    <div className="inner-container _380">
                                        <div className="text-center---tablet">
                                            <div className="card categories-card !p-8">
                                                <Link href="/blog" className="blog-categories-item-wrapper w-inline-block">
                                                    {t("all")}
                                                </Link>
                                                <div className="w-dyn-list">
                                                    <div role="list" className="collection-list categories w-dyn-items">
                                                        {CATEGORIES.map((category) => (
                                                            <CategoryItem key={category} category={category as Category} slug={slug} locale={locale as Locale} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-12">
                                    <PostsListInfiniteScroll locale={locale} category={slug} initialPosts={posts} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryItem = ({ category, slug, locale }: { category: Category; slug: string; locale: Locale }) => {
    const tCat = useTranslations(`Categories.${category}`);
    return (
        <div role="listitem" key={category} className="w-dyn-item">
            <Link href={`/blog/category/${category}`} className={`blog-categories-item-wrapper ${category === slug ? "current pointer-events-none" : ""} w-inline-block`}>
                {tCat("title")}
            </Link>
        </div>
    );
};
