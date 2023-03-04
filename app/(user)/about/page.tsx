import Hobbies from "@/app/components/sfn/about/Hobbies";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MdOutlineEmail } from "react-icons/md";
import { Fade } from "@/app/components/animations/Fades";

function About() {
    return (
        <div className="page-wrapper">
            <div className="section hero v2 overflow-hidden wf-section">
                <div className="container-default w-container">
                    <div id="w-node-_34c59c1f-4be7-ed9c-ff5c-c122f878dc41-c2543d52" className="grid-3-columns _3-col-hero">
                        <div id="w-node-_5c5dc0c4-b5e3-5f62-6d6f-8e34246cf7f8-c2543d52" className="image-wrapper max-width-270px left">
                            <Fade>
                                <Image src="/images/about-hero-left-image-paperfolio-webflow-template.png" width={270} height={273} alt="about teacher image" className="object-contain" />
                            </Fade>
                        </div>

                        <div id="w-node-dc0e7998-b9b3-c083-f58f-6cb9b7068f8e-c2543d52" className="inner-container _600px">
                            {/* <SlideFromBottom> */}
                            <div className="inner-container _550px---mbl">
                                <div className="mg-top-64px mg-top-0px---mbl">
                                    <div className="mg-borrom-35px mg-bottom-0px---mbl">
                                        <div data-w-id="4fcb1f41-b872-2c44-81b4-9b4b37ac484d" className="text-center">
                                            <div className="inner-container _400px---mbp center">
                                                <div className="inner-container _400px---mbl center">
                                                    <h1 className="display-1">
                                                        Enchanté, moi c'est <span className="heading-span-secondary-2">Yohann</span>
                                                    </h1>
                                                </div>
                                                <p className="mg-bottom-40px">
                                                    I'm a teacher of French as a foreign language and a specialist in <span className="text-no-wrap">teaching beginners.</span>
                                                </p>
                                            </div>
                                            <Link href="/contact" className="btn-primary button-row w-button">
                                                <div className="flex items-center justify-center">
                                                    <MdOutlineEmail className="mr-2" />
                                                    Get in touch
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* </SlideFromBottom> */}
                        </div>

                        <div id="w-node-_9590e10b-34c1-a027-5169-2a6f2e246de6-c2543d52" className="image-wrapper max-width-270px rigth">
                            <Fade>
                                <Image src="/images/about-hero-rigth-image-paperfolio-webflow-template.png" width={270} height={273} alt="about pencil" className="object-contain" />
                            </Fade>
                        </div>
                    </div>
                </div>
            </div>
            <div id="My-Story" className="section pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="w-layout-grid grid-2-columns text-right-default story-grid">
                                <div id="w-node-c2929208-8d91-98cc-9b09-092b6fe57133-c2543d52" className="inner-container _583px _100---tablet">
                                    <div className="mg-bottom-54px">
                                        <div className="text-center---tablet">
                                            <SlideFromBottom>
                                                <h2 data-w-id="94dd1cd1-5dda-c634-8877-ea0facb5345a" className="display-2 mg-bottom-0">
                                                    My <span className="heading-span-secondary-3">story</span> as <span className="text-no-wrap">a teacher</span>
                                                </h2>
                                            </SlideFromBottom>
                                        </div>
                                    </div>
                                    <div className="inner-container _553px _100---tablet">
                                        <div className="image-wrapper">
                                            <Fade delay={0.6}>
                                                <Image src="/images/my-story-image-paperfolio-webflow-template.png" alt="my story image" height={500} width={500} className="image" loading="lazy" />
                                            </Fade>
                                        </div>
                                    </div>
                                </div>
                                <div id="w-node-_8fce2975-a4c1-d75d-4e92-2f3e3dce47b0-c2543d52" data-w-id="8fce2975-a4c1-d75d-4e92-2f3e3dce47b0" className="inner-container _580px _100---tablet">
                                    <SlideFromBottom delay={0.8}>
                                        <>
                                            <p className="mg-bottom-24px keep w-clearfix">
                                                <span className="drop-cap-span">I</span> started as a primary school teacher before deciding to change my audience, quickly becoming an expert in
                                                teaching French as a foreign language. This allowed me the opportunity to work abroad as I went first to China, then to England and to New Zealand. In
                                                addition to working in many countries, I have also worked in a variety of different professional environments such as language schools (Alliance
                                                française), universities, and business schools where I was teaching general French to a demanding public{" "}
                                                <span className="text-no-wrap">of varied level.</span>
                                            </p>
                                            <p className="mg-bottom-40px">
                                                Very early on, I specialized in teaching beginners as I always enjoyed seeing my students progress rapidly, being able to go from knowing no French to a
                                                level of confidence which allows them to survive in their environment and manage everyday situations.{" "}
                                                <span className="text-no-wrap">It's very rewarding.</span>
                                            </p>
                                            <p className="mg-bottom-40px">
                                                In creating courses and materials online, I'm very happy to see that now my students come from different parts of the world. This drives me to always do
                                                my best to bring them answers and guide them toward <span className="text-no-wrap">their objectives. </span>
                                            </p>
                                            <p className="mg-bottom-40px">
                                                I hope you will enjoy my courses and I look forward to hearing from you. Feel free to drop me a <span className="text-no-wrap">message anytime.</span>
                                            </p>
                                        </>
                                    </SlideFromBottom>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Hobbies />
        </div>
    );
}

export default About;
