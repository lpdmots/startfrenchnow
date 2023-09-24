"use client";
import * as React from "react";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { StoryCard as StoryCardProps } from "@/app/types/stories/adventure";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { AiFillSignal } from "react-icons/ai";
import { LEVELDATA, STORYCATEGORIES } from "@/app/lib/constantes";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { IoCaretDown, IoCaretUp } from "react-icons/io5";
import Link from "next-intl/link";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../../sanity/RichTextStory";

interface AccordionProps {
    story: StoryCardProps;
    expanded: false | string;
    setExpanded: (expanded: false | string) => void;
}

export const StoriesAccordion = ({ filtredStories }: { filtredStories: StoryCardProps[] }) => {
    // This approach is if you only want max one section open at a time. If you want multiple
    // sections to potentially be open simultaneously, they can all be given their own `useState`.
    const [expanded, setExpanded] = useState<false | string>("18d88b4c-e3ce-4471-a66e-0d1fec1437e1");

    return (
        <>
            {filtredStories.map((story) => (
                <Accordion key={story._id} story={story} expanded={expanded} setExpanded={setExpanded} />
            ))}
        </>
    );
};

const Accordion = ({ story, expanded, setExpanded }: AccordionProps) => {
    const isOpen = story._id === expanded;
    const level = story.level ? LEVELDATA[story.level] : LEVELDATA["a1"];

    // By using `AnimatePresence` to mount and unmount the contents, we can animate
    // them in and out while also only rendering the contents of open accordions
    return (
        <div className="link-card card overflow-hidden" style={{ transformStyle: "flat" }}>
            <m.div initial={false}>
                <div className="hidden sm:flex relative justify-end">
                    <m.div className="absolute left-0" initial={{ width: "50%" }} animate={{ width: isOpen ? "100%" : "50%" }} transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}>
                        <Image src={urlFor(story.images.primary).url()} width={810} height={500} loading="lazy" alt={story.name} style={{ objectFit: "cover", maxHeight: "300px" }} />
                    </m.div>
                    <m.div
                        key="title"
                        className="flex flex-col justify-around items-center overflow-hidden"
                        style={{ height: 300, width: "50%" }}
                        initial={{ width: "50%" }}
                        animate={{ width: isOpen ? "100%" : "50%" }}
                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <h2 className="display-4 text-center pt-4">{story.name}</h2>
                        <p className="font-bold text-secondary-2">{STORYCATEGORIES[story.category]}</p>
                        <div className="flex justify-end items-center text-300 medium color-neutral-600 " style={{ fontSize: 16 }}>
                            <AiFillSignal className=" mr-2" style={{ fontSize: "1.2rem", color: level.color }} />
                            {level.label} - {new Date(story.publishedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        <div className="flex justify-center  w-full gap-4 p-4">
                            <button className="btn btn-secondary small" onClick={() => setExpanded(isOpen ? false : story._id)}>
                                <span className="flex  justify-center items-center">
                                    Info <span className="flex items-center">{isOpen ? <IoCaretUp className="ml-2" /> : <IoCaretDown className="ml-2" />}</span>
                                </span>
                            </button>
                            <Link href={`/stories/${story.slug.current}/select-heros`} className="btn btn-primary small">
                                Play
                            </Link>
                        </div>
                    </m.div>
                </div>
                <div className="sm:hidden">
                    <div>
                        <Image src={urlFor(story.images.primary).url()} width={480} height={300} loading="lazy" alt={story.name} style={{ objectFit: "cover", maxHeight: "300px" }} />
                    </div>
                    <div className="flex flex-col justify-around items-center overflow-hidden p-4">
                        <div className="flex justify-center w-full gap-4">
                            <button className="btn btn-secondary small" onClick={() => setExpanded(isOpen ? false : story._id)}>
                                <span className="flex justify-center items-center">
                                    Infos <span className="flex items-center">{isOpen ? <IoCaretUp className="ml-2" /> : <IoCaretDown className="ml-2" />}</span>
                                </span>
                            </button>
                            <Link href={`/stories/${story.slug.current}/select-heros`} className="btn btn-primary small">
                                Play
                            </Link>
                        </div>
                        <h2 className="display-4 text-center pt-4">{story.name}</h2>
                        <p className="font-bold text-secondary-2">{STORYCATEGORIES[story.category]}</p>
                        <div className="flex justify-end items-center text-300 medium color-neutral-600 pb-4" style={{ fontSize: 16 }}>
                            <AiFillSignal className=" mr-2" style={{ fontSize: "1.2rem", color: level.color }} />
                            {level.label} - {new Date(story.publishedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                    </div>
                </div>
            </m.div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <m.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <SlideFromBottom>
                            <div className="hidden sm:grid grid-cols-12 p-6 pb-0">
                                <div className="col-span-8 flex flex-col justify-center items-center">
                                    <h2 className="display-4 text-center">{story.name}</h2>
                                    <p className="font-bold text-secondary-2">{story.category}</p>
                                </div>
                                <div className="col-span-4 flex justify-center items-center text-300 medium color-neutral-600 " style={{ fontSize: 16 }}>
                                    <AiFillSignal className=" mr-2" style={{ fontSize: "1.2rem", color: level.color }} />
                                    {level.label} - {new Date(story.publishedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                                </div>
                            </div>
                        </SlideFromBottom>
                        <m.div className="p-6" variants={{ collapsed: { scale: 0.5 }, open: { scale: 1 } }} transition={{ duration: 0.2 }}>
                            <PortableText value={story.description} components={RichTextStory()} />
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};
