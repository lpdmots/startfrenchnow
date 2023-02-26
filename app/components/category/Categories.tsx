import { Category, Post } from "../../types/blog";
import SecondaryPost from "../../components/blog/SecondaryPost";
import Link from "next/link";
import { ParentToChildrens } from "../animations/ParentToChildrens";

function Categories({ allPosts, slug, categories }: { allPosts: Post[]; slug: string; categories: Category[] }) {
    const posts = allPosts.filter((post) => post.categories.filter((category: Category) => category.slug.current === slug).length);
    const category = categories.find((cat) => cat.slug.current === slug);
    return (
        <div className="page-wrapper">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-60px">
                                <div className="text-center---tablet">
                                    <div className="w-layout-grid grid-2-columns title-and-paragraph v2">
                                        <div className="flex-horizontal start flex-wrap center---tablet">
                                            <div className="heading-span-secondary-4">
                                                <h1 className="display-1 color-neutral-100 mg-bottom-0">{category?.title}</h1>
                                            </div>
                                            <div className="display-1"> </div>
                                            <h2 className="display-1 mg-bottom-0">posts</h2>
                                        </div>
                                        <div className="inner-container _560px">
                                            <p className="mg-bottom-0">{category?.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                                <div className="sticky-top _48px-top sticky-tbl">
                                    <div className="inner-container _380">
                                        <div className="text-center---tablet">
                                            <div className="card categories-card">
                                                <Link href="/blog" className="blog-categories-item-wrapper w-inline-block">
                                                    Tous
                                                </Link>
                                                <div className="w-dyn-list">
                                                    <div role="list" className="collection-list categories w-dyn-items">
                                                        {categories.map((category) => (
                                                            <div role="listitem" key={category.title} className="w-dyn-item">
                                                                <Link
                                                                    href={`/blog/category/${category.slug.current}`}
                                                                    className={`blog-categories-item-wrapper ${category.slug.current === slug ? "current pointer-events-none" : ""} w-inline-block`}
                                                                >
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
        </div>
    );
}

export default Categories;
