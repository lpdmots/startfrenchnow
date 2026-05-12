import { intelRich } from "@/app/lib/intelRich";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Fade } from "../../animations/Fades";
import { SlideFromBottom, SlideFromRight } from "../../animations/Slides";

const pointColors = ["bg-secondary-6", "bg-secondary-5", "bg-secondary-2"] as const;

function WhyFideHome() {
    const t = useTranslations("WhyFideHome");
    const points = ["permit", "naturalization", "integration"] as const;

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
                                className="inner-container max-w-[584px] _100---tablet col-span-3"
                            >
                                <SlideFromBottom delay={0.5}>
                                    <>
                                        <p className="color-neutral-300 mb-8 lg:mb-10">{t("description")}</p>
                                        <div className="grid gap-5 lg:gap-6">
                                            {points.map((point, index) => (
                                                <div key={point} className="flex gap-3 lg:gap-4 items-start">
                                                    <div className={`bullet ${pointColors[index]} mt-[1px] md:mt-1 shrink-0`} />
                                                    <div>
                                                        <p className="color-neutral-100 font-bold mg-bottom-4px">{t(`points.${point}.title`)}</p>
                                                        <p className="color-neutral-300 mg-bottom-0 text-sm">{t(`points.${point}.description`)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-5">
                                            <LinkArrow url="/fide" target="_self" className="!text-neutral-100 hover:!text-secondary-2 text-xl font-semibold">
                                                {t("cta")}
                                            </LinkArrow>
                                        </div>
                                    </>
                                </SlideFromBottom>
                            </div>
                            <div className="flex items-center col-span-4 mt-12 lg:mt-0" style={{ overflow: "hidden" }}>
                                <SlideFromRight delay={0.8}>
                                    <div className="inner-container w-full">
                                        <Image
                                            src="/images/hero-fide4.png"
                                            alt={t("imageAlt")}
                                            className="object-contain"
                                            width={705}
                                            height={500}
                                            style={{ border: "solid 4px #0b0b0b", borderRadius: "32px", objectFit: "contain", height: "auto", maxHeight: 450, maxWidth: "100%" }}
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

export default WhyFideHome;
