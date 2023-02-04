import Image from "next/image";
import { SiApple, SiBarclays, SiPaypal, SiVolkswagen } from "react-icons/si";

function UdemyBusiness() {
    return (
        <div className="section bg-neutral-800 wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <h2 className="display-2 color-neutral-100 mb-12">
                            Students from{" "}
                            <span className="heading-span-secondary-2" style={{ whiteSpace: "nowrap" }}>
                                all over the world.
                            </span>
                        </h2>
                        <div className="lg:grid lg:grid-cols-7 gap-6">
                            <div
                                id="w-node-_686f4507-61d8-cbed-f166-5192bfa063e2-c2543d52"
                                data-w-id="686f4507-61d8-cbed-f166-5192bfa063e2"
                                className="inner-container _584px _100---tablet col-span-3"
                            >
                                <p className="color-neutral-300 mg-bottom-24px">
                                    One of my greatest pleasure is to see that my students come from over 140 different countries ! They all have their own objective towards the french language and my
                                    mission is to help
                                    <span className="text-no-wrap"> them reaching it.</span>
                                </p>
                                <p className="color-neutral-300 mg-bottom-24px">
                                    My courses have also been recommended to big companies and their employees via the Udemy for Business programm that rewards the best courses based on the student
                                    feedback, their relevance and
                                    <span className="text-no-wrap"> general quality.</span>
                                </p>
                                <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:gap-6 ">
                                    <div className="mg-bottom-12px">
                                        <div className="flex gap-2 sm:gap-4 items-center">
                                            <div
                                                className="border-solid border-secondary-1 p-1 rounded-lg flex items-center justify-center bg-neutral-100  h-14 w-14 sm:h-20 sm:w-20"
                                                style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%", borderWidth: "6px" }}
                                            >
                                                <SiVolkswagen style={{ fontSize: "40px" }} />
                                            </div>
                                            <p className="color-neutral-100 mg-bottom-0">Volkswagen</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex gap-2 sm:gap-4 items-center">
                                            <div
                                                className="border-solid border-secondary-2 p-1 rounded-lg flex items-center justify-center bg-neutral-100  h-14 w-14 sm:h-20 sm:w-20"
                                                style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%", borderWidth: "6px" }}
                                            >
                                                <SiApple style={{ fontSize: "40px" }} />
                                            </div>
                                            <p className="color-neutral-100 mg-bottom-0">Apple</p>
                                        </div>
                                    </div>
                                    <div className="mg-bottom-12px">
                                        <div className="flex gap-2 sm:gap-4 items-center">
                                            <div
                                                className="border-solid border-secondary-3  rounded-lg flex items-center justify-center bg-neutral-100 h-14 w-14 sm:h-20 sm:w-20"
                                                style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%", borderWidth: "6px" }}
                                            >
                                                <SiBarclays style={{ fontSize: "40px" }} />
                                            </div>
                                            <p className="color-neutral-100 mg-bottom-0">Barclays</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex gap-2 sm:gap-4 items-center">
                                            <div
                                                className="border-solid border-secondary-4  rounded-lg flex items-center justify-center bg-neutral-100  h-14 w-14 sm:h-20 sm:w-20"
                                                style={{ borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%", borderWidth: "6px" }}
                                            >
                                                <SiPaypal style={{ fontSize: "40px" }} />
                                            </div>
                                            <p className="color-neutral-100 mg-bottom-0">Paypal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="inner-container position-relative h-72 sm:h-96 lg:h-full w-full col-span-4 mt-12 lg:mt-0">
                                <Image src="/images/world-map.png" fill alt="worl map image" className="object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UdemyBusiness;
