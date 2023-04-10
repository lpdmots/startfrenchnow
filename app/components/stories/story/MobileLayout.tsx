import { PortableText } from "@portabletext/react";
import React from "react";
import { RichTextComponents } from "../../sanity/RichTextComponents";
import { LayoutProps } from "@/app/types/stories/state";
import { AiOutlineArrowRight } from "react-icons/ai";
import Image from "next/image";
import { ChoiceButtons } from "./ChoiceButtons";
import { useStoryStore } from "@/stores/storiesStore";

export const MobileLayout = ({ data }: { data: LayoutProps }) => {
    const { slideIndex, setNewStates, layouts } = useStoryStore();
    const oneColumn = (!data.image || !data.text) && !data.interactionChoices && !data.accessChoices;
    const hasChoices = !!data.interactionChoices || !!data.accessChoices;

    const handleNextLayout = () => {
        setNewStates({ slideIndex: Math.min(slideIndex + 1, layouts.length - 1) });
    };

    if (oneColumn)
        return (
            <div className="flex flex-col items-center justify-between h-full gap-6 py-6">
                <div className=" flex grow items-center justify-center text-center bl">
                    {data.text && <PortableText value={data.text} components={RichTextComponents} />}
                    {data.image && (
                        <div>
                            <Image
                                src={data.image}
                                width={1000}
                                height={800}
                                alt={data.title || "image"}
                                className="rounded-xl shadow-1 simple-border"
                                style={{ objectFit: "contain", maxHeight: "55vh", width: "auto" }}
                                priority={slideIndex ? false : true}
                            />
                            <h2 className="display-3 mt-6">{data.title}</h2>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <button className="roundButton" onClick={handleNextLayout}>
                        <AiOutlineArrowRight className="text-4xl" />
                    </button>
                </div>
            </div>
        );

    return (
        <div className="flex flex-col h-full gap-6 py-6 " style={{ maxWidth: 600 }}>
            <div className="flex flex-col grow items-center justify-around">
                {data.text && (
                    <div className="flex  items-center justify-center text-center">
                        <PortableText value={data.text} components={RichTextComponents} />
                    </div>
                )}
                {data.image && (
                    <Image
                        src={data.image}
                        width={610}
                        height={400}
                        alt={data.title || "image"}
                        className="rounded-xl shadow-1 simple-border"
                        style={{ objectFit: "cover", height: "auto", maxHeight: "400px" }}
                        priority={slideIndex ? false : true}
                    />
                )}
            </div>
            {hasChoices ? (
                <div className="flex flex-col justify-center">
                    <ChoiceButtons data={data} />
                </div>
            ) : (
                <div className="flex justify-center">
                    <div>
                        <button className="roundButton" onClick={handleNextLayout}>
                            <AiOutlineArrowRight className="text-3xl" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
