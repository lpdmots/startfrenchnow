import React from "react";
import Link from "next/link";
import { FaPenFancy } from "react-icons/fa";
import GrammarLogo from "../../common/logos/GrammarLogo";
import VocabularyLogo from "../../common/logos/VocabularyLogo";
import Image from "next/image";
import { SlideFromBottom } from "../../animations/Slides";

const argumentsList = [
    {
        title: "Language comprehension",
        icon: { url: "/images/execution.png", alt: "Comprehension" },
        description: "Interactive stories help to understand the structure of the French language and the context in which words are used in a natural, intuitive way.",
    },
    {
        title: "Vocabulary acquisition",
        icon: { url: "/images/dictionary.png", alt: "Dictionary" },
        description: "These stories offer an excellent opportunity to acquire vocabulary in context, making learning more effective.",
    },
    {
        title: "Adapted to your needs",
        icon: { url: "/images/adaptation.png", alt: "Adaptation" },
        description: "Whatever your skill level, interactive stories adapt to your specific needs, enabling you to progress at your own pace.",
    },
    {
        title: "Engagement and enjoyment",
        icon: { url: "/images/smile.png", alt: "happy smiley" },
        description: "Interactive stories make learning French more engaging and enjoyable, thanks to an immersive and captivating experience.",
    },
    {
        title: "Repetition and reinforcement",
        icon: { url: "/images/rinse.png", alt: "Repetition" },
        description: "Repetition, a key element of language learning, is also facilitated by these stories.",
    },
    {
        title: "Anywhere, Anytime",
        icon: { url: "/images/time-management.png", alt: "time-management" },
        description: "Their online accessibility means you can learn anytime, anywhere.",
    },
];

export const WhyStories = () => {
    return (
        <div id="moreInfo" className="section bg-neutral-800 wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <div className="w-layout-grid grid-2-columns blog-left-sidebar gap-column-64px">
                            <div id="w-node-eb9abc4f-1a64-dc91-46de-47243848b65b-b9543dac" data-w-id="eb9abc4f-1a64-dc91-46de-47243848b65b" className="sticky-top _48px-top sticky-tbl">
                                <div className="inner-container _535px">
                                    <div className="text-center---tablet">
                                        <div className="inner-container _500px---tablet center">
                                            <SlideFromBottom>
                                                <div className="inner-container _300px---mbl center">
                                                    <h2 className="display-2 color-neutral-100">
                                                        <span className="z-index-1">
                                                            Why Should You Learn French with <span className="heading-span-secondary-2">Interactive Stories</span>?
                                                        </span>
                                                    </h2>
                                                </div>
                                            </SlideFromBottom>
                                        </div>
                                        <SlideFromBottom>
                                            <>
                                                <p className="color-neutral-300 mg-bottom-40px">
                                                    Unleash the power of interactive stories for an engaging and effective French learning experience. Here are the key benefits.
                                                </p>
                                                <Link href="/blog/post/discover-the-benefits-of-interactive-stories-for-learning-french" className="btn-secondary variant w-button">
                                                    <div className="flex items-center justify-center">
                                                        <FaPenFancy className="mr-2" />
                                                        Read more on the blog
                                                    </div>
                                                </Link>
                                            </>
                                        </SlideFromBottom>
                                    </div>
                                </div>
                            </div>
                            <div id="w-node-_20d05100-4494-e1df-c799-844a90f09c7c-b9543dac" className="grid-1-column gap-40px">
                                {argumentsList.map((argument) => (
                                    <Argument key={argument.title} {...argument} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ArgumentProps {
    title: string;
    description: string;
    icon: any;
}

const Argument = ({ title, description, icon }: ArgumentProps) => {
    return (
        <SlideFromBottom>
            <div id="w-node-_8d83adfe-2d0c-e555-1807-e37fe0b61b0d-b9543dac" className="card resume-card-v1">
                <div className="top-content-resume-card">
                    <div className="flex-horizontal space-between reverse-wrap">
                        <div className="resume-card-period">{title}</div>
                        <Image src={icon.url} height={60} width={60} alt={icon.alt} />
                    </div>
                </div>
                <div className="resume-card-divider"></div>
                <div className="bottom-content-resume-card">
                    <p className="mg-bottom-0">{description}</p>
                </div>
            </div>
        </SlideFromBottom>
    );
};
