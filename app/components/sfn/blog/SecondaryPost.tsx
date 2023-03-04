import { Post } from "../../../types/sfn/blog";
import Image from "next/image";
import ClientSideRoute from "../../common/ClientSideRoute";
import urlFor from "../../../../lib/urlFor";
import { AiFillSignal } from "react-icons/ai";
import { LEVELDATA } from "@/lib/constantes";
import { ScaleChildren } from "../../animations/ParentToChildrens";

const SecondaryPost = ({ post }: { post: Post }) => {
    const level = post.level ? LEVELDATA[post.level] : LEVELDATA["a1"];

    return (
        <ClientSideRoute route={`/blog/post/${post.slug.current}`}>
            <div className="card blog-secondary-card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card blog-secondary-card-image ">
                    <ScaleChildren>
                        <Image
                            src={urlFor(post.mainImage).url()}
                            width={200}
                            height={200}
                            loading="lazy"
                            alt={post.title}
                            className="blog-card-image object-contain rounded-2xl sm:rounded-3xl"
                            style={{ width: "auto", height: "auto", maxHeight: "200px" }}
                        />
                    </ScaleChildren>
                    <div className="blog-card-badge-wrapper-top text-right">
                        {post.categories.map((category) => (
                            <div key={category.title} className="badge-primary small mb-2 ml-2">
                                {category.title}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="inner-container blog-secondary-card-content flex flex-col justify-between" style={{ minHeight: 200 }}>
                    <div>
                        <h2 className="mg-bottom-16px display-4">{post.title}</h2>
                        <p className="mg-bottom-0 line-clamp-5">{post.description}</p>
                    </div>
                    <div className="flex justify-end items-center text-300 medium color-neutral-600 mt-4" style={{ fontSize: 16 }}>
                        <AiFillSignal className=" mr-2" style={{ fontSize: "1.2rem", color: level.color }} />
                        {level.label} - {new Date(post.publishedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                </div>
            </div>
        </ClientSideRoute>
    );
};

export default SecondaryPost;
