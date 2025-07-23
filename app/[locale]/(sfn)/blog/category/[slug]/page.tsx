import { groq } from "next-sanity";
import { Category, Post } from "@/app/types/sfn/blog";
import SecondaryPost from "@/app/components/sfn/blog/SecondaryPost";
import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES, HEADINGSPANCOLORS } from "@/app/lib/constantes";
import { BlogLangButton } from "@/app/components/sfn/blog/BlogLangButton";
import { LinkBlog } from "@/app/components/sfn/blog/LinkBlog";
import { Locale } from "@/i18n";
import { PostsListInfiniteScroll } from "@/app/components/sfn/post/PostsListInfiniteScroll";
import { getCategoryPostsSlice } from "@/app/serverActions/blogActions";

type Props = {
    params: {
        slug: Category;
    };
    searchParams: { postLang: "en" | "fr" };
};

const queryCategories = groq`
    *[_type=='category'] {title, slug, description} | order(title asc)
`;

export const revalidate = 60;

/* export async function generateStaticParams() {
    const query = groq`*[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true]
    {
        slug
    }`;

    const slugs: Post[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
} */

async function Categories({ params: { slug }, searchParams }: Props) {
    const posts: Post[] = await getCategoryPostsSlice(slug, 0, 10);
    return <CategoriesNoAsync posts={posts} slug={slug} searchParams={searchParams} />;
}

export default Categories;

const CategoriesNoAsync = ({ posts: postsCatFiltred, slug, searchParams }: { posts: Post[]; slug: string; searchParams: { postLang: "en" | "fr" } }) => {
    const locale = useLocale();
    const postLang = searchParams.postLang ? searchParams.postLang : ["fr", "en"].includes(locale) ? (locale as "fr" | "en") : "en";
    const isForcedLang = locale !== postLang;
    const posts = postsCatFiltred.filter((post) => postLang === post.langage || post.langage === "both" || post.langage === undefined);
    const t = useTranslations(`Categories.${slug}`);
    const tBut = useTranslations("Blog.BlogLangButton");
    const messages = {
        title: tBut("title"),
        message: tBut("message"),
        okString: tBut("okString"),
    };
    const headingSpanColor = HEADINGSPANCOLORS[slug as Category];

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            {isForcedLang && <BlogLangButton messages={messages} postLang={postLang} />}
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
                                                <LinkBlog href="/blog" className="blog-categories-item-wrapper w-inline-block" locale={locale as Locale}>
                                                    {t("all")}
                                                </LinkBlog>
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
                                    <PostsListInfiniteScroll postLang={postLang} locale={locale} category={slug} initialPosts={posts} />
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
            <LinkBlog href={`/blog/category/${category}`} className={`blog-categories-item-wrapper ${category === slug ? "current pointer-events-none" : ""} w-inline-block`} locale={locale}>
                {tCat("title")}
            </LinkBlog>
        </div>
    );
};
