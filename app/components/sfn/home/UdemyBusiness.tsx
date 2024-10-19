import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { SiApple, SiBarclays, SiPaypal, SiVolkswagen } from "react-icons/si";
import { Fade } from "../../animations/Fades";
import { SlideFromBottom, SlideFromRight } from "../../animations/Slides";

function UdemyBusiness() {
    const t = useTranslations("UdemyBusiness");
    return (
        <div className="w-full m-auto bg-neutral-800">
            <div className="container-default w-container py-12 lg:py-24">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center">
                        <Fade>
                            <h2 className="display-2 color-neutral-100 mb-12">{t.rich("title", intelRich())}</h2>
                        </Fade>
                        <div className="lg:grid lg:grid-cols-7 gap-6">
                            <div
                                id="w-node-_686f4507-61d8-cbed-f166-5192bfa063e2-c2543d52"
                                data-w-id="686f4507-61d8-cbed-f166-5192bfa063e2"
                                className="inner-container _584px _100---tablet col-span-3"
                            >
                                <SlideFromBottom delay={0.5}>
                                    <>
                                        <p className="color-neutral-300 mg-bottom-24px">{t.rich("paragraph1", intelRich())}</p>
                                        <p className="color-neutral-300 mg-bottom-24px">{t.rich("paragraph2", intelRich())}</p>
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
                                    </>
                                </SlideFromBottom>
                            </div>
                            <div className="flex items-center col-span-4 mt-12 lg:mt-0" style={{ overflow: "hidden" }}>
                                <SlideFromRight delay={0.8}>
                                    <div className="inner-container w-full">
                                        <Image
                                            src="/images/world-map.png"
                                            alt="worl map"
                                            className="object-contain"
                                            width={705}
                                            height={500}
                                            style={{ border: "solid 4px #0b0b0b", borderRadius: "32px", objectFit: "contain", height: "auto", maxWidth: "100%" }}
                                            loading="lazy"
                                        />
                                    </div>
                                </SlideFromRight>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UdemyBusiness;
