import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Post } from "@/app/types/sfn/blog";
import { Locale, normalizeLocale } from "@/i18n";
import BlogLangFixedButton from "@/app/components/sfn/blog/BlogLangFixedButton";
import { localizePosts } from "@/app/lib/utils";
import FidePostContent from "./components/FidePostContent";
import { findAdjacentFromTOC } from "@/app/lib/tocNavigation";
import { FidePackSommaire, getFidePackSommaire } from "@/app/serverActions/productActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { Permission } from "@/app/types/sfn/auth";
import { redirect } from "next/navigation";
import CommentComposer from "@/app/components/comments/CommentComposer";
import CommentList from "@/app/components/comments/CommentList";

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
        }
    `;

async function CoursFidePage(props: { params: Promise<{ locale: string; slug: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    const { slug } = params;

    // 0) Session → déterminer l’accès Pack FIDE
    const session = await getServerSession(authOptions);
    const now = Date.now();
    const hasPack = !!session?.user?.permissions?.some((p: Permission) => p.referenceKey === "pack_fide" && (!p.expiresAt || new Date(p.expiresAt).getTime() > now));

    // 1) Post courant (inchangé)
    const post: Post = await client.fetch(query, { slug });
    if (!post) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    // 2) Si pas d’accès et pas en preview → redirection
    const isPreview = !!post.isPreview;
    if (!isPreview) {
        if (!hasPack) {
            redirect("/fide/videos");
        }
    }

    // 3) TOC pour navigation adjacente
    const fidePackSommaire = await getFidePackSommaire(locale);

    // 4) Adjacent avec filtrage preview si pas d’accès
    const { previous, next } = findAdjacentFromTOC(fidePackSommaire, slug, hasPack);

    const localizedPost = localizePosts([post], locale)[0];

    return <CoursFidePageNoAsync post={localizedPost} previous={previous} next={next} hasPack={hasPack} fidePackSommaire={fidePackSommaire} locale={locale} />;
}

export default CoursFidePage;

interface PropsNoAsync {
    post: Post;
    previous: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
    hasPack: boolean;
    fidePackSommaire: FidePackSommaire;
    locale: "fr" | "en";
}

const CoursFidePageNoAsync = ({ post, previous, next, hasPack, fidePackSommaire, locale }: PropsNoAsync) => {
    const previousUrl = previous ? `/fide/videos/${previous.slug}` : null;
    const nextUrl = next ? `/fide/videos/${next.slug}` : null;

    return (
        <div className="mb-24 flex w-full flex-col gap-8 md:gap-12">
            <FidePostContent post={post} previous={previousUrl} next={nextUrl} hasPack={hasPack} fidePackSommaire={fidePackSommaire} />
            <CommentComposer resourceType="pack_fide" resourceId={post._id} />
            <CommentList resourceType="pack_fide" resourceId={post._id} locale={locale} />
            <BlogLangFixedButton />
        </div>
    );
};
