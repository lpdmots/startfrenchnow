import Image from "next/image";
import urlFor from "../../../lib/urlFor";
import { Post } from "../../types/blog";
import { FiArrowUpRight } from "react-icons/fi";
import ClientSideRoute from "../common/ClientSideRoute";
import PrimaryPost from "./PrimaryPost";
import SecondaryPost from "./SecondaryPost";

type Props = {
    posts: Post[];
};

function BlogList({ posts }: Props) {
    return (
        <div className="section hero v3 wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="inner-container _725px center---full-width-mbl">
                            <div className="text-center mg-bottom-40px">
                                <h2 className="display-1 mg-bottom-8px">
                                    Articles &amp; <span className="heading-span-secondary-1 v2">Resources</span>
                                </h2>
                                <p className="mg-bottom-0">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit ectus mattis nunc aliquam tincidunt est non viverra nec eu, in ridiculus egestas{" "}
                                    <span className="text-no-wrap">vulputate tristique.</span>
                                </p>
                            </div>
                        </div>
                        <div className="grid-2-columns blog-featured-grid">
                            <div className="w-dyn-list">
                                <div role="list" className="height-100 w-dyn-items">
                                    <div role="listitem" className="height-100 w-dyn-item">
                                        {posts.length > 0 && <PrimaryPost post={posts[0]} />}
                                    </div>
                                </div>
                            </div>
                            <div className="collection-list-wrapper w-dyn-list">
                                <div role="list" className="grid-1-column gap-32px w-dyn-items">
                                    <div role="listitem" className="w-dyn-item">
                                        {posts.length > 1 && <SecondaryPost post={posts[1]} />}
                                    </div>
                                    <div role="listitem" className="w-dyn-item">
                                        {posts.length > 2 && <SecondaryPost post={posts[2]} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogList;

{
    /* function BlogList({ posts }: Props) {
    return (
        <div className="container">
            <hr className="border-secondary mb-10"></hr>

            <div className="grid grid-cols-1 md:grid-cols-2 px-10 resp-gap pb-24">
                
                {posts.map((post) => (
                    <ClientSideRoute key={post._id} route={`/blog/post/${post.slug.current}`}>
                        <div className="flex flex-col group cursor-pointer">
                            <div className="relative w-full h-80 drop-shadow-xl group-hover:scale-105 transition-transform duration-200 ease-out">
                                <Image className="object-cover object-left lg:object-center" src={urlFor(post.mainImage).url()} alt={post.author.name} fill />
                                <div className="absolute bottom-0 w-full bg-opacity-20 bg-black backdrop-blur-lg rounded drop-shadow-lg text-white p-5 flex justify-between">
                                    <div>
                                        <p className="font-bold">{post.title}</p>

                                        <p>{new Date(post._createdAt).toLocaleDateString("fr", { day: "numeric", month: "long", year: "numeric" })}</p>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-y-2 md:gap-x-2 items-center justify-center">
                                        {post.categories.map((category) => {
                                            return (
                                                <div key={category._id} className="bg-secondary text-center text-on-secondary px-3 py-1 rounded-full text-sm font-semibold">
                                                    <p>{category.title}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex-1">
                                <p className="underline text-lg font-bold">{post.title}</p>
                                <p className="line-clamp-2 text-gray-500">{post.description}</p>
                            </div>

                            <p className="mt-5 font-bold flex items-center group-hover:underline">
                                Read Post
                                <FiArrowUpRight className="ml-2 h-4 w-4" />
                            </p>
                        </div>
                    </ClientSideRoute>
                ))}
            </div>
        </div>
    );
}

export default BlogList; */
}
