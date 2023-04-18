"use client";
import Image from "next/image";
import React from "react";
import { AiFillSignal } from "react-icons/ai";
import { IoTime } from "react-icons/io5";
import { BiDollar } from "react-icons/bi";
import Link from "next/link";
import { MdOutlineEmail } from "react-icons/md";
import { m } from "framer-motion";
import { fadeInOneByOneItem, fadeInOneByOneParent } from "@/app/lib/framerVariants";
import { SlideFromBottom } from "../../animations/Slides";
import { ParentToChildrens, ScaleChildren } from "../../animations/ParentToChildrens";

const lessons = [
    {
        title: "Beginner - Level 1 (A0 to A2)",
        image: "/images/courseTwo.png",
        description: "For complete beginners who want to master the basics of French. Build and develop practical communication skills in French: speaking, listening, reading and writing.",
        price: 100,
        reduction: 60,
        difficulty: "A1",
        time: "16h10",
        label: (
            <>
                Get <span className="heading-span-secondary-4">55% OFF</span> this month!
            </>
        ),
        link: "https://www.udemy.com/course/french-for-beginners-a1/",
    },
    {
        title: "Low intermediate - Level 2 (A2.1)",
        image: "/images/courseOne.png",
        description:
            "Deepen your knowledge of French and advance from A2 to B1. Learn all the tools you need for building longer and more complex sentences. Speak real French confidently on familiar topics.",
        price: 120,
        reduction: 70,
        difficulty: "A2",
        time: "11h40",
        label: (
            <>
                Enroll with <span className="heading-span-secondary-4">40% discount</span>
            </>
        ),
        link: "https://www.udemy.com/course/the-complete-french-course-learn-french-low-intermediate/",
    },
    {
        title: "Master the past tenses",
        image: "/images/courseTree.png",
        description:
            "Speak in the past in French. Learn the 3 main past tenses : passé composé, imparfait, plus-que-parfait. Understand the differences between the past tenses and use them together.",
        price: 90,
        reduction: null,
        difficulty: "A2",
        time: "1h30",
        label: (
            <>
                Grab the <span className="heading-span-secondary-4">latest</span> course!
            </>
        ),
        link: "https://www.udemy.com/course/french-grammar-the-past-tenses/",
    },
];

function LessonCards() {
    return (
        <m.div variants={fadeInOneByOneParent} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="text-center m-auto mb-10" style={{ maxWidth: "600px" }}>
                <h2 id="courses" className="display-2">
                    Find a course that suits you and <span className="heading-span-secondary-4">get started</span>!
                </h2>
                <p className="bd py-4">
                    No "Blabla"! The objective is to really learn and understand the French language in order to speak it. A method for beginners and intermediates with the intention of guiding you to
                    a level of confidence where you can "fly on your own".
                </p>
            </div>
            <div className="grid-3-columns m-auto">
                {lessons.map(({ image, title, description, price, difficulty, time, label, reduction, link }) => (
                    <m.div key={title} variants={fadeInOneByOneItem} className="h-full">
                        <ParentToChildrens>
                            <Link href={link} className="card link-card flex flex-col h-full">
                                <div className="image-wrapper-card-top">
                                    <ScaleChildren>
                                        <Image className="h-auto" src={image} alt={title} height={300} width={500} />
                                    </ScaleChildren>
                                </div>
                                {/* <div className="flex items-center justify-center py-4 px-4">
                            <BiDollar className="mb-1" style={{ fontSize: "1.5rem" }} />
                            {reduction ? (
                                <div className="flex items-center">
                                    <p className="bd text-neutral-600 line-through mr-2 mb-0">{price}</p>
                                    <p className="text-2xl font-extrabold m-0">{reduction}</p>
                                </div>
                            ) : (
                                <p className="font-extrabold text-2xl m-0">{price}</p>
                            )}
                        </div> */}
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
                    </m.div>
                ))}

                <m.div className="card card-secondary-1 flex-vertical-center card-contact-featured card-contact-sm" variants={fadeInOneByOneItem}>
                    <div className="mg-bottom-24px keep">
                        <Image src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={90} width={90} alt="get in touch" />
                    </div>
                    <div className="text-center">
                        <h3 className="display-4">Not sure what to choose?</h3>
                        <p className="color-neutral-800 mg-bottom-32px">Click here and send me a message!</p>
                        <Link href="/contact" className="btn-primary w-button">
                            <div className="flex items-center justify-center">
                                <MdOutlineEmail className="mr-2" />
                                Contact me
                            </div>
                        </Link>
                    </div>
                </m.div>
            </div>
            <SlideFromBottom>
                <div className="flex justify-center">
                    <div className="card-contact-lg card card-secondary-1 flex !justify-around items-center card-contact-featured mt-16 shadow-2">
                        <Image className="display-inline" src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={90} width={90} alt="get in touch" />
                        <div className=" max-w-xl pl-6">
                            <h3 className="display-4">Not sure what to choose?</h3>
                            <p className="color-neutral-800 mg-bottom-24px ">Click here and send me a message!</p>
                            <div className="flex justify-center">
                                <Link href="/contact" className="btn-primary w-button">
                                    <div className="flex items-center justify-center">
                                        <MdOutlineEmail className="mr-2" />
                                        Get in touch
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </SlideFromBottom>
        </m.div>
    );
}

export default LessonCards;
