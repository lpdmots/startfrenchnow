import { PortableText } from "@portabletext/react";
import Image from "next/image";
import React, { useMemo } from "react";
import { LayoutProps } from "@/app/types/stories/state";
import { AiOutlineArrowRight } from "react-icons/ai";
import { ChoiceButtons } from "./ChoiceButtons";
import { Tabs } from "./Tabs";
import { useStoryStore } from "@/app/stores/storiesStore";
import { RichTextStory } from "../../sanity/RichTextStory";
import { Popover } from "@/app/components/animations/Popover";
import { ImInfo } from "react-icons/im";

export const DesktopLayout = ({ data }: { data: LayoutProps }) => {
    const { slideIndex, setNewStates, layouts } = useStoryStore();
    const oneColumn = (!data.image || !data.text) && !data.interactionChoices && !data.accessChoices;
    const hasChoices = !!data.interactionChoices || !!data.accessChoices;
    const portableText = useMemo(() => data?.text && <PortableText value={data.text} components={RichTextStory(true)} />, [data.text]);
    const informations = useMemo(() => <Informations data={data} />, [data]);

    const handleNextLayout = () => {
        setNewStates({ slideIndex: Math.min(slideIndex + 1, layouts.length - 1) });
    };

    if (oneColumn)
        return (
            <div className="flex flex-col items-center justify-center gap-6">
                <div className=" grow text-center bl max-w-3xl">
                    {portableText}
                    {informations}
                </div>
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
                    <div className="text-center bl">
                        {portableText}
                        {informations}
                    </div>
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

export const Informations = ({ data }: { data: LayoutProps }) => {
    if (!data?.informations?.length) return null;
    const popover = (
        <div className="flex flex-col gap-4">
            {data.informations.map((info, index) => (
                <p key={index} className="mb-0 italic">
                    {info}
                </p>
            ))}
        </div>
    );
    const content = (
        <button className="roundButton small" style={{ backgroundColor: "var(--neutral-200)", height: "1.5rem" }}>
            <ImInfo className="text-2xl" style={{ color: "var(--neutral-700)" }} />
        </button>
    );
    return <Popover content={content} popover={popover} />;
};
