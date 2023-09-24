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

function LessonCards() {
    const t = useTranslations("LessonCards");

    const lessons = [
        {
            title: t("lessons.beginnerLevel1.title"),
            image: "/images/courseTwo.png",
            description: t("lessons.beginnerLevel1.description"),
            price: 100,
            reduction: 60,
            difficulty: "A1",
            time: "16h10",
            link: "https://www.udemy.com/course/french-for-beginners-a1/",
        },
        {
            title: t("lessons.lowIntermediateLevel2.title"),
            image: "/images/courseOne.png",
            description: t("lessons.lowIntermediateLevel2.description"),
            price: 120,
            reduction: 70,
            difficulty: "A2",
            time: "11h40",
            link: "https://www.udemy.com/course/the-complete-french-course-learn-french-low-intermediate/",
        },
        {
            title: t("lessons.masterPastTenses.title"),
            image: "/images/courseTree.png",
            description: t("lessons.masterPastTenses.description"),
            price: 90,
            reduction: null,
            difficulty: "A2",
            time: "1h30",
            link: "https://www.udemy.com/course/french-grammar-the-past-tenses/",
        },
    ];

    return (
        <SlideInOneByOneParent>
            <>
                <div className="text-center m-auto mb-10" style={{ maxWidth: "600px" }}>
                    <h2 id="courses" className="display-2">
                        {t.rich("title", intelRich())}
                    </h2>
                    <p className="bd py-4">{t("description")}</p>
                </div>
                <div className="grid-3-columns m-auto">
                    {lessons.map(({ image, title, description, price, difficulty, time, link }) => (
                        <div key={title}>
                            <SlideInOneByOneChild>
                                <ParentToChildrens>
                                    <Link href={link} className="card link-card flex flex-col h-full">
                                        <div className="image-wrapper-card-top">
                                            <ScaleChildren>
                                                <Image className="h-auto" src={image} alt={title || "no title"} height={300} width={500} style={{ maxWidth: "100%" }} />
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
                                                    <AiFillSignal className=" mr-2" style={{ fontSize: "1.5rem", color: difficulty === "A1" ? "var(--secondary-5)" : "var(--secondary-1)" }} />
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

                    <SlideInOneByOneChild>
                        <div className="card card-secondary-1 flex-vertical-center card-contact-featured card-contact-sm">
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
                <SlideFromBottom>
                    <div className="flex justify-center">
                        <div className="card-contact-lg card card-secondary-1 flex !justify-around items-center card-contact-featured mt-16 shadow-2">
                            <Image className="display-inline" src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={90} width={90} alt="get in touch" />
                            <div className=" max-w-xl pl-6">
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
            </>
        </SlideInOneByOneParent>
    );
}

export default LessonCards;
