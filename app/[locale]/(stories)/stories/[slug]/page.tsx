import React from "react";
import { NavBarStory } from "@/app/components/stories/story/NavBarStory";
import { LayoutsCarousel } from "@/app/components/stories/story/LayoutsCarousel";
import { client } from "@/app/lib/sanity.client";
import { groqQueries } from "@/app/lib/groqQueries";

type Props = {
    params: {
        slug: string;
    };
};

const Story = async ({ params: { slug } }: Props) => {
    const story = await client.fetch(groqQueries["adventure"], { slug });
    return (
        <div className="flex justify-center">
            <div className="container-default h-screen flex flex-col w-screen item-center ">
                <NavBarStory story={story} />
                <LayoutsCarousel />
            </div>
        </div>
    );
};

export default Story;
