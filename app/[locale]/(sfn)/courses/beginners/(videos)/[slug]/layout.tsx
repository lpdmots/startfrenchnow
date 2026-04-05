import type { Metadata } from "next";
import { client } from "@/app/lib/sanity.client";
import { getDataInRightLang } from "@/app/lib/utils";
import { Post } from "@/app/types/sfn/blog";
import { Locale, normalizeLocale } from "@/i18n";
import { groq } from "next-sanity";

const query = groq`
  *[_type=='post' && slug.current == $slug][0]{
    title,
    title_en,
    metaDescription,
    metaDescription_en
  }
`;

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    const { slug } = params;

    const post: Post = await client.fetch(query, { slug });
    const title = getDataInRightLang(post, locale, "title");
    const metaDescription = getDataInRightLang(post, locale, "metaDescription");

    const path = `/courses/beginners/${slug}`;
    const canonical = locale === "fr" ? `/fr${path}` : path;

    return {
        title,
        description: metaDescription,
        alternates: {
            canonical,
            languages: {
                en: path,
                fr: `/fr${path}`,
                "x-default": path,
            },
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
