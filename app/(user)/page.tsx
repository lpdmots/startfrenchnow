import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaCommentDots, FaRegEnvelope, FaSignInAlt, FaStar, FaStarHalfAlt, FaUserGraduate } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import BlogHome from "../components/home/BlogHome";
import CommentsCarousel from "../components/home/CommentsCarousel";
import CoreValuesMethod from "../components/home/CoreValuesMethod";
import LessonCards from "../components/home/LessonCards";
import WhoIAm from "../components/home/WhoIAm";

function Home() {
    return (
        <div className="page-wrapper">
            <section className="section hero v1 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="w-layout-grid grid-2-columns hero-v1">
                                <div id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac" data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be" className="inner-container _600px test">
                                    <div className="text-center---tablet">
                                        <div className="inner-container _550px---tablet center">
                                            <h1 className="display-1">
                                                <span className="heading-span-secondary-4">Learn French</span> at your own pace with <span className="heading-span-secondary-2 ">high quality</span>{" "}
                                                French lessons.
                                            </h1>
                                        </div>
                                        <p className="mg-bottom-48px">You want to be serious about learning French? Don't worry, it doesn't have to be boring. Check it out.</p>
                                    </div>
                                    <div className="buttons-row center-tablet ">
                                        <a href="#courses" className="btn-primary button-row w-button flex items-center">
                                            <HiAcademicCap className="mr-2" style={{ fontSize: 20 }} />
                                            Start French now
                                        </a>
                                        <a href="#whoami" className="btn-secondary button-row w-button">
                                            <span className="line-rounded-icon link-icon-left text-medium"></span>I am Yohann
                                        </a>
                                    </div>
                                </div>
                                <div className="m-auto">
                                    <Image
                                        className=" shadow-3 rounded-full h-auto"
                                        src="https://i-don-t-speak-french.s3.eu-central-1.amazonaws.com/character1.png"
                                        height={500}
                                        width={500}
                                        alt="Le professeur"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section pd-top-5---bottom-5 wf-section">
                <div className="logo-strip-wrapper text-neutral-100 p-3">
                    <div className="w-full max-w-7xl flex justify-around">
                        <div className="flex flex-col justify-center items-center p-2">
                            <p className="font-bold">Students</p>
                            <p className="font-extrabold text-2xl ">10,2K</p>
                            <FaUserGraduate className=" text-3xl mt-2" />
                        </div>
                        <div className="flex flex-col justify-center items-center p-2">
                            <p className="font-bold">Comments</p>
                            <p className="font-extrabold text-2xl ">1,560</p>
                            <FaCommentDots className=" text-3xl mt-2" />
                        </div>
                        <div className="flex flex-col justify-between items-center p-2">
                            <div>
                                <p className="font-bold">Stars</p>
                                <p className="font-extrabold text-2xl ">4.8</p>
                            </div>
                            <div className="flex flex-grow items-center">
                                <FaStar className="text-xl md:text-2xl mt-2" />
                                <FaStar className="text-xl  md:text-2xl mt-2" />
                                <FaStar className="text-xl  md:text-2xl mt-2" />
                                <FaStar className="text-xl  md:text-2xl mt-2" />
                                <FaStarHalfAlt className="text-xl  md:text-2xl mt-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="pt-[80px] sm:pt-[100px] md:pt-[118px] lg:pt-[150px] ">
                <div className="container-default w-container ">
                    <div className="max-w-[500px] md:max-w-none m-auto">
                        <div className="max-w-[600px] text-center m-auto mb-10">
                            <h2 id="courses" className="display-2">
                                Find a course that suits you and <span className="heading-span-secondary-4">get started</span>!
                            </h2>
                            <p className="bd py-4">
                                No "Blabla"! The objective is to really learn and understand the French language in order to speak it. A method for beginners and intermediates with the intention of
                                guiding you to a level of confidence where you can "fly on your own".
                            </p>
                        </div>
                        <LessonCards />
                    </div>
                </div>
            </section>

            <section className="section pd-200px wf-section bg-neutral-800">
                <CoreValuesMethod />
            </section>

            <section className="section pb-0 wf-section">
                <WhoIAm />
            </section>
            <CommentsCarousel />
            {/* @ts-expect-error Server Component */}
            <BlogHome />
        </div>
    );
}

export default Home;
