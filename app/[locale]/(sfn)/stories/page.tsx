import Marquee from "@/app/components/animations/Marquee";
import StoriesBand from "@/app/components/stories/home/StoriesBand";
import { StoryTabs } from "@/app/components/stories/home/StoryTabs";
import { StoryCard } from "@/app/types/stories/adventure";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import Hero from "@/app/components/stories/home/Hero";
import { WhyStories } from "@/app/components/stories/home/WhyStories";
import { BetaVersion } from "@/app/components/stories/home/BetaVersion";
import { useTranslations } from "next-intl";

const query = groq`
    *[_type=='adventure' && isReady && dateTime(publishedAt) < dateTime(now())] {
        _id,
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
            <StoryTabs stories={stories} />
            <WhyStories />
            <BetaVersion />
        </>
    );
}

export default Stories;
