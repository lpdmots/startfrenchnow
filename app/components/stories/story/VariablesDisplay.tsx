import { convertMinutesToTime } from "@/app/lib/utils";
import { useStoryStore } from "@/app/stores/storiesStore";
import React from "react";
import { BiTime } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { Popover } from "../../animations/Popover";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../../sanity/RichTextComponents";
import { GiRat } from "react-icons/gi";

export const VariablesDisplay = () => {
    const { variables } = useStoryStore();
    const variablesToDisplay = Object.values(variables).filter(
        (variable) => (["static", "dynamique"].includes(variable.data?.nature || "") && variable.data?.display?.name) || variable.data?.display?.image
    );

    return (
        <div className="w-full flex justify-end gap-4">
            {variablesToDisplay.map((variable) => (
                <VariableDisplay key={variable.data?._id} variable={variable} />
            ))}
        </div>
    );
};

const VariableDisplay = ({ variable }: { variable: any }) => {
    if (variable.data.name === "time") return <TimeDisplay variable={variable} />;
    if (variable.data.name === "volonte") return <HeartDisplay variable={variable} />;
    if (variable.data.name === "rats-sauves") return <RatDisplay variable={variable} />;
    return null;
};

const TimeDisplay = ({ variable }: { variable: any }) => {
    const content = (
        <div className="flex items-center justify-start">
            <BiTime className="mr-2 text-2xl" />
            <p className="m-0 font-bold">{convertMinutesToTime(parseInt(variable.value))}</p>
        </div>
    );
    const popoverContent = (
        <div>
            <p className="font-bold underline">L'heure :</p>
            <p>Elle passe à mesure que ton héros fait des actions. Ne perds pas trop de temps si tu veux sauver les rats.</p>
        </div>
    );
    return <Popover content={content} popover={popoverContent} small />;
};

const HeartDisplay = ({ variable }: { variable: any }) => {
    const content = (
        <div className="flex gap-1 items-center">
            {[...Array(5)].map((_, i) => {
                const isFull = i < variable.value;
                return isFull ? <FaHeart key={i} className="text-xl" /> : <FaRegHeart key={i} className="text-xl" />;
            })}
        </div>
    );

    const popoverContent = (
        <div>
            <p className="font-bold underline">{variable.data.display.name} :</p>
            <div className="text-bold">
                <PortableText value={variable.data.display.description} components={RichTextComponents()} />
            </div>
        </div>
    );
    return (
        <div className="flex items-center">
            <Popover content={content} popover={popoverContent} small />
        </div>
    );
};

const RatDisplay = ({ variable }: { variable: any }) => {
    const content = (
        <div className="flex gap-1 items-center">
            <GiRat className="text-2xl" />
            <span>{variable.value}/3</span>
        </div>
    );

    const popoverContent = (
        <div>
            <p className="font-bold underline">{variable.data.display.name} :</p>
            <div className="text-bold">
                <PortableText value={variable.data.display.description} components={RichTextComponents()} />
            </div>
        </div>
    );
    return (
        <div className="flex items-center">
            <Popover content={content} popover={popoverContent} small />
        </div>
    );
};
