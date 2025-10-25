import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Post } from "@/app/types/sfn/blog";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";
import BlogLangFixedButton from "@/app/components/sfn/blog/BlogLangFixedButton";
import { localizePosts } from "@/app/lib/utils";
import Link from "next-intl/link";
import FidePostContent from "./components/FidePostContent";
import { findAdjacentFromTOC } from "@/app/lib/tocNavigation";
import { FidePackSommaire, getFidePackSommaire } from "@/app/serverActions/productActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { Permission } from "@/app/types/sfn/auth";
import { redirect } from "next/navigation";
import CommentComposer from "@/app/components/comments/CommentComposer";

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
        }
    `;
const queryLatest = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true] 
    {
        ...,
    } | order(publishedAt desc) [0...3]
`;

async function CoursFidePage({ params }: { params: { locale: Locale; slug: string } }) {
    const { locale, slug } = params;

    // 0) Session → déterminer l’accès Pack FIDE
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p: Permission) => p.referenceKey === "pack_fide");

    // 1) Post courant (inchangé)
    const post: Post = await client.fetch(query, { slug });
    if (!post) return <p className="h-64 flex justify-center items-center">Sorry this post has been deleted...</p>;

    // 2) Si pas d’accès et pas en preview → redirection
    const isPreview = !!post.isPreview;
    if (!isPreview) {
        const session = await getServerSession(authOptions);
        const now = Date.now();

        const hasPack = !!session?.user?.permissions?.some(
            (p) => p.referenceKey === "pack_fide" && (!p.expiresAt || new Date(p.expiresAt).getTime() > now) // enlève cette ligne si tu ne gères pas l’expiration
        );

        if (!hasPack) {
            redirect("/fide/pack-fide#plans");
        }
    }

    // 3) TOC pour navigation adjacente
    const fidePackSommaire = await getFidePackSommaire(locale);

    // 4) Adjacent avec filtrage preview si pas d’accès
    const { previous, next } = findAdjacentFromTOC(fidePackSommaire, slug, hasPack);

    const localizedPost = localizePosts([post], locale)[0];

    return <CoursFidePageNoAsync post={localizedPost} previous={previous} next={next} hasPack={hasPack} fidePackSommaire={fidePackSommaire} />;
}

export default CoursFidePage;

interface PropsNoAsync {
    post: Post;
    previous: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
    hasPack: boolean;
    fidePackSommaire: FidePackSommaire;
}

const CoursFidePageNoAsync = ({ post, previous, next, hasPack, fidePackSommaire }: PropsNoAsync) => {
    const previousUrl = previous ? `/fide/videos/${previous.slug}` : null;
    const nextUrl = next ? `/fide/videos/${next.slug}` : null;

    return (
        <div className="mb-24">
            <FidePostContent post={post} previous={previousUrl} next={nextUrl} hasPack={hasPack} fidePackSommaire={fidePackSommaire} />
            <CommentComposer resourceType="post" resourceId={post._id} />
            <BlogLangFixedButton />
        </div>
    );
};
