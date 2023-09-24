import { client } from "@/app/lib/sanity.client";
import { getDataInRightLang } from "@/app/lib/utils";
import { Post } from "@/app/types/sfn/blog";
import { Locale } from "@/i18n";
import { groq } from "next-sanity";

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
            author->,
            categories[]->,
        }
    `;

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: Locale; slug: string } }) {
    const post: Post = await client.fetch(query, { slug });
    const postLang = ["fr", "en"].includes(locale) ? (locale as "fr" | "en") : "en";
    const title = getDataInRightLang(post, postLang, "title");
    const description = getDataInRightLang(post, postLang, "metaDescription");

    return {
        title,
        description,
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
