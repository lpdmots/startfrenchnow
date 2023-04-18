import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Post } from "../../../../../types/sfn/blog";
import Link from "next/link";
import PrimaryPost from "../../../../../components/sfn/blog/PrimaryPost";
import { AiOutlineArrowRight } from "react-icons/ai";
import PostContent from "@/app/components/sfn/post/PostContent";
import PreviewSuspense from "../../../../../components/sanity/PreviewSuspense";
import PreviewPost from "../../../../../components/sanity/PreviewPost";
import { previewData } from "next/headers";
import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";

type Props = {
    params: {
        slug: string;
    };
};

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

async function Post({ params: { slug } }: Props) {
    const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
            author->,
            categories[]->,
        }
    `;
    const queryLatest = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now())] 
    {
        ...,
        categories[]->,
    } | order(title asc) [0...3]
`;

    const postData: Promise<Post> = client.fetch(query, { slug });
    const rowLatestPostsData: Promise<Post[]> = client.fetch(queryLatest);
    const [post, rowLatestPosts] = await Promise.all([postData, rowLatestPostsData]);

    const latestPosts = rowLatestPosts.filter((post) => post.slug.current !== slug);

    const postContent = previewData() ? (
        <PreviewSuspense
            fallback={
                <div role="status">
                    <p className="animate-pulse text-primary">Chargement de l'apperçu</p>
                </div>
            }
        >
            <PreviewPost query={query} slug={slug} />
        </PreviewSuspense>
    ) : (
        <PostContent post={post} />
    );

    if (!post && !previewData()) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    return (
        <>
            {postContent}
            <div className="page-wrapper">
                <div className="section pd-top-0 wf-section">
                    <div className="container-default w-container">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-40px">
                                <div className="text-center---mbl">
                                    <div className="w-layout-grid grid-2-columns title-and-buttons">
                                        <h2 className="display-2 mg-bottom-0">
                                            Latest <span className="heading-span-secondary-4">posts</span>
                                        </h2>
                                        <Link href="/blog" className="btn-secondary w-button">
                                            <span className="flex items-center">
                                                Browse all posts
                                                <AiOutlineArrowRight className="ml-2" />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="w-dyn-list">
                                <div role="list" className="grid-2-columns blog-post-section---grid w-dyn-items">
                                    {latestPosts.slice(0, 2).map((post) => (
                                        <ParentToChildrens key={post.title}>
                                            <PrimaryPost post={post} />
                                        </ParentToChildrens>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Post;
