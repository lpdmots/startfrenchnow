import Image from "next/image";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import { GiSpellBook } from "react-icons/gi";
import { SlideFromBottom } from "../../animations/Slides";

function Hero() {
    return (
        <section className="section hero v1 wf-section" style={{ paddingTop: 50, paddingBottom: 50 }}>
            <div className="container-default w-container">
                <div className="grid grid-cols-12">
                    <div className="hidden lg:flex col-span-4 items-center justify-center">
                        <SlideFromBottom>
                            <div className="flex justify-center items-center h-full">
                                <Image
                                    src="/images/story-home-5-small.png"
                                    height={600}
                                    width={500}
                                    alt="Un homme qui regarde un livre d'où sort des effluves magiques"
                                    className="image"
                                    priority
                                    style={{ maxHeight: 600, objectFit: "contain", width: "auto" }}
                                />
                            </div>
                        </SlideFromBottom>
                    </div>
                    <div className="col-span-12 lg:col-span-8 flex justify-center items-center p-2 md:p-6">
                        <div id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac" data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be" className="inner-container" style={{ maxWidth: 750 }}>
                            <div className="text-center---tablet">
                                <div className="inner-container _600px---tablet center">
                                    <h1 className="display-1 pb-8">
                                        <span className="heading-span-secondary-4">Immerse</span> Yourself in French Through an Interactive <span className="heading-span-secondary-2 ">Story</span>
                                    </h1>
                                    <p className="mg-bottom-48px">
                                        Discover the power of interactive learning with our French language story. Improve your language skills and explore Paris in a fun and engaging way.
                                    </p>
                                </div>
                            </div>
                            <div className="buttons-row flex justify-center lg:justify-start">
                                <a href="#storiesTab" className="btn-primary button-row w-button flex items-center">
                                    <GiSpellBook className="mr-2" style={{ fontSize: 30 }} />
                                    Go to story
                                </a>
                                <a href="#moreInfo" className="btn-secondary button-row w-button flex items-center justify-center">
                                    <FaInfoCircle className="mr-2" style={{ fontSize: 30 }} />
                                    More info
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:hidden flex justify-center px-2 md:px-6 pt-12">
                    <SlideFromBottom>
                        <div className="flex justify-center items-center h-full">
                            <Image src="/images/story-home-5-small.png" height={450} width={350} alt="The teacher" className="image" priority style={{ maxHeight: 450, width: "auto" }} />
                        </div>
                    </SlideFromBottom>
                </div>
            </div>
        </section>
    );
}

export default Hero;

/* function Hero() {
    return (
        <section className="section hero v1 wf-section">
            <div className="container-default w-container">
                <div className="grid grid-cols-12">
                    <div className="hidden lg:flex col-span-4 items-center justify-center">
                        <SlideFromBottom>
                            <div className="flex justify-center items-center h-full">
                                <Image
                                    src="/images/story-home-5-small.png"
                                    height={600}
                                    width={500}
                                    alt="The teacher"
                                    className="image"
                                    priority
                                    style={{ maxHeight: 600, objectFit: "contain", width: "auto" }}
                                />
                            </div>
                        </SlideFromBottom>
                    </div>
                    <div className="col-span-12 lg:col-span-8 flex justify-center items-center p-2 md:p-6">
                        <div id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac" data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be" className="inner-container" style={{ maxWidth: 700 }}>
                            <div className="text-center---tablet">
                                <div className="inner-container _600px---tablet center">
                                    <h1 className="display-1 pb-8">
                                        <span className="heading-span-secondary-4">Immerse</span> Yourself in French Through Interactive <span className="heading-span-secondary-2 ">Stories</span>
                                    </h1>
                                    <p className="mg-bottom-48px">
                                        Discover the power of interactive learning with our French language stories. Improve your language skills and explore new worlds in a fun and engaging way.
                                    </p>
                                </div>
                            </div>
                            <div className="buttons-row flex justify-center lg:justify-start">
                                <a href="#storiesTab" className="btn-primary button-row w-button flex items-center">
                                    <GiSpellBook className="mr-2" style={{ fontSize: 30 }} />
                                    Les histoires
                                </a>
                                <a href="#whoami" className="btn-secondary button-row w-button flex items-center justify-center">
                                    <FaInfoCircle className="mr-2" style={{ fontSize: 30 }} />
                                    Plus d'infos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:hidden flex justify-center px-2 md:px-6 pt-12">
                    <SlideFromBottom>
                        <div className="flex justify-center items-center h-full">
                            <Image src="/images/story-home-5.png" height={450} width={350} alt="The teacher" className="image" priority style={{ maxHeight: 450, width: "auto" }} />
                        </div>
                    </SlideFromBottom>
                </div>
            </div>
        </section>
    );
}

export default Hero; */
