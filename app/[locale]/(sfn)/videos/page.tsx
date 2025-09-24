import { Post } from "@/app/types/sfn/blog";
import { useLocale, useTranslations } from "next-intl";
import { PostsListInfiniteScroll } from "@/app/components/sfn/post/PostsListInfiniteScroll";
import { getVideosPostsSlice } from "@/app/serverActions/blogActions";
import { NUMBER_OF_POSTS_TO_FETCH } from "@/app/lib/constantes";
import { intelRich } from "@/app/lib/intelRich";
import { localizePosts } from "@/app/lib/utils";
import { Locale } from "@/i18n";

export default async function Videos({ params: { locale } }: { params: { locale: Locale } }) {
    const postsData: Post[] = await getVideosPostsSlice(0, NUMBER_OF_POSTS_TO_FETCH);
    const posts = localizePosts(postsData, locale);
    return <VideosNoAsync posts={posts} />;
}

const VideosNoAsync = ({ posts }: { posts: Post[] }) => {
    const locale = useLocale();
    const tv = useTranslations("Videos.VideoList");

    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center mb-8">
                            <div className="inner-container _725px center---full-width-mbl">
                                <div className="text-center mg-bottom-40px">
                                    <h1 className="display-1 mg-bottom-8px mb-8">{tv.rich("title", intelRich())}</h1>
                                    <p className="mg-bottom-0">{tv.rich("description", intelRich())}</p>
                                </div>
                            </div>
                            <PostsListInfiniteScroll initialPosts={posts} category="video" locale={locale} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
