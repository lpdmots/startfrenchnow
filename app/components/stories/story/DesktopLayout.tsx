import { PortableText } from "@portabletext/react";
import Image from "next/image";
import React from "react";
import { LayoutProps } from "@/app/types/stories/state";
import { AiOutlineArrowRight } from "react-icons/ai";
import { ChoiceButtons } from "./ChoiceButtons";
import { Tabs } from "./Tabs";
import { useStoryStore } from "@/app/stores/storiesStore";
import { RichTextStory } from "../../sanity/RichTextStory";

export const DesktopLayout = ({ data }: { data: LayoutProps }) => {
    const { slideIndex, setNewStates, layouts } = useStoryStore();
    const oneColumn = (!data.image || !data.text) && !data.interactionChoices && !data.accessChoices;
    const hasChoices = !!data.interactionChoices || !!data.accessChoices;

    const handleNextLayout = () => {
        setNewStates({ slideIndex: Math.min(slideIndex + 1, layouts.length - 1) });
    };

    if (oneColumn)
        return (
            <div className="flex flex-col items-center justify-center gap-6">
                {data.text && (
                    <div className=" flex grow items-center justify-center text-center bl">
                        <PortableText value={data.text} components={RichTextStory()} />
                    </div>
                )}
                {data.image && (
                    <Image
                        src={data.image}
                        width={1000}
                        height={800}
                        alt={data.title || "image"}
                        className="rounded-xl shadow-1 simple-border"
                        style={{ objectFit: "contain", maxHeight: "67vh", width: "auto" }}
                        priority={slideIndex ? false : true}
                    />
                )}
                <div className="flex items-center justify-between gap-6">
                    <h2 className="display-3 mb-0">{data.title}</h2>
                    <button className="roundButton" onClick={handleNextLayout}>
                        <AiOutlineArrowRight className="text-4xl" />
                    </button>
                </div>
            </div>
        );

    return (
        <>
            <div className="grow grid grid-cols-2 gap-6 lg:gap-12">
                <div className="flex flex-col items-center justify-center gap-6">
                    {data.text && (
                        <div className=" flex items-center justify-center text-center bl">
                            <PortableText value={data.text} components={RichTextStory()} />
                        </div>
                    )}
                    {hasChoices ? (
                        <ChoiceButtons data={data} />
                    ) : (
                        <div className="flex items-center justify-center">
                            <button className="roundButton" onClick={handleNextLayout}>
                                <AiOutlineArrowRight className="text-4xl" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-around">
                    <Tabs data={data} />
                </div>
            </div>
        </>
    );
};
