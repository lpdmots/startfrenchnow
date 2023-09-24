import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import { Post } from "../../../types/sfn/blog";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import { Scale } from "../../animations/Scale";
import PrimaryPost from "./PrimaryPost";
import SecondaryPost from "./SecondaryPost";

type Props = {
    posts: Post[];
    postLang: "en" | "fr";
};

function BlogList({ posts, postLang }: Props) {
    const t = useTranslations("Blog.BlogList");
    return (
        <div className="section hero v3 wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        {/* <SlideFromBottom> */}
                        <div className="inner-container _725px center---full-width-mbl">
                            <div className="text-center mg-bottom-40px">
                                <h1 className="display-1 mg-bottom-8px mb-8">{t.rich("articlesAndResources", intelRich())}</h1>
                                <p className="mg-bottom-0">{t.rich("description", intelRich())}</p>
                            </div>
                        </div>
                        {/* </SlideFromBottom> */}
                        <h2 className="hidden">{t("newestPosts")}</h2>
                        <Scale>
                            <div className="grid-2-columns blog-featured-grid">
                                <div className="w-dyn-list">
                                    <div role="list" className="height-100 w-dyn-items">
                                        <div role="listitem" className="height-100 w-dyn-item">
                                            {posts.length > 0 && (
                                                <ParentToChildrens>
                                                    <PrimaryPost post={posts[0]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="collection-list-wrapper w-dyn-list">
                                    <div role="list" className="grid-1-column gap-32px w-dyn-items">
                                        <div role="listitem" className="w-dyn-item">
                                            {posts.length > 1 && (
                                                <ParentToChildrens>
                                                    <SecondaryPost post={posts[1]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                        <div role="listitem" className="w-dyn-item">
                                            {posts.length > 2 && (
                                                <ParentToChildrens>
                                                    <SecondaryPost post={posts[2]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Scale>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogList;
