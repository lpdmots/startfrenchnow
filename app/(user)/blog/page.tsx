import { previewData } from "next/headers";
import { groq } from "next-sanity";
import { client } from "../../../lib/sanity.client";
import PreviewSuspense from "../../components/sanity/PreviewSuspense";
import PreviewBlogListe from "../../components/sanity/PreviewBlogList";
import BlogList from "../../components/blog/BlogList";
import { Category, Post } from "../../types/blog";
import NewsletterBand from "../../components/common/NewsletterBand";
import SecondaryPost from "../../components/blog/SecondaryPost";
import Link from "next/link";

const query = groq`
    *[_type=='post'] {
        ...,
        categories[]->
    } | order(_createdAt desc)
`;

const queryCategories = groq`
    *[_type=='category'] {title, slug, description} | order(title asc)
`;

export const revalidate = 60;

export async function generateStaticParams() {
    const query = groq`*[_type=='post']
    {
        slug
    }`;

    const slugs: Post[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
}

export default async function Blog() {
    const postsData: Promise<Post[]> = client.fetch(query);
    const categoriesData: Promise<Category[]> = client.fetch(queryCategories);

    const [posts, categories] = await Promise.all([postsData, categoriesData]);

    const blogList = previewData() ? (
        <PreviewSuspense
            fallback={
                <div role="status">
                    <p className="animate-pulse text-primary">Chargement de l'apperçu</p>
                </div>
            }
        >
            <PreviewBlogListe query={query} />
        </PreviewSuspense>
    ) : (
        <BlogList posts={posts} />
    );

    return (
        <div className="page-wrapper">
            {blogList}
            <NewsletterBand />
            <PostsList posts={posts} categories={categories} />
        </div>
    );
}

const PostsList = ({ posts, categories }: { posts: Post[]; categories: Category[] }) => {
    return (
        <div className="section pd-200px pd-top-184px wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                            <div className="sticky-top _48px-top sticky-tbl">
                                <div className="inner-container _380">
                                    <div className="text-center---tablet">
                                        <h2 className="display-2 mg-bottom-40px">
                                            <span className="z-index-1">Latest </span>
                                            <span className="heading-span-secondary-3 v2">Posts</span>
                                        </h2>
                                        <div className="card categories-card">
                                            <Link href="#" className="blog-categories-item-wrapper current w-inline-block pointer-events-none">
                                                All
                                            </Link>
                                            <div className="w-dyn-list">
                                                <div role="list" className="collection-list categories w-dyn-items">
                                                    {categories.map((category) => (
                                                        <div role="listitem" key={category.title} className="w-dyn-item">
                                                            <Link href={`/blog/category/${category.slug.current}`} className="blog-categories-item-wrapper w-inline-block">
                                                                {category.title}
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-12">
                                {posts.map((post) => (
                                    <SecondaryPost key={post.title} post={post} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
