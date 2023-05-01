"use client";
import { HeroAdventure, Heros, Variable } from "@/app/types/stories/adventure";
import urlFor from "@/app/lib/urlFor";
import React from "react";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../../sanity/RichTextStory";
import { Popover } from "../../animations/Popover";

export const HeroCard = ({ hero, skills }: { hero: HeroAdventure | Heros | null; skills: Variable[] | null }) => {
    if (!hero) return null;
    return (
        <div className=" relative flex justify-center w-full h-full" style={{ maxHeight: 600, minHeight: 400, maxWidth: 400 }}>
            <Image
                src={urlFor(hero.images.default).url()}
                height={500}
                width={"350"}
                className="object-contain absolute top-0 z-0"
                priority
                style={{ maxHeight: "100%", minHeight: 350, width: "auto" }}
                alt={hero.name}
            />
            <div className="p-2 absolute bottom-0 left-0 bg-neutral-100 rounded-lg simple-border bs text-left w-full opacity-90">
                <div className="w-full">
                    <b className="bl underline">{hero.name}</b> : <PortableText value={hero.description} components={RichTextStory()} />
                </div>
                <div className="flex gap-x-4 flex-wrap">
                    {skills &&
                        skills
                            .sort((variable) => variable.display.order)
                            .map((variable) => {
                                const display = variable?.display;
                                return (
                                    <Popover
                                        key={variable?._id}
                                        small
                                        content={
                                            <div className="flex items-center gap-2">
                                                <Image src={display && urlFor(display.image).url()} height={25} width={25} alt={display?.name} />
                                                <p className="m-0">{display?.name}</p>
                                            </div>
                                        }
                                        popover={<PortableText value={display?.description} components={RichTextStory()} />}
                                    />
                                );
                            })}
                </div>
            </div>
        </div>
    );
};
