import { HeroAdventure, Heros, Variable, VariableState } from "@/app/types/stories/adventure";
import urlFor from "@/lib/urlFor";
import React from "react";
import Image from "next/image";

export const HeroCard = ({ hero, skills }: { hero: HeroAdventure | Heros | null; skills: Variable[] | null }) => {
    if (!hero) return null;
    return (
        <div className=" relative flex justify-center w-full h-full" style={{ maxHeight: 600, minHeight: 400, maxWidth: 400 }}>
            <Image
                src={urlFor(hero.images.default).url()}
                height={500}
                width={350}
                className="object-contain absolute top-0 z-0"
                priority
                style={{ maxHeight: "100%", minHeight: 350 }}
                alt={hero.name}
            />
            <div className="p-2 absolute bottom-0 left-0 bg-neutral-100 rounded-lg simple-border bs text-left w-full opacity-90">
                <p className="w-full">
                    <b className="bl underline">{hero.name}</b> : {hero.description}
                </p>
                <div className="flex gap-4">
                    {skills &&
                        skills
                            .sort((variable) => variable.display.order)
                            .map((variable) => {
                                const display = variable?.display;
                                return (
                                    <div key={variable?._id} className="flex items-center gap-2">
                                        <Image src={display && urlFor(display.image).url()} height={25} width={25} alt={display?.name} />
                                        <p className="m-0">{display?.name}</p>
                                    </div>
                                );
                            })}
                </div>
            </div>
        </div>
    );
};
