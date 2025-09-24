import { client } from "@/app/lib/sanity.client";
import { getDataInRightLang } from "@/app/lib/utils";
import { Post } from "@/app/types/sfn/blog";
import { Locale } from "@/i18n";
import { groq } from "next-sanity";

const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            title,
            title_en,
            metaDescription,
            metaDescription_en
        }
    `;

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: Locale; slug: string } }) {
    const post: Post = await client.fetch(query, { slug });
    const title = getDataInRightLang(post, locale, "title");
    const metaDescription = getDataInRightLang(post, locale, "metaDescription");

    return {
        title,
        description: metaDescription,
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
