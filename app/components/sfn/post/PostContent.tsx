import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Post } from "../../../types/sfn/blog";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../../sanity/RichTextComponents";
import Link from "next/link";
import NewsletterCard from "../../common/NewsletterCard";
import { LEVELDATA } from "@/app/lib/constantes";
import Helper from "./Helper";
import VideoBlog from "../../sanity/VideoBlog";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

function PostContent({ post }: { post: Post }) {
    const level = post.level ? LEVELDATA[post.level] : LEVELDATA["a1"];

    return (
        <>
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
                    {post.mainVideo ? (
                        <div className=" mt-12">
                            <VideoBlog values={{ url: post.mainVideo.url, title: post.mainVideo.title }} />
                            <Helper post={post} level={level} />
                        </div>
                    ) : post.mainImage ? (
                        <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto" style={{ maxWidth: "800px" }}>
                            <Image src={urlFor(post.mainImage).url()} height={800} width={800} loading="eager" alt={post.title} className="image object-contain rounded-lg" />
                            <Helper post={post} level={level} />
                        </div>
                    ) : (
                        <Helper post={post} level={level} />
                    )}
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
        </>
    );
}

export default PostContent;
