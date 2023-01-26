import { groq } from "next-sanity";
import Image from "next/image";
import { client } from "../../../../../lib/sanity.client";
import urlFor from "../../../../../lib/urlFor";
import { Post } from "../../../../types/blog";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../../../../components/sanity/RichTextComponents";
import Link from "next/link";
import NewsletterCard from "../../../../components/common/NewsletterCard";
import PrimaryPost from "../../../../components/blog/PrimaryPost";

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
    *[_type=='post'] 
    {
        ...,
        categories[]->,
    } | order(title asc) [0...3]
`;

    const postData: Promise<Post> = client.fetch(query, { slug });
    const rowLatestPostsData: Promise<Post[]> = client.fetch(queryLatest);
    const [post, rowLatestPosts] = await Promise.all([postData, rowLatestPostsData]);

    const latestPosts = rowLatestPosts.filter((post) => post.slug.current !== slug);

    if (!post) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    return (
        <div className="page-wrapper">
            <section className="section hero v4 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---mbl center">
                        <div className="flex-horizontal mg-bottom-32px">
                            <Link href={`/blog/category/${post.categories[0].slug.current}`} className="badge-primary small btn-primary w-button">
                                {post.categories[0].title}
                            </Link>
                        </div>
                        <div className="text-center">
                            <div className="inner-container _1015px center">
                                <h1 className="display-1 mg-bottom-12px">{post.title}</h1>
                            </div>
                            <div className="inner-container _800px center">
                                <div className="inner-container _700px---tablet center">
                                    <div className="inner-container _500px---mbl center">
                                        <p className="mg-bottom-48px">{post.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cms-featured-image-wrapper max-w-[800px] image-wrapper border-radius-30px mx-auto">
                        <Image src={urlFor(post.mainImage).url()} height={800} width={800} loading="eager" alt={post.title} className="image object-contain rounded-lg" />
                    </div>
                </div>
            </section>
            <section className="section pd-bottom-220px pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="grid-2-columns post-rigth-sidebar _1-col-tablet">
                            <div className="inner-container _758px">
                                <div className="mg-bottom-48px">
                                    <PortableText value={post.body} components={RichTextComponents} />
                                </div>
                            </div>
                            <div id="w-node-_2efa5bda-72aa-9528-9385-590a86804244-6f543d60" className="sticky-top _48px-top">
                                <NewsletterCard />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
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
                                        Browse all posts<span className="line-rounded-icon link-icon-right"></span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="w-dyn-list">
                            <div role="list" className="grid-2-columns blog-post-section---grid w-dyn-items">
                                {latestPosts.slice(0, 2).map((post) => (
                                    <PrimaryPost key={post.title} post={post} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Post;
