import Marquee from "@/app/components/animations/Marquee";
import Hero from "@/app/components/stories/Home/Hero";
import StoriesBand from "@/app/components/stories/Home/StoriesBand";
import { StoryCards } from "@/app/components/stories/Home/StoryCards";
import { StoryCard } from "@/app/types/stories/adventure";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";

const query = groq`
    *[_type=='adventure' && isReady && dateTime(publishedAt) < dateTime(now())] {
        name,
        slug,
        level,
        category,
        duration,
        description,
        images,
        publishedAt
    } | order(publishedAt desc)
`;

async function Stories() {
    const stories: StoryCard[] = await client.fetch(query);

    return (
        <>
            <Hero />
            <Marquee content={<StoriesBand />} />
            <StoryCards stories={stories} />
        </>
    );
}

export default Stories;
