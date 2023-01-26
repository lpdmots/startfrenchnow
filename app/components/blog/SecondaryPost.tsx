import { Post } from "../../types/blog";
import Image from "next/image";
import ClientSideRoute from "../common/ClientSideRoute";
import urlFor from "../../../lib/urlFor";

const SecondaryPost = ({ post }: { post: Post }) => {
    return (
        <ClientSideRoute route={`/blog/post/${post.slug.current}`}>
            <div className="card blog-secondary-card link-card w-inline-block">
                <div className="blog-card-image-wrapper inside-card blog-secondary-card-image ">
                    <Image src={urlFor(post.mainImage).url()} width={200} height={200} loading="eager" alt={post.title} className="blog-card-image max-h-[200px] object-contain" />
                    <div className="blog-card-badge-wrapper-top text-right">
                        {post.categories.map((category) => (
                            <div key={category.title} className="badge-primary small mb-2 ml-2">
                                {category.title}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="inner-container blog-secondary-card-content">
                    <h3 className="mg-bottom-16px">{post.title}</h3>
                    <p className="mg-bottom-0 line-clamp-5">{post.description}</p>
                </div>
            </div>
        </ClientSideRoute>
    );
};

export default SecondaryPost;
