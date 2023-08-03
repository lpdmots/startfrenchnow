import { Post } from "../../../types/sfn/blog";
import Image from "next/image";
import ClientSideRoute from "../../common/ClientSideRoute";
import urlFor from "@/app/lib/urlFor";

const PrimaryPost = ({ post }: { post: Post }) => {
    const level = post.level ? LEVELDATA[post.level] : null;

    return (
        <ClientSideRoute route={`/blog/post/${post.slug.current}`}>
            <div className="blog-card-wrapper card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card max-heigth-330px">
                    <ScaleChildren>
                        <Image src={urlFor(post.mainImage).url()} width={400} height={400} loading="lazy" alt={post.title} className="blog-card-image" />
                    </ScaleChildren>
                    <div className="blog-card-badge-wrapper-top text-right">
                        {post.categories.map((category) => (
                            <div key={category.title} className="badge-primary small">
                                {category.title}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="blog-card-content-inside">
                    <div className="inner-container _350px---mbl">
                        <h2 className="blog-card-title display-4 mg-bottom-24px">{post.title}</h2>
                    </div>
                    <div className="mg-top-auto">
                        <div className="flex-col gap-24px _15px---mbp">
                            <p className="line-clamp-4">{post.description}</p>
                            <div className="flex justify-end items-center text-300 medium color-neutral-600">
                                {level ? (
                                    <>
                                        <AiFillSignal className=" mr-2" style={{ fontSize: "1.5rem", color: level?.color }} />
                                        {`${level.label} - `}
                                    </>
                                ) : (
                                    ""
                                )}
                                {new Date(post.publishedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientSideRoute>
    );
};

import React from "react";
import { AiFillSignal } from "react-icons/ai";
import { LEVELDATA } from "@/app/lib/constantes";
import { ScaleChildren } from "../../animations/ParentToChildrens";

export default PrimaryPost;
