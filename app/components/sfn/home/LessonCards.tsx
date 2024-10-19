import Image from "next/image";
import React from "react";
import { AiFillSignal } from "react-icons/ai";
import { IoTime } from "react-icons/io5";
import Link from "next-intl/link";
import { MdOutlineEmail } from "react-icons/md";
import { SlideFromBottom, SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import { ParentToChildrens, ScaleChildren } from "../../animations/ParentToChildrens";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";

interface LessonCard {
    title: string;
    image: string;
    description: string;
    price: number;
    reduction: number | null;
    difficulty: string;
    time: string;
    link: string;
    isNew?: string;
}

function LessonCards() {
    const t = useTranslations("LessonCards");

    const lessons: LessonCard[] = [
        {
            title: t("lessons.beginnerLevel1.title"),
            image: "/images/cours1.jpg",
            description: t("lessons.beginnerLevel1.description"),
            price: 100,
            reduction: 60,
            difficulty: "A1",
            time: "16h10",
            link: "/courses/beginners",
        },
        {
            title: t("lessons.lowIntermediateLevel2.title"),
            image: "/images/cours2.jpg",
            description: t("lessons.lowIntermediateLevel2.description"),
            price: 120,
            reduction: 70,
            difficulty: "A2",
            time: "11h40",
            link: "/courses/intermediates",
        },
        {
            title: t("lessons.lowIntermediateLevel3.title"),
            image: "/images/cours3.jpg",
            description: t("lessons.lowIntermediateLevel3.description"),
            price: 120,
            reduction: 70,
            difficulty: "B1",
            time: "23h",
            link: "/courses/dialogues",
            isNew: t("lessons.lowIntermediateLevel3.new"),
        },
    ];

    return (
        <SlideInOneByOneParent>
            <div className="flex flex-col w-full items-center pb-12 px-5">
                <div className="text-center m-auto mb-10" style={{ maxWidth: "900px" }}>
                    <h2 id="courses" className="display-2">
                        {t.rich("title", intelRich())}
                    </h2>
                    <p className="bd py-4">{t("description")}</p>
                </div>
                <div className="grid grid-cols-6 gap-4 lg:gap-8 max-w-7xl">
                    <LessonCardsRender lessons={lessons} />

                    <div className="h-full hidden md:grid xl:hidden col-span-3">
                        <SlideInOneByOneChild>
                            <div className="card card-secondary-1 flex-vertical-center card-contact-featured h-full">
                                <div className="mg-bottom-24px keep">
                                    <Image src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={90} width={90} alt="get in touch" />
                                </div>
                                <div className="text-center">
                                    <h3 className="display-4">{t("notSureTitle")}</h3>
                                    <p className="color-neutral-800 mg-bottom-32px">{t("notSureDescription")}</p>
                                    <Link href="/contact" className="btn-primary w-button">
                                        <div className="flex items-center justify-center">
                                            <MdOutlineEmail className="mr-2" />
                                            {t("contactButton")}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </SlideInOneByOneChild>
                    </div>
                </div>
                <SlideFromBottom>
                    <div className="flex justify-center md:hidden xl:grid">
                        <div className="card card-secondary-1 flex flex-col md:flex-row gap-4 !justify-around items-center card-contact-featured mt-16 shadow-2">
                            <Image className="display-inline " src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={90} width={90} alt="get in touch" />
                            <div className=" max-w-xl">
                                <h3 className="display-4">{t("notSureTitle")}</h3>
                                <p className="color-neutral-800 mg-bottom-24px ">{t("notSureDescription")}</p>
                                <div className="flex justify-center">
                                    <Link href="/contact" className="btn-primary w-button">
                                        <div className="flex items-center justify-center">
                                            <MdOutlineEmail className="mr-2" />
                                            {t("contactButton")}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </SlideFromBottom>
            </div>
        </SlideInOneByOneParent>
    );
}

export default LessonCards;

export const LessonCardsRender = ({ lessons }: { lessons: LessonCard[] }) => {
    return lessons.map(({ image, title, description, isNew, difficulty, time, link }) => (
        <div key={title} className="col-span-6 md:col-span-3 xl:col-span-2">
            <SlideInOneByOneChild>
                <ParentToChildrens>
                    <Link href={link} className="card link-card flex flex-col h-full w-full relative overflow-hidden">
                        {isNew && (
                            <div className="new-banner" style={{ border: "solid 1px black", boxShadow: "3px 3px 3px 0px var(--neutral-800)" }}>
                                {isNew}
                            </div>
                        )}
                        <div className="image-wrapper-card-top">
                            <ScaleChildren>
                                <Image className="h-auto" src={image} alt={title || "no title"} height={320} width={550} style={{ maxWidth: "100%" }} />
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
    ));
};
