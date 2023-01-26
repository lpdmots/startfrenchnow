import Image from "next/image";
import React from "react";

function WhoIAm() {
    return (
        <div className="container-default w-container">
            <div className="inner-container _600px---tablet center">
                <div className="inner-container _500px---mbl center">
                    <div id="whoami" className="w-layout-grid grid-2-columns text-left-short">
                        <div className="inner-container _620px">
                            <div className="image-wrapper bg-secondary-4 left-shadow-circle">
                                <Image src="/images/about-me-image-paperfolio-webflow-template.svg" alt="experience image" height={600} width={600} className="image" />
                            </div>
                        </div>
                        <div className="inner-container _535px">
                            <div className="text-center---tablet">
                                <div className="inner-container _430px">
                                    <div className="inner-container _400px---tablet center">
                                        <div className="inner-container _300px---mbl center">
                                            <div className="inner-container _250px---mbp center">
                                                <h2 className="display-2">
                                                    Bonjour, moi c'est <span className="heading-span-secondary-2">Yohann</span>
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mg-bottom-32px">
                                    I’m a French teacher as a foreign language, expert on teaching online and creating high quality content for beginners and intermediate learners.
                                </p>
                                <div className="inner-container _500px---tablet center">
                                    <div className="inner-container _400px---mbl center _100---mbp">
                                        <div className="mg-bottom-40px">
                                            <div className="flex-horizontal align-top---justify-left gap-16px center---tablet">
                                                <div className="bullet bg-secondary-1"></div>
                                                <div>
                                                    <div className="mg-bottom-12px">
                                                        <div className="text-300 bold color-neutral-800">A native & certified French teacher</div>
                                                    </div>
                                                    <p className="mg-bottom-0">Born in the beautiful Burgundy region near Dijon, I have a Master’s degree in Education.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mg-bottom-32px">
                                            <div className="flex-horizontal align-top---justify-left gap-16px center---tablet">
                                                <div className="bullet bg-secondary-3"></div>
                                                <div>
                                                    <div className="mg-bottom-12px">
                                                        <div className="text-300 bold color-neutral-800">10+ years of experience</div>
                                                    </div>
                                                    <p className="mg-bottom-0">
                                                        I have taught in language schools, universities and business schools all around the world before going online with my students.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mg-bottom-40px">
                                            <div className="flex-horizontal align-top---justify-left gap-16px center---tablet">
                                                <div className="bullet bg-secondary-4"></div>
                                                <div>
                                                    <div className="mg-bottom-12px">
                                                        <div className="text-300 bold color-neutral-800">An expert with beginners</div>
                                                    </div>
                                                    <p className="mg-bottom-0">
                                                        Where other teachers are often bored and not sure how to deal with total beginners, I’m loving it and I have specifically crafted a method for
                                                        them.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="buttons-row center-tablet">
                                            <a href="about" className="btn-primary w-button">
                                                <span className="line-rounded-icon link-icon-left text-medium"></span>More about me
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhoIAm;
