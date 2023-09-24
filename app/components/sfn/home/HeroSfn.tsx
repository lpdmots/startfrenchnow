import React from "react";
import { AiOutlineUser } from "react-icons/ai";
import { FaCommentDots, FaStar, FaStarHalfAlt, FaUserGraduate } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import { HeroVideo } from "./HeroVideo";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

export const HeroSfn = () => {
    const t = useTranslations("HeroSfn");

    return (
        <section className="section hero v1 wf-section">
            <div className="flex justify-center w-full items-center">
                <div className="px-8" style={{ maxWidth: 1500 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 hero-v1 gap-8 xl:gap-12">
                        <div id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac" data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be" className="inner-container test" style={{ maxWidth: 650 }}>
                            <div className="text-center---tablet">
                                <div className="inner-container _550px---tablet center">
                                    <h1 className="hero-title">{t.rich("title", intelRich())}</h1>
                                </div>
                                <p className="mb-8">{t.rich("description", intelRich())}</p>
                            </div>
                            <div className="buttons-row center-tablet ">
                                <a href="#courses" className="btn-primary button-row w-button flex items-center">
                                    <HiAcademicCap className="mr-2" style={{ fontSize: 20 }} />
                                    {t("btn_courses")}
                                </a>
                                <a href="#whoami" className="btn-secondary button-row w-button flex items-center justify-center">
                                    <AiOutlineUser className="mr-2" />
                                    Enchanté
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-4">
                            <div className="h-auto w-full mb-8">
                                <HeroVideo />
                            </div>
                            <Ratings />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Ratings = () => {
    return (
        <SlideInOneByOneParent>
            <div className="w-full flex justify-around gap-8 lg:gap-12">
                <SlideInOneByOneChild>
                    <div className="flex flex-col  justify-center items-center gap-2">
                        <p className="font-extrabold text-2xl  mb-0">16,058</p>
                        <FaUserGraduate className=" text-3xl" />
                    </div>
                </SlideInOneByOneChild>
                <SlideInOneByOneChild>
                    <div className="flex flex-col justify-between items-center gap-2 h-full">
                        <p className="font-extrabold text-2xl mb-0">4.7</p>
                        <div className="flex flex-grow items-center">
                            <FaStar className="text-xl md:text-2xl fill-secondary-1" />
                            <FaStar className="text-xl  md:text-2xl fill-secondary-1" />
                            <FaStar className="text-xl  md:text-2xl fill-secondary-1" />
                            <FaStar className="text-xl  md:text-2xl fill-secondary-1" />
                            <FaStarHalfAlt className="text-xl  md:text-2xl fill-secondary-1" />
                        </div>
                    </div>
                </SlideInOneByOneChild>
                <SlideInOneByOneChild>
                    <div className="flex flex-col justify-center items-center gap-2">
                        <p className="font-extrabold text-2xl  mb-0">2,923</p>
                        <FaCommentDots className=" text-3xl" />
                    </div>
                </SlideInOneByOneChild>
            </div>
        </SlideInOneByOneParent>
    );
};
