import { Post } from "@/app/types/blog";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";

export default async function Head({ params }: { params: { slug: string } }) {
    const query = groq`
        *[_type=='post' && slug.current == $slug][0] 
        {
            ...,
            categories[]->,
        }
    `;

    const getTitleTag = (post: Post) => {
        const title = post.title;
        if (title.length > 50) return title;
        return "My Blog: " + title;
    };

    const getDescriptionMeta = (post: Post) => {
        const description = post.description;
        if (description.length >= 100) return description;
        return description + " - " + post.categories[0].title + ": " + post.categories[0].description;
    };

    const post = await client.fetch(query, { slug: params.slug });

    const title = getTitleTag(post);
    const description = getDescriptionMeta(post);

    return (
        <>
            <title>{title}</title>
            <meta content="width=device-width, initial-scale=1" name="viewport" />
            <meta name="description" content={description} />
            <link rel="icon" href="/favicon.ico" />
        </>
    );
}
