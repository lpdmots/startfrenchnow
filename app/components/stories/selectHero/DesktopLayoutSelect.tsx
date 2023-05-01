import { Adventure } from "@/app/types/stories/adventure";
import urlFor from "@/app/lib/urlFor";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { Carousel } from "../../animations/Carousel";
import { HeroCard } from "./HeroCard";
import { StartStoryButton } from "./StartStoryButton";
import { ElementProps } from "@/app/types/stories/element";
import { RichTextStory } from "../../sanity/RichTextStory";

export const DesktopLayoutSelect = ({ story, element }: { story: Adventure; element: ElementProps }) => {
    const portableText = useMemo(() => story?.selectContent && <PortableText value={story.selectContent} components={RichTextStory()} />, [story?.selectContent]);
    const carouselData = useMemo(
        () =>
            story.heros?.map((hero) => {
                const skills = hero.variables?.filter((variable) => variable.nature === "skill");
                return <HeroCard key={hero.name} hero={hero} skills={skills} />;
            }),
        [story]
    );

    return (
        <>
            <div className="grow grid grid-cols-2 gap-6 lg:gap-12 pb-6">
                <div className="flex items-center justify-center">
                    <div className="flex flex-col gap-6">
                        <div className=" flex items-center justify-center text-center bl">{portableText}</div>
                        <Image
                            src={urlFor(story.images.primary).url()}
                            width={610}
                            height={400}
                            alt={`Illustration de l'aventure ${story.name}`}
                            className="rounded-xl shadow-1 simple-border"
                            style={{ objectFit: "cover", maxHeight: "400px" }}
                            priority
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-around">{story.heros?.length && <Carousel data={carouselData} />}</div>
            </div>
            <div className="flex items-center justify-center text-center mb-6 lg:mb-12 gap-6">
                <Link href="/stories" className="btn-secondary">
                    Annuler
                </Link>
                <StartStoryButton story={story} element={element} />
            </div>
        </>
    );
};
