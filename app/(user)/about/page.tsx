import Hobbies from "@/app/components/about/Hobbies";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function About() {
    return (
        <div className="page-wrapper">
            <div className="section hero v2 overflow-hidden wf-section">
                <div className="container-default w-container">
                    <div id="w-node-_34c59c1f-4be7-ed9c-ff5c-c122f878dc41-c2543d52" className="grid-3-columns _3-col-hero">
                        <div id="w-node-_5c5dc0c4-b5e3-5f62-6d6f-8e34246cf7f8-c2543d52" className="image-wrapper max-width-270px left">
                            <Image src="/images/about-hero-left-image-paperfolio-webflow-template.png" width={270} height={273} alt="about teacher image" className="object-contain" />
                        </div>
                        <div id="w-node-dc0e7998-b9b3-c083-f58f-6cb9b7068f8e-c2543d52" className="inner-container _600px">
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
                                                <span className="line-rounded-icon link-icon-left text-medium"></span>Get in touch
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="w-node-_9590e10b-34c1-a027-5169-2a6f2e246de6-c2543d52" className="image-wrapper max-width-270px rigth">
                            <Image src="/images/about-hero-rigth-image-paperfolio-webflow-template.png" width={270} height={273} alt="about pencil" className="object-contain" />
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
                                            <h2 data-w-id="94dd1cd1-5dda-c634-8877-ea0facb5345a" className="display-2 mg-bottom-0">
                                                My <span className="heading-span-secondary-3">story</span> as <span className="text-no-wrap">a teacher</span>
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="inner-container _553px _100---tablet">
                                        <div className="image-wrapper">
                                            <img
                                                src="/images/my-story-image-paperfolio-webflow-template.png"
                                                alt="my story image"
                                                sizes="(max-width: 479px) 92vw, (max-width: 767px) 90vw, (max-width: 991px) 600px, (max-width: 1439px) 45vw, 553px"
                                                data-w-id="8fce2975-a4c1-d75d-4e92-2f3e3dce47af"
                                                loading="eager"
                                                srcSet="/images/my-story-image-paperfolio-webflow-template-p-500.png 500w, /images/my-story-image-paperfolio-webflow-template.png 1106w"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div id="w-node-_8fce2975-a4c1-d75d-4e92-2f3e3dce47b0-c2543d52" data-w-id="8fce2975-a4c1-d75d-4e92-2f3e3dce47b0" className="inner-container _580px _100---tablet">
                                    <p className="mg-bottom-24px keep w-clearfix">
                                        <span className="drop-cap-span">W</span>ell I started as primary school teacher and then decided to change audience and become an expert in teaching French as a
                                        foreign language. So I quickly wanted to work abroad and went to China first, then to London (England) and to New Zealand. I worked in different establishments,
                                        language schools (Alliance française), universities, and business schools where I was teaching general French to a demanding public{" "}
                                        <span className="text-no-wrap">of varied level.</span>
                                    </p>
                                    <p className="mg-bottom-40px">
                                        Very early on, I also specialized in teaching beginners, I always liked to see my students progress quickly, being able to go from 0 French to a level of
                                        confidence that allows them to survive in their environment and manage everyday situations. <span className="text-no-wrap">It's very rewarding.</span>
                                    </p>
                                    <p className="mg-bottom-40px">
                                        Creating courses and materials online, I'm now so happy to see that my students come from different parts of the world and I will always do my best to bring
                                        them answers and guide them towards <span className="text-no-wrap">their objectives. </span>
                                    </p>
                                    <p className="mg-bottom-40px">
                                        So I hope you will be enjoying my courses and I’m looking forward to hearing from you. Feel free to drop me a{" "}
                                        <span className="text-no-wrap">message anytime.</span>
                                    </p>
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
