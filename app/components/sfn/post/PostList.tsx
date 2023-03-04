import { Category, Post } from "@/app/types/sfn/blog";
import Link from "next/link";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import { SlideFromBottom } from "../../animations/Slides";
import SecondaryPost from "../blog/SecondaryPost";

export default function PostsList({ posts, categories }: { posts: Post[]; categories: Category[] }) {
    return (
        <div className="section pd-200px pd-top-184px wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                            <div className="sticky-top _48px-top sticky-tbl">
                                <div className="inner-container _380">
                                    <SlideFromBottom>
                                        <div className="text-center---tablet">
                                            <h2 className="display-2 mg-bottom-40px">
                                                <span className="z-index-1">Latest </span>
                                                <span className="heading-span-secondary-3 v2">Posts</span>
                                            </h2>
                                            <div className="card categories-card">
                                                <Link href="#" className="blog-categories-item-wrapper current w-inline-block pointer-events-none">
                                                    Tous
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
                                    </SlideFromBottom>
                                </div>
                            </div>
                            <div className="grid gap-12">
                                {posts.map((post) => (
                                    <ParentToChildrens key={post.title}>
                                        <SecondaryPost post={post} />
                                    </ParentToChildrens>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
