"use client";
import { useStoryStore } from "@/app/stores/storiesStore";
import { Reference } from "@/app/types/sfn/blog";
import React, { useEffect, useState } from "react";
import { Popover } from "../../animations/Popover";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import fetchData from "@/app/lib/apiStories";
import { Variable, VariableState } from "@/app/types/stories/adventure";
import Spinner from "../../common/Spinner";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../RichTextStory";

interface Props {
    value: {
        variable: Reference;
    };
    children: React.ReactNode;
}
export const VarInformation = ({ children, value }: Props) => {
    const { variables } = useStoryStore();
    const ref = value?.variable?._ref;
    const [popover, setPopover] = useState(getPopoverContent(variables[ref]));

    useEffect(() => {
        if (!popover.variable) {
            (async () => {
                try {
                    const variableData = await fetchData<Variable>("variable", ref);
                    const variableState: VariableState = { data: variableData, value: "0" };
                    setPopover(getPopoverContent(variableState));
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [ref, popover.variable]);

    const color = !popover.variable ? "" : popover.variable?.data?.nature === "object" ? "text-secondary-3" : popover.variable?.data?.nature === "skill" ? "text-secondary-4" : "text-secondary-5";
    const content = <span className={`relative underline decoration-dotted decoration-1 underline-offset-4 cursor-pointer ${color}`}>{children}</span>;

    return <Popover content={content} popover={popover.content} />;
};

const getPopoverContent = (variable: VariableState | null) => {
    if (!variable)
        return {
            variable: variable,
            content: (
                <div className="bs italic p-2 max-w-xs flex justify-center items-center" style={{ minHeight: 80 }}>
                    <Spinner />
                </div>
            ),
        };

    const description = variable?.data?.display?.description;
    return {
        variable: variable,
        content: (
            <div className="bs italic p-2 max-w-xs" style={{ minHeight: 80 }}>
                <Image
                    src={urlFor(variable?.data?.display.image).url()}
                    width={80}
                    height={80}
                    alt={variable.data?.name || "image"}
                    style={{ objectFit: "contain", maxHeight: "100px", width: "auto", float: "left", marginRight: "1rem", marginBottom: "1rem" }}
                />
                <p className="mb-0 underline">{variable?.data?.display.name}</p>
                {description && (
                    <p className=" text-justify">
                        <PortableText value={description} components={RichTextStory(true)} />
                    </p>
                )}
            </div>
        ),
    };
};
