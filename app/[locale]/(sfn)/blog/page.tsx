import { Post } from "@/app/types/sfn/blog";
import PostsList from "@/app/components/sfn/post/PostList";
import { getPostsSlice } from "@/app/serverActions/blogActions";
import { NUMBER_OF_POSTS_TO_FETCH } from "@/app/lib/constantes";
import { localizePosts } from "@/app/lib/utils";
import { Locale } from "@/i18n";

export const revalidate = 60;

export default async function Blog({ params }: { params: { locale: string } }) {
    const locale = params.locale as Locale;
    const postsData: Post[] = await getPostsSlice(0, NUMBER_OF_POSTS_TO_FETCH);
    const posts = localizePosts(postsData, locale);
    return <BlogNoAsync posts={posts} />;
}

const BlogNoAsync = ({ posts }: { posts: Post[] }) => {
    return (
        <div className="page-wrapper mt-8 sm:mt-12">
            <PostsList initialPosts={posts} />
        </div>
    );
};
