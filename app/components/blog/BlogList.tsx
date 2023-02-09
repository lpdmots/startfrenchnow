import { Post } from "../../types/blog";
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
                                    In this section you will find articles and resources to help you <span className="text-no-wrap">learn French.</span>
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
