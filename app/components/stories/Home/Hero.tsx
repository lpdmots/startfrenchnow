import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FaInfoCircle } from "react-icons/fa";
import { GiSpellBook } from "react-icons/gi";
import { SlideFromBottom } from "../../animations/Slides";

function Hero() {
    const t = useTranslations("Stories.Hero");
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
                                    alt={t("imageAlt")}
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
                                    <h1 className="display-1 pb-8">{t.rich("title", intelRich())}</h1>
                                    <p className="mg-bottom-48px">{t("description")}</p>
                                </div>
                            </div>
                            <div className="buttons-row flex justify-center lg:justify-start">
                                <a href="#storiesTab" className="btn-primary button-row w-button flex items-center">
                                    <GiSpellBook className="mr-2" style={{ fontSize: 30 }} />
                                    {t("btnStory")}
                                </a>
                                <a href="#moreInfo" className="btn-secondary button-row w-button flex items-center justify-center">
                                    <FaInfoCircle className="mr-2" style={{ fontSize: 30 }} />
                                    {t("btnMoreInfo")}
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
