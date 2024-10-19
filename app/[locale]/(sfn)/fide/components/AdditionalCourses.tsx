import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { SlideFromBottom, SlideInOneByOneChild } from "@/app/components/animations/Slides";
import { ParentToChildrens, ScaleChildren } from "@/app/components/animations/ParentToChildrens";
import Link from "next-intl/link";
import { AiFillSignal } from "react-icons/ai";
import { IoTime } from "react-icons/io5";

interface LessonCard {
    title: string | React.ReactNode;
    image: string;
    description: string;
    difficulty: string;
    time: string;
    link: string;
    isNew?: string;
}

export const AdditionalCourses = () => {
    const t = useTranslations("Fide.AdditionalCourses");

    const lessons: LessonCard[] = [
        {
            title: t.rich("lowIntermediateLevel3.title", intelRich()),
            image: "/images/cours3.jpg",
            description: t("lowIntermediateLevel3.description"),
            difficulty: "B1",
            time: "23h",
            link: "/courses/dialogues",
            isNew: t("lowIntermediateLevel3.isNew"),
        },
        {
            title: t.rich("beginner.title", intelRich()),
            image: "/images/cours1.jpg",
            description: t("beginner.description"),
            difficulty: "A1",
            time: "16h10",
            link: "/courses/beginners",
        },
    ];

    return (
        <div className="flex flex-col justify-center">
            <div className="text-center---tablet mb-6 lg:mb12">
                <div className="inner-container _500px---tablet center">
                    <SlideFromBottom>
                        <div className="inner-container _300px---mbl center">
                            <h2 className="display-2">{t.rich("title", intelRich())}</h2>
                        </div>
                    </SlideFromBottom>
                </div>
                <SlideFromBottom>
                    <p className="color-neutral-700 mg-bottom-40px">{t.rich("description", intelRich())}</p>
                </SlideFromBottom>
            </div>
            <div className="flex justify-center w-full">
                <div className="grid grid-cols-2 gap-6 lg:gap-12 max-w-4xl">
                    {lessons.map(({ title, image, description, difficulty, time, link, isNew }) => (
                        <div key={link} className="col-span-2 md:col-span-1">
                            <SlideInOneByOneChild>
                                <ParentToChildrens>
                                    <Link href={link} className="card link-card flex flex-col h-full w-full relative overflow-hidden max-w-96">
                                        {isNew && (
                                            <p className="new-banner text-sm" style={{ border: "solid 1px black", boxShadow: "3px 3px 3px 0px var(--neutral-800)" }}>
                                                {isNew}
                                            </p>
                                        )}
                                        <div className="image-wrapper-card-top">
                                            <ScaleChildren>
                                                <Image className="h-auto" src={image} alt={"image du cours"} height={320} width={550} style={{ maxWidth: "100%" }} />
                                            </ScaleChildren>
                                        </div>
                                        <div className="p-4 flex flex-col space-between grow">
                                            <h2 className="font-bold pt-2 text-xl" style={{ minHeight: 64 }}>
                                                {title}
                                            </h2>
                                            <div className=" flex flex-col justify-between grow">
                                                <p className="text-left">{description}</p>
                                            </div>
                                            <div className="flex justify-center items-center">
                                                <div className="flex items-center mr-2">
                                                    <AiFillSignal
                                                        className=" mr-2"
                                                        style={{
                                                            fontSize: "1.5rem",
                                                            color: difficulty === "A1" ? "var(--secondary-5)" : difficulty === "A2" ? "var(--secondary-1)" : "var(--secondary-4)",
                                                        }}
                                                    />
                                                    <p className="m-0">{difficulty}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <IoTime className="mr-2" style={{ fontSize: "1.5rem" }} />
                                                    <p className="m-0">{time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </ParentToChildrens>
                            </SlideInOneByOneChild>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
