import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Post } from "@/app/types/sfn/blog";
import { Locale } from "@/i18n";
import BlogLangFixedButton from "@/app/components/sfn/blog/BlogLangFixedButton";
import { localizePosts } from "@/app/lib/utils";
import { findAdjacentFromTOC } from "@/app/lib/tocNavigation";
import { FidePackSommaire, getPackSommaire } from "@/app/serverActions/productActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { Permission } from "@/app/types/sfn/auth";
import { redirect } from "next/navigation";
import FidePostContent from "@/app/[locale]/(sfn)/fide/videos/(lessons)/[slug]/components/FidePostContent";
import CommentComposer from "@/app/components/comments/CommentComposer";
import CommentList from "@/app/components/comments/CommentList";

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
        }
    `;

async function BeginnersVideosPage({ params }: { params: { locale: Locale; slug: string } }) {
    const { locale, slug } = params;

    // 0) Session → déterminer l’accès Pack FIDE
    const session = await getServerSession(authOptions);
    const hasPermission = !!session?.user?.permissions?.some((p: Permission) => p.referenceKey === "udemy_course_beginner");

    // 1) Post courant (inchangé)
    const post: Post = await client.fetch(query, { slug });
    if (!post) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    // 2) Si pas d’accès et pas en preview → redirection
    const isPreview = !!post.isPreview;
    if (!isPreview) {
        const session = await getServerSession(authOptions);
        const now = Date.now();

        const hasPermission = !!session?.user?.permissions?.some((p) => p.referenceKey === "udemy_course_beginner" && (!p.expiresAt || new Date(p.expiresAt).getTime() > now));

        if (!hasPermission) {
            redirect("/courses/beginners");
        }
    }

    // 3) TOC pour navigation adjacente
    const fidePackSommaire = await getPackSommaire(locale, "udemy_course_beginner");

    // 4) Adjacent avec filtrage preview si pas d’accès
    const { previous, next } = findAdjacentFromTOC(fidePackSommaire, slug, hasPermission);

    const localizedPost = localizePosts([post], locale)[0];

    return <BeginnersVideosPageNoAsync post={localizedPost} previous={previous} next={next} hasPack={hasPermission} fidePackSommaire={fidePackSommaire} locale={locale} />;
}

export default BeginnersVideosPage;

interface PropsNoAsync {
    post: Post;
    previous: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
    hasPack: boolean;
    fidePackSommaire: FidePackSommaire;
    locale: Locale;
}

const BeginnersVideosPageNoAsync = ({ post, previous, next, hasPack, fidePackSommaire, locale }: PropsNoAsync) => {
    const previousUrl = previous ? `/courses/beginners/${previous.slug}` : null;
    const nextUrl = next ? `/courses/beginners/${next.slug}` : null;

    return (
        <div className="mb-24 flex w-full flex-col gap-8 md:gap-12">
            <FidePostContent
                post={post}
                previous={previousUrl}
                next={nextUrl}
                hasPack={hasPack}
                fidePackSommaire={fidePackSommaire}
                linkPrefix="/courses/beginners/"
                progressType="udemy_course_beginner"
            />
            <CommentComposer resourceType="udemy_course_beginner" resourceId={post._id} />
            <CommentList resourceType="udemy_course_beginner" resourceId={post._id} locale={locale} />
            <BlogLangFixedButton />
        </div>
    );
};
